// screens/
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Surface } from 'react-native-paper';

export default function BusinessInfoScreen({ navigation }) {
  const [business, setBusiness] = useState('');

  const handleSubmit = () => {
    navigation.navigate('Proposal', { business });
  };

  return (
    <Surface style={styles.container}>
      <TextInput
        label="Tell us about your business"
        value={business}
        onChangeText={setBusiness}
        mode="outlined"
        multiline
        numberOfLines={4}
        style={styles.input}
      />
      <Button 
        mode="contained" 
        onPress={handleSubmit}
        style={styles.button}
      >
        Get Proposal
      </Button>
    </Surface>
  );
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
    },
    card: {
      marginBottom: 16,
    },
    input: {
      marginBottom: 16,
    },
    button: {
      marginTop: 8,
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    proposalText: {
      marginTop: 16,
      lineHeight: 24,
    },
  });