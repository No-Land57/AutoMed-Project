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

  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const [prescriptions, setPrescriptions] = useState([
    { drug: "", dose: "", time: "", selectedDays: [], isTimePickerVisible: false, tempTime: new Date() },
    { drug: "", dose: "", time: "", selectedDays: [], isTimePickerVisible: false, tempTime: new Date() },
    { drug: "", dose: "", time: "", selectedDays: [], isTimePickerVisible: false, tempTime: new Date() },
  ]);

  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

useEffect(() => {
  const fetchUserDetails = async () => {
    try {
      const response = await fetch('http://192.168.0.246:5000/userdetails', {
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
        age: data.age ? String(data.age) : 'N/A',
        userType: data.userType
      });

      // After successful user details fetch, check for prescriptions
      fetchPrescriptions();  // This should ideally be based on an actual condition or flag
    } catch (error) {
      console.error('Failed to fetch user details:', error);
    }
  };

  fetchUserDetails();
}, []);

const fetchPrescriptions = async () => {
  try {
    const response = await fetch("http://192.168.0.246:5000/GetSched", {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const prescriptionsData = await response.json();

      // Initialize empty prescriptions
      const defaultPrescription = () => ({
        drug: "",
        dose: "",
        time: "",
        selectedDays: [],
        isTimePickerVisible: false,
        tempTime: new Date(),
      });

      // Rebuild array of length 3, filling in gaps by slot
      const paddedPrescriptions = [defaultPrescription(), defaultPrescription(), defaultPrescription()];
      prescriptionsData.forEach((pres) => {
        const slot = pres.slot;
        if (slot >= 0 && slot < 3) {
          paddedPrescriptions[slot] = {
            ...pres,
            dose: pres.dose !== null ? String(pres.dose) : "",
            isTimePickerVisible: false,
            tempTime: new Date(pres.time),
          };
        }
      });

      setPrescriptions(paddedPrescriptions);
    }
  } catch (error) {
    console.error("Error fetching prescriptions:", error);
  }
};


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
  // Check if all prescriptions are empty
  const allEmpty = prescriptions.every(({ drug, dose, selectedDays, time }) => 
    !drug && !dose && selectedDays.length === 0 && !time
  );

  if (allEmpty) {
    alert("Please fill out at least one prescription.");
    return;
  }

  // Validate each filled prescription
  for (const { drug, dose, selectedDays, time } of prescriptions) {
    if ((drug || dose || selectedDays.length > 0 || time) && (!drug || !dose || selectedDays.length === 0 || !time)) {
      alert("Please fill out all fields for each filled prescription.");
      return;
    }
  }

    try {
      const response = await fetch("http://192.168.0.246:5000/SetSched", {
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
      alert("Message: " + data.Message);
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

            {/* Dropdown Button */}
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setIsDropdownVisible(!isDropdownVisible)}
            >
              <Text style={styles.dropdownButtonText}>Options</Text>
            </TouchableOpacity>

            {/* Dropdown Menu */}
            {isDropdownVisible && (
              <View style={styles.dropdownMenu}>
                <TouchableOpacity
      style={styles.dropdownMenuItem}
      onPress={() => {
        setIsDropdownVisible(false); // Close the dropdown
        navigation.navigate('UserDetailsScreen'); // navigate to UserDetailsScreen
      }}
    >
                  <Text style={styles.dropdownMenuItemText}>Update User Details and Passcode</Text>
                </TouchableOpacity>
              
                <TouchableOpacity
      style={styles.dropdownMenuItem}
      onPress={() => {
        setIsDropdownVisible(false); // Close the dropdown
        navigation.navigate('UnlockWithPasscode'); // navigate to UnlockWithPin
      }}
                >
                  <Text style={styles.dropdownMenuItemText}>Unlock Storage with Passcode</Text>
                </TouchableOpacity>
                <TouchableOpacity
      style={styles.dropdownMenuItem}
      onPress={() => {
        setIsDropdownVisible(false); // Close the dropdown
        navigation.navigate('UnlockWithFaceID'); // navigate to UnlockWithFace
      }}
                >
                  <Text style={styles.dropdownMenuItemText}>Unlock Storage with FaceID</Text>
                </TouchableOpacity>



                     </View>
            )}
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
                  keyboardType = "numeric"
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
                    value={new Date(2000, 0, 1, prescription.tempTime.getHours(), prescription.tempTime.getMinutes())}
                    mode="time"
                    display="spinner"
                    onChange={(event, selectedTime) => {
                      if (event.type === "set" && selectedTime) {
                        setPrescriptions((prev) => prev.map((p, i) => (i === index ? { ...p, tempTime: selectedTime } : p)));
                        // Do NOT call handleConfirmTime yet! Let the user press the Confirm button
                      } else if (event.type === "dismissed") {
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
                  <TouchableOpacity
      style={styles.clearButton}
      onPress={() =>
        setPrescriptions((prev) =>
          prev.map((p, i) =>
            i === index
              ? { drug: "", dose: "", time: "", selectedDays: [], isTimePickerVisible: false, tempTime: new Date() }
              : p
          )
        )
      }
    >
      <Text style={styles.clearButtonText}>Clear</Text>
    </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity style={styles.dispenseButton} onPress={handleDispense}>
            <Text style={styles.dispenseButtonText}>Set Schedule!</Text>
          </TouchableOpacity>

          
          <TouchableOpacity onPress={() => navigation.replace('Login')} style={styles.LogoutButton}>
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
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 10,
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
  dropdownButton: {
    position: "absolute",
    top: 55, // Adjust the vertical position
    right: 20, // Align to the right
    backgroundColor: "#fff",
    padding: 8, // Reduce padding to make it smaller
    borderRadius: 5,
    elevation: 3, // Add a slight shadow for better visibility
  },
  dropdownButtonText: {
    color: "#333",
    fontSize: 14, // Reduce font size
    fontWeight: "bold",
  },
  dropdownMenu: {
    position: "absolute",
    top: 95, // Adjust dropdown position relative to the button
    right: 20, // Align to the right
    backgroundColor: "#fff",
    borderRadius: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    zIndex: 1000,
  },
  dropdownMenuItem: {
    padding: 8, // Reduce padding for smaller items
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  dropdownMenuItemText: {
    fontSize: 14, // Reduce font size
    color: "#333",
  },
  clearButton: {
    backgroundColor: "crimson",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: "center",
  },
  clearButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});