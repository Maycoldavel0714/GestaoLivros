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
export async function adicionarLivro(nome) {
  const { data, error } = await supabase
    .from("livros")
    .insert({ nome })
    .select()
    .single();

  if (error) {
    // Código 23505 = violação de unicidade (livro já existe)
    if (error.code === "23505") {
      throw new Error("Esse livro já existe na lista.");
    }
    throw error;
  }

  return data;
}