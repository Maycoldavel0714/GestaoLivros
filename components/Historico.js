import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Platform,
} from "react-native";
import { listarRegistros, marcarComoDevolvido, excluirRegistro } from "../backend/api/Registros";

const FILTROS = {
  PENDENTES: "pendentes",
  DEVOLVIDOS: "devolvidos",
};

// "yyyy-mm-dd" -> "dd/mm/aaaa"
function formatarDataISO(dataISO) {
  if (!dataISO) return "";
  const [ano, mes, dia] = dataISO.split("-");
  return `${dia}/${mes}/${ano}`;
}

export default function Historico() {
  const [registros, setRegistros] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [filtro, setFiltro] = useState(FILTROS.TODOS);

  const carregar = useCallback(async () => {
    try {
      const dados = await listarRegistros();
      setRegistros(dados);
    } catch (err) {
      Alert.alert("Erro", "Não foi possível carregar o histórico: " + err.message);
    }
  }, []);

  useEffect(() => {
    (async () => {
      setCarregando(true);
      await carregar();
      setCarregando(false);
    })();
  }, [carregar]);

  async function handleRefresh() {
    setAtualizando(true);
    await carregar();
    setAtualizando(false);
  }

  async function handleDevolver(id) {
    try {
      await marcarComoDevolvido(id);
      carregar(); // recarrega a lista pra refletir a mudança
    } catch (err) {
      Alert.alert("Erro", "Não foi possível marcar como devolvido: " + err.message);
    }
  }
async function confirmarExclusao(id) {
  try {
    await excluirRegistro(id);
    await carregar();

    if (Platform.OS === "web") {
      window.alert("Registro excluído com sucesso!");
    } else {
      Alert.alert("Sucesso", "Registro excluído com sucesso!");
    }
  } catch (err) {
    if (Platform.OS === "web") {
      window.alert(err.message);
    } else {
      Alert.alert("Erro", err.message);
    }
  }
}
function handleExcluir(id) {
  if (Platform.OS === "web") {
    const confirmar = window.confirm(
      "Tem certeza que deseja excluir este registro?"
    );

    if (confirmar) {
      confirmarExclusao(id);
    }
  } else {
    Alert.alert(
      "Excluir registro",
      "Tem certeza que deseja excluir este registro do histórico?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () => confirmarExclusao(id),
        },
      ]
    );
  }
}

  const registrosFiltrados = registros.filter((r) => {
    if (filtro === FILTROS.PENDENTES) return !r.devolvido;
    if (filtro === FILTROS.DEVOLVIDOS) return r.devolvido;
    return true;
  });

  if (carregando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator color="#fff" size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Histórico</Text>

      <View style={styles.filtrosRow}>
        {[
          { chave: FILTROS.PENDENTES, label: "Pendentes" },
          { chave: FILTROS.DEVOLVIDOS, label: "Devolvidos" },
        ].map((f) => (
          <TouchableOpacity
            key={f.chave}
            style={[styles.filtroButton, filtro === f.chave && styles.filtroButtonAtivo]}
            onPress={() => setFiltro(f.chave)}
            activeOpacity={0.75}
          >
            <Text
              style={[
                styles.filtroButtonText,
                filtro === f.chave && styles.filtroButtonTextAtivo,
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={registrosFiltrados}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={atualizando} onRefresh={handleRefresh} tintColor="#fff" />
        }
        contentContainerStyle={{ paddingBottom: 24 }}
        ListEmptyComponent={
          <Text style={styles.vazioText}>Nenhum registro encontrado.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardNome}>{item.nome_pessoa}</Text>
              <View
                style={[
                  styles.badge,
                  item.devolvido ? styles.badgeDevolvido : styles.badgePendente,
                ]}
              >
                <Text style={styles.badgeText}>
                  {item.devolvido ? "Devolvido" : "Pendente"}
                </Text>
              </View>
            </View>

            <Text style={styles.cardLivro}>📖 {item.livro_nome}</Text>
            <Text style={styles.cardData}>
              Limite: {formatarDataISO(item.data_limite)}
              {item.devolvido && item.data_devolucao
                ? `  •  Devolvido em: ${formatarDataISO(item.data_devolucao)}`
                : ""}
            </Text>

            <View style={styles.cardActionsRow}>
              {!item.devolvido && (
                <TouchableOpacity
                  style={styles.actionButton}
                  activeOpacity={0.75}
                  onPress={() => handleDevolver(item.id)}
                >
                  <Text style={styles.actionButtonText}>Marcar devolvido</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.actionButton, styles.actionButtonExcluir]}
                activeOpacity={0.75}
                onPress={() => handleExcluir(item.id)}
              >
                <Text style={styles.actionButtonTextExcluir}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "90%",
    alignSelf: "center",
    marginTop: 24,
  },
  centro: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 16,
  },
  filtrosRow: {
    flexDirection: "row",
    gap: 8,
    backgroundColor:"#1c1c1c",
    padding:7,
    borderRadius:20,
    marginBottom: 16,
  },
  filtroButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2e2e2e",
    backgroundColor: "#1c1c1c",
    alignItems: "center",
  },
  filtroButtonAtivo: {
    backgroundColor: "#3a3a3a",
    borderColor: "#555",
  },
  filtroButtonText: {
    color: "#9a9a9a",
    fontSize: 13,
    fontWeight: "600",
  },
  filtroButtonTextAtivo: {
    color: "#ffffff",
  },
  vazioText: {
    color: "#777",
    textAlign: "center",
    marginTop: 40,
  },
  card: {
    backgroundColor: "#1c1c1c",
    borderWidth: 1,
    borderColor: "#2e2e2e",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  cardNome: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgePendente: {
    backgroundColor: "#4a3a1c",
  },
  badgeDevolvido: {
    backgroundColor: "#1c3a24",
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  cardLivro: {
    color: "#e5e5e5",
    fontSize: 14,
    marginBottom: 4,
  },
  cardData: {
    color: "#9a9a9a",
    fontSize: 12,
    marginBottom: 10,
  },
  cardActionsRow: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: "#3a3a3a",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  actionButtonText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "600",
  },
  actionButtonExcluir: {
    backgroundColor: "#2a1c1c",
    borderWidth: 1,
    borderColor: "#4a2e2e",
  },
  actionButtonTextExcluir: {
    color: "#e08080",
    fontSize: 13,
    fontWeight: "600",
  },
});