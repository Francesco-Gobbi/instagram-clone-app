import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
  Switch,
} from "react-native";
import { Formik } from "formik";
import * as Yup from "yup";
import useRegistrationWithApproval from "../../hooks/useRegistrationWityhApproval.js";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import MessageModal, {
  handleFeatureNotImplemented,
} from "../../components/shared/modals/MessageModal";
import { shouldShowComingSoonFeatures } from "../../utils/featureFlags";
const termsUrl = Constants.expoConfig?.extra?.termsUrl;

const SignUpForm = ({ navigation }) => {
  const {
    registerUser,
    registerWithGoogle,
    isRegistering,
    registrationError,
    clearError,
  } = useRegistrationWithApproval();
  const [messageModalVisible, setMessageModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const SignUpSchema = Yup.object().shape({
    email: Yup.string()
      .required("Email e richiesta")
      .email("Inserisci un indirizzo email valido"),
    password: Yup.string()
      .required("Password e richiesta")
      .min(6, "La password deve contenere almeno 6 caratteri"),
    confirmPassword: Yup.string()
      .required("Conferma password e richiesta")
      .oneOf([Yup.ref("password")], "Le password non corrispondono"),
    displayName: Yup.string()
      .required("Nome e richiesto")
      .min(2, "Il nome deve contenere almeno 2 caratteri"),
    acceptedTerms: Yup.boolean().oneOf(
      [true],
      "Devi accettare i termini e la privacy policy"
    ),
  });

  const handleOpenTerms = async () => {
    try {
      const supported = await Linking.canOpenURL(termsUrl);
      if (supported) {
        await Linking.openURL(termsUrl);
      } else {
        Alert.alert(
          "Termini e condizioni",
          "Impossibile aprire il collegamento ai termini."
        );
      }
    } catch (error) {
      Alert.alert(
        "Termini e condizioni",
        "Impossibile aprire il collegamento ai termini."
      );
    }
  };

  const handleEmailRegistration = async (values) => {
    clearError();

    const result = await registerUser(values.email, values.password, {
      displayName: values.displayName,
      acceptedTerms: values.acceptedTerms,
      acceptedTermsVersion: 1,
    });

    if (result.success) {
      Alert.alert("Registrazione Completata!", result.message, [
        {
          text: "OK",
          onPress: () => navigation.navigate("PendingApproval"),
        },
      ]);
    } else {
      Alert.alert("Errore Registrazione", result.error);
    }
  };

  const handleGoogleRegistration = async ({ acceptedTerms, displayName }) => {
    clearError();

    const result = await registerWithGoogle({
      acceptedTerms,
      acceptedTermsVersion: 1,
      displayName,
    });

    if (result.success) {
      Alert.alert("Registrazione Google Completata!", result.message, [
        {
          text: "OK",
          onPress: () => navigation.navigate("PendingApproval"),
        },
      ]);
    } else {
      Alert.alert("Errore Registrazione Google", result.error);
    }
  };

  const showComingSoonFeatures = shouldShowComingSoonFeatures();

  useEffect(() => {
    if (!registrationError) {
      return;
    }

    setErrorMessage(registrationError);
    setMessageModalVisible(true);

    const timer = setTimeout(() => setMessageModalVisible(false), 3500);
    return () => clearTimeout(timer);
  }, [registrationError]);

  return (
    <View style={styles.container}>
      <Formik
        initialValues={{
          email: "",
          password: "",
          confirmPassword: "",
          displayName: "",
          acceptedTerms: false,
        }}
        validationSchema={SignUpSchema}
        onSubmit={handleEmailRegistration}
      >
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          setFieldValue,
          values,
          errors,
          touched,
          isValid,
        }) => (
          <View>
            <View style={styles.inputField}>
              <TextInput
                style={styles.inputText}
                placeholder="Nome completo"
                placeholderTextColor="#bbb"
                onChangeText={handleChange("displayName")}
                onBlur={handleBlur("displayName")}
                value={values.displayName}
                autoCapitalize="words"
              />
            </View>
            {touched.displayName && errors.displayName && (
              <Text style={styles.errorText}>{errors.displayName}</Text>
            )}

            <View style={styles.inputField}>
              <TextInput
                style={styles.inputText}
                placeholder="Email"
                placeholderTextColor="#bbb"
                onChangeText={handleChange("email")}
                onBlur={handleBlur("email")}
                value={values.email}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            {touched.email && errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}

            <View style={styles.inputField}>
              <TextInput
                style={styles.inputText}
                placeholder="Password"
                placeholderTextColor="#bbb"
                onChangeText={handleChange("password")}
                onBlur={handleBlur("password")}
                value={values.password}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>
            {touched.password && errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}

            <View style={styles.inputField}>
              <TextInput
                style={styles.inputText}
                placeholder="Conferma Password"
                placeholderTextColor="#bbb"
                onChangeText={handleChange("confirmPassword")}
                onBlur={handleBlur("confirmPassword")}
                value={values.confirmPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>
            {touched.confirmPassword && errors.confirmPassword && (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            )}

            <View style={styles.termsRow}>
              <Switch
                value={values.acceptedTerms}
                onValueChange={(checked) =>
                  setFieldValue("acceptedTerms", checked)
                }
                trackColor={{ false: "#444", true: "#07f" }}
                thumbColor={values.acceptedTerms ? "#fff" : "#ccc"}
              />
              <Text style={styles.termsText}>
                Dichiaro di aver letto e accettato i{" "}
                <Text style={styles.termsLink} onPress={handleOpenTerms}>
                  Termini e la Privacy Policy
                </Text>
              </Text>
            </View>
            {touched.acceptedTerms && errors.acceptedTerms && (
              <Text style={styles.errorText}>{errors.acceptedTerms}</Text>
            )}

            <TouchableOpacity
              style={[
                styles.btnContainer,
                { opacity: !isValid || isRegistering ? 0.6 : 1 },
              ]}
              onPress={handleSubmit}
              disabled={!isValid || isRegistering}
            >
              <View style={styles.btnContent}>
                {isRegistering ? (
                  <>
                    <ActivityIndicator size="small" color="#fff" />
                    <Text style={styles.btnText}>Registrando...</Text>
                  </>
                ) : (
                  <Text style={styles.btnText}>Registrati</Text>
                )}
              </View>
            </TouchableOpacity>

            {showComingSoonFeatures && (
              <>
                <View style={styles.separator}>
                  <View style={styles.separatorLine} />
                  <Text style={styles.separatorText}>oppure</Text>
                  <View style={styles.separatorLine} />
                </View>

                <TouchableOpacity
                  style={[
                    styles.googleBtn,
                    {
                      opacity: !values.acceptedTerms || isRegistering ? 0.5 : 1,
                    },
                  ]}
                  onPress={() => {
                    setErrorMessage("Questa funzione sarà disponibile a breve.");
                    handleFeatureNotImplemented(setMessageModalVisible);
                  }}
                  disabled={!values.acceptedTerms || isRegistering}
                >
                  <View style={styles.btnContent}>
                    {isRegistering ? (
                      <ActivityIndicator size="small" color="#333" />
                    ) : (
                      <>
                        <Ionicons name="logo-google" size={20} color="#333" />
                        <Text style={styles.googleBtnText}>
                          Registrati con Google
                        </Text>
                      </>
                    )}
                  </View>
                </TouchableOpacity>
              </>
            )}
            <View style={styles.loginLinkContainer}>
              <Text style={styles.loginLinkText}>Hai gia un account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={styles.loginLink}>Accedi</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Formik>

      <MessageModal
        messageModalVisible={messageModalVisible}
        message={errorMessage}
        height={70}
        icon="wrong"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  inputField: {
    marginTop: 14,
    backgroundColor: "#111",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#444",
    paddingHorizontal: 15,
    marginHorizontal: 20,
    height: 56,
    justifyContent: "center",
  },
  inputText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#fff",
  },
  errorText: {
    color: "#f00",
    fontSize: 12,
    marginTop: 5,
    marginLeft: 20,
    marginBottom: 5,
  },
  termsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    marginHorizontal: 20,
  },
  termsText: {
    color: "#ccc",
    marginLeft: 12,
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  termsLink: {
    color: "#1af",
    fontWeight: "700",
  },
  btnContainer: {
    marginTop: 35,
    alignItems: "center",
    backgroundColor: "#07f",
    marginHorizontal: 20,
    justifyContent: "center",
    height: 54,
    borderRadius: 10,
  },
  btnContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
  separator: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 25,
    marginHorizontal: 20,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#444",
  },
  separatorText: {
    color: "#666",
    paddingHorizontal: 15,
    fontSize: 14,
  },
  googleBtn: {
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    justifyContent: "center",
    height: 54,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  googleBtnText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "600",
  },
  loginLinkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 30,
  },
  loginLinkText: {
    color: "#666",
    fontSize: 14,
  },
  loginLink: {
    color: "#1af",
    fontSize: 14,
    fontWeight: "700",
  },
});

export default SignUpForm;
