import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import firebase from '../../services/firebase';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const PendingApprovalScreen = ({ navigation, route }) => {
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [registrationDate, setRegistrationDate] = useState(null);

  useEffect(() => {
    const user = firebase.auth().currentUser;
    if (user) {
      setUserEmail(user.email);
      fetchUserData(user.uid);
    }
  }, []);

  const fetchUserData = async (uid) => {
    try {
      const userDoc = await firebase.firestore().collection('users').doc(uid).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        setRegistrationDate(userData.createdAt?.toDate());
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const checkApprovalStatus = async () => {
    setIsCheckingStatus(true);
    
    try {
      const user = firebase.auth().currentUser;
      if (!user) {
        navigation.navigate('Login');
        return;
      }

      await user.reload();
      
      if (user.disabled) {
        Alert.alert(
          'Account ancora in attesa',
          'Il tuo account è ancora in attesa di approvazione. Riprova più tardi o contatta il tuo referente.',
          [{ text: 'OK' }]
        );
        return;
      }

      const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        
        if (userData.status === 'approved') {
          Alert.alert(
            'Account Approvato! 🎉',
            'Il tuo account è stato approvato. Sarai reindirizzato alla pagina di login.',
            [
              {
                text: 'Accedi ora',
                onPress: () => {
                  firebase.auth().signOut();
                  navigation.navigate('Login');
                }
              }
            ]
          );
        } else if (userData.status === 'rejected') {
          Alert.alert(
            'Account Rifiutato',
            'Il tuo account è stato rifiutato. Contatta il tuo referente per maggiori informazioni.',
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert(
            'Ancora in attesa',
            'Il tuo account è ancora in attesa di approvazione.',
            [{ text: 'OK' }]
          );
        }
      }
    } catch (error) {
      console.error('Error checking status:', error);
      Alert.alert(
        'Errore',
        'Si è verificato un errore durante la verifica dello stato. Riprova più tardi.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const contactSupport = () => {
    Alert.alert(
      'Contatta il Referente',
      'Scegli come contattare il tuo referente:',
      [
        {
          text: 'Email',
          onPress: () => {
            const emailSubject = encodeURIComponent('Richiesta Approvazione Account');
            const emailBody = encodeURIComponent(
              `Salve,\n\nHo registrato un account con l'email: ${userEmail}\n` +
              `Data registrazione: ${registrationDate ? registrationDate.toLocaleDateString('it-IT') : 'N/A'}\n\n` +
              `Il mio account è in attesa di approvazione. Potreste gentilmente procedere con l'attivazione?\n\n` +
              `Grazie per l'attenzione.\n\nCordiali saluti`
            );
            
            const adminEmail = 'info@shentao.it';
            const mailtoUrl = `mailto:${adminEmail}?subject=${emailSubject}&body=${emailBody}`;
            
            Linking.openURL(mailtoUrl);
          }
        },
        // {
        //   text: 'WhatsApp',
        //   onPress: () => {
        //     const phoneNumber = '+393331234567';
        //     const message = encodeURIComponent(
        //       `Salve, ho registrato un account con l'email ${userEmail} in data ${registrationDate ? registrationDate.toLocaleDateString('it-IT') : 'N/A'}. Il mio account è in attesa di approvazione. Potreste procedere con l'attivazione? Grazie.`
        //     );
        //     const whatsappUrl = `whatsapp://send?phone=${phoneNumber}&text=${message}`;
            
        //     Linking.canOpenURL(whatsappUrl)
        //       .then((supported) => {
        //         if (supported) {
        //           Linking.openURL(whatsappUrl);
        //         } else {
        //           Alert.alert(
        //             'WhatsApp non disponibile',
        //             'WhatsApp non è installato su questo dispositivo.',
        //             [{ text: 'OK' }]
        //           );
        //         }
        //       });
        //   }
        // },
      //  {
      //     text: 'Telefono',
      //     onPress: () => {
      //       // Sostituisci con il numero di telefono del referente
      //       const phoneNumber = '+393331234567';
      //       Linking.openURL(`tel:${phoneNumber}`);
      //     }
      //   },
        {
          text: 'Annulla',
          style: 'cancel'
        }
      ]
    );
  };

  const goBackToLogin = () => {
    firebase.auth().signOut();
    navigation.navigate('Login');
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Animated.View entering={FadeInUp.delay(200)} style={styles.iconContainer}>
        <MaterialCommunityIcons 
          name="clock-outline" 
          size={80} 
          color="#FFA500" 
        />
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(400)} style={styles.titleContainer}>
        <Text style={styles.title}>Account in Attesa</Text>
        <Text style={styles.subtitle}>Approvazione Richiesta</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(600)} style={styles.messageContainer}>
        <Text style={styles.message}>
          Il tuo account è stato registrato con successo ma necessita dell'approvazione 
          da parte dell'amministratore prima di poter accedere all'applicazione.
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(800)} style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <Ionicons name="mail-outline" size={20} color="#1af" />
          <Text style={styles.infoText}>Email: {userEmail}</Text>
        </View>
        
        {registrationDate && (
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color="#1af" />
            <Text style={styles.infoText}>
              Registrato il: {formatDate(registrationDate)}
            </Text>
          </View>
        )}
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(1000)} style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>Cosa fare ora:</Text>
        <Text style={styles.instructionsText}>
          • Contatta il tuo referente per accelerare il processo{'\n'}
          • Verifica periodicamente lo stato dell'approvazione{'\n'}
          • Attendi la conferma via email dell'attivazione
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(1200)} style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={checkApprovalStatus}
          disabled={isCheckingStatus}
        >
          <View style={styles.buttonContent}>
            {isCheckingStatus ? (
              <>
                <ActivityIndicator size="small" color="#fff" style={styles.loadingSpinner} />
                <Text style={styles.buttonText}>Verificando...</Text>
              </>
            ) : (
              <>
                <Ionicons name="refresh-outline" size={20} color="#fff" />
                <Text style={styles.buttonText}>Verifica Stato</Text>
              </>
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={contactSupport}
        >
          <View style={styles.buttonContent}>
            <Ionicons name="person-outline" size={20} color="#1af" />
            <Text style={styles.secondaryButtonText}>Contatta Referente</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.ghostButton}
          onPress={goBackToLogin}
        >
          <View style={styles.buttonContent}>
            <Ionicons name="arrow-back-outline" size={20} color="#666" />
            <Text style={styles.ghostButtonText}>Torna al Login</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  iconContainer: {
    marginBottom: 30,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFA500',
    textAlign: 'center',
    fontWeight: '600',
  },
  messageContainer: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 20,
    marginBottom: 25,
    borderLeftWidth: 4,
    borderLeftColor: '#FFA500',
  },
  message: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    lineHeight: 24,
  },
  infoContainer: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 20,
    marginBottom: 25,
    width: '100%',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#fff',
    marginLeft: 12,
    flex: 1,
  },
  instructionsContainer: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    width: '100%',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1af',
    marginBottom: 12,
  },
  instructionsText: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 22,
  },
  buttonsContainer: {
    width: '100%',
    gap: 15,
  },
  primaryButton: {
    backgroundColor: '#07f',
    borderRadius: 10,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderRadius: 10,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1af',
  },
  ghostButton: {
    backgroundColor: 'transparent',
    borderRadius: 10,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#444',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  secondaryButtonText: {
    color: '#1af',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  ghostButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingSpinner: {
    marginRight: 8,
  },
});

export default PendingApprovalScreen;