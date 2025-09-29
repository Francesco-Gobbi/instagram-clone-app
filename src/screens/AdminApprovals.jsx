import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUserContext } from "../contexts/UserContext";
import AdminPendingApprovals from "../components/profile/AdminPendingApprovals";
import { darkTheme } from "../utils/theme";

const AdminApprovalsScreen = ({ navigation }) => {
  const { currentUser } = useUserContext();

  if (!currentUser) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator color={darkTheme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Richieste di registrazione</Text>
        <Text style={styles.subtitle}>
          Approva o rifiuta le richieste di accesso all'applicazione.
        </Text>
      </View>

      <AdminPendingApprovals />
    </SafeAreaView>
  );
};

export default AdminApprovalsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: darkTheme.colors.background,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: darkTheme.colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 28,                
    paddingBottom: 10,
    alignItems: "center",           
  },
  title: {
    color: darkTheme.colors.onSurface,
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },
  subtitle: {
    color: darkTheme.colors.onSurfaceVariant,
    fontSize: 14,
    marginTop: 6,
    textAlign: "center",
  },
});
