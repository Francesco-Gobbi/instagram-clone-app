import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
  StatusBar,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState } from "react";
import {
  MaterialIcons,
  Ionicons,
  MaterialCommunityIcons,
  Entypo,
  Feather,
  FontAwesome,
  Octicons,
  AntDesign,
} from "@expo/vector-icons";
import Constants from "expo-constants";
import MessageModal, {
  handleFeatureNotImplemented,
} from "../shared/modals/MessageModal";

const SettingsScreen = ({ navigation, route }) => {
  const { currentUser } = route.params;
  const [messageModalVisible, setMessageModalVisible] = useState(false);
  const showComingSoonFeatures =
    Constants.expoConfig?.android?.showComingSoonFeatures;

  const OptionRow = ({ icon: Icon, iconName, iconSize, text, onPress, showArrow = true }) => (
    <>
      <TouchableOpacity onPress={onPress} style={styles.optionRow}>
        <View style={styles.iconContainer}>
          <Icon name={iconName} size={iconSize} color="#fff" />
        </View>
        <Text style={styles.optionText}>{text}</Text>
        {showArrow && <MaterialIcons name="chevron-right" size={24} color="#666" />}
      </TouchableOpacity>
      <View style={styles.divider} />
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back-ios" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Menu</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {showComingSoonFeatures && (
          <OptionRow
            icon={Ionicons}
            iconName="settings-sharp"
            iconSize={27}
            text="Settings and privacy"
            onPress={() => handleFeatureNotImplemented(setMessageModalVisible)}
          />
        )}

        {showComingSoonFeatures && (
          <OptionRow
            icon={Ionicons}
            iconName="timer-outline"
            iconSize={28}
            text="Your activity"
            onPress={() => handleFeatureNotImplemented(setMessageModalVisible)}
          />
        )}

        {showComingSoonFeatures && (
          <OptionRow
            icon={Entypo}
            iconName="back-in-time"
            iconSize={27}
            text="Archive"
            onPress={() => handleFeatureNotImplemented(setMessageModalVisible)}
          />
        )}

        <OptionRow
          icon={MaterialCommunityIcons}
          iconName="qrcode-scan"
          iconSize={24}
          text="QR code"
          onPress={() => navigation.navigate("ShareQR", { user: currentUser })}
        />

        {showComingSoonFeatures && (
          <OptionRow
            icon={Feather}
            iconName="bookmark"
            iconSize={29}
            text="Saved"
            onPress={() => handleFeatureNotImplemented(setMessageModalVisible)}
          />
        )}

        {showComingSoonFeatures && (
          <OptionRow
            icon={MaterialCommunityIcons}
            iconName="account-supervisor-outline"
            iconSize={30}
            text="Supervision"
            onPress={() => handleFeatureNotImplemented(setMessageModalVisible)}
          />
        )}

        {showComingSoonFeatures && (
          <OptionRow
            icon={FontAwesome}
            iconName="credit-card"
            iconSize={24}
            text="Orders and payments"
            onPress={() => handleFeatureNotImplemented(setMessageModalVisible)}
          />
        )}

        {showComingSoonFeatures && (
          <OptionRow
            icon={Octicons}
            iconName="verified"
            iconSize={27}
            text="Meta Verified"
            onPress={() => handleFeatureNotImplemented(setMessageModalVisible)}
          />
        )}

        {showComingSoonFeatures && (
          <OptionRow
            icon={Feather}
            iconName="list"
            iconSize={29}
            text="Close Friends"
            onPress={() => handleFeatureNotImplemented(setMessageModalVisible)}
          />
        )}

        <OptionRow
          icon={Feather}
          iconName="star"
          iconSize={27}
          text="Favorites"
          onPress={() => navigation.navigate("Favorites")}
        />

        <OptionRow
          icon={Feather}
          iconName="user"
          iconSize={27}
          text="Delete account"
          onPress={() => navigation.navigate({name: "DeleteAccount", params: {currentUser: currentUser}})}
        />

        {showComingSoonFeatures && (
          <>
            <OptionRow
              icon={AntDesign}
              iconName="adduser"
              iconSize={29}
              text="Discover people"
              onPress={() => handleFeatureNotImplemented(setMessageModalVisible)}
            />

            <OptionRow
              icon={Feather}
              iconName="users"
              iconSize={28}
              text="Group profiles"
              onPress={() => handleFeatureNotImplemented(setMessageModalVisible)}
            />
          </>
        )}

        <View style={styles.logoutSection}>
          <TouchableOpacity 
            onPress={() => navigation.navigate("Logout", { currentUser })} 
            style={styles.logoutRow}
          >
            <View style={styles.iconContainer}>
              <MaterialIcons name="logout" size={27} color="#f44" />
            </View>
            <Text style={styles.logoutText}>Log out</Text>
            <MaterialIcons name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <MessageModal
        messageModalVisible={messageModalVisible}
        message="This feature is not yet implemented."
      />
    </SafeAreaView>
  );
};

export default SettingsScreen;

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
  scrollView: {
    flex: 1,
    marginTop: 10,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 10,
  },
  iconContainer: {
    width: 35,
    alignItems: "center",
  },
  optionText: {
    flex: 1,
    color: "#fff",
    fontSize: 17,
    fontWeight: "500",
  },
  divider: {
    height: 0.5,
    backgroundColor: "#333",
    marginLeft: 65,
  },
  logoutSection: {
    marginTop: 30,
    marginBottom: 40,
  },
  logoutRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 10,
  },
  logoutText: {
    flex: 1,
    color: "#f44",
    fontSize: 17,
    fontWeight: "600",
  },
});