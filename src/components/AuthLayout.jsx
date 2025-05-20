export default function AuthLayout({ children }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-teal-900 to-gray-900 p-4">
      <div className="grid md:grid-cols-2 bg-white dark:bg-gray-800 shadow-xl rounded-xl overflow-hidden w-full max-w-5xl animate-fade-in">
        <div className="hidden md:block">
          <img src="/logo6.png" alt="Logo" className="w-full h-full object-cover" />
        </div>

        <div className="p-8 md:p-12 dark:bg-gray-800 dark:text-white overflow-y-auto max-h-[80vh]">{children}</div>
      </div>
    </div>
  )
}
