import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";

// Pegue esses dois valores em: Supabase > seu projeto > Project Settings > API
const SUPABASE_URL = "https://bchtignwvuzbfpkgvmbq.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_uQgJaOofRXz5Y7ELjbgjkQ_cl_cSbM2";
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY,{
  auth: {
    persistSession: false, // não há login no app, então não precisa persistir sessão
  },
});