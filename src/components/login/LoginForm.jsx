import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Keyboard,
  Platform,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import { MaterialCommunityIcons, Octicons } from "@expo/vector-icons";
import { Formik } from "formik";
import * as Yup from "yup";
import firebase from "../../services/firebase";
import appwriteService from "../../services/appwrite";
import MessageModal from "../shared/modals/MessageModal";
import Animated from "react-native-reanimated";
import useAuthPersistence from '../../utils/useAuthPersistence';
const appwriteAccount = appwriteService.account;

const LoginForm = React.forwardRef(({ navigation }, ref) => {
  const [obsecureText, setObsecureText] = useState(true);
  const [emailOnFocus, setEmailOnFocus] = useState(false);
  const [emailToValidate, SetEmailToValidate] = useState(false);
  const [passwordToValidate, SetPasswordToValidate] = useState(false);
  const [messageModalVisible, setMessageModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [developerMessage, setDeveloperMessage] = useState(false);
  const { isLoading, user, saveUserSecurely } = useAuthPersistence();
  
  const passwordInputRef = useRef(null);

  useEffect(() => {
    setTimeout(() => {
      setDeveloperMessage(true);
    }, 2000);
    setTimeout(() => {
      setDeveloperMessage(false);
    }, 12000);
  }, []);

  useEffect(() => {
    if (!isLoading && user) {
      console.log("isLoggin")
      navigation.replace("Home");
      }
  }, [isLoading, user]);
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#07f" />
        <Text style={styles.loadingText}>Checking authentication...</Text>
      </View>
    );
  }
  
  const handleDataError = (message) => {
    setErrorMessage(message);
    setMessageModalVisible(true);
    setTimeout(() => {
      setMessageModalVisible(false);
    }, 3500);
  };

  const LoginFormSchema = Yup.object().shape({
    email: Yup.string()
      .required("Email is required")
      .email("Please enter a valid email address")
      .min(5, "Email must be at least 5 characters"),
    password: Yup.string()
      .required("Password is required")
      .min(6, "Password must be at least 6 characters"),
  });

  const getFirebaseErrorMessage = (error) => {
    switch (error.code) {
      case 'auth/wrong-password':
        return "The password is incorrect. Please try again.";
      case 'auth/user-not-found':
        return "No account found with this email address.";
      case 'auth/invalid-email':
        return "The email address is invalid.";
      case 'auth/user-disabled':
        return "Your account is pending approval. Please contact your administrator.";
      case 'auth/too-many-requests':
        return "Too many unsuccessful login attempts. Please try again later.";
      case 'auth/network-request-failed':
        return "Network error. Please check your internet connection.";
      case 'auth/invalid-credential':
        return "Invalid credentials. Please check your email and password.";
      default:
        return "An error occurred during login. Please try again.";
    }
  };

  // Funzione per verificare lo status dell'utente
  const checkUserApprovalStatus = async (uid) => {
    try {
      const userDoc = await firebase.firestore().collection('users').doc(uid).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        return userData.status;
      }
      return null;
    } catch (error) {
      console.error('Error checking user status:', error);
      return null;
    }
  };

   // Funzione per creare utente di sessione in Appwrite
   const createAppwriteSession = async (email, password) => {
    const sessionCreator = async () => {
      if (typeof appwriteAccount.createEmailPasswordSession === 'function') {
        return appwriteAccount.createEmailPasswordSession(email, password);
      }
      if (typeof appwriteAccount.createEmailSession === 'function') {
        return appwriteAccount.createEmailSession(email, password);
      }
      throw new Error('Metodo di sessione Appwrite non disponibile nel client attuale.');
    };

    try {
      // Elimina eventuali sessioni esistenti
      try {
        await appwriteAccount.deleteSession('current');
      } catch {
        /* nessuna sessione attiva */
      }
      const session = await sessionCreator();
      const appwriteUser = await appwriteAccount.get();
      return {
        sessionId: session.$id,
        userId: appwriteUser.$id,
        expire: session.expire, // scadenza Unix:contentReference[oaicite:3]{index=3}
        secret: session.secret, // se disponibile (SDK server-side)
        appwriteUser,
      };
    } catch (error) {
      // Utente inesistente? Crealo e riprova
      if (error.code === 401 || /Invalid credentials/i.test(error.message)) {
        const newId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const defaultName = (email?.split('@')[0] || 'User').trim().slice(0, 128) || 'User';

        const createAccount = async () => {
          try {
            return await appwriteAccount.create({ userId: newId, email, password, name: defaultName });
          } catch (creationError) {
            if (creationError?.message?.includes('Missing required parameter')) {
              return await appwriteAccount.create(newId, email, password, defaultName);
            }
            throw creationError;
          }
        };

        await createAccount();
        const session = await sessionCreator();
        const appwriteUser = await appwriteAccount.get();
        return {
          sessionId: session.$id,
          userId: appwriteUser.$id,
          expire: session.expire,
          secret: session.secret,
          appwriteUser,
        };
      }
      throw error;
    }
  };

 const handleLogin = async (email, password) => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    Keyboard.dismiss();
    try {
      // Login Firebase
      const credentials = await firebase.auth().signInWithEmailAndPassword(email, password);
      // Controllo stato utente
      const userStatus = await checkUserApprovalStatus(credentials.user.uid);
      if (userStatus === 'pending') {
        await firebase.auth().signOut();
        navigation.navigate('PendingApproval');
        return;
      }
      if (userStatus === 'rejected') {
        await firebase.auth().signOut();
        handleDataError('Your account has been rejected. Please contact your administrator.');
        return;
      }
      // Login Appwrite
      const appwriteData = await createAppwriteSession(email, password);
      // Oggetto da salvare con useAuthPersistence
      const userData = {
        uid: credentials.user.uid,
        email: credentials.user.email,
        // Info Appwrite utili per ricreare la sessione
        appwriteUserId: appwriteData.userId,
        appwriteSessionId: appwriteData.sessionId,
        appwriteExpire: appwriteData.expire,
        appwriteSecret: appwriteData.secret,
        // Informazioni utente opzionali
        loginTimestamp: new Date().toISOString(),
        appwriteUserData: {
          name: appwriteData.appwriteUser.name || '',
          emailVerification: appwriteData.appwriteUser.emailVerification || false,
          status: appwriteData.appwriteUser.status || false,
        },
      };
      // Salva in Keychain/AsyncStorage tramite il tuo hook; l'effetto in AuthNavigation gestirà il cambio stack
      await saveUserSecurely(userData, password);
    } catch (error) {
      console.error('Login error:', error);
      // Pulizia in caso di errore
      try {
        await firebase.auth().signOut();
        await appwriteAccount.deleteSession('current').catch(() => {});
      } catch {}
      // Mostra messaggio d’errore appropriato
      if (error.code && error.code >= 400 && error.code < 500) {
        handleDataError('Error creating storage session. Please try again.');
      } else if (error.code === 'auth/user-disabled') {
        navigation.navigate('PendingApproval');
      } else {
        handleDataError('An error occurred during login. Please try again.');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };
  
   return (
    <Animated.View ref={ref} style={styles.container}>
      <Formik
        initialValues={{ email: "", password: "" }}
        onSubmit={(values) => {
          handleLogin(values.email, values.password);
        }}
        validationSchema={LoginFormSchema}
        validateOnMount={true}
      >
       {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          errors,
          touched,
          isValid,
          setFieldTouched,
          setFieldValue,
          validateForm,
        }) => {
          
          // Funzione per gestire il cambio della password con validazione forzata
          const handlePasswordChange = (text) => {
            setFieldValue("password", text);
            setFieldTouched("password", true);
            
            // Forza la validazione dopo un breve delay
            setTimeout(() => {
              validateForm();
            }, 50);
            
            // Aggiorna lo stato di validazione locale
            if (text.length > 0) {
              SetPasswordToValidate(true);
            } else {
              SetPasswordToValidate(false);
            }
          };

          // Gestione del focus sulla password
          const handlePasswordFocus = () => {
            if (values.password.length > 0) {
              SetPasswordToValidate(true);
              setFieldTouched("password", true);
            }
          };

          return (
            <View>
              <View
                style={[
                  styles.inputField,
                  {
                    paddingVertical: 16,
                    borderColor:
                      (touched.email && errors.email) || (emailToValidate && values.email.length < 5)
                        ? "#f00"
                        : "#444",
                  },
                ]}
              >
                <TextInput
                  style={styles.inputText}
                  placeholderTextColor={"#bbb"}
                  placeholder="Email"
                  autoCapitalize="none"
                  autoCorrect={false}
                  inputMode="email"
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  onChangeText={(text) => {
                    handleChange("email")(text);
                    setTimeout(() => setFieldTouched("email", true), 100);
                  }}
                  onBlur={() => {
                    handleBlur("email");
                    setEmailOnFocus(false);
                    values.email.length > 0
                      ? SetEmailToValidate(true)
                      : SetEmailToValidate(false);
                  }}
                  onFocus={() => setEmailOnFocus(true)}
                  value={values.email}
                />
                <TouchableOpacity onPress={() => handleChange("email")("")}>
                  <Octicons
                    name={emailOnFocus ? "x-circle-fill" : ""}
                    size={15}
                    color={"#555"}
                  />
                </TouchableOpacity>
              </View>

              {touched.email && errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}

              <View
                style={[
                  styles.inputField,
                  {
                    borderColor:
                      (touched.password && errors.password) || (passwordToValidate && values.password.length < 6)
                        ? "#f00"
                        : "#444",
                  },
                ]}
              >
                <TextInput
                  ref={passwordInputRef}
                  style={styles.inputText}
                  placeholderTextColor={"#bbb"}
                  placeholder="Password"
                  autoCapitalize="none"
                  autoCorrect={false}
                  secureTextEntry={obsecureText}
                  textContentType="password"
                  onChangeText={handlePasswordChange}
                  onBlur={() => {
                    handleBlur("password");
                    values.password.length > 0
                      ? SetPasswordToValidate(true)
                      : SetPasswordToValidate(false);
                  }}
                  onFocus={handlePasswordFocus}
                  value={values.password}
                  onSelectionChange={() => {
                    setTimeout(() => {
                      if (values.password.length > 0) {
                        setFieldTouched("password", true);
                        validateForm();
                      }
                    }, 100);
                  }}
                />
                <TouchableOpacity onPress={() => setObsecureText(!obsecureText)}>
                  <MaterialCommunityIcons
                    name={obsecureText ? "eye-off" : "eye"}
                    size={24}
                    color={obsecureText ? "#fff" : "#37e"}
                  />
                </TouchableOpacity>
              </View>

              {touched.password && errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}

              <View style={styles.forgotContainer}>
                <TouchableOpacity onPress={() => navigation.navigate("Forgot")}>
                  <Text style={styles.forgotText}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                onPress={handleSubmit} 
                disabled={!isValid || isLoggingIn}
                style={styles.btnContainer(isValid && !isLoggingIn)}
              >
                <View style={styles.btnContent}>
                  {isLoggingIn ? (
                    <>
                      <ActivityIndicator size="small" color="#fff" style={styles.loadingSpinner} />
                      <Text style={styles.btnText}>Logging in...</Text>
                    </>
                  ) : (
                    <Text style={styles.btnText}>Log in</Text>
                  )}
                </View>
              </TouchableOpacity>
            </View>
          );
        }}
      </Formik>

      <MessageModal
        messageModalVisible={messageModalVisible}
        message={errorMessage}
        height={70}
        icon="wrong"
      />
    </Animated.View>
  );
});

