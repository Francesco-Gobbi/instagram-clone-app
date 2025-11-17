import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
  StatusBar,
} from "react-native";
import React from "react";
import { Octicons } from "@expo/vector-icons";
import { DARK_COLORS } from "../../utils/theme";

const Header = ({ currentUser, navigation }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => navigation.navigate("Profile")}
        style={styles.usernameContainer}
      >
        <Text style={styles.username}>{currentUser.username}</Text>
      </TouchableOpacity>

      <View style={styles.IconsContainer}>
        <TouchableOpacity
          onPress={() => navigation.navigate("CreateNew")}
          style={styles.iconButton}
        >
          <Octicons name="plus" size={26} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("Settings", { currentUser: currentUser })
          }
          style={styles.iconButton}
        >
          <Octicons name="gear" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
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
    backgroundColor: DARK_COLORS.surface,
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
  IconsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginTop: 8,
  },
  iconButton: {
    padding: 4,
  },
});