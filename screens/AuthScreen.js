import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Alert } from 'react-native';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithCredential } from '@firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore'; 
import { getDatabase, ref, set } from 'firebase/database'; 
import { GoogleSignin, GoogleSigninButton } from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import { useNavigation } from '@react-navigation/native';

const AuthScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const auth = getAuth();
  const firestore = getFirestore();
  const database = getDatabase();
  const navigation = useNavigation(); 

  const storeUserIdLocally = async (userId, email) => {
    try {
      await AsyncStorage.setItem('userId', userId);
      await AsyncStorage.setItem('email', email); // Also store email for support check
    } catch (error) {
      console.error('Error storing userId:', error);
    }
  };

  const saveUserToRealtimeDB = async (uid, email) => {
    try {
      const userRef = ref(database, `users/${uid}`);
      await set(userRef, {
        email: email,
        createdAt: serverTimestamp(), 
      });
    } catch (error) {
      console.error('Error saving user to Realtime Database:', error);
    }
  };

  const handleAuthentication = async () => {
    try {
      let userCredential;
      if (isLogin) {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
        Alert.alert('Signed in successfully!');
      } else {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        Alert.alert('Account created successfully!');
      }

      const { uid } = userCredential.user;

      if (email === 'support@abc.com' && password === 'Support@123') {
        await storeUserIdLocally(uid, email);
        navigation.navigate('Support'); 
        return;
      }

      await saveUserToRealtimeDB(uid, email);
      await storeUserIdLocally(uid, email);

      navigation.navigate('chats');

    } catch (error) {
      Alert.alert('Authentication error:', error.message);
      console.log(error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.authContainer}>
        <Text style={styles.title}>{isLogin ? 'Sign In' : 'Sign Up'}</Text>

        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry
        />
        <View style={styles.buttonContainer}>
          <Button title={isLogin ? 'Sign In' : 'Sign Up'} onPress={handleAuthentication} color="#3498db" />
        </View>

        {/* <GoogleSigninButton
          style={{ width: 192, height: 48 }}
          size={GoogleSigninButton.Size.Wide}
          color={GoogleSigninButton.Color.Dark}
          onPress={googleSignIn}
        /> */}

        <View style={styles.bottomContainer}>
          <Text style={styles.toggleText} onPress={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Sign In'}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f0f0f0',
  },
  authContainer: {
    width: '80%',
    maxWidth: 400,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 16,
    padding: 8,
    borderRadius: 4,
  },
  buttonContainer: {
    marginBottom: 16,
  },
  toggleText: {
    color: '#3498db',
    textAlign: 'center',
  },
  bottomContainer: {
    marginTop: 20,
  },
});

export default AuthScreen;
