import React, { useState } from 'react';
import { View, Alert, StyleSheet } from 'react-native';
import { TextInput, Button, Text, Card, Title, ActivityIndicator } from 'react-native-paper';
import { auth, firestore } from './firebase';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true); // Toggle between login and registration
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await auth().signInWithEmailAndPassword(email, password);
      Alert.alert('Login successful');
    } catch (error) {
      Alert.alert('Login failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    setLoading(true);
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      const { uid } = userCredential.user;

      // Save user data to Firestore
      await firestore().collection('users').doc(uid).set({
        email: email,
        createdAt: new Date(),
      });

      Alert.alert('Registration successful');
    } catch (error) {
      Alert.alert('Registration failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>{isLogin ? 'Welcome Back!' : 'Create an Account'}</Title>
          <TextInput
            label="Email"
            mode="outlined"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            style={styles.input}
          />
          <TextInput
            label="Password"
            mode="outlined"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
          />
          {loading ? (
            <ActivityIndicator animating={true} size="large" />
          ) : (
            <Button
              mode="contained"
              onPress={isLogin ? handleLogin : handleSignup}
              style={styles.button}
              contentStyle={styles.buttonContent}
            >
              {isLogin ? 'Login' : 'Sign Up'}
            </Button>
          )}
          <Button
            mode="text"
            onPress={() => setIsLogin(!isLogin)}
            labelStyle={styles.toggleText}
          >
            {isLogin
              ? "Don't have an account? Sign Up"
              : 'Already have an account? Login'}
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f0f4f8', // Light background color for better readability
  },
  card: {
    elevation: 4,
    borderRadius: 12,
    paddingVertical: 20,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
    color: '#2c3e50',
  },
  input: {
    marginBottom: 20,
    backgroundColor: '#000', // Keep input backgrounds white
  },
  button: {
    marginTop: 10,
    backgroundColor: '#3498db', // Light blue for the primary action button
  },
  buttonContent: {
    paddingVertical: 8,
  },
  toggleText: {
    marginTop: 10,
    textAlign: 'center',
    color: '#3498db',
  },
});

export default LoginScreen;
