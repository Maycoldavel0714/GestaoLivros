import { supabase } from "../Supabaseclient";

// Cria um novo registro de empréstimo
// dataLimite deve estar no formato "yyyy-mm-dd"
export async function criarRegistro({ nomePessoa, livroId, livroNome, dataLimite }) {
  const { data, error } = await supabase
    .from("registros")
    .insert({
      nome_pessoa: nomePessoa,
      livro_id: livroId,
      livro_nome: livroNome,
      data_limite: dataLimite,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Lista todos os registros, mais recentes primeiro
export async function listarRegistros() {
  const { data, error } = await supabase
    .from("registros")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

// Lista apenas registros pendentes (não devolvidos)
export async function listarPendentes() {
  const { data, error } = await supabase
    .from("registros")
    .select("*")
    .eq("devolvido", false)
    .order("data_limite", { ascending: true });

  if (error) throw error;
  return data;
}

// Marca um registro como devolvido (com data de hoje)
export async function marcarComoDevolvido(id) {
  const hoje = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("registros")
    .update({ devolvido: true, data_devolucao: hoje })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Remove um registro
export async function excluirRegistro(id) {
  const { error } = await supabase.from("registros").delete().eq("id", id);
  if (error) throw error;
}