import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
  StatusBar,
  ActivityIndicator,
  TextInput,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import firebase from "../../services/firebase";
import useAuthPersistence from "../../utils/useAuthPersistence";

const DeleteAccountScreen = ({ navigation, route }) => {
  const { currentUser } = route.params;
  const { clearUserData } = useAuthPersistence();
  
  const [step, setStep] = useState(1); // 1: info, 2: richiesta codice, 3: verifica codice
  const [loading, setLoading] = useState(false);
  const [enteredCode, setEnteredCode] = useState("");
  const [codeError, setCodeError] = useState("");

  const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const sendVerificationEmail = async () => {
    setLoading(true);
    setCodeError("");
    
    try {
    //   const code = generateVerificationCode();
    //   const expiresAt = Date.now() + 15 * 60 * 1000; 

      await firebase.firestore()
        .collection("users")
        .doc(currentUser.email)
        .update({
        //   deleteAccountCode: code,
        //   deleteAccountExpiresAt: expiresAt,
          deleteAccountCreatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });

   
    //   await firebase.firestore()
    //     .collection("mail")
    //     .add({
    //       to: [currentUser.email],
    //       message: {
    //         subject: "🔐 Codice di verifica per eliminazione account",
    //         html: `
    //           <!DOCTYPE html>
    //           <html>
    //             <head>
    //               <style>
    //                 body {
    //                   font-family: Arial, sans-serif;
    //                   line-height: 1.6;
    //                   color: #333;
    //                   max-width: 600px;
    //                   margin: 0 auto;
    //                   padding: 20px;
    //                   background-color: #f4f4f4;
    //                 }
    //                 .container {
    //                   background-color: #ffffff;
    //                   border-radius: 10px;
    //                   padding: 30px;
    //                   box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    //                 }
    //                 .header {
    //                   text-align: center;
    //                   margin-bottom: 30px;
    //                   padding-bottom: 20px;
    //                   border-bottom: 2px solid #f0f0f0;
    //                 }
    //                 .header h1 {
    //                   color: #ff4444;
    //                   margin: 0;
    //                   font-size: 24px;
    //                 }
    //                 .code-box {
    //                   background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    //                   border-radius: 12px;
    //                   padding: 30px;
    //                   text-align: center;
    //                   margin: 30px 0;
    //                   box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    //                 }
    //                 .code {
    //                   font-size: 42px;
    //                   font-weight: bold;
    //                   color: #ffffff;
    //                   letter-spacing: 12px;
    //                   text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
    //                   font-family: 'Courier New', monospace;
    //                 }
    //                 .warning {
    //                   background-color: #fff3cd;
    //                   border-left: 4px solid #ff4444;
    //                   padding: 15px 20px;
    //                   margin: 25px 0;
    //                   border-radius: 4px;
    //                 }
    //                 .warning strong {
    //                   color: #ff4444;
    //                   display: block;
    //                   margin-bottom: 8px;
    //                   font-size: 16px;
    //                 }
    //                 .info {
    //                   background-color: #e7f3ff;
    //                   border-left: 4px solid #2196F3;
    //                   padding: 15px 20px;
    //                   margin: 25px 0;
    //                   border-radius: 4px;
    //                 }
    //                 .footer {
    //                   text-align: center;
    //                   margin-top: 40px;
    //                   padding-top: 20px;
    //                   border-top: 2px solid #f0f0f0;
    //                   font-size: 12px;
    //                   color: #666;
    //                 }
    //                 .greeting {
    //                   font-size: 16px;
    //                   margin-bottom: 20px;
    //                 }
    //                 .username {
    //                   color: #667eea;
    //                   font-weight: bold;
    //                 }
    //               </style>
    //             </head>
    //             <body>
    //               <div class="container">
    //                 <div class="header">
    //                   <h1>⚠️ Richiesta Eliminazione Account</h1>
    //                 </div>
                    
    //                 <p class="greeting">Ciao <span class="username">${currentUser.username || currentUser.name || "utente"}</span>,</p>
                    
    //                 <p>Hai richiesto l'eliminazione del tuo account. Per procedere con questa operazione, devi verificare la tua identità inserendo il seguente codice di verifica nell'app:</p>
                    
    //                 <div class="code-box">
    //                   <div class="code">${code}</div>
    //                 </div>
                    
    //                 <div class="info">
    //                   <strong>ℹ️ Informazioni importanti:</strong>
    //                   <p style="margin: 8px 0 0 0;">
    //                     • Il codice è valido per <strong>15 minuti</strong><br>
    //                     • Puoi richiedere un nuovo codice se questo scade<br>
    //                     • Inserisci il codice esattamente come mostrato
    //                   </p>
    //                 </div>
                    
    //                 <div class="warning">
    //                   <strong>⚠️ ATTENZIONE - Azione Irreversibile</strong>
    //                   <p style="margin: 8px 0 0 0;">
    //                     Una volta completata l'eliminazione:<br>
    //                     • Tutti i tuoi post, foto e video verranno eliminati permanentemente<br>
    //                     • Le tue stories e reels saranno rimosse<br>
    //                     • Perderai tutti i follower e following<br>
    //                     • Il tuo profilo e tutte le informazioni associate verranno cancellati<br>
    //                     • <strong>Non sarà possibile recuperare questi dati</strong>
    //                   </p>
    //                 </div>
                    
    //                 <p style="margin-top: 30px;">
    //                   Se <strong>NON hai richiesto</strong> l'eliminazione del tuo account, ignora questa email. 
    //                   Il tuo account rimarrà al sicuro e nessuna modifica verrà apportata.
    //                 </p>
                    
    //                 <div class="footer">
    //                   <p>Questa è un'email automatica. Per favore non rispondere a questo messaggio.</p>
    //                   <p style="margin-top: 10px; color: #999;">© ${new Date().getFullYear()} Your App Name. Tutti i diritti riservati.</p>
    //                 </div>
    //               </div>
    //             </body>
    //           </html>
    //         `,
    //         text: `
    //           Ciao ${currentUser.username || currentUser.name || "utente"},
              
    //           Hai richiesto l'eliminazione del tuo account.
              
    //           Il tuo codice di verifica è: ${code}
              
    //           Il codice è valido per 15 minuti.
              
    //           ATTENZIONE: Questa è un'azione irreversibile. Una volta eliminato, il tuo account e tutti i tuoi dati verranno rimossi permanentemente.
              
    //           Se non hai richiesto l'eliminazione del tuo account, ignora questa email.
    //         `,
    //       },
    //     });

    //   Alert.alert(
    //     "Email inviata",
    //     `Abbiamo inviato un codice di verifica a ${currentUser.email}. Il codice è valido per 15 minuti.`,
    //     [{ text: "OK", onPress: () => setStep(3) }]
    //   );
    } catch (error) {
      console.error("Errore invio email:", error);
      Alert.alert(
        "Errore",
        "Impossibile inviare l'email di verifica. Riprova più tardi."
      );
    } finally {
      setLoading(false);
    }
  };

  // Verifica il codice inserito
  const verifyCode = async () => {
    setLoading(true);
    setCodeError("");

    try {
      // Recupera il codice salvato nel database
      const userDoc = await firebase.firestore()
        .collection("users")
        .doc(currentUser.email)
        .get();

      const userData = userDoc.data();
      const savedCode = userData?.deleteAccountCode;
      const expiresAt = userData?.deleteAccountCodeExpiresAt;

      // Verifica che il codice esista
      if (!savedCode) {
        setCodeError("Nessun codice trovato. Richiedi un nuovo codice.");
        setLoading(false);
        return;
      }

      // Verifica che il codice non sia scaduto
      if (Date.now() > expiresAt) {
        setCodeError("Il codice è scaduto. Richiedi un nuovo codice.");
        setLoading(false);
        return;
      }

      // Verifica che il codice sia corretto
      if (enteredCode.trim() === savedCode) {
        setCodeError("");
        showFinalConfirmation();
      } else {
        setCodeError("Codice non valido. Riprova.");
      }
    } catch (error) {
      console.error("Errore verifica codice:", error);
      setCodeError("Errore durante la verifica. Riprova.");
    } finally {
      setLoading(false);
    }
  };

  // Conferma finale prima dell'eliminazione
  const showFinalConfirmation = () => {
    Alert.alert(
      "Conferma eliminazione",
      "Sei assolutamente sicuro? Questa azione è irreversibile e tutti i tuoi dati verranno eliminati permanentemente.",
      [
        { text: "Annulla", style: "cancel" },
        {
          text: "Elimina definitivamente",
          style: "destructive",
          onPress: deleteAccount,
        },
      ]
    );
  };

  // Elimina l'account
  const deleteAccount = async () => {
    setLoading(true);

    try {
      const user = firebase.auth().currentUser;
      const db = firebase.firestore();
      const batch = db.batch();

      // 1. Elimina tutti i post dell'utente
      const postsSnapshot = await db
        .collection("users")
        .doc(currentUser.email)
        .collection("posts")
        .get();
      
      postsSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      // 2. Elimina tutte le stories dell'utente
      const storiesSnapshot = await db
        .collection("users")
        .doc(currentUser.email)
        .collection("stories")
        .get();
      
      storiesSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      // 3. Elimina tutti i reels dell'utente
      const reelsSnapshot = await db
        .collection("users")
        .doc(currentUser.email)
        .collection("reels")
        .get();
      
      reelsSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

    const messageSnapshot = await db
        .collection("users")
        .doc(currentUser.email)
        .collection("chat")
        .get();


    messageSnapshot.docs.forEach((doc)=> batch.delete(doc.ref))
      // 4. Rimuovi l'utente dai followers/following di altri utenti
      const usersSnapshot = await db.collection("users").get();
      
      usersSnapshot.docs.forEach((doc) => {
        const userData = doc.data();
        
        if (userData.followers?.includes(currentUser.email)) {
          batch.update(doc.ref, {
            followers: firebase.firestore.FieldValue.arrayRemove(currentUser.email),
          });
        }
        
        if (userData.following?.includes(currentUser.email)) {
          batch.update(doc.ref, {
            following: firebase.firestore.FieldValue.arrayRemove(currentUser.email),
          });
        }
      });

      // 5. Elimina il documento utente
      batch.delete(db.collection("users").doc(currentUser.email));

      // Esegui tutte le operazioni batch
      await batch.commit();

      // 6. Elimina l'account Firebase Auth
      await user.delete();

      // 7. Pulisci i dati locali e reindirizza al login
      await clearUserData();
      
      Alert.alert(
        "Account eliminato",
        "Il tuo account è stato eliminato con successo.",
        [
          {
            text: "OK",
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: "Login" }],
              });
            },
          },
        ]
      );
    } catch (error) {
      console.error("Errore eliminazione account:", error);
      
      // Gestisci errori specifici
      if (error.code === "auth/requires-recent-login") {
        Alert.alert(
          "Riautenticazione richiesta",
          "Per motivi di sicurezza, devi effettuare nuovamente il login prima di eliminare l'account.",
          [
            {
              text: "OK",
              onPress: async () => {
                await clearUserData();
                navigation.reset({
                  index: 0,
                  routes: [{ name: "Login" }],
                });
              },
            },
          ]
        );
      } else {
        Alert.alert(
          "Errore",
          "Si è verificato un errore durante l'eliminazione dell'account. Riprova più tardi."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Informazioni e prima conferma
  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <MaterialIcons name="warning" size={72} color="#ff4444" />
      
      <Text style={styles.title}>Elimina account</Text>
      
      <Text style={styles.warningText}>
        ⚠️ Questa azione è irreversibile
      </Text>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Cosa verrà eliminato:</Text>
        <Text style={styles.infoItem}>• Tutti i tuoi post, foto e video</Text>
        <Text style={styles.infoItem}>• Tutte le tue stories e reels</Text>
        <Text style={styles.infoItem}>• I tuoi follower e following</Text>
        <Text style={styles.infoItem}>• Il tuo profilo e tutte le informazioni</Text>
        <Text style={styles.infoItem}>• Non potrai più recuperare questi dati</Text>
      </View>

      <Text style={styles.description}>
        Prima di procedere, ti invieremo un codice di verifica all'email:{"\n"}
        <Text style={styles.emailText}>{currentUser.email}</Text>
      </Text>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.button, styles.continueButton]}
          onPress={() => deleteAccount()}
          disabled={loading}
        >
          <Text style={styles.continueButtonText}>Continua</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Annulla</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Step 2: Conferma invio email
  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <MaterialIcons name="email" size={72} color="#09f" />
      
      <Text style={styles.title}>Verifica la tua identità</Text>
      
      <Text style={styles.description}>
        Per procedere con l'eliminazione, devi verificare la tua identità.
        {"\n\n"}
        Ti invieremo un codice di verifica a:{"\n"}
        <Text style={styles.emailText}>{currentUser.email}</Text>
      </Text>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.button, styles.sendCodeButton]}
          onPress={sendVerificationEmail}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.sendCodeButtonText}>Invia codice</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => setStep(1)}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Indietro</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Step 3: Inserimento codice
  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <MaterialIcons name="vpn-key" size={72} color="#09f" />
      
      <Text style={styles.title}>Inserisci il codice</Text>
      
      <Text style={styles.description}>
        Abbiamo inviato un codice di 6 cifre a:{"\n"}
        <Text style={styles.emailText}>{currentUser.email}</Text>
      </Text>

      <View style={styles.codeInputContainer}>
        <TextInput
          style={[styles.codeInput, codeError && styles.codeInputError]}
          value={enteredCode}
          onChangeText={(text) => {
            setEnteredCode(text.replace(/[^0-9]/g, ""));
            setCodeError("");
          }}
          placeholder="000000"
          placeholderTextColor="#555"
          keyboardType="number-pad"
          maxLength={6}
          autoFocus
        />
        {codeError ? (
          <Text style={styles.errorText}>{codeError}</Text>
        ) : null}
      </View>

      {/* <TouchableOpacity
        onPress={sendVerificationEmail}
        disabled={loading}
        style={styles.resendButton}
      >
        <Text style={styles.resendText}>Non hai ricevuto il codice? Invia di nuovo</Text>
      </TouchableOpacity> */}

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            styles.verifyButton,
            (enteredCode.length !== 6 || loading) && styles.buttonDisabled,
          ]}
          onPress={verifyCode}
          disabled={loading || enteredCode.length !== 6}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.verifyButtonText}>Verifica ed elimina</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => {
            setStep(1);
            setEnteredCode("");
            setCodeError("");
          }}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Indietro</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back-ios" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Elimina account</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default DeleteAccountScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  stepContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 40,
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  warningText: {
    color: "#ff4444",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 20,
  },
  description: {
    color: "#aaa",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginVertical: 20,
  },
  emailText: {
    color: "#09f",
    fontWeight: "600",
  },
  infoBox: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    marginVertical: 20,
  },
  infoTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  infoItem: {
    color: "#ccc",
    fontSize: 14,
    lineHeight: 24,
  },
  codeInputContainer: {
    width: "100%",
    marginVertical: 20,
  },
  codeInput: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 20,
    fontSize: 32,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    letterSpacing: 8,
    borderWidth: 2,
    borderColor: "#333",
  },
  codeInputError: {
    borderColor: "#ff4444",
  },
  errorText: {
    color: "#ff4444",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
  },
  resendButton: {
    paddingVertical: 10,
    marginBottom: 20,
  },
  resendText: {
    color: "#09f",
    fontSize: 14,
    textAlign: "center",
  },
  buttonsContainer: {
    width: "100%",
    gap: 12,
    marginTop: "auto",
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
  },
  continueButton: {
    backgroundColor: "#ff4444",
  },
  continueButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  sendCodeButton: {
    backgroundColor: "#09f",
  },
  sendCodeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  verifyButton: {
    backgroundColor: "#ff4444",
  },
  verifyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  cancelButton: {
    backgroundColor: "#2a2a2a",
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});