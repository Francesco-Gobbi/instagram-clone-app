import {
  StyleSheet,
  View,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { darkTheme } from "../../utils/theme";
import BottomMenu from "../shared/BottomMenu";
import ReportModal from "../shared/modals/ReportModal";
import firebase from "../../services/firebase";

const MomentHeader = ({ moment, currentUser, navigation, refreshMoments }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);

  const safeUpdate = async (ref, data) => {
    try {
      await ref.update(data);
    } catch (err) {
      await ref.set(data, { merge: true });
    }
  };

  return (
    <View>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={styles.menuButton}
      >
        <Ionicons 
          name="ellipsis-horizontal" 
          size={26} 
          color={darkTheme.colors.textPrimary}
        />
      </TouchableOpacity>

      <BottomMenu
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        showEdit={currentUser.email === moment.owner_email}
        onReport={() => setReportModalVisible(true)}
        onEdit={() => navigation.navigate('EditPost', { post: moment })}
        onBlock={async () => {
          try {
            setModalVisible(false);
            const currentUserRef = firebase.firestore().collection('users').doc(currentUser.email);
            const blockedUserRef = firebase.firestore().collection('users').doc(moment.owner_email);

            await Promise.all([
              safeUpdate(currentUserRef, { blockedUsers: firebase.firestore.FieldValue.arrayUnion(moment.owner_email) }),
              safeUpdate(blockedUserRef, { blockedBy: firebase.firestore.FieldValue.arrayUnion(currentUser.owner_uid || null) })
            ]);
            
            Alert.alert(
              'Utente bloccato',
              'Non vedrai più i contenuti di questo utente',
              [{ 
                text: 'OK',
                onPress: () => {
                  // navigate home and refresh moments
                  navigation.navigate('Main Screen', { screen: 'Feed' });
                  try { refreshMoments && refreshMoments(); } catch (e) { console.warn('refreshMoments error', e); }
                }
              }]
            );
          } catch (error) {
            console.error('Error blocking user:', error);
            Alert.alert('Errore', 'Si è verificato un errore durante il blocco dell\'utente');
          }
        }}
      />

      <ReportModal
        visible={reportModalVisible}
        onClose={() => setReportModalVisible(false)}
        onSubmit={async (reason) => {
          try {
            // normalize key
            const reasonKey = reason.toLowerCase().replace(/[^a-z0-9]+/g, '_');

            const reportsRef = firebase.firestore().collection('reports').doc(moment.id + '_moment');
            await reportsRef.set({ contentId: moment.id, owner_email: moment.owner_email, type: 'moment' }, { merge: true });

            const updateObj = {};
            updateObj[`reasons.${reasonKey}.reporters`] = firebase.firestore.FieldValue.arrayUnion(currentUser.owner_uid || null);
            updateObj[`reasons.${reasonKey}.label`] = reason;
            await reportsRef.update(updateObj);

            // hide the moment for the reporting user
            const currentUserRef = firebase.firestore().collection('users').doc(currentUser.email);
            await safeUpdate(currentUserRef, { hiddenMoments: firebase.firestore.FieldValue.arrayUnion(moment.id) });

            Alert.alert('Segnalazione inviata', 'Il contenuto è stato nascosto.');
            try { refreshMoments && refreshMoments(); } catch (e) { console.warn('refreshMoments error', e); }
            navigation.navigate('Main Screen', { screen: 'Feed' });
          } catch (e) {
            console.error('Report moment error:', e);
            Alert.alert('Errore', 'Impossibile inviare la segnalazione.');
          }
        }}
        contentId={moment.id}
        contentType="moment"
        contentOwnerId={moment.owner_email}
        currentUserId={currentUser.email}
      />
    </View>
  );
};

export default MomentHeader;

const styles = StyleSheet.create({
  menuButton: {
    padding: 8,
  }
});