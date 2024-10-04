import React, { useState } from 'react';
import { View, Alert, StyleSheet } from 'react-native';
import { TextInput, Button, Title, ActivityIndicator, Card } from 'react-native-paper';
import { auth, firestore } from './firebase';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLogin, setIsLogin] = useState(true);   
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    try {
      await auth().signInWithEmailAndPassword(email, password);
      Alert.alert('Login successful');
      setError('');
    } catch (error) {
      setError(error.message);
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

      await firestore().collection('user').doc(uid).set({
        name: name,
        email: email,
        avatar: 'https://example.com/default-avatar.png',
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      Alert.alert('User created successfully!');
      setEmail('');
      setPassword('');
      setName('');
      setError('');
    } catch (error) {
      setError(error.message);
      Alert.alert('Signup failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>{isLogin ? 'Welcome Back!' : 'Create an Account'}</Title>

          {!isLogin && (
            <TextInput
              label="Name"
              mode="outlined"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />
          )}

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

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Button
            mode="text"
            onPress={() => setIsLogin(!isLogin)}
            labelStyle={styles.toggleText}
          >
            {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Login'}
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
    backgroundColor: '#f0f4f8',
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
    backgroundColor: '#ffffff',
  },
  button: {
    marginTop: 10,
    backgroundColor: '#3498db',
  },
  buttonContent: {
    paddingVertical: 8,
  },
  toggleText: {
    marginTop: 10,
    textAlign: 'center',
    color: '#3498db',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default LoginScreen;
