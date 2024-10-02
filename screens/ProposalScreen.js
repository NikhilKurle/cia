import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Card, Button, Text, ActivityIndicator, Divider, TextInput } from 'react-native-paper';
import { generateProposal } from '../src/services/geminiService';

export default function ProposalScreen({ route, navigation }) {
  const { business } = route.params;
  const [proposal, setProposal] = useState('');
  const [loading, setLoading] = useState(true);
  const [clientDetails, setClientDetails] = useState({
    clientName: '',
    companyName: '',
    address: '',
    phoneNumber: '',
    email: '',
  });

  useEffect(() => {
    generateProposal(business)
      .then(result => {
        setProposal(result);
        setLoading(false);
      })
      .catch(error => {
        console.error(error);
        setLoading(false);
      });
  }, [business]);

  const renderFormattedContent = (content) => {
    if (!content) return null;

    const sections = content.split('\n\n').filter(section => section.trim());

    return (
      <View style={styles.proposalContent}>
        {sections.map((section, index) => {
          const lines = section.split('\n');
          
          return (
            <View key={index} style={styles.section}>
              {lines.map((line, lineIndex) => {
                if (line.startsWith("") && line.endsWith("")) {
                  return (
                    <Text key={lineIndex} style={styles.sectionHeader}>
                      {line.replace(/\*\*/g, "")}
                    </Text>
                  );
                } else if (line.trim().startsWith("*") || line.trim().startsWith("-")) {
                  return (
                    <Text key={lineIndex} style={styles.bulletPoint}>
                      • {line.trim().substring(1)}
                    </Text>
                  );
                } else {
                  return (
                    <Text key={lineIndex} style={styles.sectionContent}>
                      {line.trim()}
                    </Text>
                  );
                }
              })}
              {index < sections.length - 1 && <Divider style={styles.divider} />}
            </View>
          );
        })}
      </View>
    );
  };

  const renderClientDetailsForm = () => (
    <View style={styles.clientDetailsForm}>
      <Text style={styles.formHeader}>Client Details</Text>
      <TextInput
        label="Client Name"
        value={clientDetails.clientName}
        onChangeText={(text) => setClientDetails({ ...clientDetails, clientName: text })}
        style={styles.input}
      />
      <TextInput
        label="Company Name"
        value={clientDetails.companyName}
        onChangeText={(text) => setClientDetails({ ...clientDetails, companyName: text })}
        style={styles.input}
      />
      <TextInput
        label="Address"
        value={clientDetails.address}
        onChangeText={(text) => setClientDetails({ ...clientDetails, address: text })}
        style={styles.input}
      />
      <TextInput
        label="Phone Number"
        value={clientDetails.phoneNumber}
        onChangeText={(text) => setClientDetails({ ...clientDetails, phoneNumber: text })}
        style={styles.input}
        keyboardType="phone-pad"
      />
      <TextInput
        label="Email"
        value={clientDetails.email}
        onChangeText={(text) => setClientDetails({ ...clientDetails, email: text })}
        style={styles.input}
        keyboardType="email-address"
      />
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.headerContainer}>
            <Text style={styles.companyName}>
              Cehpoint E-Learning & Cyber Security Solutions
            </Text>
            <Text style={styles.companyTagline}>
              A Secure Choice for Your Career and Our World
            </Text>
          </View>
          <Divider style={styles.divider} />
          {renderFormattedContent(proposal)}
          {renderClientDetailsForm()}
        </Card.Content>
        <Card.Actions style={styles.actions}>
          <Button 
            mode="contained" 
            onPress={() => navigation.navigate('Quotation', { business, clientDetails })} 
            style={styles.actionButton}
          >
            Generate Quotation
          </Button>
          <Button 
            mode="outlined" 
            onPress={() => navigation.navigate('Support')} 
            style={styles.actionButton}
          >
            Contact Sales
          </Button>
        </Card.Actions>
      </Card>
    </ScrollView>
  );
}


const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: '#f5f5f5',
    },
    card: {
      marginBottom: 16,
      elevation: 4,
    },
    headerContainer: {
      alignItems: 'center',
      marginBottom: 16,
    },
    companyName: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#2c3e50',
      textAlign: 'center',
      marginBottom: 8,
    },
    companyTagline: {
      fontSize: 16,
      color: '#34495e',
      textAlign: 'center',
      fontStyle: 'italic',
    },
    proposalContent: {
      marginTop: 16,
    },
    section: {
      marginVertical: 12,
    },
    sectionHeader: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#2c3e50',
      marginBottom: 8,
    },
    sectionContent: {
      fontSize: 16,
      lineHeight: 24,
      color: '#34495e',
      marginBottom: 4,
    },
    bulletPoint: {
      fontSize: 16,
      lineHeight: 24,
      color: '#34495e',
      marginLeft: 16,
      marginBottom: 4,
    },
    divider: {
      marginVertical: 16,
    },
    actions: {
      justifyContent: 'space-around',
      padding: 16,
    },
    actionButton: {
      minWidth: 140,
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  // ... (previous styles remain the same)
  clientDetailsForm: {
    marginTop: 24,
  },
  formHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
});



