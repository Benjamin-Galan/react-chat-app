import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../services/supabase";

export default function Profile({ show }) {
    const [profile, setProfile] = useState(null);
    const { user } = useAuth();

    const fetchProfile = async () => {
        const { data, error } = await supabase
            .from("user_profile")
            .select("name, email, bio, status, phone, auth_id")
            .eq("auth_id", user.id)
            .single();

        if (error) {
            console.error("Error fetching profile:", error);
        }

        setProfile(data);
        console.log(data, "profile");
    }

    useEffect(() => {
        if (user) fetchProfile();
    }, [user]);

    if (!profile) return <div className="text-white p-6">Cargando perfil...</div>; // opcional

    return (
        <div className={`
  fixed top-0 right-0 h-dvh w-80 bg-gray-800 text-white p-6 transition-transform duration-300 z-50
  ${show ? "translate-x-0" : "translate-x-full"}
`}>

            <div className="flex flex-col items-center gap-4">
                <div className="w-24 h-24 rounded-full bg-indigo-500 border-4 border-indigo-700 flex items-center justify-center text-4xl font-bold text-white">
                    {user?.email?.slice(0, 2).toUpperCase()}
                </div>
                <h2 className="text-xl font-semibold">{profile.name}</h2>
                <p className="text-sm text-gray-400">Estado: {profile.status ? 'En Línea' : 'Desconectado'}</p>
            </div>

            <div className="mt-10 space-y-4">
                <div>
                    <h3 className="text-sm text-gray-500 uppercase">Correo</h3>
                    <p className="text-white">{user.email}</p>
                </div>
                <div>
                    <h3 className="text-sm text-gray-500 uppercase">Biografía</h3>
                    <p className="text-gray-300">{profile.bio || 'Hola, estoy usando Ghossip'}</p>
                </div>
            </div>
        </div>
    );
}
