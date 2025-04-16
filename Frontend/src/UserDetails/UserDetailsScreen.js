import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function UserDetailsScreen({ navigation }) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [userType, setUserType] = useState(''); // Guardian, Worker, or Patient
  const [fetchData, setFetchData] = useState(false);

  useEffect(() => {
    if (fetchData) {  // Only fetch data if fetchData is true
      const fetchUserDetails = async () => {
        try {
          const response = await fetch('http://10.0.2.2:5000/userdetails', {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          setName(data.name);
          setAge(data.age ? String(data.age) : 'N/A');
          setUserType(data.userType);
        } catch (error) {
          console.error('Failed to fetch user details:', error);
        }
      };
      fetchUserDetails();
    }
  }, [fetchData]);  // Depend on the fetchData flag

  const handleSaveDetails = async () => {
    console.log('Name:', name);
    console.log('Age:', age);
    console.log('User Type:', userType);
    if(!name || !age || !userType) {
      alert('Please fill out all fileds.');
      return;
    }

    try {
      const response = await fetch('http://10.0.2.2:5000/userdetails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: name,
          age: age,
          userType: userType,
        }),
      });

      const data = await response.json();
      if(response.status === 201) {
        alert('User details saved successfully!');
      } else {
        alert("Message: " + data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to save user details');
  };
    // Save data or navigate to the next screen
    navigation.navigate('SetPasscode'); // Navigate to Set passcode screen
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
        <Text style={styles.saveButtonText}>Next</Text>
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
