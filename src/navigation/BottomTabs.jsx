import { StyleSheet, TouchableOpacity, Platform } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Home from "../screens/Home";
import Search from "../screens/Search";
import Moments from "../screens/Moment";
import Profile from "../screens/Profile";
import Blank from "./Blank";
import { darkTheme } from "../utils/theme";
import {
  Ionicons,
  AntDesign,
  MaterialIcons,
  MaterialCommunityIcons 
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
    <Tab.Navigator 
      initialRouteName="Feed"
      screenOptions={screenOptions}>
      {/* SEARCH - Prima posizione */}
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
      
      {/* CREATE - Seconda posizione */}
      <Tab.Screen
        name="Create"
        component={Blank}
        options={{
          tabBarIcon: ({ focused }) => {
            return <Ionicons name="add" size={32} color="white" />

          },
          tabBarButton: (props) => (
            <TouchableOpacity
              {...props}
              onPress={() => {
                navigation.navigate("MediaLibrary", {
                  initialSelectedType: "Add to story",
                });
              }}
            />
          ),
        }}
      />
      
      {/* HOME (DOJO) - Centro */}
      <Tab.Screen
        name="Feed"
        component={Home}
        options={{
          tabBarIcon: ({ focused }) => {
            return (
             <MaterialCommunityIcons name="temple-buddhist" size={30} 
             color={focused ? darkTheme.colors.primary : darkTheme.colors.onSurfaceVariant}/>
            );
          },
        }}
      />
      
      {/* VIDEOS (MOVIE) - Quarta posizione */}
      <Tab.Screen
        name="Videos"
        component={Moments}
        options={{
          tabBarIcon: ({ focused }) => {
            return (
              <MaterialCommunityIcons 
              name="movie-outline" 
              size={32} 
              color={focused ? darkTheme.colors.primary : darkTheme.colors.onSurfaceVariant}/>
            );
          },
        }}
      />
      
      {/* PROFILE - Ultima posizione */}
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