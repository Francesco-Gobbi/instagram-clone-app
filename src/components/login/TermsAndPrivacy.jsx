import React from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Linking } from "react-native";
import Constants from 'expo-constants';
const termsUrl = Constants.expoConfig?.extra?.termsUrl;

const TermsAndPrivacy = ({ navigation }) => {
  const openTerms = async () => {
    try {
      const supported = await Linking.canOpenURL(termsUrl);
      if (supported) {
        await Linking.openURL(termsUrl);
      } else {
        Alert.alert('Termini e condizioni', 'Impossibile aprire il collegamento ai termini.');
      }
    } catch (error) {
      Alert.alert('Termini e condizioni', 'Impossibile aprire il collegamento ai termini.');
    }
  };

  return (
    <ScrollView style={styles.container} contentInsetAdjustmentBehavior="automatic">
      <Text style={styles.title}>Termini e Condizioni & Privacy Policy</Text>
      <Text style={styles.text}>
        Puoi consultare i termini di utilizzo e la privacy policy toccando il pulsante qui sotto oppure il link
        dedicato. Torna quindi alla registrazione per completare l'iscrizione.
      </Text>
      <Text style={styles.text}>
        In alternativa apri il collegamento{' '}
        <Text style={styles.linkInline} onPress={openTerms}>
          direttamente da qui
        </Text>
        .
      </Text>

      <TouchableOpacity style={styles.button} onPress={openTerms}>
        <Text style={styles.buttonText}>Apri termini e privacy policy</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.closeButton]} onPress={() => navigation.goBack()}>
        <Text style={styles.buttonText}>Chiudi</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default TermsAndPrivacy;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#000' },
  title: { fontSize: 22, fontWeight: '700', color: '#fff', marginBottom: 12 },
  text: { color: '#ccc', marginBottom: 16, lineHeight: 20 },
  linkInline: { color: '#1af', fontWeight: '700' },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 8,
    backgroundColor: '#07f',
  },
  buttonText: { color: '#fff', fontWeight: '700' },
  closeButton: { backgroundColor: '#555' },
});
