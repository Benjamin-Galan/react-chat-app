import { createClient } from "@supabase/supabase-js";

const supabase_url = import.meta.env.SUPABASE_URL;
const supabase_key = import.meta.env.SUPABASE_KEY;

export const supabase = createClient( supabase_url,supabase_key)
