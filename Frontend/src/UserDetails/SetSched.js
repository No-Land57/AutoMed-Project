import React, { useState, useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  ScrollView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";

export default function SetSched({ route, navigation }) {
  const [userDetails, setUserDetails] = useState({
    name: 'Unknown',
    age: 'N/A',
    userType: 'N/A'
  });

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await fetch('http://192.168.0.240:5000/userdetails', {
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
        setUserDetails({
          name: data.name,
          age: data.age ? String(data.age) : 'N/A',  // Ensure age is a string or 'N/A'
          userType: data.userType
        });
      } catch (error) {
        console.error('Failed to fetch user details:', error);
      }
    };

    const fetchPrescriptions = async () => {
      try {
        const response = await fetch("http://10.0.2.2:5000/SetSched", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if(response.ok) {
          const data = await response.json();
          const padded = [...data.prescriptions];
          while (padded.length < 3) {
            padded.push({ drug: "", dose: "", time: "", selectedDays: [] });
          }
          setPrescriptions(padded.map((p) => ({
            ...p,
            isTimePickerVisible: false,
            tempTime: new Date(),
          }))
        );
        } else {
          console.error("Failed to load prescriptions:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
    }
  };
    fetchPrescriptions();
    fetchUserDetails();
  }, []);

  const [prescriptions, setPrescriptions] = useState([
    { drug: "", dose: "", time: "", selectedDays: [], isTimePickerVisible: false, tempTime: new Date() },
    { drug: "", dose: "", time: "", selectedDays: [], isTimePickerVisible: false, tempTime: new Date() },
    { drug: "", dose: "", time: "", selectedDays: [], isTimePickerVisible: false, tempTime: new Date() },
  ]);

  const daysOfWeek = ["Sundays", "Mondays", "Tuesdays", "Wednesdays", "Thursdays", "Fridays", "Saturdays"];

  const toggleDaySelection = (index, day) => {
    setPrescriptions((prev) => {
      const selectedDays = prev[index].selectedDays.includes(day)
        ? prev[index].selectedDays.filter((d) => d !== day)
        : [...prev[index].selectedDays, day];
      return prev.map((p, i) => (i === index ? { ...p, selectedDays } : p));
    });
  };

  const handleConfirmTime = (index) => {
    setPrescriptions((prev) => {
      const formattedTime = prev[index].tempTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      return prev.map((p, i) => (i === index ? { ...p, time: formattedTime, isTimePickerVisible: false } : p));
    });
  };

  const handleDispense = async () => {
    for (const { drug, dose, selectedDays, time } of prescriptions) {
      if (!drug || !dose || selectedDays.length === 0 || !time) {
        alert("Please fill out all fields.");
        return;
      }
    }

    try {
      const response = await fetch("http://192.168.0.240:5000/SetSched", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ prescriptions }),
      });

      const data = await response.json();

      if (response.status === 201) {
        alert("Medication has been set!");
    } else {
      alert("message: " + data.message);
    }
  } catch (error) {
      alert("An error occurred. Please try again.");
      console.error(error);
  }
  };

  const getSelectedDaysText = (selectedDays) => {
    const sortedDays = selectedDays.sort((a, b) => daysOfWeek.indexOf(a) - daysOfWeek.indexOf(b));
    return sortedDays.length === daysOfWeek.length ? "Everyday" : sortedDays.join(", ");
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <LinearGradient colors={["#13c2c2", "#6b73ff"]} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.header}>
            <View style={styles.userInfo}>
              <Image source={require("../../assets/profile.png")} style={styles.profileImage} />
              <View>
                <Text style={styles.userName}>{userDetails.name}</Text>
                <Text style={styles.userDetails}>{userDetails.userType}, Age {userDetails.age}</Text>
              </View>
            </View>
          </View>

          {prescriptions.map((prescription, index) => (
            <View key={index} style={styles.card}>
              <Text style={styles.cardTitle}>Prescription {index + 1}</Text>
              <View style={styles.table}>
                <TextInput
                  style={styles.tableCell}
                  placeholder="Drug"
                  placeholderTextColor="#aaa"
                  value={prescription.drug}
                  onChangeText={(text) => setPrescriptions((prev) => prev.map((p, i) => (i === index ? { ...p, drug: text } : p)))}
                />
                <TextInput
                  style={styles.tableCell}
                  placeholder="Dose"
                  placeholderTextColor="#aaa"
                  value={prescription.dose}
                  onChangeText={(text) => setPrescriptions((prev) => prev.map((p, i) => (i === index ? { ...p, dose: text } : p)))}
                />
                <TouchableOpacity
                  style={styles.daySelectionButton}
                  onPress={() => setPrescriptions((prev) => prev.map((p, i) => (i === index ? { ...p, showDaySelection: !p.showDaySelection } : p)))}
                >
                  <Text style={styles.inputText}>
                    {prescription.selectedDays.length > 0 ? getSelectedDaysText(prescription.selectedDays) : "Select Days"}
                  </Text>
                </TouchableOpacity>
                {prescription.showDaySelection && (
                  <View style={styles.daySelection}>
                    {daysOfWeek.map((day) => (
                      <TouchableOpacity
                        key={day}
                        style={[styles.dayButton, prescription.selectedDays.includes(day) && styles.dayButtonSelected]}
                        onPress={() => toggleDaySelection(index, day)}
                      >
                        <Text style={styles.dayButtonText}>{day}</Text>
                      </TouchableOpacity>
                    ))}
                    <TouchableOpacity
                      style={styles.confirmButton}
                      onPress={() => setPrescriptions((prev) => prev.map((p, i) => (i === index ? { ...p, showDaySelection: false } : p)))}
                    >
                      <Text style={styles.confirmButtonText}>Confirm</Text>
                    </TouchableOpacity>
                  </View>
                )}
                <View style={styles.tableRow}>
                  <TouchableOpacity
                    style={styles.timePicker}
                    onPress={() => setPrescriptions((prev) => prev.map((p, i) => (i === index ? { ...p, isTimePickerVisible: true } : p)))}
                  >
                    <Text style={styles.inputText}>{prescription.time || "Set Time"}</Text>
                  </TouchableOpacity>
                </View>
              </View>
              {prescription.isTimePickerVisible && (
                <View>
                  <DateTimePicker
                    value={prescription.tempTime}
                    mode="time"
                    display="spinner"
                    onChange={(event, selectedTime) => {
                      if (event.type === "set" && selectedTime) {
                        setPrescriptions((prev) => prev.map((p, i) => (i === index ? { ...p, tempTime: selectedTime } : p)));
                        handleConfirmTime(index);
                      } else {
                        setPrescriptions((prev) => prev.map((p, i) => (i === index ? { ...p, isTimePickerVisible: false } : p)));
                      }
                    }}
                  />
                  <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={() => handleConfirmTime(index)}
                  >
                    <Text style={styles.confirmButtonText}>Confirm Time</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}

          <TouchableOpacity style={styles.dispenseButton} onPress={handleDispense}>
            <Text style={styles.dispenseButtonText}>Set Schedule!</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.LogoutButton}>
              <Text style={styles.LogoutButtonText}>Logout</Text>
            </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  LogoutButton: {
    backgroundColor: '#ff6f61',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  LogoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 10,
    marginTop: 50,
  },
  userName: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 50,
  },
  userDetails: {
    fontSize: 18,
    color: "#fff",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  table: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 5,
  },
  tableRow: {
    flexDirection: "row",
  },
  timePicker: {
    flex: 1,
    padding: 15,
    backgroundColor: "#d3d3d3",
    borderRadius: 5,
    alignItems: "center",
  },
  daySelectionButton: {
    backgroundColor: "#d3d3d3",
    padding: 15,
    borderBottomWidth: 1,
    borderColor: "#000",
  },
  inputText: {
    textAlign: "center",
    fontSize: 16,
    color: "#333",
  },
  tableCell: {
    padding: 15,
    borderBottomWidth: 1,
    borderColor: "#000",
    fontSize: 16,
    textAlign: "center",
  },
  dispenseButton: {
    backgroundColor: "#3c48b0",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  dispenseButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  daySelection: {
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  dayButton: {
    padding: 5,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    margin: 5,
  },
  dayButtonSelected: {
    backgroundColor: "#ccc",
    borderColor: "#007bff",
  },
  dayButtonText: {
    color: "#000",
  },
  confirmButton: {
    backgroundColor: "#d3d3d3",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  confirmButtonText: {
    color: "#000",
    fontSize: 16,
  },
});