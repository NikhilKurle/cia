import React, { useState, useEffect } from 'react';
import { View, ScrollView, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Button, Text, ActivityIndicator, Divider, TextInput } from 'react-native-paper';
import { getFirestore, collection, query, where, getDocs } from '@firebase/firestore';
import { getAuth } from '@firebase/auth';
import { generateProposal } from '../src/services/geminiService';

const ProposalScreen = ({ route, navigation }) => {
  const business = route.params?.business;
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [proposal, setProposal] = useState('');
  const [clientDetails, setClientDetails] = useState({
    clientName: '',
    companyName: '',
    address: '',
    phoneNumber: '',
    email: '',  
  });
  const auth = getAuth();
  const db = getFirestore();


  const handelNaviagte =()=>{
    navigation.navigate('chats')
 }

  useEffect(() => {
    const fetchProposals = async () => {
      if (auth.currentUser) {
        const q = query(
          collection(db, 'proposals'),
          where('userId', '==', auth.currentUser.uid),
          where('status', '==', 'accepted')
        );
        const querySnapshot = await getDocs(q);
        const fetchedProposals = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProposals(fetchedProposals);
        setLoading(false);
      }
    };

    const generateDynamicProposal = async () => {
      try {
        const result = await generateProposal(business);
        setProposal(result);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    fetchProposals();
    generateDynamicProposal();
  }, [business, auth.currentUser]);

  const renderFormattedContent = (content) => {
    if (!content) return null;

    const sections = content.split('\n\n').filter(section => section.trim());

    return (
      <View style={styles.proposalContent}>
        {sections.map((section, index) => {
          const lines = section.split('\n');
          return (
            <View key={index} style={styles.section}>
              {lines.map((line, lineIndex) => (
                <Text key={lineIndex} style={line.startsWith('*') ? styles.bulletPoint : styles.sectionContent}>
                  {line.trim().startsWith('*') ? `• ${line.trim().substring(1)}` : line.trim()}
                </Text>
              ))}
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
      {['clientName', 'companyName', 'address', 'phoneNumber', 'email'].map((field) => (
        <TextInput
          key={field}
          label={field.split(/(?=[A-Z])/).join(' ')}
          value={clientDetails[field]}
          onChangeText={(text) => setClientDetails({ ...clientDetails, [field]: text })}
          style={styles.input}
          keyboardType={field === 'phoneNumber' ? 'phone-pad' : field === 'email' ? 'email-address' : 'default'}
        />
      ))}
    </View>
  );

  const renderProposal = ({ item }) => (
    <View style={styles.proposalItem}>
      <Text style={styles.proposalTitle}>{item.title}</Text>
      <Text>Status: {item.status}</Text>
      <Text>Quotation: ${item.quotation}</Text>
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
      <Text style={styles.title}>Accepted Proposals</Text>
      <FlatList
        data={proposals}
        renderItem={renderProposal}
        keyExtractor={item => item.id}
      />
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.companyName}>Generated Proposal for {business.name}</Text>
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
          <TouchableOpacity 
            mode="outlined" 
            onPress={()=>handelNaviagte()} 
            style={styles.actionButton}
          >
            <Text>Contact Sales</Text>
          </TouchableOpacity>
        </Card.Actions>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
  },
  proposalItem: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
  },
  proposalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  card: {
    marginBottom: 16,
    elevation: 4,
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  proposalContent: {
    marginTop: 16,
  },
  section: {
    marginVertical: 12,
  },
  sectionContent: {
    fontSize: 16,
    color: '#34495e',
  },
  bulletPoint: {
    fontSize: 16,
    marginLeft: 16,
  },
  divider: {
    marginVertical: 16,
  },
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
});

export default ProposalScreen;