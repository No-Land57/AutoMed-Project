import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, TextInput } from 'react-native';
import * as Keychain from 'react-native-keychain';
import { useBlurOnFulfill, useClearByFocusCell } from 'react-native-confirmation-code-field';

const CELL_COUNT = 6;

export default function SetPasscode({ navigation }) {
  const [passcode, setPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [step, setStep] = useState(1); // Step 1: Enter passcode, Step 2: Confirm passcode
  const inputRef = useBlurOnFulfill({ value: step === 1 ? passcode : confirmPasscode, cellCount: CELL_COUNT });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value: step === 1 ? passcode : confirmPasscode,
    setValue: step === 1 ? setPasscode : setConfirmPasscode,
  });

  const handleSetPasscode = () => {
    if (passcode.length !== 6) {
      Alert.alert('Error', 'Passcode must be 6 digits.');
      return;
    }
    setStep(2);
  };

  const handleConfirmPasscode = async () => {
    console.log('Passcode:', passcode);
    console.log('Confirm Passcode:', confirmPasscode);
  
    if (confirmPasscode !== passcode) {
      Alert.alert('Error', 'Passcodes do not match. Try again.');
      setPasscode('');
      setConfirmPasscode('');
      setStep(1);
      return;
    } else{
          // Save passcode
    // await Keychain.setGenericPassword(username, passcode);  must call username from UserDetailsScreen.js, to allocate passcode to that username
  
    Alert.alert('Success', 'Passcode has been set!');
    navigation.navigate('FaceID'); // Navigate to FaceID screen
    }
  };

  const handleKeyPress = (key) => {
    if (step === 1) {
      if (passcode.length < CELL_COUNT) {
        setPasscode(passcode + key);
      }
    } else {
      if (confirmPasscode.length < CELL_COUNT) {
        setConfirmPasscode(confirmPasscode + key);
      }
    }
  };

  const handleDelete = () => {
    if (step === 1) {
      setPasscode(passcode.slice(0, -1));
    } else {
      setConfirmPasscode(confirmPasscode.slice(0, -1));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{step === 1 ? 'Set a Passcode' : 'Confirm Passcode'}</Text>
      
      <View style={styles.passcodeContainer}>
        {[...Array(CELL_COUNT)].map((_, index) => (
          <View key={index} style={styles.cell} onLayout={getCellOnLayoutHandler(index)}>
            <Text style={styles.cellText}>
              {step === 1
                ? (index < passcode.length ? (index === passcode.length - 1 ? passcode[index] : '•') : '_')
                : (index < confirmPasscode.length ? (index === confirmPasscode.length - 1 ? confirmPasscode[index] : '•') : '_')}
            </Text>
          </View>
        ))}
      </View>

      <TextInput
        ref={inputRef}
        style={styles.hiddenInput}
        keyboardType="number-pad"
        maxLength={CELL_COUNT}
        value={step === 1 ? passcode : confirmPasscode}
        onChangeText={(text) => {
          if (step === 1) {
            setPasscode(text);
          } else {
            setConfirmPasscode(text);
          }
        }}
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

      <TouchableOpacity
        style={styles.button}
        onPress={step === 1 ? handleSetPasscode : handleConfirmPasscode}
      >
        <Text style={styles.buttonText}>{step === 1 ? 'Next' : 'Confirm'}</Text>
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