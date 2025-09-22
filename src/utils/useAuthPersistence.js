import { useEffect, useState, useCallback } from 'react';
import * as Keychain from 'react-native-keychain';
import firebase from '../services/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const KEYCHAIN_SERVICE = Constants.expoConfig?.extra?.keychainService;
const ASYNC_STORAGE_KEY = Constants.expoConfig?.extra?.asyncStorageKey;

const useAuthPersistence = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState(null);
  const [isKeychainAvailable, setIsKeychainAvailable] = useState(false);

  const checkKeychainAvailability = useCallback(async () => {
    try {
      const isSupported = await Keychain.getSupportedBiometryType();
      setIsKeychainAvailable(true);
      console.log('Keychain is available, biometry support:', isSupported);
    } catch (error) {
      console.warn('Keychain not available, falling back to AsyncStorage:', error);
      setIsKeychainAvailable(false);
    }
  }, []);

  const saveUserSecurely = useCallback(async (userData, password = null) => {
    try {
      const dataToSave = {
        ...userData,
        lastPassword: password,
        savedAt: Date.now(),
      };

      if (isKeychainAvailable) {
        await Keychain.setInternetCredentials(
          KEYCHAIN_SERVICE,
          userData.email,
          JSON.stringify(dataToSave)
        );
        console.log('User data saved securely in Keychain for:', userData.email);
      } else {
        await AsyncStorage.setItem(ASYNC_STORAGE_KEY, JSON.stringify(dataToSave));
        console.log('User data saved in AsyncStorage for:', userData.email);
      }
    } catch (error) {
      console.error('Error saving user securely:', error);
      throw error;
    }
  }, [isKeychainAvailable]);

  const getStoredUserData = useCallback(async () => {
    try {
      let userData = null;

      if (isKeychainAvailable) {
        const credentials = await Keychain.getInternetCredentials(KEYCHAIN_SERVICE);
        if (credentials && credentials.password) {
          userData = JSON.parse(credentials.password);
        }
      } else {
        const storedData = await AsyncStorage.getItem(ASYNC_STORAGE_KEY);
        if (storedData) {
          userData = JSON.parse(storedData);
        }
      }

      if (userData) {
        const maxAge = 1000;
        if (userData.savedAt && Date.now() - userData.savedAt > maxAge) {
          console.log('Stored user data is too old, clearing...');
          await clearSecureStorage();
          return null;
        }

        return userData;
      }
      return null;
    } catch (error) {
      console.error('Error reading stored user data:', error);
      await clearSecureStorage();
      return null;
    }
  }, [isKeychainAvailable]);

  const clearSecureStorage = useCallback(async () => {
    try {
      if (isKeychainAvailable) {
        await Keychain.resetInternetCredentials(KEYCHAIN_SERVICE);
        console.log('Keychain cleared');
      } else {
        await AsyncStorage.removeItem(ASYNC_STORAGE_KEY);
        console.log('AsyncStorage cleared');
      }
    } catch (error) {
      console.error('Error clearing secure storage:', error);
    }
  }, [isKeychainAvailable]);

  const signInWithStoredCredentials = useCallback(async (userData) => {
    try {
      if (!userData.lastPassword) {
        throw new Error('No password stored');
      }

      const userCredential = await firebase.auth().signInWithEmailAndPassword(
        userData.email,
        userData.lastPassword
      );

      console.log('Successfully signed in with stored credentials:', userData.email);
      return userCredential;
    } catch (authError) {
      console.error('Error signing in with stored credentials:', authError);

      // Se le credenziali non sono valide, pulisce lo storage
      await clearSecureStorage();
      setAuthError(authError.message);
      throw authError;
    }
  }, [clearSecureStorage]);

  // Controlla lo stato di autenticazione
  const checkAuthState = useCallback(async () => {
    try {
      setIsLoading(true);
      setAuthError(null);

      // Controlla prima la disponibilità del Keychain
      await checkKeychainAvailability();

      // Controlla se c'è un utente già autenticato con Firebase
      const firebaseUser = firebase.auth().currentUser;

      if (firebaseUser) {
        const userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
        };
        setUser(userData);
        console.log('User already authenticated with Firebase:', userData.email);
      } else {
        // Se non c'è un utente Firebase, prova a recuperare dalle credenziali salvate
        const storedUserData = await getStoredUserData();

        if (storedUserData) {
          console.log('Found stored user data, attempting to sign in...');
          setUser(storedUserData); // Imposta l'utente temporaneamente

          try {
            await signInWithStoredCredentials(storedUserData);
          } catch (signInError) {
            // Se il login fallisce, rimuove l'utente
            setUser(null);
          }
        } else {
          console.log('No stored user data found');
        }
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
      setAuthError(error.message);
      await clearSecureStorage();
    } finally {
      setIsLoading(false);
    }
  }, [checkKeychainAvailability, getStoredUserData, signInWithStoredCredentials, clearSecureStorage]);

  // Pulisce tutti i dati utente
  const clearUserData = useCallback(async () => {
    try {
      setIsLoading(true);
      await clearSecureStorage();
      await firebase.auth().signOut();
      setUser(null);
      setAuthError(null);
      console.log('User data cleared and signed out');
    } catch (error) {
      console.error('Error clearing user data:', error);
      setAuthError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [clearSecureStorage]);

  // Ricarica lo stato di autenticazione
  const refreshAuth = useCallback(async () => {
    await checkAuthState();
  }, [checkAuthState]);

  useEffect(() => {
    checkAuthState();

    // Listener per i cambiamenti di stato di autenticazione di Firebase
    const unsubscribe = firebase.auth().onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
        };
        setUser(userData);
        console.log('Firebase auth state changed - user signed in:', userData.email);
      } else {
        setUser(null);
        console.log('Firebase auth state changed - user signed out');
      }
    });

    return unsubscribe;
  }, [checkAuthState]);

  return {
    isLoading,
    user,
    authError,
    saveUserSecurely,
    clearUserData,
    refreshAuth,
    isKeychainAvailable
  };
};

export default useAuthPersistence;