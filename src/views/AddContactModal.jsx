"use client"

import { useState } from "react"
import { supabase } from "../services/supabase"
import { useAuth } from "../hooks/useAuth"
import { X } from "lucide-react"

export default function AddContactModal({ isOpen, onClose }) {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const { user } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      // Validar formato de email
      if (!email || !email.includes("@")) {
        throw new Error("Por favor ingresa un correo electrónico válido")
      }

      // Verificar si el correo existe en la base de datos
      const { data: userProfile, error: userError } = await supabase
        .from("user_profile")
        .select("auth_id, email")
        .eq("email", email)
        .single()

      if (userError || !userProfile) {
        throw new Error("No se encontró ningún usuario con ese correo electrónico")
      }

      // Verificar que no sea el propio usuario
      if (userProfile.auth_id === user.id) {
        throw new Error("No puedes agregarte a ti mismo como contacto")
      }

      // Verificar si ya está en la lista de contactos
      const { data: existingContact, error: contactError } = await supabase
        .from("user_contacts")
        .select("*")
        .eq("owner_user_id", user.id)
        .eq("contact_user_id", userProfile.auth_id)

      if (contactError) throw contactError

      if (existingContact && existingContact.length > 0) {
        throw new Error("Este usuario ya está en tu lista de contactos")
      }

      // Agregar contacto
      const { error: insertError } = await supabase.from("user_contacts").insert({
        owner_user_id: user.id,
        contact_user_id: userProfile.auth_id,
      })

      if (insertError) throw insertError

      setSuccess("Contacto agregado exitosamente")
      setEmail("")

      // Cerrar el modal después de 2 segundos
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96 max-h-[80vh] overflow-y-auto relative">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          onClick={onClose}
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold mb-6 dark:text-white">Agregar contacto</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Correo electrónico
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={loading}
            />
          </div>

          {error && <div className="text-red-500 text-sm py-2 px-3 bg-red-50 dark:bg-red-900/20 rounded">{error}</div>}

          {success && (
            <div className="text-green-500 text-sm py-2 px-3 bg-green-50 dark:bg-green-900/20 rounded">{success}</div>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Agregando..." : "Agregar contacto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
