import { MessageSquare, UserIcon, LogOut } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function Sidebar({ onPanelChange, activePanel, onClick    }) {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const initials = user?.email.slice(0, 2).toUpperCase() || "??";

    const btnClass = (panel) =>
        `p-3 rounded-lg flex justify-center items-center transition-colors duration-200 
        ${activePanel === panel ? "bg-indigo-600 text-white" : "text-gray-300 hover:bg-slate-700 hover:text-white"}`;

    const handleSignOut = async () => {
        try {
            await signOut();
            navigate("/login");
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    return (
        <aside className="h-screen w-1/12 bg-gray-900 flex flex-col justify-between items-center py-6 shadow-xl">
            {/* Avatar e iconos */}
            <div className="flex flex-col items-center gap-8">
                {/* Avatar */}
                <div
                    className="bg-indigo-500 border-4 border-indigo-700 rounded-full w-14 h-14 flex items-center justify-center text-white font-bold text-lg shadow-md hover:cursor-pointer"
                    onClick={onClick}
                >
                    {initials}
                </div>

                {/* Paneles */}
                <div className="space-y-4 flex flex-col">
                    <button className={btnClass("chats")} onClick={() => onPanelChange("chats")} title="Chats">
                        <MessageSquare size={22} />
                    </button>
                    <button className={btnClass("contacts")} onClick={() => onPanelChange("contacts")} title="Contactos">
                        <UserIcon size={22} />
                    </button>
                </div>
            </div>

            {/* Separador */}
            <div className="w-full border-t border-gray-700 my-4" />

            {/* Logout */}
            <button
                onClick={handleSignOut}
                title="Cerrar sesión"
                className="p-3 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-all duration-200"
            >
                <LogOut size={22} />
            </button>
        </aside>
    );
}
