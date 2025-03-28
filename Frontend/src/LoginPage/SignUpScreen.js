import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView} from 'react-native';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { LinearGradient } from 'expo-linear-gradient';

export default function SignUpScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignUp = async () => {
    console.log('Username:', username);
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Confirm Password:', confirmPassword);
    if(!username) {
      alert('Please enter your username.');
      return;
    } else if(!email) {
      alert('Please enter your email.');
      return;
    } else if(!password) {
      alert('Please enter your password.');
      return;
    } else if(password.length < 8) {
      alert('Password must be at least 8 characters long.');
      return;
    } else if(confirmPassword !== password) {
      alert('Passwords do not match.');
      return;
    }

    try {
      const response = await fetch('http://10.0.2.2:5000/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username: username,
          email: email,
          password: password,
        }),
      });

      const data = await response.json();
      if(response.status === 201) {
        alert('Account created successfully!');
        navigation.navigate('SetPasscode');
      } else {
        alert("Message: " + data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to sign up');
    }
  };

  const handleGoBackHome = () => {
    if (navigation) {
      navigation.goBack(); // Use React Navigation to go back to the previous screen
    } else {
      console.log('Go Back Home button pressed');
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <LinearGradient colors={['#13c2c2', '#6b73ff']} style={styles.container}>
      <View style={styles.logoContainer}>
        <Image source={require('../../assets/pill.png')} style={styles.logo} />
      </View>
      <Text style={styles.title}>Create an Account</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#d3d3d3"
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#d3d3d3"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#d3d3d3"
          value={password}
          secureTextEntry
          onChangeText={setPassword}
        />
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          placeholderTextColor="#d3d3d3"
          value={confirmPassword}
          secureTextEntry
          onChangeText={setConfirmPassword}
        />
      </View>

      <TouchableOpacity style={styles.loginButton} onPress={handleSignUp}>
        <Text style={styles.loginButtonText}>Sign Up</Text>
      </TouchableOpacity>

      {/* Go Back Home Button */}
      <TouchableOpacity style={styles.goBackButton} onPress={handleGoBackHome}>
        <Text style={styles.goBackButtonText}>Home</Text>
      </TouchableOpacity>
    </LinearGradient>
    </ScrollView>
    </GestureHandlerRootView>
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
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  input: {
    height: 50,
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
  goBackButton: {
    backgroundColor: '#ff6f61',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  goBackButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scrollViewContent: {
    flexGrow: 1,
  },

});
