import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { CodeField, Cursor, useBlurOnFulfill, useClearByFocusCell } from 'react-native-confirmation-code-field';
import * as Keychain from 'react-native-keychain';

const CELL_COUNT = 6;

export default function SetPasscode({ navigation }) {
  const [passcode, setPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [step, setStep] = useState(1); // Step 1: Enter passcode, Step 2: Confirm passcode

  const ref = useBlurOnFulfill({ value: step === 1 ? passcode : confirmPasscode, cellCount: CELL_COUNT });
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
    if (confirmPasscode !== passcode) {
      Alert.alert('Error', 'Passcodes do not match. Try again.');
      setPasscode('');
      setConfirmPasscode('');
      setStep(1);
      return;
    }

    // Save passcode securely
    await Keychain.setGenericPassword('user', passcode);

    Alert.alert('Success', 'Passcode has been set!');
    navigation.navigate('FaceId'); // Replace with the actual screen to navigate to
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{step === 1 ? 'Set a Passcode' : 'Confirm Passcode'}</Text>
      
      <CodeField
        ref={ref}
        {...props}
        value={step === 1 ? passcode : confirmPasscode}
        onChangeText={step === 1 ? setPasscode : setConfirmPasscode}
        cellCount={CELL_COUNT}
        rootStyle={styles.codeFieldRoot}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        renderCell={({ index, symbol, isFocused }) => (
          <Text
            key={index}
            style={[styles.cell, isFocused && styles.focusCell]}
            onLayout={getCellOnLayoutHandler(index)}
          >
            {symbol || (isFocused ? <Cursor /> : null)}
          </Text>
        )}
      />

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
  codeFieldRoot: {
    marginBottom: 20,
  },
  cell: {
    width: 40,
    height: 40,
    lineHeight: 38,
    fontSize: 24,
    borderWidth: 2,
    borderColor: '#00000030',
    textAlign: 'center',
    margin: 5,
  },
  focusCell: {
    borderColor: '#000',
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

