import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SignUpScreen from './SignUpScreen';
import UserDetailsScreen from '../UserDetails/UserDetailsScreen';
import SetSched from '../UserDetails/SetSched';
import SetPasscode from '../Security/SetPasscode';
import FaceID from '../Security/FaceID';

const Stack = createNativeStackNavigator();

function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    console.log('Username:', username);
    console.log('Password:', password);
    if(!username) {
      alert('Please enter your username.');
      return;
    } else if(!password) {
      alert('Please enter your password.');
      return;
    }

     try {
      const response = await fetch('http://10.0.2.2:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });

      const data = await response.json();
      if(response.status === 200) {
        alert('Login successful!');
        navigation.navigate('SetSched');
      }
      else {
        alert("Message: " + data.Message);
      }
     } catch (error) {
      console.error('Error:', error);
      alert('Failed to login');
      }
  };
  return (
    <LinearGradient colors={['#13c2c2', '#6b73ff']} style={styles.container}>
      <View style={styles.logoContainer}>
        <Image source={require('../../assets/pill.png')} style={styles.logo} />
      </View>
      <Text style={styles.title}>Welcome to AutoMed</Text>
      <Text style={styles.subtitle}>Your Personal Medication Assistant</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Username/Email"
          placeholderTextColor="#ffffff"
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#ffffff"
          value={password}
          secureTextEntry
          onChangeText={setPassword}
        />
      </View>

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Login</Text>
      </TouchableOpacity>

      <Text style={styles.footerText}>
        Don’t have an account?{' '}
        <Text
          style={styles.signupText}
          onPress={() => navigation.navigate('SignUp')}
        >
          Sign up
        </Text>
      </Text>
    </LinearGradient>
  );
}

export default function Home() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SignUp"
          component={SignUpScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="UserDetails"
          component={UserDetailsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name = "SetSched"
          component = {SetSched}
          options = {{headerShown: false}}
          />
        <Stack.Screen
          name = "SetPasscode"
          component = {SetPasscode}
          options = {{headerShown: false}}
          />
        <Stack.Screen
          name = "FaceID"
          component = {FaceID}
          options = {{headerShown: false}}
          />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#e0e0e0',
    marginBottom: 30,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  input: {
    height: 60,
    backgroundColor: '#ffffff33',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    color: '#fff',
  },
  loginButton: {
    backgroundColor: '#5a67d8',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footerText: {
    color: '#e0e0e0',
    marginTop: 10,
    fontSize: 14,
  },
  signupText: {
    color: '#6dd5ed',
    fontWeight: 'bold',
  },
});
