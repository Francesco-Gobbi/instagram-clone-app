import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firebase from '../services/firebase';

const useAuthPersistence = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuthState = async () => {
      try {
        // Controlla se c'è un utente salvato in AsyncStorage
        const savedUser = await AsyncStorage.getItem('user');
        
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }

        // Ascolta i cambiamenti dello stato di autenticazione di Firebase
        const unsubscribe = firebase.auth().onAuthStateChanged(async (firebaseUser) => {
          if (firebaseUser) {
            // Utente autenticato, salva in AsyncStorage
            const userData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
            };
            
            await AsyncStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
          } else {
            // Utente non autenticato, rimuovi da AsyncStorage
            await AsyncStorage.removeItem('user');
            setUser(null);
          }
          setIsLoading(false);
        });

        return unsubscribe;
      } catch (error) {
        console.error('Errore nel controllo dello stato di autenticazione:', error);
        setIsLoading(false);
      }
    };

    checkAuthState();
  }, []);

  const logout = async () => {
    try {
      await firebase.auth().signOut();
      await AsyncStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      console.error('Errore durante il logout:', error);
    }
  };

  return {
    user,
    isLoading,
    logout,
    isAuthenticated: !!user,
  };
};

export default useAuthPersistence;

