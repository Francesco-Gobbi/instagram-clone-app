import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";
import { MaterialIcons, MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";

const CreateNewScreen = ({ navigation }) => {
  const handleNavigation = (screen, params) => {
    navigation.navigate(screen, params);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back-ios" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.contentContainer}>
        <TouchableOpacity
          onPress={() =>
            handleNavigation("MediaLibrary", {
              initialSelectedType: "New moment",
              selectorAvailable: false,
            })
          }
          style={styles.optionRow}
        >
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name="play-box-outline"
              size={28}
              color="#fff"
            />
          </View>
          <Text style={styles.optionText}>Moment</Text>
          <MaterialIcons name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity
          onPress={() =>
            handleNavigation("MediaLibrary", {
              initialSelectedType: "New Post",
              selectorAvailable: false,
            })
          }
          style={styles.optionRow}
        >
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="grid" size={26} color="#fff" />
          </View>
          <Text style={styles.optionText}>Post</Text>
          <MaterialIcons name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity
          onPress={() =>
            handleNavigation("MediaLibrary", {
              initialSelectedType: "Add to story",
              selectorAvailable: false,
            })
          }
          style={styles.optionRow}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="heart-circle-outline" size={28} color="#fff" />
          </View>
          <Text style={styles.optionText}>Story</Text>
          <MaterialIcons name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default CreateNewScreen;

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
  contentContainer: {
    marginTop: 10,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 15,
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
    marginLeft: 70,
  },
});