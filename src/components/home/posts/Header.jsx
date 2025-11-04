import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Platform,
  
  Alert,
} from "react-native";
import React, { useState } from "react";
import { Entypo } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { STORY_GRADIENT_COLORS } from "../../../utils/theme";
import ReportModal from "../../shared/modals/ReportModal";
import BottomMenu from "../../shared/BottomMenu";
import useCheckStoriesSeen from "../../../hooks/useCheckStoriesSeen";
import useHandleFollow from "../../../hooks/useHandleFollow";
import useFetchPosts from "../../../hooks/useFetchPosts";
import firebase from "../../../services/firebase";
import { COLORS } from "../../../utils/usePalete";

const Header = ({ navigation, post, currentUser }) => {
  const { refreshPosts } = useFetchPosts();
  const { checkStoriesSeen } = useCheckStoriesSeen();
  const { handleFollow } = useHandleFollow();
  const [modalVisible, setModalVisible] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);

  // safeUpdate: try update, fallback to set with merge
  const safeUpdate = async (ref, data) => {
    try {
      await ref.update(data);
    } catch (err) {
      try {
        await ref.set(data, { merge: true });
      } catch (e) {
        console.error('safeUpdate error:', e);
      }
    }
  };

  const handOptionsSheet = () => {
    setModalVisible(true);
  };

  const handlePostOwner = () => {
    if (currentUser.email === post.owner_email) {
      navigation.navigate("Account");
    } else {
      navigation.navigate("UserDetail", {
        email: post.owner_email,
      });
    }
  };

  return (
    <View>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => {
            handlePostOwner();
          }}
          style={styles.headerUserContainer}
        >
          {checkStoriesSeen(post.username, currentUser.email) ? (
            <View style={styles.rainbowBorder}>
              <Image
                source={{ uri: post.profile_picture }}
                style={styles.headerImage}
              />
            </View>
          ) : (
            <LinearGradient
              start={[0.9, 0.45]}
              end={[0.07, 1.03]}
              colors={STORY_GRADIENT_COLORS}
              style={styles.rainbowBorder}
            >
              <Image
                source={{ uri: post.profile_picture }}
                style={styles.headerImageWithRainbow}
              />
            </LinearGradient>
          )}
          <Text style={styles.headerText}>{post.username.toLowerCase()}</Text>
        </TouchableOpacity>
        <View style={styles.rowContainer}>
          {currentUser.email !== post.owner_email &&
          currentUser.following &&
          !currentUser.following.includes(post.owner_email) ? (
            <TouchableOpacity
              onPress={() => {
                handleFollow(post.owner_email);
              }}
              style={styles.buttonContainer}
            >
              {currentUser.following_request &&
              !currentUser.following_request.includes(post.owner_email) ? (
                <Text style={styles.buttonText}>Follow</Text>
              ) : (
                <Text style={styles.buttonText}>Requested</Text>
              )}
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity onPress={() => handOptionsSheet()}>
            <Entypo
              name="dots-three-horizontal"
              size={15}
              color={"#fff"}
              style={styles.headerDots}
            />
          </TouchableOpacity>
        </View>
      </View>
      {/* Reusable bottom menu */}
      <BottomMenu
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        showEdit={currentUser.email === post.owner_email}
        onReport={() => setReportModalVisible(true)}
        onEdit={() => navigation.navigate('EditPost', { post })}
        onBlock={async () => {
          try {
            setModalVisible(false);
            const currentUserRef = firebase.firestore().collection('users').doc(currentUser.email);
            const blockedUserRef = firebase.firestore().collection('users').doc(post.owner_email);

            await Promise.all([
              safeUpdate(currentUserRef, { blockedUsers: firebase.firestore.FieldValue.arrayUnion(post.owner_email) }),
              safeUpdate(blockedUserRef, { blockedBy: firebase.firestore.FieldValue.arrayUnion(currentUser.owner_uid || null) })
            ]);
            
            // Show success message
            Alert.alert(
              'Utente bloccato',
              'Non vedrai più i contenuti di questo utente',
              [{ 
                text: 'OK',
                onPress: () => navigation.navigate('Main Screen', { screen: 'Feed' })
              }]
            );

            if (post.ref) {
              await safeUpdate(firebase.firestore().doc(post.ref.path), { blockedBy: firebase.firestore.FieldValue.arrayUnion(currentUser.owner_uid || null) });
            }

            Alert.alert('Utente bloccato', "Non vedrai più i post di questo utente.");
            refreshPosts();
          } catch (e) {
            console.error('Block user error:', e);
            Alert.alert('Errore', 'Impossibile bloccare l\'utente.');
          }
        }}
      />
      <ReportModal
        visible={reportModalVisible}
        onClose={() => setReportModalVisible(false)}
        onSubmit={async (reason) => {
          try {
            // Organizza la chiave della ragione
            const reasonKey = reason.toLowerCase().replace(/[^a-z0-9]+/g, '_');

            // Assicura il documento report per il post
            const reportsRef = firebase.firestore().collection('reports').doc(post.id);
            await reportsRef.set({ postId: post.id, owner_email: post.owner_email }, { merge: true });

            // Aggiungi il reporter all'array per la specifica ragione
            const updateObj = {};
            updateObj[`reasons.${reasonKey}.reporters`] = firebase.firestore.FieldValue.arrayUnion(currentUser.owner_uid || null);
            updateObj[`reasons.${reasonKey}.label`] = reason;
            await reportsRef.update(updateObj);

            // Nascondi il post per l'utente che l'ha segnalato
            const currentUserRef = firebase.firestore().collection('users').doc(currentUser.email);
            await safeUpdate(currentUserRef, { hiddenPosts: firebase.firestore.FieldValue.arrayUnion(post.id) });

            // Aggiungi info sul post: chi lo ha segnalato
            if (post.ref) {
              await safeUpdate(firebase.firestore().doc(post.ref.path), { reportedBy: firebase.firestore.FieldValue.arrayUnion(currentUser.owner_uid || null) });
            }

            Alert.alert("Segnalazione inviata", "Il post è stato nascosto.");
            refreshPosts();
          } catch (e) {
            console.error('Report error:', e);
            Alert.alert("Errore", "Impossibile inviare la segnalazione.");
          }
        }}
        contentType={"post"}
        contentId={post.id}
      />
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  headerContainer: {
    marginTop: 6,
    marginHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerUserContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerImage: {
    height: 37,
    width: 37,
    contentFit: "cover",
    borderRadius: 100,
    borderWidth: 0.6,
    borderColor: "#444",
  },
  headerImageWithRainbow: {
    height: 36.5,
    width: 36.5,
    contentFit: "cover",
    borderRadius: 100,
    borderWidth: 2,
    borderColor: "#000",
  },
  rainbowBorder: {
    height: 39,
    width: 39,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  headerText: {
    color: COLORS.text,
    fontWeight: "600",
    fontSize: 15,
    marginLeft: 9,
    marginBottom: Platform.OS === "android" ? 4 : 1,
  },
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonContainer: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 10,
    borderWidth: 1,
    height: Platform.OS === "android" ? 35 : 30,
    paddingHorizontal: 12,
    marginRight: 15,
    justifyContent: "center",
    alignItems: "center",
    borderColor: COLORS.border,
  },
  buttonText: {
    color: COLORS.text,
    fontWeight: "600",
    fontSize: 13,
    marginBottom: Platform.OS === "android" ? 2 : 0,
  },
  headerDots: {
    transform: [{ scaleX: 1.1 }],
    marginRight: 6,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    width: '92%',
    maxWidth: 400,
    alignSelf: 'center',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    overflow: 'hidden',
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },
  sheetButton: {
    width: '90%',
    alignSelf: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 16,
    marginVertical: 2,
    borderRadius: 12,
    alignItems: 'center',
  },
  sheetButtonText: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  sheetDivider: {
    width: '90%',
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 2,
    alignSelf: 'center',
    opacity: 0.5,
  },
});
