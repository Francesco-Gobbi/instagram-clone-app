import firebase from "firebase/compat/app";
import "firebase/compat/auth";
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
