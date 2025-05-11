import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Image } from 'react-native';

export default function UnlockWithFaceID({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  const handleFaceIDUnlock = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://192.168.0.246:5000/UnlockWithFaceID', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (response.status === 200) {
        setUnlocked(true);
        setTimeout(() => {
          navigation.replace('SetSched');
        }, 1500);
      } else {
        alert(data.Message || 'Face ID failed');
      }
    } catch (error) {
      alert('An error occurred during Face ID unlock');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        unlocked ? (
          <Image
            source={require('../../assets/checkmark.png')}
            style={styles.checkmark}
          />
        ) : (
          <ActivityIndicator size="large" color="#00ffcc" />
        )
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleFaceIDUnlock}>
          <Text style={styles.buttonText}>Scan Face</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#00ffcc',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 10,
  },
  buttonText: {
    color: '#000',
    fontSize: 20,
    fontWeight: 'bold',
  },
  checkmark: {
    width: 100,
    height: 100,
  },
});
