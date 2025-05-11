import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

import  Login  from './LoginPage/Login';
import SignUpScreen from './LoginPage/SignUpScreen';
import UserDetailsScreen from './UserDetails/UserDetailsScreen';
import SetSched from './UserDetails/SetSched';
import SetPasscode from './Security/SetPasscode';
import SetFaceID from './Security/SetFaceID';
import UnlockWithPasscode from './Security/UnlockWithPasscode';
import UnlockWithFaceID from './Security/UnlockWithFaceID';

const Stack = createNativeStackNavigator();


export default function Home() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions = {{gestureEnabled: false}}>
        <Stack.Screen
          name="Login"
          component={Login}
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen
          name="SignUp"
          component={SignUpScreen}
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen
          name="UserDetailsScreen"
          component={UserDetailsScreen}
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen
          name = "SetSched"
          component = {SetSched}
          options = {{headerShown: false, gestureEnabled: false}}
          />
        <Stack.Screen
          name = "SetPasscode"
          component = {SetPasscode}
          options = {{headerShown: false, gestureEnabled: false}}
          />
        <Stack.Screen
          name = "UnlockWithPasscode"
          component = {UnlockWithPasscode}
          options = {{headerShown: false, gestureEnabled: false}}
          />
        <Stack.Screen
          name = "SetFaceID"
          component = {SetFaceID}
          options = {{headerShown: false, gestureEnabled: false}}
          />
          <Stack.Screen
          name = "UnlockWithFaceID"
          component = {UnlockWithFaceID}
          options = {{headerShown: false, gestureEnabled: false}}
          />
      </Stack.Navigator>
    </NavigationContainer>
  );
}