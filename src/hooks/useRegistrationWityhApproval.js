import { useState } from 'react';
import firebase from '../services/firebase';

const useRegistrationWithApproval = () => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [registrationError, setRegistrationError] = useState(null);

    const registerUser = async (email, password, additionalData = {}) => {
        setIsRegistering(true);
        setRegistrationError(null);

        try {
            const userCredential = await firebase
                .auth()
                .createUserWithEmailAndPassword(email, password);

            const user = userCredential.user;

            await firebase.firestore().collection('users').doc(user.uid).set({
                email: user.email,
                displayName: additionalData.displayName || '',
                photoURL: additionalData.photoURL || '',
                provider: 'email',
                status: 'pending',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                approvedAt: null,
                approvedBy: null,
                ...additionalData
            });

            await firebase.auth().signOut();

            console.log('User registered successfully, awaiting approval:', user.email);

            return {
                success: true,
                user: {
                    uid: user.uid,
                    email: user.email
                },
                message: 'Registrazione completata! Il tuo account è in attesa di approvazione.'
            };

        } catch (error) {
            console.error('Registration error:', error);

            let errorMessage = 'Si è verificato un errore durante la registrazione.';

            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'Questo indirizzo email è già registrato.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'L\'indirizzo email non è valido.';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'La password è troppo debole. Deve contenere almeno 6 caratteri.';
                    break;
                case 'auth/network-request-failed':
                    errorMessage = 'Errore di rete. Controlla la tua connessione internet.';
                    break;
                default:
                    errorMessage = 'Si è verificato un errore durante la registrazione. Riprova.';
            }

            setRegistrationError(errorMessage);

            return {
                success: false,
                error: errorMessage
            };
        } finally {
            setIsRegistering(false);
        }
    };

    const registerWithGoogle = async () => {
        setIsRegistering(true);
        setRegistrationError(null);

        try {
            // Configura il provider Google
            const provider = new firebase.auth.GoogleAuthProvider();
            provider.addScope('email');
            provider.addScope('profile');

            // Effettua il login con Google
            const result = await firebase.auth().signInWithPopup(provider);
            const user = result.user;

            // Salva i dati dell'utente in Firestore
            await firebase.firestore().collection('users').doc(user.uid).set({
                email: user.email,
                displayName: user.displayName || '',
                photoURL: user.photoURL || '',
                provider: 'google',
                status: 'pending',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                approvedAt: null,
                approvedBy: null
            });

            // L'utente viene disabilitato automaticamente dalla Cloud Function
            // Logout immediato
            await firebase.auth().signOut();

            console.log('Google registration successful, awaiting approval:', user.email);

            return {
                success: true,
                user: {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    photoURL: user.photoURL
                },
                message: 'Registrazione con Google completata! Il tuo account è in attesa di approvazione.'
            };

        } catch (error) {
            console.error('Google registration error:', error);

            let errorMessage = 'Si è verificato un errore durante la registrazione con Google.';

            switch (error.code) {
                case 'auth/popup-closed-by-user':
                    errorMessage = 'Registrazione annullata dall\'utente.';
                    break;
                case 'auth/network-request-failed':
                    errorMessage = 'Errore di rete. Controlla la tua connessione internet.';
                    break;
                case 'auth/account-exists-with-different-credential':
                    errorMessage = 'Esiste già un account con questo indirizzo email.';
                    break;
                default:
                    errorMessage = 'Si è verificato un errore durante la registrazione con Google.';
            }

            setRegistrationError(errorMessage);

            return {
                success: false,
                error: errorMessage
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
        clearError
    };
};

export default useRegistrationWithApproval;