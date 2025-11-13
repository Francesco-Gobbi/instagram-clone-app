import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, TouchableOpacity, Platform } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import Home from "../screens/Home";
import Search from "../screens/Search";
import Moments from "../screens/Moment";
import Profile from "../screens/Profile";
import AdminApprovals from "../screens/AdminApprovals";
import Blank from "./Blank";
import { darkTheme } from "../utils/theme";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Constants from "expo-constants";

const Tab = createBottomTabNavigator();
const showComingSoonFeatures = Constants.expoConfig?.android?.showComingSoonFeatures;
const screenOptions = {
  tabBarShowLabel: false,
  tabBarHideOnKeyboard: true,
  headerShown: false,
  tabBarStyle: {
    position: "absolute",
    bottom: 0,
    right: 0,
    left: 0,
    elevation: 12,
    shadowColor: darkTheme.colors.glowPurple,
    shadowOpacity: 0.45,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: -4 },
    borderTopWidth: 0.5,
    borderTopColor: darkTheme.colors.outline,
    height: Platform.OS === "android" ? 60 : 85, // <-- "android" in minuscolo
    backgroundColor: darkTheme.colors.surface,
    paddingBottom: Platform.OS === "ios" ? 20 : 8,
    paddingTop: 8,
  },
};

const BottomTabs = ({ navigation }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const unsubscribeUserRef = useRef(null); // conserva l'unsubscribe dello snapshot

  useEffect(() => {
    const auth = firebase.auth();
    const db = firebase.firestore();

    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      // chiudi eventuale listener precedente
      if (unsubscribeUserRef.current) {
        unsubscribeUserRef.current();
        unsubscribeUserRef.current = null;
      }

      if (!user) {
        setCurrentUser(null);
        setIsAdmin(false);
        return;
      }

      try {
        // 1) prova /users/{uid}
        let docRef = db.collection("users").doc(user.uid);
        let snap = await docRef.get();

        // 2) fallback a /users/{emailLowercase} se non esiste
        if (!snap.exists && user.email) {
          const emailDocId = user.email.toLowerCase();
          const emailRef = db.collection("users").doc(emailDocId);
          const emailSnap = await emailRef.get();
          if (emailSnap.exists) {
            docRef = emailRef;
            snap = emailSnap;
          }
        }

        // iscriviti in realtime sul doc scelto
        unsubscribeUserRef.current = docRef.onSnapshot(
          (snapshot) => {
            console.log("[users] snapshot exists:", snapshot.exists, "id:", snapshot.id);

            if (!snapshot.exists) {
              const fallback = { uid: user.uid, email: user.email, role: "user" };
              setCurrentUser(fallback);
              setIsAdmin(false);
              return;
            }

            const data = snapshot.data() || {};
            const role = typeof data.role === "string" ? data.role.toLowerCase() : "user";

            const userData = { uid: user.uid, email: user.email, ...data };
            setCurrentUser(userData);
            setIsAdmin(role === "admin");
          },
          async (error) => {
            console.error(error);
            setCurrentUser(null);
            setIsAdmin(false);

            if (error?.code === "permission-denied") {
              try {
                await auth.signOut();
              } catch (e) {
                console.error("Errore signOut dopo permission-denied:", e);
              }
            }
          }
        );
      } catch (e) {
        console.error("Errore inizializzazione listener utente:", e);
        setCurrentUser(null);
        setIsAdmin(false);
      }
    });

    // cleanup: chiudi sia auth listener che user listener
    return () => {
      unsubscribeAuth();
      if (unsubscribeUserRef.current) {
        unsubscribeUserRef.current();
        unsubscribeUserRef.current = null;
      }
    };
  }, []);

  return (
    <Tab.Navigator initialRouteName="Feed" screenOptions={screenOptions}>
      <Tab.Screen
        name="Discover"
        component={Search}
        options={{
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? "search" : "search-outline"}
              size={28}
              color={focused ? darkTheme.colors.primary : darkTheme.colors.onSurfaceVariant}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Create"
        component={Blank}
        options={{
          tabBarIcon: () => <Ionicons name="add" size={32} color="white" />,
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

      <Tab.Screen
        name="Feed"
        component={Home}
        options={{
          tabBarIcon: ({ focused }) => (
            <MaterialCommunityIcons
              name="temple-buddhist"
              size={30}
              color={focused ? darkTheme.colors.primary : darkTheme.colors.onSurfaceVariant}
            />
          ),
        }}
      />

      {showComingSoonFeatures &&   <Tab.Screen
        name="Videos"
        component={Moments}
        options={{
          tabBarIcon: ({ focused }) => (
            <MaterialCommunityIcons
              name="movie-outline"
              size={32}
              color={focused ? darkTheme.colors.primary : darkTheme.colors.onSurfaceVariant}
            />
          ),
        }}
      />}

      <Tab.Screen
        name="Account"
        component={Profile}
        options={{
          tabBarIcon: ({ focused }) =>
            focused ? (
              <Ionicons name="person" size={26} color={darkTheme.colors.primary} />
            ) : (
              <Ionicons name="person-outline" size={26} color={darkTheme.colors.onSurfaceVariant} />
            ),
        }}
      />

      {isAdmin && (
        <Tab.Screen
          name="Approvals"
          component={AdminApprovals}
          options={{
            tabBarIcon: ({ focused }) => (
              <Ionicons
                name={focused ? "checkmark-circle" : "checkmark-circle-outline"}
                size={28}
                color={focused ? darkTheme.colors.primary : darkTheme.colors.onSurfaceVariant}
              />
            ),
          }}
        />
      )}
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
