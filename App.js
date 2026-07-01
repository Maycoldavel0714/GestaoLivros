import { useState } from "react";
import { StyleSheet, View } from "react-native";
import Card from "./components/Card.js";
import Historico from "./components/Historico.js";
import Cadastrar from "./components/Cadastrar.js";

export default function App() {
  const [activeTab, setActiveTab] = useState("historico");
  const [registros, setRegistros] = useState([]);

  function handleSave(novoRegistro) {
    setRegistros((prev) => [{ ...novoRegistro, entregue: false }, ...prev]);
    setActiveTab("historico");
  }

  function handleFinalizar(id) {
    setRegistros((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, entregue: true } : item
      )
    );
  }

  return (
    <View style={styles.container}>
      <Card activeTab={activeTab} onChangeTab={setActiveTab} />

      {activeTab === "historico" ? (
        <Historico dados={registros} onFinalizar={handleFinalizar} />
      ) : (
        <Cadastrar onSave={handleSave} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    paddingTop: 50,
  },
});