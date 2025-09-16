import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import "firebase/compat/storage";
import Constants from 'expo-constants';

const firebaseConfig = {
    apiKey: Constants.expoConfig?.extra?.apiKey,
    authDomain: "shentaohub.firebaseapp.com",
    projectId: "shentaohub",
    storageBucket: "shentaohub.firebasestorage.app",
    messagingSenderId: Constants.expoConfig?.extra?.messagingSenderId,
    appId: Constants.expoConfig?.extra?.appId
};

!firebase.apps.length ? firebase.initializeApp(firebaseConfig) : firebase.app()

export default firebase;
export const db = firebase.firestore();
export const storage = firebase.storage();
export const auth = firebase.auth();
