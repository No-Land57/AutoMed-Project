import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function SetSched({route, navigation }) {
  const { name, age, userType } = route.params; //get data from UserDetails
  const [drug, setDrug] = useState('');
  const [dose, setDose] = useState('');
  const [time, setTime] = useState('');
  const [day, setDay] = useState('');

  const handleDispense = () => {
    if (!drug || !dose || !time || !day) {
      alert('Please fill out all fields.');
      return;
    }
    alert('Medication Dispensed!');
    navigation.goBack(); // Navigate back after dispensing
  };

  return (
    <LinearGradient colors={['#13c2c2', '#6b73ff']} style={styles.container}>
      {/* Header Section */}
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>{'<'} Back</Text>
        </TouchableOpacity>
      <View style={styles.header}>

        <View style={styles.userInfo}>
          <Image
            source={require('../assets/profile.png')} // Replace with the actual profile picture
            style={styles.profileImage}
          />
          <View>
            <Text style={styles.userName}>{name}</Text>
            <Text style={styles.userDetails}>{age} years old</Text>
            <Text style={styles.userStatus}>{userType}</Text>
          </View>
        </View>
      </View>

      {/* Medication Details */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Medication Details</Text>
        <TextInput
          style={styles.input}
          placeholder="Medicine"
          placeholderTextColor="#d3d3d3"
          value={drug}
          onChangeText={setDrug}
        />
        <TextInput
          style={styles.input}
          placeholder="Dose"
          placeholderTextColor="#d3d3d3"
          value={dose}
          onChangeText={setDose}
        />
        <TextInput
          style={styles.input}
          placeholder="Time"
          placeholderTextColor="#d3d3d3"
          value={time}
          onChangeText={setTime}
        />
        <TextInput
          style={styles.input}
          placeholder="Day"
          placeholderTextColor="#d3d3d3"
          value={day}
          onChangeText={setDay}
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  backButton: {
    marginRight: 60,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 18,
    alignItems: 'flex-start',
    marginTop: 30,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 20,
    marginTop: 50,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 50,
  },
  userDetails: {
    fontSize: 14,
    color: '#fff',
  },
  userStatus: {
    fontSize: 12,
    color: '#fff',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  table: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableCell: {
    flex: 1,
    padding: 10,
    borderRightWidth: 1,
    borderColor: '#ccc',
    textAlign: 'center',
    color: '#000',
  },
  editButton: {
    marginTop: 10,
    alignItems: 'flex-end',
  },
  editButtonText: {
    color: '#13c2c2',
    fontWeight: 'bold',
  },
  dispenseButton: {
    backgroundColor: '#5a67d8',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  dispenseButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
