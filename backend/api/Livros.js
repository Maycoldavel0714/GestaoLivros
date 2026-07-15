import { supabase } from "../Supabaseclient";

// Lista todos os livros, ordenados por nome
export async function listarLivros() {
  const { data, error } = await supabase
    .from("livros")
    .select("*")
    .order("nome", { ascending: true });

  if (error) throw error;
  return data;
}

// Adiciona um novo livro à lista
export async function adicionarLivro(nome, quantidade) {
  const { data, error } = await supabase
    .from("livros")
    .insert([{ nome, quantidade }])   // <- precisa ter quantidade aqui
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}