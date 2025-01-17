import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function UserDetailsScreen() {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [userType, setUserType] = useState(''); // Guardian, Worker, or Patient

  const handleSaveDetails = () => {
    console.log('Name:', name);
    console.log('Age:', age);
    console.log('User Type:', userType);
    // Save data or navigate to the next screen
  };

  return (
    <LinearGradient colors={['#13c2c2', '#6b73ff']} style={styles.container}>
      <Text style={styles.title}>User Details</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Name"
          placeholderTextColor="#d3d3d3"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Age"
          placeholderTextColor="#d3d3d3"
          value={age}
          keyboardType="numeric"
          onChangeText={setAge}
        />
        <TextInput
          style={styles.input}
          placeholder="User Type (Guardian, Worker, Patient)"
          placeholderTextColor="#d3d3d3"
          value={userType}
          onChangeText={setUserType}
        />
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSaveDetails}>
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
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
  saveButton: {
    backgroundColor: '#5a67d8',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
