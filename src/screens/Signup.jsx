import {
  StyleSheet,
  View,
  Keyboard,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import SignupForm from "../components/signup/SignupForm";
import Footer from "../components/signup/Footer";
import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { SIZES } from "../constants";

const Signup = ({ navigation }) => {
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.mainContainer}>
            <View style={{ height: 56 }} />
            <View>
              <Animated.View style={styles.logoContainer}>
                <Image
                  source={require("../../assets/images/header-logo.png")}
                  style={styles.logo}
                />
              </Animated.View>

              <SignupForm navigation={navigation} />
            </View>
          </View>
        </KeyboardAvoidingView>
        <Footer navigation={navigation} />
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default Signup;

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
    marginTop: -SIZES.Width * 0.15,
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
