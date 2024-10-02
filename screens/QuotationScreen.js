import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Alert, Platform } from 'react-native';
import { Card, Text, Button, ActivityIndicator, DataTable } from 'react-native-paper';
import { generateQuotation } from '../src/services/geminiService';
import { db } from '../firebase.config';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNFetchBlob from 'rn-fetch-blob';

export default function QuotationScreen({ route }) {
  const { business, clientDetails } = route.params;
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateQuotation(business, clientDetails)
      .then(result => {
        setQuotation(result);
        setLoading(false);
        console.log(result);
        db.collection('quotations').add({
          business,
          quotation: result,
          clientDetails,
          timestamp: new Date(),
        });
      })
      .catch(error => {
        console.error(error);
        setLoading(false);
      });
  }, [business, clientDetails]);

  const handleAcceptQuotation = async () => {
    try {
      await db.collection('quotations').doc(business).update({
        accepted: true,
        acceptedAt: new Date(),
      });
      Alert.alert('Success', 'You have accepted the quotation!');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to accept the quotation.');
    }
  };

  const generatePDF = async () => {
    try {
      const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Quotation</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .header { background-color: #0066cc; color: white; padding: 20px; }
            .company-name { font-size: 24px; margin-bottom: 5px; }
            .quote-info { display: flex; justify-content: space-between; }
            .client-info { background-color: #0066cc; color: white; padding: 20px; margin-top: 20px; }
            .services { margin-top: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .total { font-weight: bold; }
            .footer { margin-top: 30px; font-size: 12px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">Cehpoint E-Learning & Cyber Security Solutions</div>
            <div>A Secure Choice for Your Career and Our World</div>
            <div class="quote-info">
              <div>Quote No. CEH-${Math.floor(1000 + Math.random() * 9000)}</div>
              <div>Date: ${new Date().toLocaleDateString()}</div>
            </div>
          </div>
          <div class="client-info">
            <h2>Client Information</h2>
            <p>Client Name: ${clientDetails.clientName}</p>
            <p>Company Name: ${clientDetails.companyName}</p>
            <p>Address: ${clientDetails.address}</p>
            <p>Phone Number: ${clientDetails.phoneNumber}</p>
            <p>Email: ${clientDetails.email}</p>
          </div>
          <div class="services">
            <h2>Quotation Details</h2>
            ${quotation.rawContent.replace(/\n/g, '<br>')}
          </div>
          <div class="footer">
            <p>This quotation is valid for 30 days from the date of issue.</p>
            <p>Authorized Signature: _______________________</p>
          </div>
        </body>
      </html>
      `;

      const options = {
        html,
        fileName: `Quotation-${clientDetails.companyName}-${Date.now()}`,
        directory: 'Documents',
      };

      const file = await RNHTMLtoPDF.convert(options);
      
      if (Platform.OS === 'android') {
        const downloadPath = `${RNFetchBlob.fs.dirs.DownloadDir}/quotation_${clientDetails.companyName}.pdf`;
        await RNFetchBlob.fs.cp(file.filePath, downloadPath);
        Alert.alert('Success', `PDF saved to: ${downloadPath}`);
      } else {
        Alert.alert('Success', `PDF saved to: ${file.filePath}`);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert('Error', 'Failed to download PDF.');
    }
  };

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
          <Text variant="titleLarge" style={styles.title}>Your Quotation</Text>
          <Text style={styles.content}>{quotation.rawContent}</Text>
        </Card.Content>
        <Card.Actions>
          <Button onPress={handleAcceptQuotation}>Accept Quotation</Button>
          <Button onPress={generatePDF}>Download PDF</Button>
        </Card.Actions>
      </Card>
    </ScrollView>
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginBottom: 16,
  },
  content: {
    whiteSpace: 'pre-wrap',
  },
});