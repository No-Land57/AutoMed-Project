import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function Security({ navigation }) {
    const [pincode, setPincode] = useState('');
    const [confirmPincode, setConfirmPincode] = useState('');

    if(pincode !== confirmPincode) {
        alert('Pincodes do not match.');
        return;
    }



return (
    <LinearGradient colors={['#13c2c2', '#6b73ff']} style={styles.container}>
                <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backButton}
              >
                <Text style={styles.backButtonText}>{"<"} Back</Text>
                </TouchableOpacity>
        {/* header */}
        <View style={styles.header}>
            <Text style={styles.title}>Security Info</Text>
        </View>
        {/* body */}
        <View style={styles.body}>
            <TouchableOpacity></TouchableOpacity>

        </View>

    </LinearGradient>
    );
}



    const styles = StyleSheet.create({
        container: {
            flex: 
        }
    
    backButton: {
        position: 'absolute',
        top: 40,
        left: 20,
        padding: 10,
      },

    });