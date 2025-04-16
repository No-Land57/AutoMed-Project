import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, TextInput } from 'react-native';
import { useBlurOnFulfill, useClearByFocusCell } from 'react-native-confirmation-code-field';

const CELL_COUNT = 6;

export default function UnlockWithPin({ navigation }) {
    const [pin, setPin] = useState('');
    const [step, setStep] = useState(1); // Step 1: Enter passcode
    const inputRef = useBlurOnFulfill({ value: pin, cellCount: CELL_COUNT });
    const [props, getCellOnLayoutHandler] = useClearByFocusCell({
        value: pin,
        setValue: setPin,
    });

    const handleUnlock = () => {
        if (pin.length !== 6) {
            Alert.alert('Error', 'Please enter a 6-digit passcode.');
            return;
        }

        console.log('Unlocking with passcode:', pin);
        alert('Unlocking the solenoid (Todo)');


    };

    const handleKeyPress = (key) => {
        if (pin.length < CELL_COUNT) {
            setPin(pin +key);
        }
    };

    const handleDelete = () => {
        setPin(pin.slice(0,-1));
    };

    return (
        <View style={styles.container}>
        <Text style={styles.title}>Enter PIN to Unlock</Text>
  
        <View style={styles.passcodeContainer}>
          {[...Array(CELL_COUNT)].map((_, index) => (
            <View key={index} style={styles.cell} onLayout={getCellOnLayoutHandler(index)}>
              <Text style={styles.cellText}>
                {index < pin.length ? (index === pin.length - 1 ? pin[index] : '•') : '_'}
              </Text>
            </View>
          ))}
        </View>
  
        <TextInput
          ref={inputRef}
          style={styles.hiddenInput}
          keyboardType="number-pad"
          maxLength={CELL_COUNT}
          value={pin}
          onChangeText={(text) => setPin(text)}
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
          onPress={() => navigation.goBack()}
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
