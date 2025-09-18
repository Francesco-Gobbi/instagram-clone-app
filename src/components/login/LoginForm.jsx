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
import { appwriteClient, account } from "../../services/appwrite";
import MessageModal from "../shared/modals/MessageModal";
import Animated from "react-native-reanimated";
import useAuthPersistence from '../../utils/useAuthPersistence';

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
  
  // Ref per il TextInput della password
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
    try {
      console.log("Creating Appwrite session for:", email);
      
      // Verifica se esiste già una sessione attiva
      try {
        const currentUser = await account.get();
        console.log("Existing Appwrite session found, deleting it");
        await account.deleteSession('current');
      } catch (sessionError) {
        // Nessuna sessione esistente, procediamo
        console.log("No existing Appwrite session");
      }

      // Crea una nuova sessione
      const session = await account.createEmailSession(email, password);
      console.log("Appwrite session created successfully");
      
      // Ottieni le informazioni dell'utente
      const appwriteUser = await account.get();
      console.log("Appwrite user data retrieved:", appwriteUser.$id);
      
      return {
        sessionId: session.$id,
        userId: appwriteUser.$id,
        token: session.secret || session.providerAccessToken || session.$id, // Il token può variare in base alla configurazione
        appwriteUser: appwriteUser
      };
      
    } catch (appwriteError) {
      console.error("Appwrite session creation failed:", appwriteError);
      
      // Se l'utente non esiste in Appwrite, potremmo crearlo
      if (appwriteError.code === 401 || appwriteError.message?.includes('Invalid credentials')) {
        try {
          console.log("User not found in Appwrite, attempting to create...");
          
          // Genera un ID unico per Appwrite (puoi usare l'UID di Firebase)
          const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          
          // Crea l'utente in Appwrite
          const newUser = await account.create(userId, email, password);
          console.log("New Appwrite user created:", newUser.$id);
          
          // Crea la sessione per il nuovo utente
          const session = await account.createEmailSession(email, password);
          const appwriteUser = await account.get();
          
          return {
            sessionId: session.$id,
            userId: appwriteUser.$id,
            token: session.secret || session.providerAccessToken || session.$id,
            appwriteUser: appwriteUser
          };
          
        } catch (createError) {
          console.error("Failed to create Appwrite user:", createError);
          throw createError;
        }
      } else {
        throw appwriteError;
      }
    }
  };

  const onLogin = async (email, password) => {
    if (isLoggingIn) return; 
    
    setIsLoggingIn(true);
    Keyboard.dismiss();
    
    try {
      const userCredentials = await firebase
        .auth()
        .signInWithEmailAndPassword(email, password);

      // Verifica lo status di approvazione
      const userStatus = await checkUserApprovalStatus(userCredentials.user.uid);
      
      if (userStatus === 'pending') {
        // Logout immediato se l'utente non è approvato
        await firebase.auth().signOut();
        navigation.navigate('PendingApproval');
        return;
      } else if (userStatus === 'rejected') {
        await firebase.auth().signOut();
        handleDataError("Your account has been rejected. Please contact your administrator.");
        return;
      }

      const appwriteSessionData = await createAppwriteSession(email, password);

      const userData = {
        uid: userCredentials.user.uid,
        email: userCredentials.user.email,
        
        appwriteUserId: appwriteSessionData.userId,
        appwriteSessionId: appwriteSessionData.sessionId,
        appwriteToken: appwriteSessionData.token,
        
        loginTimestamp: new Date().toISOString(),
        
        appwriteUserData: {
          name: appwriteSessionData.appwriteUser.name || '',
          emailVerification: appwriteSessionData.appwriteUser.emailVerification || false,
          status: appwriteSessionData.appwriteUser.status || false,
        }
      };
      
      await saveUserSecurely(userData, password);
      
      console.log("🔥 Firebase Login Successful ✅", userCredentials.user.email);
      
    } catch (error) {
      console.error("Login error:", error);
      try {
        await firebase.auth().signOut();
        await account.deleteSession('current').catch(() => {});
      } catch (cleanupError) {
        console.error("Cleanup error:", cleanupError);
      }
      let errorMessage;
      
      // Gestisci errori specifici di Appwrite
      if (error.code && error.code >= 400 && error.code < 500) {
        errorMessage = "Error creating storage session. Please try again.";
      } else {
        errorMessage = getFirebaseErrorMessage(error);
      }
      
      // Se l'errore è user-disabled, mostra la pagina di attesa
      if (error.code === 'auth/user-disabled') {
        navigation.navigate('PendingApproval');
      } else {
        handleDataError(errorMessage);
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
          onLogin(values.email, values.password);
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