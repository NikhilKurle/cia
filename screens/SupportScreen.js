// screens/SupportScreen.js
import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { TextInput, Button, Card, Text } from 'react-native-paper';
import { db } from '../firebase.config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SupportScreen() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSupport, setIsSupport] = useState(false);

  useEffect(() => {
    const checkIfSupport = async () => {
      const storedEmail = await AsyncStorage.getItem('email');
      if (storedEmail === 'support@abc.com') {
        setIsSupport(true);
      }
    };

    checkIfSupport();

    const unsubscribe = db.collection('messages')
      .orderBy('timestamp', 'desc')
      .onSnapshot(snapshot => {
        const messageList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setMessages(messageList);
      });

    return () => unsubscribe();
  }, []);

  const sendMessage = async () => {
    if (newMessage.trim()) {
      const sender = isSupport ? 'support' : 'client';
      await db.collection('messages').add({
        text: newMessage,
        timestamp: new Date(),
        sender: sender
      });
      setNewMessage('');
    }
  };

  const renderItem = ({ item }) => (
    <Card style={[styles.messageCard, item.sender === 'support' ? styles.supportMessage : styles.clientMessage]}>
      <Card.Content>
        <Text>{item.sender === 'support' ? 'Support: ' : 'Client: '}{item.text}</Text>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        inverted
      />
      <View style={styles.inputContainer}>
        <TextInput
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type your message..."
          style={styles.input}
        />
        <Button onPress={sendMessage} mode="contained">
          Send
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  messageCard: {
    marginBottom: 8,
  },
  clientMessage: {
    backgroundColor: '#f1f1f1',
  },
  supportMessage: {
    backgroundColor: '#d1f7c4',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  input: {
    flex: 1,
    marginRight: 8,
  },
});
