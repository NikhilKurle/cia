import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider } from 'react-native-paper';
import { initializeApp } from '@firebase/app';
import { initializeAuth, getReactNativePersistence, onAuthStateChanged } from '@firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

import BusinessInfoScreen from './screens/BusinessInfoScreen';
import ProposalScreen from './screens/ProposalScreen';
import QuotationScreen from './screens/QuotationScreen';
import SupportScreen from './screens/SupportScreen';
import AuthScreen from './screens/AuthScreen';
import ProfileScreen from './screens/ProfileScreen';
import ChatScreen from './screens/ChatScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAvSG0uqy9dSFTLaZtqhPvJhu6ROIKic0M",
  authDomain: "cehpoint-30581.firebaseapp.com",
  projectId: "cehpoint-30581",
  storageBucket: "cehpoint-30581.appspot.com",
  messagingSenderId: "215528592295",
  appId: "1:215528592295:android:6771852388e2eeb35d1c82",
};

const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Business" component={BusinessInfoScreen} />
      <Tab.Screen name="Proposal" component={ProposalScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      
    </Tab.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '215528592295-leuk6eac4copg6tf08lrs5v5q5uc0p2m.apps.googleusercontent.com', // Get this from your Google Cloud Console
      offlineAccess: true, // if you want to access Google API on behalf of the user FROM YOUR SERVER
      forceCodeForRefreshToken: true, // [Android] related to `serverAuthCode`, read the docs link below *.
    });

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);
  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator>
          
          {user ? (
            <>
              <Stack.Screen 
                name="Main" 
                component={MainTabs} 
                options={{ headerShown: false }}
              />
              <Stack.Screen name="Quotation" component={QuotationScreen} />
              <Stack.Screen name="Support" component={SupportScreen} />
              <Stack.Screen name="chats" component={ChatScreen} />
             
            </>
          ) : (
            <Stack.Screen 
              name="Auth" 
              component={AuthScreen} 
              options={{ title: 'Login / Sign Up' }}
            />
            
          )}
           
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}