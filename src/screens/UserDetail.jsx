import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  StatusBar,
  Alert,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from "react";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import StoryHightlights from "../components/user/StoryHighlights";
import firebase from "../services/firebase";
import { useUserContext } from "../contexts/UserContext";
import BottomMenu from "../components/shared/BottomMenu";
import CopyClipboardModal from "../components/shared/modals/CopyClipboardModal";

const User = ({ route, navigation }) => {
  const { email } = route.params || {};
  const [user, setUser] = useState({});
  const { currentUser } = useUserContext();
  const [menuVisible, setMenuVisible] = useState(false);
  const [copyModalVisible, setCopyModalVisible] = useState(false);

  useEffect(() => {
    try {
      const unsubscribe = firebase
        .firestore()
        .collection("users")
        .doc(email)
        .onSnapshot((snapshot) => {
          setUser(snapshot.data());
        });

      return () => unsubscribe;
    } catch (error) {
      console.log(error);
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.titleContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back-ios" size={24} color={"#fff"} />
        </TouchableOpacity>
        <Text style={styles.textTitle}>{user.username}</Text>
        {user.username ? (
          <TouchableOpacity onPress={() => setMenuVisible(true)}>
            <MaterialCommunityIcons
              name="dots-horizontal"
              size={24}
              color={"#fff"}
              style={{ marginTop: 2 }}
            />
          </TouchableOpacity>
        ) : (
          <ActivityIndicator />
        )}
      </View>

      <StoryHightlights navigation={navigation} user={user} />

      <CopyClipboardModal copyModalVisible={copyModalVisible} />
      <BottomMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        showEdit={user.email === currentUser.email}
        onReport={() => {
          setMenuVisible(false);
          // navigate to a report flow for user (optional)
          navigation.navigate('ReportUser', { userEmail: user.email });
        }}
        onEdit={() => {
          setMenuVisible(false);
          navigation.navigate('EditProfile');
        }}
        onBlock={async () => {
          try {
            setMenuVisible(false);
            const safeUpdate = async (ref, data) => {
              try {
                await ref.update(data);
              } catch (err) {
                try {
                  await ref.set(data, { merge: true });
                } catch (error) {
                  console.error('Error in safeUpdate:', error);
                  throw error;
                }
              }
            };

            const currentUserRef = firebase.firestore().collection('users').doc(currentUser.email);
            const blockedUserRef = firebase.firestore().collection('users').doc(user.email);

            await Promise.all([
              safeUpdate(currentUserRef, { blockedUsers: firebase.firestore.FieldValue.arrayUnion(user.email) }),
              safeUpdate(blockedUserRef, { blockedBy: firebase.firestore.FieldValue.arrayUnion(currentUser.owner_uid || null) })
            ]);

            // Show success message
            Alert.alert(
              'Utente bloccato',
              'Non vedrai più i contenuti di questo utente',
              [{ text: 'OK' }]
            );

            Alert.alert('Utente bloccato', 'Non vedrai più i post di questo utente.');
          } catch (e) {
            console.error('Block user error:', e);
            Alert.alert('Errore', "Impossibile bloccare l'utente.");
          }
        }}
      />
    </SafeAreaView>
  );
};

export default User;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  textTitle: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    // marginBottom: 4,
  },
});
