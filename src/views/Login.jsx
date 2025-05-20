import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { login } from "../hooks/useAuth"
import { User, Lock } from "lucide-react"

export default function Login() {
    const [form, setForm] = useState({
        email: "",
        password: ""
    })

    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate();

    const handleChange = ({ target: { name, value } }) => {
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true)
        setError("")

        try {
            await login(form.email, form.password);
            navigate('/');
        } catch (error) {
            setError(error.message || "Error al registrar usuario")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-center dark:text-white">Iniciar sesión</h2>

            <form onSubmit={handleLogin}>
                <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Correo
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            id="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            name="email"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="Tu correo "
                        />
                    </div>
                </div>

                <div className="space-y-2 mt-3">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Contraseña
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="password"
                            id="password"
                            value={form.password}
                            onChange={handleChange}
                            required
                            name="password"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="Tu contraseña"
                        />
                    </div>
                </div>

                {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

                <button
                    type="submit"
                    className="w-full mt-5 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 transition-colors duration-200"
                    disabled={loading}
                >
                    {loading ? "Registrando..." : "Registrarse"}
                </button>

                <div className="text-sm text-center mt-2">
                    <a href="/register" className="font-medium text-teal-600 hover:text-teal-500 dark:text-teal-400">
                        ¿No tienes una cuenta? Registrate
                    </a>
                </div>
            </form>

            <form action=""></form>
        </div>
    )
}