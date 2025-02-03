import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, TextInput } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { LinearGradient } from 'expo-linear-gradient';

export default function SetSched({ route, navigation }) {
  // Safely retrieve user data from UserDetailsScreen
  const { name = 'Unknown', age = 'N/A', userType = 'N/A' } = route?.params || {};

  // State for prescription details
  const [drug, setDrug] = useState('');
  const [dose, setDose] = useState('');
  const [time, setTime] = useState(''); // Store formatted time
  const [selectedDays, setSelectedDays] = useState([]); // Store selected days
  const [showDaySelection, setShowDaySelection] = useState(false); // Show/hide day selection
  const [isTimePickerVisible, setTimePickerVisible] = useState(false); // Show/hide time picker

  const daysOfWeek = ['Every Sun',
     'Every Mon', 
     'Every Tue', 
     'Every Wed', 
     'Every Thur', 
     'Every Fri', 
     'Every Sat'];

  const toggleDaySelection = (day) => {
    setSelectedDays((prevDays) =>
      prevDays.includes(day) ? prevDays.filter((d) => d !== day) : [...prevDays, day]
    );
  };

  // Function to handle time selection
  const handleConfirmTime = (selectedTime) => {
    const formattedTime = selectedTime.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true, // AM/PM format
    });
    setTime(formattedTime);
    setTimePickerVisible(false);
  };

  // Handle medication dispensing
  const handleDispense = () => {
    if (!drug || !dose || !selectedDays.length === 0 || !time) {
      alert('Please fill out all fields.');
      return;
    }
    alert('Medication Dispensed!');
    navigation.goBack(); // Navigate back after dispensing
  };

  const getSelectedDaysText = () => {
    const sortedDays = selectedDays.sort((a, b) => daysOfWeek.indexOf(a) - daysOfWeek.indexOf(b));
    return sortedDays.length === daysOfWeek.length ? 'Everyday' : sortedDays.join(', ');
  };

  const handleConfirmDays = () => {
    setShowDaySelection(false);
  };

  return (
    <LinearGradient colors={['#13c2c2', '#6b73ff']} style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>{'<'} Back</Text>
        </TouchableOpacity>
        <View style={styles.userInfo}>
          <Image source={require('../assets/profile.png')} style={styles.profileImage} />
          <View>
            <Text style={styles.userName}>{name}</Text>
            <Text style={styles.userDetails}>
              {userType}, {age} years old
            </Text>
            <Text style={styles.userStatus}>Normal</Text>
          </View>
        </View>
      </View>

      {/* Prescription Section */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Prescription</Text>
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
              {selectedDays.length > 0 ? getSelectedDaysText() : 'Select Days'}
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
                  onPress={() => toggleDaySelection(day)}
                >
                  <Text style={styles.dayButtonText}>{day}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmDays}>
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Time Picker */}
          <View style={styles.tableRow}>
            <TouchableOpacity style={styles.timePicker} onPress={() => setTimePickerVisible(true)}>
              <Text style={styles.inputText}>{time || 'Set Time'}</Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* Time Picker Modal */}
        <DateTimePickerModal
          isVisible={isTimePickerVisible}
          mode="time"
          is24Hour={false} // Uses AM/PM format
          onConfirm={handleConfirmTime}
          onCancel={() => setTimePickerVisible(false)}
        />
      </View>

      {/* Dispense Button */}
      <TouchableOpacity style={styles.dispenseButton} onPress={handleDispense}>
        <Text style={styles.dispenseButtonText}>Dispense</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    marginRight: 10,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 50,
  },
  userDetails: {
    fontSize: 18,
    color: '#fff',
  },
  userStatus: {
    fontSize: 18,
    color: '#d3d3d3',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  table: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 5,
  },
  tableRow: {
    flexDirection: 'row',
  },
  timePicker: {
    flex: 1,
    padding: 15,
    backgroundColor: '#d3d3d3', // Light gray to indicate it's clickable
    borderRadius: 5,
    alignItems: 'center',
  },
  daySelectionButton: {
    backgroundColor: '#d3d3d3',
    padding: 15,
    borderBottomWidth: 1,
    borderColor: '#000',
  },
  inputText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#333',
  },
  tableCell: {
    padding: 15,
    borderBottomWidth: 1,
    borderColor: '#000',
    fontSize: 16,
    textAlign: 'center',
  },

  dispenseButton: {
    backgroundColor: '#5a67d8',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  dispenseButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  daySelection: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },

  confirmButton: {
    backgroundColor: '#00cdff',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
});