export default LoginForm;

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
  inputField: {
    marginTop: 14,
    backgroundColor: "#111",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#444",
    paddingLeft: 15,
    paddingRight: 25,
    marginHorizontal: 20,
    height: 56,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  inputText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#fff",
    width: "95%",
  },
  errorText: {
    color: "#f00",
    fontSize: 12,
    marginTop: 5,
    marginLeft: 20,
    marginBottom: 5,
  },
  forgotContainer: {
    alignItems: "flex-end",
    marginTop: 20,
    marginRight: 20,
  },
  forgotText: {
    color: "#1af",
    fontWeight: "700",
  },
  btnContainer: (isEnabled) => ({
    marginTop: 35,
    alignItems: "center",
    backgroundColor: "#07f",
    opacity: isEnabled ? 1 : 0.6,
    marginHorizontal: 20,
    justifyContent: "center",
    alignContent: "center",
    height: Platform.OS === "android" ? 56 : 54,
    borderRadius: 10,
  }),
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
  loadingSpinner: {
    marginRight: 8,
  },
  modalContainer: {
    marginTop: 14,
    marginHorizontal: 20,
    backgroundColor: "#333",
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 7,
      height: 7,
    },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    borderRadius: 10,
    height: 56,
    paddingHorizontal: 20,
    gap: 12,
  },
  modalText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#fff",
    marginBottom: Platform.OS === "android" ? 4 : 0,
  },
});
