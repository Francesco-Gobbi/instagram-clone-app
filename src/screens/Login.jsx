import {
  StyleSheet,
  View,
  Keyboard,
  TouchableWithoutFeedback,
  Animated,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useState } from "react";
import LoginForm from "../components/login/LoginForm";
import Footer from "../components/login/Footer";
import { Image } from "expo-image";

const LoginScreen = ({ navigation }) => {
  const [messageModalVisible, setMessageModalVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setMessageModalVisible(true);
    }, 500);
    setTimeout(() => {
      setMessageModalVisible(false);
    }, 3500);
  }, []);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.mainContainer}>
            <View>
              <Animated.View style={styles.logoContainer}>
                <Image
                  source={require("../../assets/images/header-logo.webp")}
                  style={styles.logo}
                />
              </Animated.View>

              <LoginForm navigation={navigation} />
            </View>
          </View>
        </KeyboardAvoidingView>
        <Footer navigation={navigation} />
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingHorizontal: 20,
    alignContent: "space-between",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  mainContainer: {
    flex: 1,
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
  },
  logo: {
    height: Platform.OS === "android" ? 70 : 60,
    width: 200,
    contentFit: "cover",
  },
});
