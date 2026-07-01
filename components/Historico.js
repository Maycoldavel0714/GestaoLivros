import { useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";

function getStatus(item) {
  if (item.entregue) {
    return { label: "Entregue", color: "#4bdc8a", bg: "#1c3a26" };
  }

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const limite = new Date(item.dataLimiteRaw);
  limite.setHours(0, 0, 0, 0);

  if (limite < hoje) return { label: "Atrasado", color: "#ff5c5c", bg: "#3a1c1c" };
  if (limite.getTime() === hoje.getTime()) return { label: "Vence hoje", color: "#ffc24b", bg: "#3a311c" };
  return { label: "No prazo", color: "#4bdc8a", bg: "#1c3a26" };
}

const FILTROS = [
  { key: "pendentes", label: "Pendentes" },
  { key: "entregues", label: "Entregues" },
];

export default function Historico({ dados = [], onFinalizar }) {
  const [filtro, setFiltro] = useState("pendentes");

  const dadosFiltrados = dados.filter((item) => {
    if (filtro === "pendentes") return !item.entregue;
    if (filtro === "entregues") return item.entregue;
    return true; // "todos"
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Histórico</Text>

      <View style={styles.filtroRow}>
        {FILTROS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filtroButton, filtro === f.key && styles.filtroButtonActive]}
            activeOpacity={0.75}
            onPress={() => setFiltro(f.key)}
          >
            <Text
              style={[
                styles.filtroText,
                filtro === f.key && styles.filtroTextActive,
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {dadosFiltrados.length === 0 ? (
        <Text style={styles.empty}>Nenhum registro nessa categoria.</Text>
      ) : (
        <FlatList
          data={dadosFiltrados}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 24 }}
          renderItem={({ item }) => {
            const status = getStatus(item);

            return (
              <View style={styles.item}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemNome}>{item.nome}</Text>
                  <View style={[styles.badge, { backgroundColor: status.bg }]}>
                    <Text style={[styles.badgeText, { color: status.color }]}>
                      {status.label}
                    </Text>
                  </View>
                </View>

                <Text style={styles.itemLivro}>📖 {item.livro}</Text>
                <Text style={styles.itemData}>📅 Devolução: {item.dataLimite}</Text>

                {!item.entregue && (
                  <TouchableOpacity
                    style={styles.finalizarButton}
                    activeOpacity={0.75}
                    onPress={() => onFinalizar?.(item.id)}
                  >
                    <Text style={styles.finalizarButtonText}>✓  Marcar como entregue</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          }}
        />
      )}
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
  title: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 16,
  },
  filtroRow: {
    flexDirection: "row",
    backgroundColor: "#1c1c1c",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2e2e2e",
    padding: 4,
    marginBottom: 16,
    gap: 4,
  },
  filtroButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  filtroButtonActive: {
    backgroundColor: "#3a3a3a",
  },
  filtroText: {
    color: "#9a9a9a",
    fontSize: 12,
    fontWeight: "600",
  },
  filtroTextActive: {
    color: "#ffffff",
  },
  empty: {
    color: "#777",
    textAlign: "center",
    marginTop: 20,
  },
  item: {
    backgroundColor: "#1c1c1c",
    borderWidth: 1,
    borderColor: "#2e2e2e",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  itemNome: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
    flexShrink: 1,
  },
  badge: {
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  itemLivro: {
    color: "#cfcfcf",
    fontSize: 13,
    marginBottom: 2,
  },
  itemData: {
    color: "#9a9a9a",
    fontSize: 13,
    marginBottom: 10,
  },
  finalizarButton: {
    backgroundColor: "#1c3a26",
    borderWidth: 1,
    borderColor: "#2e5c3c",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  finalizarButtonText: {
    color: "#4bdc8a",
    fontSize: 13,
    fontWeight: "700",
  },
});