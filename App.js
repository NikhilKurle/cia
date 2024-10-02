// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import BusinessInfoScreen from './screens/BusinessInfoScreen';
import ProposalScreen from './screens/ProposalScreen';
import QuotationScreen from './screens/QuotationScreen';
import SupportScreen from './screens/SupportScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="BusinessInfo" component={BusinessInfoScreen} options={{ title: 'Business Information' }} />
          <Stack.Screen name="Proposal" component={ProposalScreen} options={{ title: 'Your Proposal' }} />
          <Stack.Screen name="Quotation" component={QuotationScreen} options={{ title: 'Quotation' }} />
          <Stack.Screen name="Support" component={SupportScreen} options={{ title: 'Support Chat' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}







