import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  Modal,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { listarLivros, adicionarLivro } from "../backend/api/Livros";
import { criarRegistro } from "../backend/api/Registros";

// No Web não existe módulo nativo, então só importamos o DateTimePicker
// fora da Web. Isso evita que o bundler quebre tentando resolver o pacote nativo.
let DateTimePicker = null;
if (Platform.OS !== "web") {
  DateTimePicker = require("@react-native-community/datetimepicker").default;
}

const OPCAO_NENHUM = "Nenhum";

function formatarData(date) {
  const dia = String(date.getDate()).padStart(2, "0");
  const mes = String(date.getMonth() + 1).padStart(2, "0");
  const ano = date.getFullYear();
  return `${dia}/${mes}/${ano}`;
}

// Converte Date -> "yyyy-mm-dd" (formato exigido pelo <input type="date"> e pelo Postgres)
function dateParaInputValue(date) {
  const ano = date.getFullYear();
  const mes = String(date.getMonth() + 1).padStart(2, "0");
  const dia = String(date.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

export default function Cadastrar({ onSave }) {
  const [nome, setNome] = useState("");
  const [livro, setLivro] = useState(""); // guarda o objeto { id, nome } selecionado
  const [dataLimite, setDataLimite] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [showLivroModal, setShowLivroModal] = useState(false);

  const [livros, setLivros] = useState([]);
  const [carregandoLivros, setCarregandoLivros] = useState(true);
  const [showAddLivroModal, setShowAddLivroModal] = useState(false);
  const [novoLivro, setNovoLivro] = useState("");
  const [salvando, setSalvando] = useState(false);

  const carregarLivros = useCallback(async () => {
    try {
      setCarregandoLivros(true);
      const dados = await listarLivros();
      setLivros(dados);
    } catch (err) {
      Alert.alert("Erro", "Não foi possível carregar a lista de livros: " + err.message);
    } finally {
      setCarregandoLivros(false);
    }
  }, []);

  useEffect(() => {
    carregarLivros();
  }, [carregarLivros]);

  function handleChangeDate(event, selectedDate) {
    setShowPicker(Platform.OS === "ios");
    if (selectedDate) {
      setDataLimite(selectedDate);
    }
  }

  // Handler específico pro <input type="date"> da Web
  function handleChangeDateWeb(event) {
    const valor = event.target.value; // "yyyy-mm-dd"
    if (!valor) {
      setDataLimite(null);
      return;
    }
    const [ano, mes, dia] = valor.split("-").map(Number);
    setDataLimite(new Date(ano, mes - 1, dia));
  }

  async function handleAdicionarLivro() {
    const nomeFormatado = novoLivro.trim();

    if (!nomeFormatado) {
      Alert.alert("Atenção", "Digite o nome do livro.");
      return;
    }

    if (
      nomeFormatado.toLowerCase() === OPCAO_NENHUM.toLowerCase() ||
      livros.some((l) => l.nome.toLowerCase() === nomeFormatado.toLowerCase())
    ) {
      Alert.alert("Atenção", "Esse livro já existe na lista.");
      return;
    }

    try {
      const novo = await adicionarLivro(nomeFormatado);
      setLivros((prev) => [...prev, novo].sort((a, b) => a.nome.localeCompare(b.nome)));
      setLivro(novo);
      setNovoLivro("");
      setShowAddLivroModal(false);
    } catch (err) {
      Alert.alert("Erro", err.message || "Não foi possível adicionar o livro.");
    }
  }

  async function handleSave() {
    if (!nome.trim() || !livro || livro === OPCAO_NENHUM || !dataLimite) {
      Alert.alert(
        "Atenção",
        "Selecione um livro válido e preencha todos os campos antes de salvar."
      );
      return;
    }

    try {
      setSalvando(true);

      const registroSalvo = await criarRegistro({
        nomePessoa: nome.trim(),
        livroId: livro.id,
        livroNome: livro.nome,
        dataLimite: dateParaInputValue(dataLimite),
      });

      onSave?.(registroSalvo);

      setNome("");
      setLivro("");
      setDataLimite(null);

      Alert.alert("Sucesso", "Registro cadastrado com sucesso!");
    } catch (err) {
      Alert.alert("Erro", "Não foi possível salvar o registro: " + err.message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cadastrar</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome da Pessoa"
        placeholderTextColor="#777"
        value={nome}
        onChangeText={setNome}
      />

      <View style={styles.livroRow}>
        <TouchableOpacity
          style={[styles.input, styles.livroSelect]}
          activeOpacity={0.75}
          onPress={() => setShowLivroModal(true)}
        >
          <Text style={livro ? styles.dateTextFilled : styles.dateTextPlaceholder}>
            {livro
              ? livro === OPCAO_NENHUM
                ? "— Nenhum livro —"
                : `📖 ${livro.nome}`
              : "Selecione o livro"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.addButton}
          activeOpacity={0.75}
          onPress={() => setShowAddLivroModal(true)}
        >
          <Text style={styles.addButtonText}>＋</Text>
        </TouchableOpacity>
      </View>

      {/* Campo de Data: Web usa <input type="date">, nativo usa o TouchableOpacity + DateTimePicker */}
      {Platform.OS === "web" ? (
        <input
          type="date"
          value={dataLimite ? dateParaInputValue(dataLimite) : ""}
          min={dateParaInputValue(new Date())}
          onChange={handleChangeDateWeb}
          style={webInputDateStyle}
        />
      ) : (
        <>
          <TouchableOpacity
            style={styles.input}
            activeOpacity={0.75}
            onPress={() => setShowPicker(true)}
          >
            <Text style={dataLimite ? styles.dateTextFilled : styles.dateTextPlaceholder}>
              {dataLimite ? `📅 ${formatarData(dataLimite)}` : "Data limite"}
            </Text>
          </TouchableOpacity>

          {showPicker && (
            <DateTimePicker
              value={dataLimite || new Date()}
              mode="date"
              display={Platform.OS === "ios" ? "inline" : "default"}
              onChange={handleChangeDate}
              minimumDate={new Date()}
              themeVariant="dark"
            />
          )}
        </>
      )}

      <TouchableOpacity
        style={[styles.saveButton, salvando && styles.saveButtonDisabled]}
        activeOpacity={0.75}
        onPress={handleSave}
        disabled={salvando}
      >
        {salvando ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>Salvar</Text>
        )}
      </TouchableOpacity>

      {/* Modal de seleção de livro */}
      <Modal
        visible={showLivroModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowLivroModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Livros</Text>

            {carregandoLivros ? (
              <ActivityIndicator color="#fff" style={{ marginVertical: 20 }} />
            ) : (
              <FlatList
                data={[OPCAO_NENHUM, ...livros]}
                keyExtractor={(item) => (item === OPCAO_NENHUM ? OPCAO_NENHUM : item.id)}
                contentContainerStyle={{ paddingBottom: 16 }}
                renderItem={({ item }) => {
                  const isNenhum = item === OPCAO_NENHUM;
                  const selecionado = !isNenhum && livro?.id === item.id;
                  const nenhumSelecionado = isNenhum && livro === OPCAO_NENHUM;
                  return (
                    <TouchableOpacity
                      style={[
                        styles.livroOption,
                        isNenhum && styles.livroOptionNenhum,
                        (selecionado || nenhumSelecionado) && styles.livroOptionSelected,
                      ]}
                      activeOpacity={0.75}
                      onPress={() => {
                        setLivro(isNenhum ? OPCAO_NENHUM : item);
                        setShowLivroModal(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.livroOptionText,
                          isNenhum && styles.livroOptionTextNenhum,
                          (selecionado || nenhumSelecionado) && styles.livroOptionTextSelected,
                        ]}
                      >
                        {isNenhum ? "— Nenhum —" : item.nome}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
              />
            )}

            <TouchableOpacity
              style={styles.modalCloseButton}
              activeOpacity={0.75}
              onPress={() => setShowLivroModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de adicionar novo livro */}
      <Modal
        visible={showAddLivroModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowAddLivroModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.addModalContent}>
            <Text style={styles.modalTitle}>Adicionar Livro</Text>

            <TextInput
              style={styles.input}
              placeholder="Nome do novo livro"
              placeholderTextColor="#777"
              value={novoLivro}
              onChangeText={setNovoLivro}
              autoFocus
            />

            <View style={styles.addModalButtonsRow}>
              <TouchableOpacity
                style={[styles.addModalButton, styles.addModalButtonCancel]}
                activeOpacity={0.75}
                onPress={() => {
                  setNovoLivro("");
                  setShowAddLivroModal(false);
                }}
              >
                <Text style={styles.addModalButtonTextCancel}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.addModalButton, styles.addModalButtonConfirm]}
                activeOpacity={0.75}
                onPress={handleAdicionarLivro}
              >
                <Text style={styles.addModalButtonTextConfirm}>Adicionar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Estilo em objeto CSS puro pro <input> HTML (usado só na Web)
const webInputDateStyle = {
  backgroundColor: "#1c1c1c",
  border: "1px solid #2e2e2e",
  borderRadius: 14,
  paddingTop: 14,
  paddingBottom: 14,
  paddingLeft: 16,
  paddingRight: 16,
  color: "#fff",
  marginBottom: 12,
  fontSize: 15,
  width: "100%",
  boxSizing: "border-box",
  fontFamily: "inherit",
  colorScheme: "dark",
};

const styles = StyleSheet.create({
  container: {
    width: "90%",
    alignSelf: "center",
    marginTop: 24,
  },
  title: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 16,
  },
  input: {
    backgroundColor: "#1c1c1c",
    borderWidth: 1,
    borderColor: "#2e2e2e",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    color: "#fff",
    marginBottom: 12,
  },
  livroRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  livroSelect: {
    flex: 1,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#232323",
    borderWidth: 1,
    borderColor: "#2e2e2e",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  addButtonText: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "700",
    lineHeight: 24,
  },
  dateTextPlaceholder: {
    color: "#777",
    fontSize: 15,
  },
  dateTextFilled: {
    color: "#fff",
    fontSize: 15,
  },
  saveButton: {
    backgroundColor: "#3a3a3a",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#161616",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: "#2a2a2a",
    paddingHorizontal: 16,
    paddingTop: 16,
    maxHeight: "75%",
  },
  modalTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 14,
  },
  livroOption: {
    backgroundColor: "#1c1c1c",
    borderWidth: 1,
    borderColor: "#2e2e2e",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 8,
  },
  livroOptionNenhum: {
    borderStyle: "dashed",
  },
  livroOptionSelected: {
    backgroundColor: "#3a3a3a",
    borderColor: "#555",
  },
  livroOptionText: {
    color: "#e5e5e5",
    fontSize: 14,
    fontWeight: "600",
  },
  livroOptionTextNenhum: {
    color: "#9a9a9a",
    fontStyle: "italic",
  },
  livroOptionTextSelected: {
    color: "#ffffff",
  },
  modalCloseButton: {
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 8,
  },
  modalCloseButtonText: {
    color: "#9a9a9a",
    fontSize: 14,
    fontWeight: "600",
  },
  addModalContent: {
    width: "85%",
    alignSelf: "center",
    backgroundColor: "#161616",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#2a2a2a",
    padding: 18,
    marginBottom: "auto",
    marginTop: "auto",
  },
  addModalButtonsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  addModalButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  addModalButtonCancel: {
    backgroundColor: "#232323",
    borderWidth: 1,
    borderColor: "#2e2e2e",
  },
  addModalButtonConfirm: {
    backgroundColor: "#3a3a3a",
    borderWidth: 1,
    borderColor: "#555",
  },
  addModalButtonTextCancel: {
    color: "#9a9a9a",
    fontWeight: "600",
    fontSize: 14,
  },
  addModalButtonTextConfirm: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 14,
  },
});