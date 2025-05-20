"use client"

import { useEffect, useState } from "react"
import { PlusIcon, EllipsisVertical } from "lucide-react"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import AddContactModal from "./AddContactModal"
import { useAuth } from "../hooks/useAuth"
import { supabase } from "../services/supabase"

export default function Contacts({ onSelectContact, onStartChat }) {
  const [contactDetails, setContactDetails] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const { user } = useAuth()

  const fetchContactIds = async () => {
    const { data, error } = await supabase
      .from("user_contacts")
      .select("contact_user_id")
      .eq("owner_user_id", user.id)

    if (error) {
      console.error("Error fetching contact IDs:", error)
      return []
    }

    return data.map((c) => c.contact_user_id)
  }

  const fetchContactDetails = async (ids) => {
    if (!ids.length) return []

    const { data, error } = await supabase
      .from("user_profile")
      .select("name, email, auth_id")
      .in("auth_id", ids)
      .order("name", { ascending: true })

    if (error) {
      console.error("Error fetching contact details:", error)
      return []
    }

    return data
  }

  const fetchContacts = async () => {
    const ids = await fetchContactIds()
    const details = await fetchContactDetails(ids)
    setContactDetails(details)
  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  const filteredContacts = contactDetails.filter((c) => {
    const normalizedTerm = searchTerm.toLowerCase()
    return (
      c.name?.toLowerCase().includes(normalizedTerm) ||
      c.email?.toLowerCase().includes(normalizedTerm)
    )
  })

  const handleStartChat = async (contactId) => {
    try {
      const { data: existingMessages, error } = await supabase
        .from("messages")
        .select("chat_id")
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${contactId}),and(sender_id.eq.${contactId},receiver_id.eq.${user.id})`
        )
        .not("chat_id", "is", null)
        .limit(1)

      if (error) throw error

      let chatId = existingMessages?.[0]?.chat_id

      if (!chatId) {
        const { data: newChat, error: chatError } = await supabase
          .from("chats")
          .insert({})
          .select()

        if (chatError) throw chatError
        chatId = newChat[0].id
      }

      onSelectContact(contactId)
      onStartChat(chatId, contactId)
    } catch (err) {
      console.error("Error starting chat:", err)
      alert("Error al iniciar el chat")
    }
  }

  const handleDeleteContact = async (contactId) => {
    if (!window.confirm("¿Estás seguro que deseas eliminar este contacto?")) return

    const { error } = await supabase
      .from("user_contacts")
      .delete()
      .eq("owner_user_id", user.id)
      .eq("contact_user_id", contactId)

    if (error) {
      console.error("Error deleting contact:", error)
      alert("Error al eliminar el contacto")
    } else {
      alert("Contacto eliminado")
      fetchContacts()
    }
  }

  useEffect(() => {
    let isMounted = true
    const load = async () => {
      if (user && isMounted) await fetchContacts()
    }
    load()
    return () => {
      isMounted = false
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  return (
    <div className="h-dvh bg-gray-800 w-1/3 flex flex-col">
      <div className="p-4 border-b border-gray-700 flex items-center gap-4 justify-between">
        <input
          type="text"
          placeholder="Buscar contactos..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full px-4 py-2 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={() => setShowModal(true)}
          aria-label="Agregar contacto"
          className="bg-indigo-200 rounded-full p-1"
        >
          <PlusIcon />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredContacts.map((c) => (
          <div
            key={c.auth_id}
            className="flex items-center justify-between gap-4 p-4 hover:bg-gray-700 cursor-pointer border-b border-gray-700"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-indigo-400 flex items-center justify-center text-white font-semibold uppercase">
                {c.name?.[0] || c.email?.[0]}
              </div>
              <div className="text-white">
                <div className="font-medium">{c.name || c.email}</div>
              </div>
            </div>

            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="p-1 hover:bg-gray-600 rounded">
                  <EllipsisVertical color="white" />
                </button>
              </DropdownMenu.Trigger>

              <DropdownMenu.Content
                className="bg-white text-sm shadow-md rounded py-1 px-2"
                sideOffset={5}
                align="end"
              >
                <DropdownMenu.Item
                  className="hover:bg-gray-200 px-2 py-1 rounded cursor-pointer"
                  onClick={() => handleStartChat(c.auth_id)}
                >
                  Iniciar chat
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  className="hover:bg-gray-200 px-2 py-1 rounded cursor-pointer"
                  onClick={() => handleDeleteContact(c.auth_id)}
                >
                  Eliminar contacto
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </div>
        ))}
      </div>

      <AddContactModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          fetchContacts()
        }}
      />
    </div>
  )
}
