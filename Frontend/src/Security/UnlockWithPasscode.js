import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, TextInput } from 'react-native';
import { useBlurOnFulfill, useClearByFocusCell } from 'react-native-confirmation-code-field';

const CELL_COUNT = 6;

export default function UnlockWithPasscode({ navigation }) {
    const [entered_passcode, setEntered_passcode] = useState('');
    const inputRef = useBlurOnFulfill({ value: entered_passcode, cellCount: CELL_COUNT });
    const [props, getCellOnLayoutHandler] = useClearByFocusCell({
        value: entered_passcode,
        setValue: setEntered_passcode,
    });

    const handleUnlock = async () => {
        if (entered_passcode.length !== 6) {
            Alert.alert('Error', 'Please enter a 6-digit passcode.');
            return;
        }

      try {
        const response = await fetch('http://10.0.2.2:5000/UnlockWithPasscode', { 
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ entered_passcode: entered_passcode })
          });

        const data = await response.json();

        if (response.ok && data.Message === 'Unlocked successfully') {
          navigation.replace('SetSched'); // navigate to Home screen
        } else {
          setEntered_passcode(''); // Clear the passcode input
        }
      } catch (error) {
        console.error('Error unlocking with passcode:', error);
      }
    };

    const handleKeyPress = (key) => {
        if (entered_passcode.length < CELL_COUNT) {
            setEntered_passcode(entered_passcode +key);
        }
    };

    const handleDelete = () => {
        setEntered_passcode(entered_passcode.slice(0,-1));
    };

    return (
        <View style={styles.container}>
        <Text style={styles.title}>Enter Passcode to Unlock</Text>
  
        <View style={styles.passcodeContainer}>
          {[...Array(CELL_COUNT)].map((_, index) => (
            <View key={index} style={styles.cell} onLayout={getCellOnLayoutHandler(index)}>
              <Text style={styles.cellText}>
                {index < entered_passcode.length ? (index === entered_passcode.length - 1 ? entered_passcode[index] : '•') : '_'}
              </Text>
            </View>
          ))}
        </View>
  
        <TextInput
          ref={inputRef}
          style={styles.hiddenInput}
          keyboardType="number-pad"
          maxLength={CELL_COUNT}
          value={entered_passcode}
          onChangeText={(text) => setEntered_passcode(text)}
        />
  
        <View style={styles.keypad}>
          <View style={styles.keypadRow}>
            {['1', '2', '3'].map((key) => (
              <TouchableOpacity key={key} style={styles.key} onPress={() => handleKeyPress(key)}>
                <Text style={styles.keyText}>{key}</Text>
              </TouchableOpacity>
            ))}
          </View>
  
          <View style={styles.keypadRow}>
            {['4', '5', '6'].map((key) => (
              <TouchableOpacity key={key} style={styles.key} onPress={() => handleKeyPress(key)}>
                <Text style={styles.keyText}>{key}</Text>
              </TouchableOpacity>
            ))}
          </View>
  
          <View style={styles.keypadRow}>
            {['7', '8', '9'].map((key) => (
              <TouchableOpacity key={key} style={styles.key} onPress={() => handleKeyPress(key)}>
                <Text style={styles.keyText}>{key}</Text>
              </TouchableOpacity>
            ))}
          </View>
  
          <View style={styles.keypadBottomRow}>
            <TouchableOpacity style={styles.key} onPress={() => handleKeyPress('0')}>
              <Text style={styles.keyText}>0</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.key} onPress={handleDelete}>
              <Text style={styles.keyText}>⌫</Text>
            </TouchableOpacity>
          </View>
        </View>
  
        <TouchableOpacity style={styles.button} onPress={handleUnlock}>
          <Text style={styles.buttonText}>Unlock</Text>
        </TouchableOpacity>
  
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack('SetSched')}
        >
          <Text style={styles.backButtonText}>{"<"} Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f8f8f8',
      padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    passcodeContainer: {
        flexDirection: 'row',
        marginBottom: 20,  
    },
    cell: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 5,
    },
    cellText: {
        fontSize: 24,
        color: '#000',
    },
    hiddenInput: {
        position: 'absolute',
        width: 0,
        height: 0,
        opacity: 0,
      },
      keypad: {
        justifyContent: 'center',
        marginBottom: 20,
      },
      keypadRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 10,
      },
      keypadBottomRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
      },
      key: {
        width: 80,
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 5,
        borderRadius: 40,
        backgroundColor: '#e0e0e0',
      },
      keyText: {
        fontSize: 36,
        color: '#000',
      },
      button: {
        backgroundColor: '#5a67d8',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        width: '80%',
        alignItems: 'center',
        marginTop: 10,
      },
      buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
      },
      backButton: {
        position: 'absolute',
        top: 40,
        left: 20,
        padding: 10,
      },
      backButtonText: {
        color: "#333",
        fontSize: 18,
      },
  });
