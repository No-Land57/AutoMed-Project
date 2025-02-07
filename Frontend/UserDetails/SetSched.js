import React, { useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  ScrollView,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";

export default function SetSched({ route, navigation }) {
  // Safely retrieve user data from UserDetailsScreen
  const {
    name = "Unknown",
    age = "N/A",
    userType = "N/A",
  } = route?.params || {};

  // State for prescription details
  const [showDaySelection, setShowDaySelection] = useState(false); // Show/hide day selection

  const [drug, setDrug] = useState("");
  const [dose, setDose] = useState("");
  const [time, setTime] = useState(""); // Store formatted time
  const [selectedDays, setSelectedDays] = useState([]); // Store selected days
  const [isTimePickerVisible, setTimePickerVisible] = useState(false); // Show/hide time picker
  const [tempTime, setTempTime] = useState(new Date()); // Temporary time for confirmation

  const [drug2, setDrug2] = useState("");
  const [dose2, setDose2] = useState("");
  const [time2, setTime2] = useState(""); // Store formatted time
  const [selectedDays2, setSelectedDays2] = useState([]); // Store selected days
  const [isTimePickerVisible2, setTimePickerVisible2] = useState(false); // Show/hide time picker
  const [tempTime2, setTempTime2] = useState(new Date()); // Temporary time for confirmation

  const [drug3, setDrug3] = useState("");
  const [dose3, setDose3] = useState("");
  const [time3, setTime3] = useState(""); // Store formatted time
  const [selectedDays3, setSelectedDays3] = useState([]); // Store selected days
  const [isTimePickerVisible3, setTimePickerVisible3] = useState(false); // Show/hide time picker
  const [tempTime3, setTempTime3] = useState(new Date()); // Temporary time for confirmation

  const daysOfWeek = [
    "Sundays",
    "Mondays",
    "Tuesdays",
    "Wednesdays",
    "Thursdays",
    "Fridays",
    "Saturdays",
  ];

  // Function to toggle day selection
  const toggleDaySelection = (day, setSelectedDays) => {
    setSelectedDays((prevDays) =>
      prevDays.includes(day)
        ? prevDays.filter((d) => d !== day)
        : [...prevDays, day]
    );
  };

  // Usage for setSelectedDays
  const handleToggleDaySelection1 = (day) =>
    toggleDaySelection(day, setSelectedDays);

  // Usage for setSelectedDays2
  const handleToggleDaySelection2 = (day) =>
    toggleDaySelection(day, setSelectedDays2);

  // Usage for setSelectedDays3
  const handleToggleDaySelection3 = (day) =>
    toggleDaySelection(day, setSelectedDays3);

  // Function to handle time selection
  const handleConfirmTime = (setTime, setTimePickerVisible, tempTime) => {
    const formattedTime = tempTime.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true, // AM/PM format
    });
    setTime(formattedTime);
    setTimePickerVisible(false);
  };

  // Handle medication dispensing
  const handleDispense = () => {
    if (!drug || !dose || selectedDays.length === 0 || !time) {
      alert("Please fill out all fields.");
      return;
    }
    if (!drug2 || !dose2 || selectedDays2.length === 0 || !time2) {
      alert("Please fill out all fields.");
      return;
    }
    if (!drug3 || !dose3 || selectedDays3.length === 0 || !time3) {
      alert("Please fill out all fields.");
      return;
    }
    alert("Medication Dispensed!");
    navigation.goBack(); // Navigate back after dispensing
  };

  // Function to get selected days text
  function getSelectedDaysText() {
    const sortedDays = selectedDays.sort(
      (a, b) => daysOfWeek.indexOf(a) - daysOfWeek.indexOf(b)
    );
    return sortedDays.length === daysOfWeek.length
      ? "Everyday"
      : sortedDays.join(", ");
  }

  function getSelectedDaysText2() {
    const sortedDays2 = selectedDays2.sort(
      (a, b) => daysOfWeek.indexOf(a) - daysOfWeek.indexOf(b)
    );
    return sortedDays2.length === daysOfWeek.length
      ? "Everyday"
      : sortedDays2.join(", ");
  }

  function getSelectedDaysText3() {
    const sortedDays3 = selectedDays3.sort(
      (a, b) => daysOfWeek.indexOf(a) - daysOfWeek.indexOf(b)
    );
    return sortedDays3.length === daysOfWeek.length
      ? "Everyday"
      : sortedDays3.join(", ");
  }

  // Function to confirm day selection
  const handleConfirmDays = () => {
    setShowDaySelection(false);
  };

  // JSX code for rendering the component
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <LinearGradient colors={["#13c2c2", "#6b73ff"]} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          {/* Header Section */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>{"<"} Back</Text>
            </TouchableOpacity>
            <View style={styles.userInfo}>
              <Image
                source={require("../assets/profile.png")}
                style={styles.profileImage}
              />
              <View>
                <Text style={styles.userName}>{name}</Text>
                <Text style={styles.userDetails}>
                  {userType}, Age {age}
                </Text>
                <Text style={styles.userStatus}>Normal</Text>
              </View>
            </View>
          </View>

          {/* Prescription Section 1 */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Prescription 1</Text>
            <View style={styles.table}>
              {/* Drug Input */}
              <TextInput
                style={styles.tableCell}
                placeholder="Drug"
                placeholderTextColor="#aaa"
                value={drug}
                onChangeText={setDrug}
              />
              {/* Dose Input */}
              <TextInput
                style={styles.tableCell}
                placeholder="Dose"
                placeholderTextColor="#aaa"
                value={dose}
                onChangeText={setDose}
              />
              {/* Day Selection */}
              <TouchableOpacity
                style={styles.daySelectionButton}
                onPress={() => setShowDaySelection(!showDaySelection)}
              >
                <Text style={styles.inputText}>
                  {selectedDays.length > 0
                    ? getSelectedDaysText()
                    : "Select Days"}
                </Text>
              </TouchableOpacity>
              {showDaySelection && (
                <View style={styles.daySelection}>
                  {daysOfWeek.map((day) => (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.dayButton,
                        selectedDays.includes(day) && styles.dayButtonSelected,
                      ]}
                      onPress={() => handleToggleDaySelection1(day)}
                    >
                      <Text style={styles.dayButtonText}>{day}</Text>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={handleConfirmDays}
                  >
                    <Text style={styles.confirmButtonText}>Confirm</Text>
                  </TouchableOpacity>
                </View>
              )}
              {/* Time Picker */}
              <View style={styles.tableRow}>
                <TouchableOpacity
                  style={styles.timePicker}
                  onPress={() => setTimePickerVisible(true)}
                >
                  <Text style={styles.inputText}>{time || "Set Time"}</Text>
                </TouchableOpacity>
              </View>
            </View>
            {/* Time Picker Modal */}
            {isTimePickerVisible && (
              <View>
                <DateTimePicker
                  value={tempTime}
                  mode="time"
                  display="spinner"
                  onChange={(event, selectedTime) => {
                    if (event.type === "set" && selectedTime) {
                      setTempTime(selectedTime);
                      setTimePickerVisible(false);
                      handleConfirmTime(
                        setTime,
                        setTimePickerVisible,
                        selectedTime
                      );
                    } else {
                      setTimePickerVisible(false);
                    }
                  }}
                />
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={() =>
                    handleConfirmTime(setTime, setTimePickerVisible, tempTime)
                  }
                >
                  <Text style={styles.confirmButtonText}>Confirm Time</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>



          {/* Prescription Section 2 */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Prescription 2</Text>
            <View style={styles.table}>
              {/* Drug Input */}
              <TextInput
                style={styles.tableCell}
                placeholder="Drug"
                placeholderTextColor="#aaa"
                value={drug2}
                onChangeText={setDrug2}
              />
              {/* Dose Input */}
              <TextInput
                style={styles.tableCell}
                placeholder="Dose"
                placeholderTextColor="#aaa"
                value={dose2}
                onChangeText={setDose2}
              />
              {/* Day Selection */}
              <TouchableOpacity
                style={styles.daySelectionButton}
                onPress={() => setShowDaySelection(!showDaySelection)}
              >
                <Text style={styles.inputText}>
                  {selectedDays2.length > 0
                    ? getSelectedDaysText2()
                    : "Select Days"}
                </Text>
              </TouchableOpacity>
              {showDaySelection && (
                <View style={styles.daySelection}>
                  {daysOfWeek.map((day) => (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.dayButton,
                        selectedDays2.includes(day) && styles.dayButtonSelected,
                      ]}
                      onPress={() => handleToggleDaySelection2(day)}
                    >
                      <Text style={styles.dayButtonText}>{day}</Text>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={handleConfirmDays}
                  >
                    <Text style={styles.confirmButtonText}>Confirm</Text>
                  </TouchableOpacity>
                </View>
              )}
              {/* Time Picker */}
              <View style={styles.tableRow}>
                <TouchableOpacity
                  style={styles.timePicker}
                  onPress={() => setTimePickerVisible2(true)}
                >
                  <Text style={styles.inputText}>{time2 || "Set Time"}</Text>
                </TouchableOpacity>
              </View>
            </View>
            {/* Time Picker Modal */}
            {isTimePickerVisible2 && (
              <View>
                <DateTimePicker
                  value={tempTime2}
                  mode="time"
                  display="spinner"
                  onChange={(event, selectedTime) => {
                    if (event.type === "set" && selectedTime) {
                      setTempTime2(selectedTime);
                      setTimePickerVisible2(false);
                      handleConfirmTime(
                        setTime2,
                        setTimePickerVisible2,
                        selectedTime
                      );
                    } else {
                      setTimePickerVisible2(false);
                    }
                  }}
                />
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={() =>
                    handleConfirmTime(
                      setTime2,
                      setTimePickerVisible2,
                      tempTime2
                    )
                  }
                >
                  <Text style={styles.confirmButtonText}>Confirm Time</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>



          {/* Prescription Section 3 */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Prescription 3</Text>
            <View style={styles.table}>
              {/* Drug Input */}
              <TextInput
                style={styles.tableCell}
                placeholder="Drug"
                placeholderTextColor="#aaa"
                value={drug3}
                onChangeText={setDrug3}
              />
              {/* Dose Input */}
              <TextInput
                style={styles.tableCell}
                placeholder="Dose"
                placeholderTextColor="#aaa"
                value={dose3}
                onChangeText={setDose3}
              />
              {/* Day Selection */}
              <TouchableOpacity
                style={styles.daySelectionButton}
                onPress={() => setShowDaySelection(!showDaySelection)}
              >
                <Text style={styles.inputText}>
                  {selectedDays3.length > 0
                    ? getSelectedDaysText3()
                    : "Select Days"}
                </Text>
              </TouchableOpacity>
              {showDaySelection && (
                <View style={styles.daySelection}>
                  {daysOfWeek.map((day) => (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.dayButton,
                        selectedDays3.includes(day) && styles.dayButtonSelected,
                      ]}
                      onPress={() => handleToggleDaySelection3(day)}
                    >
                      <Text style={styles.dayButtonText}>{day}</Text>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={handleConfirmDays}
                  >
                    <Text style={styles.confirmButtonText}>Confirm</Text>
                  </TouchableOpacity>
                </View>
              )}
              {/* Time Picker */}
              <View style={styles.tableRow}>
                <TouchableOpacity
                  style={styles.timePicker}
                  onPress={() => setTimePickerVisible3(true)}
                >
                  <Text style={styles.inputText}>{time3 || "Set Time"}</Text>
                </TouchableOpacity>
              </View>
            </View>
            {/* Time Picker Modal */}
            {isTimePickerVisible3 && (
              <View>
                <DateTimePicker
                  value={tempTime3}
                  mode="time"
                  display="spinner"
                  onChange={(event, selectedTime) => {
                    if (event.type === "set" && selectedTime) {
                      setTempTime3(selectedTime);
                      setTimePickerVisible3(false);
                      handleConfirmTime(
                        setTime3,
                        setTimePickerVisible3,
                        selectedTime
                      );
                    } else {
                      setTimePickerVisible3(false);
                    }
                  }}
                />
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={() =>
                    handleConfirmTime(
                      setTime3,
                      setTimePickerVisible3,
                      tempTime3
                    )
                  }
                >
                  <Text style={styles.confirmButtonText}>Confirm Time</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Dispense Button */}
          <TouchableOpacity
            style={styles.dispenseButton}
            onPress={handleDispense}
          >
            <Text style={styles.dispenseButtonText}>Dispense</Text>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    </GestureHandlerRootView>
  );
}

// Styles
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
  backButton: {
    marginRight: 10,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 18,
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
  userStatus: {
    fontSize: 18,
    color: "#d3d3d3",
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
    backgroundColor: "#d3d3d3", // Light gray to indicate it's clickable
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
    backgroundColor: "#5a67d8",
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
