import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, ActivityIndicator, FlatList, Alert, TouchableOpacity } from "react-native";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/functions";
import { Ionicons } from "@expo/vector-icons";
import { darkTheme } from "../../utils/theme";

const AdminPendingApprovals = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch realtime: tutti gli utenti con approvedAt == null
  useEffect(() => {
    const db = firebase.firestore();

    const unsubscribe = db
      .collection("users")
      .where("approvedAt", "==", null)
      .onSnapshot(
        (snap) => {
          const rows = [];
          snap.forEach((doc) => rows.push({ id: doc.id, ...doc.data() }));
          setPendingUsers(rows);
          setLoading(false);
        },
        (err) => {
          console.error("Errore caricamento pending users:", err);
          setPendingUsers([]);
          setLoading(false);
        }
      );

    return () => unsubscribe();
  }, []);

  // Approva: scrive approvedAt + approvedByUid
  const approveUser = useCallback(async (userDocId, userData) => {
    try {
      const adminUid = firebase.auth().currentUser?.uid;
      if (!adminUid) {
        Alert.alert("Errore", "Utente admin non autenticato.");
        return;
      }

      const db = firebase.firestore();
      await db.collection("users").doc(userDocId).set(
        {
          approvedAt: firebase.firestore.FieldValue.serverTimestamp(),
          approvedByUid: adminUid,
          status: "approved",
        },
        { merge: true }
      );
    } catch (e) {
      console.error("Errore approvazione utente:", e);
      Alert.alert("Errore", "Impossibile approvare l’utente.");
    }
  }, []);

  // Rifiuta + elimina account Auth (via Cloud Function) e doc Firestore
  const rejectAndDelete = useCallback((userDocId, userData) => {
    Alert.alert(
      "Rifiuta ed elimina account",
      `Vuoi rifiutare ed eliminare l'account per ${userData?.email || userDocId}?`,
      [
        { text: "Annulla", style: "cancel" },
        {
          text: "Sì, elimina",
          style: "destructive",
          onPress: async () => {
            try {
              const targetUid = userData?.uid || userDocId; // se docId == uid, funziona
              if (!targetUid) {
                Alert.alert("Errore", "UID utente da eliminare non disponibile.");
                return;
              }

              const functions = firebase.functions();
              const adminDeleteUser = functions.httpsCallable("adminDeleteUser");
              await adminDeleteUser({ uid: targetUid });

              const db = firebase.firestore();
              await db.collection("users").doc(userDocId).delete();
            } catch (e) {
              console.error("Errore rifiuto/eliminazione utente:", e);
              Alert.alert("Errore", "Impossibile eliminare l’account. Verifica le regole e la Cloud Function.");
            }
          },
        },
      ]
    );
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={darkTheme.colors.primary} />
      </View>
    );
  }

  if (pendingUsers.length === 0) {
    return (
      <View style={styles.center}>
        <Ionicons name="checkmark-circle-outline" size={36} color={darkTheme.colors.primary} />
        <Text style={styles.empty}>Nessuna richiesta in sospeso</Text>
      </View>
    );
  }

  const renderItem = ({ item }) => {
    const displayName = item.displayName || item.username || item.name || item.email || item.id;
    return (
      <View style={styles.card}>
        <View style={{ flex: 1 }}>
          <Text style={styles.name} numberOfLines={1}>{displayName}</Text>
          {item.email ? <Text style={styles.email} numberOfLines={1}>{item.email}</Text> : null}
          <Text style={styles.meta} numberOfLines={1}>
            {item.uid ? `uid: ${item.uid}` : `docId: ${item.id}`}
          </Text>
          {item.createdAt?.seconds ? (
            <Text style={styles.meta}>
              registrato: {new Date(item.createdAt.seconds * 1000).toLocaleString()}
            </Text>
          ) : null}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={[styles.btn, styles.btnApprove]} onPress={() => approveUser(item.id, item)}>
            <Ionicons name="checkmark" size={18} color={darkTheme.colors.onPrimary} />
            <Text style={styles.btnApproveText}>Approva</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.btn, styles.btnReject]} onPress={() => rejectAndDelete(item.id, item)}>
            <Ionicons name="close" size={18} color={darkTheme.colors.onError} />
            <Text style={styles.btnRejectText}>Rifiuta</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <FlatList
      contentContainerStyle={styles.list}
      data={pendingUsers}
      keyExtractor={(it) => it.id}
      renderItem={renderItem}
      ItemSeparatorComponent={() => <View style={{ height: 6 }} />}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    />
  );
};

export default AdminPendingApprovals;

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: darkTheme.spacing.md,
    paddingTop: 24,                                // più basso e distaccato dall’header
    paddingBottom: darkTheme.spacing.xl,
    backgroundColor: darkTheme.colors.background,  // sfondo tema
  },
  center: {
    padding: darkTheme.spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: darkTheme.colors.background,
  },
  empty: {
    color: darkTheme.colors.onSurfaceVariant,
    marginTop: darkTheme.spacing.xs,
    ...darkTheme.typography.body2,
    textAlign: "center",
  },
  card: {
    backgroundColor: darkTheme.colors.cardBackground,
    borderRadius: darkTheme.borderRadius.md,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: darkTheme.spacing.sm,
    borderWidth: 1,
    borderColor: darkTheme.colors.outlineVariant,
    flexDirection: "row",
  },
  name: {
    color: darkTheme.colors.onSurface,
    fontSize: 15,
    fontWeight: "600",
    textAlign: "left",
  },
  email: {
    color: darkTheme.colors.onSurfaceVariant,
    fontSize: 12,
    marginTop: 2,
    textAlign: "left",
  },
  meta: {
    color: darkTheme.colors.textTertiary,
    fontSize: 11,
    marginTop: 3,
    textAlign: "left",
  },
  actions: {
    flexDirection: "column",
    marginLeft: 10,
    justifyContent: "center",
    alignItems: "stretch",
    gap: 6,
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: darkTheme.borderRadius.sm,
  },
  btnApprove: {
    backgroundColor: darkTheme.colors.primary,
  },
  btnApproveText: {
    color: darkTheme.colors.onPrimary,
    fontWeight: "700",
    fontSize: 12,
    textAlign: "center",
  },
  btnReject: {
    backgroundColor: darkTheme.colors.error,
  },
  btnRejectText: {
    color: darkTheme.colors.onError,
    fontWeight: "700",
    fontSize: 12,
    textAlign: "center",
  },
});
