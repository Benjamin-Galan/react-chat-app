"use client"

import { useEffect, useState } from "react"
import { supabase } from "../services/supabase"
import { useAuth } from "../hooks/useAuth"

//bg-gradient-to-br from-teal-900 to-gray-900
export default function ChatArea({ contact, chatId }) {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [contactDetails, setContactDetails] = useState(null)
  const [isContact, setIsContact] = useState(false)
  const [isAddingContact, setIsAddingContact] = useState(false)
  const [addContactStatus, setAddContactStatus] = useState(null) // 'success', 'error', null

  // 1. Cargar mensajes iniciales
  useEffect(() => {
    const loadMessages = async () => {
      if (!user || !contact) return

      let query

      if (chatId) {
        // If we have a chat ID, use it to fetch messages
        query = supabase.from("messages").select("*").eq("chat_id", chatId).order("created_at", { ascending: true })
      } else {
        // Fallback to the old method
        query = supabase
          .from("messages")
          .select("*")
          .or(
            `and(sender_id.eq.${user.id},receiver_id.eq.${contact}),and(sender_id.eq.${contact},receiver_id.eq.${user.id})`,
          )
          .order("created_at", { ascending: true })
      }

      const { data, error } = await query

      if (!error) {
        setMessages(data)
      } else {
        console.error("Error loading messages:", error)
      }
    }

    loadMessages()
  }, [user, contact, chatId])

  // Obtener detalles del contacto
  useEffect(() => {
    const fetchContactDetails = async () => {
      if (!contact) return

      try {
        const { data, error } = await supabase
          .from("user_profile")
          .select("name, email, status")
          .eq("auth_id", contact)
          .single()

        if (error) throw error
        setContactDetails(data)
      } catch (error) {
        console.error("Error fetching contact details:", error)
      }
    }

    fetchContactDetails()
  }, [contact])

  // Verificar si el contacto está en la lista de contactos
  useEffect(() => {
    const checkIfContact = async () => {
      if (!contact || !user) return

      try {
        const { data, error } = await supabase
          .from("user_contacts")
          .select("id")
          .eq("owner_user_id", user.id)
          .eq("contact_user_id", contact)
          .single()

        if (error && error.code !== "PGRST116") {
          console.error("Error checking contact:", error)
        }

        setIsContact(!!data)
      } catch (error) {
        console.error("Error checking if contact:", error)
      }
    }

    checkIfContact()
  }, [contact, user])

  // Función para agregar contacto
  const handleAddContact = async () => {
    if (!contact || !user || isAddingContact) return

    setIsAddingContact(true)
    setAddContactStatus(null)

    try {
      const { error } = await supabase.from("user_contacts").insert({
        owner_user_id: user.id,
        contact_user_id: contact,
      })

      if (error) throw error

      setIsContact(true)
      setAddContactStatus("success")

      // Resetear el estado después de 3 segundos
      setTimeout(() => {
        setAddContactStatus(null)
      }, 3000)
    } catch (error) {
      console.error("Error adding contact:", error)
      setAddContactStatus("error")
    } finally {
      setIsAddingContact(false)
    }
  }

  // 2. Escuchar mensajes en tiempo real
  useEffect(() => {
    if (!contact) return

    //let channel

    const subscription = supabase
      .channel("messages-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${user.id}`,
        },
        (payload) => {
          const message = payload.new
          if (message.sender_id === contact || message.receiver_id === contact) {
            setMessages((prev) => [...prev, message])
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [user, contact, chatId])

  // 3. Enviar mensaje
  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim()) return

    try {
      // If we don't have a chat ID yet, we need to create one or find an existing one
      let finalChatId = chatId

      if (!finalChatId) {
        // Check if a chat already exists
        const { data: existingMessages, error: messagesError } = await supabase
          .from("messages")
          .select("chat_id")
          .or(
            `and(sender_id.eq.${user.id},receiver_id.eq.${contact}),and(sender_id.eq.${contact},receiver_id.eq.${user.id})`,
          )
          .not("chat_id", "is", null)
          .limit(1)

        if (messagesError) throw messagesError

        if (existingMessages && existingMessages.length > 0) {
          finalChatId = existingMessages[0].chat_id
        } else {
          // Create a new chat
          const { data: newChat, error: chatError } = await supabase.from("chats").insert({}).select()

          if (chatError) throw chatError
          finalChatId = newChat[0].id
        }
      }

      const messageData = {
        sender_id: user.id,
        receiver_id: contact,
        content: input.trim(),
        chat_id: finalChatId,
      }

      const { error } = await supabase.from("messages").insert(messageData)

      if (error) throw error

      setMessages((prev) => [
        ...prev,
        {
          ...messageData,
          created_at: new Date().toISOString(),
        },
      ])
      setInput("")
    } catch (error) {
      console.error("Error sending message:", error)
      alert("Error al enviar el mensaje")
    }
  }

  if (!contact) {
    return (
      <div className="h-dvh bg-gray-800 w-full flex items-center justify-center text-gray-400">
        Selecciona un contacto para comenzar a chatear
      </div>
    )
  }

  return (
    <div className="h-dvh bg-gray-900 flex flex-col justify-between w-full">
      {/* Encabezado con nombre del contacto */}
      <div className="bg-gray-800 p-4 border-b border-gray-700 flex flex-col">
        {contactDetails ? (
          <>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-400 flex items-center justify-center text-white font-bold">
                {contactDetails.name?.slice(0, 2).toUpperCase() || "??"}
              </div>
              <div>
                <h3 className="font-medium text-white">{isContact ? contactDetails.name : contactDetails.email}</h3>
                <p className="text-xs text-gray-400">{contactDetails.status ? "En línea" : "Desconectado"}</p>
              </div>
            </div>

            {!isContact && (
              <div className="mt-3 bg-yellow-600/20 border border-yellow-600/30 rounded-md p-3 flex justify-between items-center">
                <p className="text-sm text-yellow-200">Esta persona no está en tus contactos</p>
                <button
                  onClick={handleAddContact}
                  disabled={isAddingContact}
                  className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded-md disabled:opacity-50"
                >
                  {isAddingContact ? "Agregando..." : "Agregar contacto"}
                </button>
              </div>
            )}

            {addContactStatus === "success" && (
              <div className="mt-3 bg-green-600/20 border border-green-600/30 rounded-md p-3">
                <p className="text-sm text-green-200">Contacto agregado exitosamente</p>
              </div>
            )}

            {addContactStatus === "error" && (
              <div className="mt-3 bg-red-600/20 border border-red-600/30 rounded-md p-3">
                <p className="text-sm text-red-200">Error al agregar contacto. Inténtalo de nuevo.</p>
              </div>
            )}
          </>
        ) : (
          <div className="h-10 flex items-center text-gray-400">Cargando...</div>
        )}
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, i) => {
          const isOwnMessage = msg.sender_id === user.id

          return (
            <div key={i} className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} my-1`}>
              <div
                className={`px-4 py-2 rounded-lg max-w-[70%] ${
                  isOwnMessage ? "bg-blue-500 text-white rounded-br-none" : "bg-gray-200 text-black rounded-bl-none"
                }`}
              >
                {msg.content}
              </div>
            </div>
          )
        })}
      </div>

      {/* Input de texto */}
      <form onSubmit={handleSend} className="p-4 border-t border-gray-700 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="w-full px-4 py-2 rounded-full bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-700">
          Enviar
        </button>
      </form>
    </div>
  )
}
