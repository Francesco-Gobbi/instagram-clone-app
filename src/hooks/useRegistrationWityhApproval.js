import { useState } from 'react';
import firebase from '../services/firebase';

const DEFAULT_PROFILE_PICTURE = 'https://randomuser.me/api/portraits/women/53.jpg';

const sanitizeUsername = (value = '') =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._]/g, '')
    .slice(0, 25);

const createFallbackUsername = () => `user${Math.random().toString(36).slice(-6)}`;

const buildUserDocument = (user, additionalData = {}, provider = 'email') => {
  const safeName = additionalData.name ?? additionalData.displayName ?? '';
  const baseUsernameSource = additionalData.username ?? safeName ?? user.email?.split('@')[0] ?? '';
  const normalizedUsername = sanitizeUsername(baseUsernameSource);
  const username = normalizedUsername || createFallbackUsername();

  const baseDocument = {
    owner_uid: user.uid,
    owner_email: user.email,
    email: user.email,
    username,
    name: safeName,
    bio: '',
    link: '',
    gender: '',
    country: additionalData.country || 'IT',
    profile_picture: additionalData.profile_picture || DEFAULT_PROFILE_PICTURE,
    followers: [],
    following: [],
    followers_request: [],
    following_request: [],
    favorite_users: [],
    close_friends: [],
    muted_users: [],
    saved_posts: [],
    chat_notification: 0,
    event_notification: 0,
    status: 'pending',
    approvedAt: null,
    approvedBy: '',
    verifiedAt: null,
    provider,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    acceptedTerms: false,
    acceptedTermsVersion: null,
    acceptedTermsAt: null,
  };

  const allowedOverrides = new Set([
    'bio',
    'link',
    'gender',
    'country',
    'profile_picture',
    'followers',
    'following',
    'followers_request',
    'following_request',
    'favorite_users',
    'close_friends',
    'muted_users',
    'saved_posts',
    'chat_notification',
    'event_notification',
    'name',
  ]);

  Object.entries(additionalData).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    if (key === 'username' || key === 'displayName') {
      return;
    }

    if (allowedOverrides.has(key)) {
      baseDocument[key] = value;
    }
  });

  if (additionalData.username) {
    const customUsername = sanitizeUsername(additionalData.username);
    if (customUsername) {
      baseDocument.username = customUsername;
    }
  }

  if (!baseDocument.name && safeName) {
    baseDocument.name = safeName;
  }

  if (additionalData.acceptedTerms) {
    baseDocument.acceptedTerms = true;
    baseDocument.acceptedTermsVersion = additionalData.acceptedTermsVersion ?? baseDocument.acceptedTermsVersion ?? null;
    baseDocument.acceptedTermsAt = firebase.firestore.FieldValue.serverTimestamp();
  } else if (baseDocument.acceptedTerms !== true) {
    baseDocument.acceptedTerms = false;
  }

  return baseDocument;
};

const useRegistrationWithApproval = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationError, setRegistrationError] = useState(null);

  const registerUser = async (email, password, additionalData = {}) => {
    setIsRegistering(true);
    setRegistrationError(null);

    if (!additionalData.acceptedTerms) {
      setIsRegistering(false);
      const errorMessage = 'Devi accettare i termini e la privacy policy.';
      setRegistrationError(errorMessage);
      return { success: false, error: errorMessage };
    }

    try {
      const userCredential = await firebase
        .auth()
        .createUserWithEmailAndPassword(email, password);

      const user = userCredential.user;
      const userDocument = buildUserDocument(user, additionalData, 'email');

      await firebase
        .firestore()
        .collection('users')
        .doc(user.email)
        .set(userDocument, { merge: true });

      await firebase.auth().signOut();

      console.log('User registered successfully, awaiting approval:', user.email);

      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
        },
        message: 'Registrazione completata! Il tuo account e in attesa di approvazione.',
      };
    } catch (error) {
      console.error('Registration error:', error);

      let errorMessage = 'Si e verificato un errore durante la registrazione.';

      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Questo indirizzo email e gia registrato.';
          break;
        case 'auth/invalid-email':
          errorMessage = "L'indirizzo email non e valido.";
          break;
        case 'auth/weak-password':
          errorMessage = 'La password e troppo debole. Deve contenere almeno 6 caratteri.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Errore di rete. Controlla la tua connessione internet.';
          break;
        default:
          errorMessage = 'Si e verificato un errore durante la registrazione. Riprova.';
      }

      setRegistrationError(errorMessage);

      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsRegistering(false);
    }
  };

  const registerWithGoogle = async (additionalData = {}) => {
    setIsRegistering(true);
    setRegistrationError(null);

    if (!additionalData.acceptedTerms) {
      setIsRegistering(false);
      const errorMessage = 'Devi accettare i termini e la privacy policy.';
      setRegistrationError(errorMessage);
      return { success: false, error: errorMessage };
    }

    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');

      const result = await firebase.auth().signInWithPopup(provider);
      const user = result.user;

      const mergedAdditionalData = {
        name: user.displayName || '',
        profile_picture: user.photoURL || DEFAULT_PROFILE_PICTURE,
        ...additionalData,
        acceptedTerms: true,
      };

      const userDocument = buildUserDocument(user, mergedAdditionalData, 'google');

      await firebase
        .firestore()
        .collection('users')
        .doc(user.email)
        .set(userDocument, { merge: true });

      await firebase.auth().signOut();

      console.log('Google registration successful, awaiting approval:', user.email);

      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        },
        message: 'Registrazione con Google completata! Il tuo account e in attesa di approvazione.',
      };
    } catch (error) {
      console.error('Google registration error:', error);

      let errorMessage = 'Si e verificato un errore durante la registrazione con Google.';

      switch (error.code) {
        case 'auth/popup-closed-by-user':
          errorMessage = "Registrazione annullata dall'utente.";
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Errore di rete. Controlla la tua connessione internet.';
          break;
        case 'auth/account-exists-with-different-credential':
          errorMessage = 'Esiste gia un account con questo indirizzo email.';
          break;
        default:
          errorMessage = 'Si e verificato un errore durante la registrazione con Google.';
      }

      setRegistrationError(errorMessage);

      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsRegistering(false);
    }
  };

  const clearError = () => {
    setRegistrationError(null);
  };

  return {
    registerUser,
    registerWithGoogle,
    isRegistering,
    registrationError,
    clearError,
  };
};

export default useRegistrationWithApproval;
