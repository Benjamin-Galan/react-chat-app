"use client"

import { useEffect, useState } from "react"
import { supabase } from "../services/supabase"
import { useAuth } from "../hooks/useAuth"

export default function Chats({ onSelectChat, activeChatId }) {
  const [chats, setChats] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchChats()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const fetchChats = async () => {
    try {
      // Get all messages where the user is sender or receiver
      const { data: messages, error: messagesError } = await supabase
        .from("messages")
        .select(`
      id, 
      content, 
      created_at, 
      chat_id, 
      sender_id, 
      receiver_id
    `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: false })

      if (messagesError) throw messagesError

      // Group messages by chat_id and get the latest message for each chat
      const chatMap = new Map()

      for (const message of messages) {
        if (!message.chat_id) continue

        if (!chatMap.has(message.chat_id)) {
          // Determine the contact ID (the other user in the conversation)
          const contactId = message.sender_id === user.id ? message.receiver_id : message.sender_id

          chatMap.set(message.chat_id, {
            chat_id: message.chat_id,
            contact_id: contactId,
            last_message: message.content,
            last_message_time: message.created_at,
          })
        }
      }

      // Get contact details for each chat
      const chatArray = Array.from(chatMap.values())
      const contactIds = chatArray.map((chat) => chat.contact_id)

      if (contactIds.length > 0) {
        // Obtener todos los perfiles de usuario
        const { data: profiles, error: profilesError } = await supabase
          .from("user_profile")
          .select("auth_id, name, email, status")
          .in("auth_id", contactIds)

        if (profilesError) throw profilesError

        // Obtener la lista de contactos del usuario
        const { data: userContacts, error: contactsError } = await supabase
          .from("user_contacts")
          .select("contact_user_id")
          .eq("owner_user_id", user.id)

        if (contactsError) throw contactsError

        // Crear un conjunto de IDs de contactos para búsqueda rápida
        const contactsSet = new Set(userContacts.map((contact) => contact.contact_user_id))

        // Merge profile data with chat data
        const chatsWithProfiles = chatArray.map((chat) => {
          const profile = profiles.find((p) => p.auth_id === chat.contact_id)
          const isContact = contactsSet.has(chat.contact_id)

          return {
            ...chat,
            contact_name: isContact ? profile?.name : profile?.email || "Usuario desconocido",
            contact_email: profile?.email || "",
            is_online: profile?.status || false,
            is_contact: isContact,
          }
        })

        setChats(chatsWithProfiles)
      } else {
        setChats([])
      }
    } catch (error) {
      console.error("Error fetching chats:", error)
    }
  }

  const handleSelectChat = (chatId, contactId) => {
    if (onSelectChat) {
      onSelectChat(chatId, contactId)
    }
  }

  const filteredChats = chats.filter((chat) => chat.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="h-dvh bg-gray-800 w-1/3 flex flex-col">
      {/* Búsqueda */}
      <div className="p-4 border-b border-gray-700">
        <input
          type="text"
          placeholder="Buscar chats..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Lista de chats */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length > 0 ? (
          filteredChats.map((chat) => (
            <div
              key={chat.chat_id}
              className={`flex items-center gap-4 p-4 hover:bg-gray-700 cursor-pointer border-b border-gray-700 ${
                chat.chat_id === activeChatId ? "bg-gray-700 border-l-4 border-l-indigo-500" : ""
              }`}
              onClick={() => handleSelectChat(chat.chat_id, chat.contact_id)}
            >
              <div className="w-10 h-10 rounded-full bg-indigo-400 flex items-end justify-end">
                {/* {!chat.is_contact && (
                  <div className="absolute w-4 h-4 rounded-full bg-yellow-500 -mt-1 -ml-1 flex items-center justify-center">
                    <span className="text-xs">?</span>
                  </div>
                )} */}
                <div
                  className={`w-3 h-3 rounded-full ${chat.is_online ? "bg-lime-400" : "bg-gray-400"} relative`}
                ></div>
              </div>
              <div className="text-white flex-1">
                <div className="font-medium flex items-center gap-2">
                  {chat.contact_name || "Usuario"}
                  {!chat.is_contact }
                </div>
                <div className="text-sm text-gray-400 truncate">{chat.last_message || "No hay mensajes"}</div>
              </div>
              <div className="text-xs text-gray-500">
                {chat.last_message_time
                  ? new Date(chat.last_message_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                  : ""}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center p-4 text-gray-400">No hay chats disponibles</div>
        )}
      </div>
    </div>
  )
}
