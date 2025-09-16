import { StyleSheet, TouchableOpacity, Platform } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Home from "../screens/Home";
import Search from "../screens/Search";
import Reels from "../screens/Reels";
import Profile from "../screens/Profile";
import Blank from "./Blank";
import { darkTheme } from "../utils/theme";
import {
  Ionicons,
  AntDesign,
} from "@expo/vector-icons";

const Tab = createBottomTabNavigator();

const screenOptions = {
  tabBarShowLabel: false,
  tabBarHideOnKeyboard: true,
  headerShown: false,
  tabBarStyle: {
    position: "absolute",
    bottom: 0,
    right: 0,
    left: 0,
    elevation: 0,
    borderTopWidth: 0.5,
    borderTopColor: darkTheme.colors.outline,
    height: Platform.OS === "Android" ? 60 : 85,
    backgroundColor: darkTheme.colors.surface,
    paddingBottom: Platform.OS === "ios" ? 20 : 8,
    paddingTop: 8,
  },
};

const BottomTabs = ({ navigation }) => {
  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen
        name="Feed"
        component={Home}
        options={{
          tabBarIcon: ({ focused }) => {
            return focused ? (
              <Ionicons name="home" size={28} color={darkTheme.colors.primary} />
            ) : (
              <Ionicons name="home-outline" size={28} color={darkTheme.colors.onSurfaceVariant} />
            );
          },
        }}
      />
      <Tab.Screen
        name="Discover"
        component={Search}
        options={{
          tabBarIcon: ({ focused }) => {
            return (
              <Ionicons
                name={focused ? "search" : "search-outline"}
                size={28}
                color={focused ? darkTheme.colors.primary : darkTheme.colors.onSurfaceVariant}
              />
            );
          },
        }}
      />
      <Tab.Screen
        name="Create"
        component={Blank}
        options={{
          tabBarIcon: ({ focused }) => {
            return <AntDesign name="plussquareo" size={26} color={focused ? darkTheme.colors.primary : darkTheme.colors.onSurfaceVariant} />;
          },
          tabBarButton: (props) => (
            <TouchableOpacity
              {...props}
              onPress={() => {
                navigation.navigate("MediaLibrary", {
                  initialSelectedType: "New content",
                });
              }}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Videos"
        component={Reels}
        options={{
          tabBarIcon: ({ focused }) => {
            return (
              <Ionicons
                name={focused ? "play" : "play-outline"}
                size={26}
                color={focused ? darkTheme.colors.primary : darkTheme.colors.onSurfaceVariant}
              />
            );
          },
        }}
      />
      <Tab.Screen
        name="Account"
        component={Profile}
        options={{
          tabBarIcon: ({ focused }) => {
            return focused ? (
              <Ionicons name="person" size={26} color={darkTheme.colors.primary} />
            ) : (
              <Ionicons name="person-outline" size={26} color={darkTheme.colors.onSurfaceVariant} />
            );
          },
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabs;

const styles = StyleSheet.create({
  container: {
    height: 70,
    backgroundColor: "#000",
  },
  iconContainer: {
    marginTop: 12,
    flexDirection: "row",
    marginHorizontal: 24,
    justifyContent: "space-between",
    alignItems: "center",
  },
});
