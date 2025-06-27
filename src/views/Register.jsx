"use client"

import React, { useState } from "react"
import { supabase } from "../services/supabase"
import { User, Mail, Phone, Lock, Icon } from "lucide-react"

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const validate = () => {
    const { name, email, password, phone } = form

    if (!name.trim()) return "El nombre es obligatorio"
    if (!/^\S+@\S+\.\S+$/.test(email)) return "Email inválido"
    if (password.length < 6) return "La contraseña debe tener al menos 6 caracteres"
    if (!/^\+?[0-9]{7,15}$/.test(phone)) return "Número de teléfono inválido"
    return ""
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccessMessage("")

    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)

    try {
      const { name, email, password, phone } = form

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (signUpError) throw signUpError

      const userId = data.user?.id
      if (!userId) throw new Error("No se pudo obtener el ID del usuario")

      const { error: profileError } = await supabase.from("user_profile").insert([
        {
          name,
          email,
          phone,
          auth_id: userId,
          bio: "",
          status: true,
          notifiable: true,
        },
      ])

      if (profileError) throw profileError

      setSuccessMessage("Registro exitoso. Verifica tu correo para poder iniciar sesión.")
      setForm({ name: "", email: "", password: "", phone: "" })
    } catch (err) {
      console.error("Error en el registro:", err)
      setError(err.message || "Error al registrar usuario")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center dark:text-white">Crear cuenta</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        {successMessage && <p className="text-sm text-green-600 dark:text-green-400">{successMessage}</p>}

        <InputField
          label="Nombre"
          name="name"
          type="text"
          icon={User}
          value={form.name}
          onChange={handleChange}
          placeholder="Tu nombre completo"
        />

        <InputField
          label="Email"
          name="email"
          type="email"
          icon={Mail}
          value={form.email}
          onChange={handleChange}
          placeholder="correo@ejemplo.com"
        />

        <InputField
          label="Teléfono"
          name="phone"
          type="tel"
          icon={Phone}
          value={form.phone}
          onChange={handleChange}
          placeholder="+1234567890"
        />

        <InputField
          label="Contraseña"
          name="password"
          type="password"
          icon={Lock}
          value={form.password}
          onChange={handleChange}
          placeholder="Contraseña segura"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 transition-colors duration-200"
        >
          {loading ? "Registrando..." : "Registrarse"}
        </button>

        <div className="text-sm text-center">
          <a href="/login" className="font-medium text-teal-600 hover:text-teal-500 dark:text-teal-400">
            ¿Ya tienes cuenta? Inicia sesión
          </a>
        </div>
      </form>
    </div>
  )
}

// Reusable input component
function InputField({ label, name, type, value, onChange, placeholder, icon }) {
  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {icon && React.createElement(icon, { className: "w-5 h-5 text-gray-400" })}
        </div>
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          placeholder={placeholder}
        />
      </div>
    </div>
  )
}
