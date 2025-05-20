import { useContext } from "react"
import { AuthContext } from "../context/AuthContext"
export const useAuth = () => useContext(AuthContext)
import { supabase } from "../services/supabase"

export const login = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
};