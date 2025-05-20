# 🧩 Chat App con Supabase + React + Vite

Esta es una aplicación de chat en tiempo real construida con **React**, **Vite**, **Supabase** y **TailwindCSS**, que incluye:

- Registro con verificación por correo
- Manejo de sesión
- Gestión de contactos
- Mensajería en tiempo real

---

## 🚀 Tecnologías

- **React**
- **Vite**
- **Supabase Auth** (correo + contraseña con verificación)
- **Supabase Realtime (Postgres + RLS)**
- **TailwindCSS**
- **Lucide-react** (iconos)
- **Radix UI** (opcional para accesibilidad / UI avanzada)

---

## 🏁 Instalación

1. **Clona el repositorio**

```bash
git clone https://github.com/Benjamin-Galan/react-chat-app
cd chat-app
```

2. **Instala las dependencias**

```bash
npm install
# o
yarn install
```

3. **Configura Supabase**

Crea un proyecto en [https://supabase.com](https://supabase.com) y copia los datos del proyecto.

Crea un archivo `.env` en la raíz:

```env
VITE_SUPABASE_URL=https://<tu-url>.supabase.co
VITE_SUPABASE_ANON_KEY=<tu-clave>
```

> Asegúrate de activar **Email Auth** y configurar las plantillas de correo si usas verificación por email.

4. **Estructura recomendada en Supabase**

Tablas principales:

- `user_profile`: perfil del usuario
  - `auth_id` (relación con `auth.users`)
  - `name`, `email`, `phone`, `bio`, `status`, `notifiable`

- `user_contacts`: contactos del usuario
  - `user_id`, `contact_id`

- `chats`: canal de conversación
  - `id`, `user_1`, `user_2`, `last_message_at`

- `messages`: mensajes dentro de un chat
  - `id`, `chat_id`, `sender_id`, `content`, `created_at`

---

## 🧑‍💻 Scripts

```bash
# Desarrollo
npm run dev

# Build producción
npm run build

# Preview local del build
npm run preview
```

---

## ✅ Funcionalidades

- [x] Registro con verificación por email
- [x] Inicio de sesión con validación de errores
- [x] Crear y visualizar contactos
- [x] Iniciar nuevos chats
- [x] Mensajes en tiempo real con Supabase
- [x] Estados de conexión
