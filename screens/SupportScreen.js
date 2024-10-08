import React, {useState, useEffect} from 'react';
import {View, FlatList, StyleSheet, ActivityIndicator} from 'react-native';
import {List, TextInput, Button, Card, Text} from 'react-native-paper';
import {ref, onValue, push, serverTimestamp} from 'firebase/database';
import {auth, database} from './firebase.config';

export default function SupportScreen({navigation}) {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const chatsRef = ref(database, 'chats');

    // Log to check if fetching starts
    console.log('Fetching chats from Firebase...');

    const unsubscribe = onValue(
      chatsRef,
      snapshot => {
        const data = snapshot.val();
        if (data) {
          console.log('Data fetched successfully:', data); // Log successful data fetch
          const chatList = Object.entries(data).map(([key, value]) => ({
            id: key,
            lastMessage: value.messages
              ? Object.values(value.messages).pop()
              : null,
          }));
          setChats(chatList);
        } else {
          console.log('No chats found'); // Log when no data is found
          setChats([]);
        }
        setLoading(false);
      },
      error => {
        console.error('Error fetching chats:', error); // Log errors
        setLoading(false); // Set loading to false on error
      },
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (selectedChat) {
      const messagesRef = ref(database, `chats/${selectedChat}/messages`);
      const unsubscribe = onValue(messagesRef, snapshot => {
        const data = snapshot.val();
        if (data) {
          const messageList = Object.entries(data).map(([key, value]) => ({
            id: key,
            ...value,
          }));
          setMessages(messageList.sort((a, b) => a.timestamp - b.timestamp));
        } else {
          setMessages([]);
        }
      });

      return () => unsubscribe();
    }
  }, [selectedChat]);

  const sendMessage = async () => {
    if (newMessage.trim() && selectedChat && auth.currentUser) {
      try {
        const messageRef = ref(database, `chats/${selectedChat}/messages`);
        await push(messageRef, {
          text: newMessage,
          senderId: auth.currentUser.uid,
          senderEmail: auth.currentUser.email,
          timestamp: serverTimestamp(),
        });
        setNewMessage('');
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  const renderChatItem = ({item}) => (
    <List.Item
      title={item.id.replace('user_', '')}
      description={item.lastMessage?.text || 'No messages yet'}
      onPress={() => setSelectedChat(item.id)}
    />
  );

  const renderMessage = ({item}) => (
    <Card
      style={[
        styles.messageCard,
        item.senderId === auth.currentUser?.uid
          ? styles.supportMessage
          : styles.clientMessage,
      ]}>
      <Card.Content>
        <Text>
          {item.senderEmail}: {item.text}
        </Text>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <ActivityIndicator size="large" color="#0000ff" style={styles.loading} />
    );
  }

  if (!selectedChat) {
    return (
      <View style={styles.container}>
        <FlatList
          data={chats}
          renderItem={renderChatItem}
          keyExtractor={item => item.id}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Button onPress={() => setSelectedChat(null)}>Back to Chat List</Button>
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messageList}
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
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageList: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  messageCard: {
    marginBottom: 8,
  },
  clientMessage: {
    backgroundColor: '#f1f1f1',
    alignSelf: 'flex-start',
  },
  supportMessage: {
    backgroundColor: '#d1f7c4',
    alignSelf: 'flex-end',
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
