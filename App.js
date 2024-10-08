import React, {useState, useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {ActivityIndicator, Provider as PaperProvider} from 'react-native-paper';
import {onAuthStateChanged} from 'firebase/auth';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {View, TouchableOpacity, StyleSheet, Animated} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import {auth} from './screens/firebase.config';

import BusinessInfoScreen from './screens/BusinessInfoScreen';
import ProposalScreen from './screens/ProposalScreen';
import QuotationScreen from './screens/QuotationScreen';
import SupportScreen from './screens/SupportScreen';
import AuthScreen from './screens/AuthScreen';
import ProfileScreen from './screens/ProfileScreen';
import ChatScreen from './screens/ChatScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const CustomTabBarButton = ({children, onPress}) => {
  return (
    <TouchableOpacity
      style={{
        top: -30,
        justifyContent: 'center',
        alignItems: 'center',
      }}
      onPress={onPress}>
      <View
        style={{
          width: 70,
          height: 70,
          borderRadius: 35,
          backgroundColor: '#ffffff',
          ...styles.shadow,
        }}>
        {children}
      </View>
    </TouchableOpacity>
  );
};

function TabIcon({focused, icon}) {
  const scaleValue = new Animated.Value(1);
  const opacity = new Animated.Value(0.5);

  React.useEffect(() => {
    if (focused) {
      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 1.2,
          friction: 5,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 1,
          friction: 5,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.5,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [focused, scaleValue, opacity]);

  return (
    <Animated.View
      style={{
        transform: [{scale: scaleValue}],
        opacity: opacity,
      }}>
      <Icon name={icon} size={24} color={focused ? '#2196F3' : '#748c94'} />
    </Animated.View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 25,
          left: 20,
          right: 20,
          elevation: 0,
          backgroundColor: '#ffffff',
          borderRadius: 15,
          height: 90,
          ...styles.shadow,
        },
      }}>
      <Tab.Screen
        name="Business"
        component={BusinessInfoScreen}
        options={{
          tabBarIcon: ({focused}) => (
            <TabIcon focused={focused} icon="office-building" />
          ),
        }}
      />
      <Tab.Screen
        name="Proposal"
        component={ProposalScreen}
        options={{
          tabBarIcon: ({focused}) => (
            <View style={{alignItems: 'center', justifyContent: 'center'}}>
              <TabIcon focused={focused} icon="file-document" />
            </View>
          ),
          tabBarButton: props => <CustomTabBarButton {...props} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({focused}) => (
            <TabIcon focused={focused} icon="account" />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [isSupport, setIsSupport] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        '215528592295-leuk6eac4copg6tf08lrs5v5q5uc0p2m.apps.googleusercontent.com',
      offlineAccess: true,
    });

    const unsubscribe = onAuthStateChanged(auth, user => {
      setUser(user);
      setIsSupport(user?.email === 'support@abc.com');
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <ActivityIndicator
        color="black"
        size={24}
        style={{flex: 1, justifyContent: 'center'}}
      />
    );
  }

  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator>
          {user ? (
            isSupport ? (
              <Stack.Screen
                name="Support"
                component={SupportScreen}
                options={{headerShown: false}}
              />
            ) : (
              <>
                <Stack.Screen
                  name="Main"
                  component={MainTabs}
                  options={{headerShown: false}}
                />
                <Stack.Screen name="Quotation" component={QuotationScreen} />
                <Stack.Screen name="Support" component={SupportScreen} />
                <Stack.Screen name="Chat" component={ChatScreen} />
              </>
            )
          ) : (
            <Stack.Screen
              name="Auth"
              component={AuthScreen}
              options={{title: 'Login / Sign Up'}}
            />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#7F5DF0',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 5,
  },
});