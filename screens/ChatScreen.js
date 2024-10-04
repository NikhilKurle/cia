import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, Alert, ScrollView } from 'react-native';
import { getDatabase, ref, onValue, push, serverTimestamp } from 'firebase/database'; // Firebase Realtime Database
import AsyncStorage from '@react-native-async-storage/async-storage'; // For retrieving userId stored during login

const ChatScreen = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [userId, setUserId] = useState('');

  const database = getDatabase(); // Initialize Firebase Realtime Database

  useEffect(() => {
    // Get the userId from AsyncStorage
    const getUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        if (storedUserId) {
          setUserId(storedUserId);
        }
      } catch (error) {
        console.error('Error retrieving userId from AsyncStorage:', error);
      }
    };

    getUserId();

    // Subscribe to chat messages from Firebase Realtime Database
    const messagesRef = ref(database, 'messages');
    onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const parsedMessages = Object.keys(data).map(key => ({
          id: key,
          text: data[key].text,
          senderId: data[key].senderId,
          timestamp: data[key].timestamp,
        }));
        setMessages(parsedMessages);
      }
    });
  }, []);

  const sendMessage = async () => {
    if (message.trim() === '') {
      Alert.alert('Message cannot be empty');
      return;
    }

    try {
      const messageRef = ref(database, 'messages');
      await push(messageRef, {
        text: message,
        senderId: userId,
        timestamp: serverTimestamp(),
      });

      setMessage(''); // Clear the input field
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Failed to send message:', error.message);
    }
  };

  const renderMessage = ({ item }) => (
    <View style={styles.messageContainer}>
      <Text style={styles.messageSender}>{item.senderId === userId ? 'You' : item.senderId}:</Text>
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messageList}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Type a message..."
        />
        <Button title="Send" onPress={sendMessage} color="#3498db" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 16,
  },
  messageList: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  messageContainer: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    alignSelf: 'flex-start',
    maxWidth: '80%',
    elevation: 1,
  },
  messageSender: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    marginRight: 10,
    paddingLeft: 8,
    borderRadius: 4,
  },
});

export default ChatScreen;
