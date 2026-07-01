import { View, StyleSheet, Text, TouchableOpacity } from "react-native";

export default function Card({ activeTab, onChangeTab }) {
  return (
    <View style={styles.containerCard}>
      <Text style={styles.titleCard}>📋  Gestão de Livros</Text>
      <Text style={styles.subtitleCard}>Selecione uma opção</Text>

      <View style={styles.buttonsRow}>
        <TouchableOpacity
          style={[styles.button, activeTab === "historico" && styles.buttonActive]}
          activeOpacity={0.75}
          onPress={() => onChangeTab("historico")}
        >
          <Text
            style={[
              styles.buttonText,
              activeTab === "historico" && styles.buttonTextActive,
            ]}
          >
            📋  Histórico
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, activeTab === "cadastrar" && styles.buttonActive]}
          activeOpacity={0.75}
          onPress={() => onChangeTab("cadastrar")}
        >
          <Text
            style={[
              styles.buttonText,
              activeTab === "cadastrar" && styles.buttonTextActive,
            ]}
          >
            ➕  Cadastrar
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  containerCard: {
    width: "90%",
    alignSelf: "center",
    backgroundColor: "#161616",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#2a2a2a",
    padding: 18,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  titleCard: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 2,
  },
  subtitleCard: {
    fontSize: 13,
    color: "#9a9a9a",
    marginBottom: 16,
  },
  buttonsRow: {
    flexDirection: "row",
    gap: 10,
  },
  button: {
    flex: 1,
    backgroundColor: "#232323",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonActive: {
    backgroundColor: "#3a3a3a",
    borderWidth: 1,
    borderColor: "#555",
  },
  buttonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#e5e5e5",
  },
  buttonTextActive: {
    color: "#ffffff",
  },
});