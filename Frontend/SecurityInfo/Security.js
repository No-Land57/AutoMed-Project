import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import PinCode from "react-native-pin-code";

export default function Security({ navigation }) {
  const [pincode, setPincode] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const handlePincode = (code) => {
    setPincode(code);
    setShowConfirm(true);
  };

  const handleConfirmPincode = (code) => {
    if(code !== pincode) {
      alert("Pincode does not match");
      setConfirmPincode(false);
      return;
    }
    alert("Pincode set successfully");

  
  };

  return (
    <LinearGradient colors={["#13c2c2", "#6b73ff"]} style={styles.container}>
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
        {!showConfirm ? (
          <PinCode
            codeLength={6}
            onCodeFilled={handlePincode}
            title="Enter Pincode"
            subtitle=""
          />
        ) : (
          <PinCode
            codeLength={6}
            onCodeFilled={handleConfirmPincode}
            title="Confirm Pincode"
            subtitle=""
          />
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    padding: 10,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 18,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    color: "#fff",
  },
  body: {
    width: "80%",
  },
});
