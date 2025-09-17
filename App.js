import 'react-native-gesture-handler';
import React from "react";
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context'; // AGGIUNGI
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import AuthNavigation from "./src/navigation/AuthNavigation";

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <BottomSheetModalProvider>
          <AuthNavigation />
        </BottomSheetModalProvider>
      </SafeAreaProvider>
      <StatusBar style="light" />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});