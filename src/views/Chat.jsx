"use client"

import { useState } from "react"
import Sidebar from "./Sidebar"
import Chats from "./Chats"
import ChatArea from "./ChatArea"
import Profile from "./Profile"
import Contacts from "./Contacts"

export default function Chat() {
  const [activePanel, setActivePanel] = useState("chats")
  const [activeContact, setActiveContact] = useState(null)
  const [activeChatId, setActiveChatId] = useState(null)
  const [showProfile, setShowProfile] = useState(false)

  const handleStartChat = (chatId, contactId) => {
    setActiveChatId(chatId)
    setActiveContact(contactId)
    setActivePanel("chats")
  }

  const handleSelectChat = (chatId, contactId) => {
    setActiveChatId(chatId)
    setActiveContact(contactId)
  }

  const handleProfileWindow = () => {
    setShowProfile((prev) => !prev)
  }

  return (
    <>
      <main className="flex">
        <Sidebar onClick={handleProfileWindow} onPanelChange={setActivePanel} activePanel={activePanel} />

        {/**Renderizado dinamico */}
        {activePanel === "chats" ? (
          <Chats onSelectChat={handleSelectChat} activeChatId={activeChatId} />
        ) : activePanel === "contacts" ? (
          <Contacts onSelectContact={setActiveContact} onStartChat={handleStartChat} />
        ) : (
          <Chats onSelectChat={handleSelectChat} activeChatId={activeChatId} />
        )}

        <ChatArea contact={activeContact} chatId={activeChatId} />
        <Profile show={showProfile} />
      </main>
    </>
  )
}
