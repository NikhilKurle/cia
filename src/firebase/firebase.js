// firebase.js
import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAvSG0uqy9dSFTLaZtqhPvJhu6ROIKic0M",
  authDomain: "cehpoint-30581.firebaseapp.com",
  projectId: "cehpoint-30581",
  storageBucket: "cehpoint-30581.appspot.com",
  messagingSenderId: "215528592295",
  appId: "1:215528592295:android:6771852388e2eeb35d1c82",
};

// Initialize Firebase only once
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export { auth, firestore };
