import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Platform,
  StatusBar,
  Alert
} from "react-native";
import React, { useRef, useState } from "react";
import { MaterialIcons, FontAwesome5, Octicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import BottomSheetAddNew from "./bottomSheets/BottomSheetAddNew";
import BottomSheetLogout from "./bottomSheets/BottomSheetLogout";
import BottomSheetOptions from "./bottomSheets/BottomSheetOptions";
import useAuthPersistence from "../../utils/useAuthPersistence";
import { DARK_COLORS } from "../../utils/theme";

const Header = ({ currentUser, navigation }) => {
  const bottomSheetRefAddNew = useRef(null);
  const bottomSheetRefLogout = useRef(null);
  const bottomSheetRefOptions = useRef(null);
  const [settingsMenuVisible, setSettingsMenuVisible] = useState(false);
  const { clearUserData } = useAuthPersistence();

  const openSettingsMenu = () => setSettingsMenuVisible(true);
  const closeSettingsMenu = () => setSettingsMenuVisible(false);

  const handleOpenSettings = () => {
    closeSettingsMenu();
    bottomSheetRefOptions.current?.present();
  };

  const handleLogoutPress = async () => {
    try {
      closeSettingsMenu();
      await clearUserData();
      navigation.reset({ index: 0, routes: [{ name: "Login" }] });
    } catch (err) {
      console.error("Errore durante il logout:", err);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => bottomSheetRefLogout.current.present()}
        style={styles.usernameContainer}
      >
        <Text style={styles.username}>{currentUser.username}</Text>
        {/* <MaterialIcons
          name="keyboard-arrow-down"
          size={24}
          color={"#fff"}
          style={styles.arrowIcon}
        /> */}
      </TouchableOpacity>

      <View style={styles.IconsContainer}>
        <TouchableOpacity
          onPress={() => bottomSheetRefAddNew.current.present()}
        >
          <FontAwesome5 name="plus-square" size={23} color={"#fff"} />
        </TouchableOpacity>
        <TouchableOpacity onPress={openSettingsMenu}>
          <Octicons name="gear" size={20} color={"#fff"} />
        </TouchableOpacity>
      </View>
      <Modal visible={settingsMenuVisible} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={closeSettingsMenu}>
          <View style={styles.settingsBackdrop}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <BlurView intensity={70} tint="dark" style={styles.settingsMenu}>
                {/* <TouchableOpacity style={styles.settingsRow} onPress={handleOpenSettings}>
                  <MaterialIcons name="settings" size={20} color="#fff" />
                  <Text style={styles.settingsText}>Settings & privacy</Text>
                </TouchableOpacity> */}
                <View style={styles.settingsDivider} />
                <TouchableOpacity
                  style={styles.settingsRow}
                  onPress={handleLogoutPress}
                >
                  <MaterialIcons name="logout" size={20} color="#fff" />
                  <Text style={styles.settingsText}>Log out</Text>
                </TouchableOpacity>
              </BlurView>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      <BottomSheetAddNew
        bottomSheetRef={bottomSheetRefAddNew}
        navigation={navigation}
      />
      <BottomSheetLogout
        bottomSheetRef={bottomSheetRefLogout}
        navigation={navigation}
      />
      <BottomSheetOptions
        bottomSheetRef={bottomSheetRefOptions}
        navigation={navigation}
        currentUser={currentUser}
      />
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    marginLeft: 20,
    marginRight: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: DARK_COLORS.surface
  },
  usernameContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  username: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
    transform: [{ scaleY: 1.05 }],
  },
  arrowIcon: {
    paddingTop: 6,
  },
  IconsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginTop: 8,
  },
  settingsBackdrop: {
    flex: 1,
    backgroundColor: "transparent",
  },
  settingsMenu: {
    position: "absolute",
    top: Platform.OS === "ios" ? 90 : (StatusBar.currentHeight || 0) + 70,
    right: 20,
    borderRadius: 16,
    overflow: "hidden",
    minWidth: 190,
    backgroundColor: DARK_COLORS.surface,
    paddingVertical: 6,
  },
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  settingsText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "500",
  },
  settingsDivider: {
    height: 1,
    marginHorizontal: 12,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
});
