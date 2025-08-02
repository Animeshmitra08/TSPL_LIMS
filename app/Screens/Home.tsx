import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SelectList } from 'react-native-dropdown-select-list';

const HomeScreen = () => {
  const [showPicker, setShowPicker] = useState(false);
  const [supervisor, setSupervisor] = useState('');
  const [sampler, setSampler] = useState('');

  const [formData, setFormData] = useState({
    truckNumber: '',
    samplingAgency: '',
    supervisorName: '',
    bagsCollected: '',
    sealNumbers: [] as { bagno: number; seal: string }[],
    samplingMode: '',
    samplingDateTime: new Date(),
  });

  const truckOptions = [
    { key: '1', value: 'TRK123' },
    { key: '2', value: 'TRK456' },
    { key: '3', value: 'TRK789' },
  ];

  const samplingModes = [
    { key: '1', value: 'Manual' },
    { key: '2', value: 'Automatic' },
  ];

  const updateSupervisorName = (sup: string, sam: string) => {
    const fullName = `${sup},${sam}`;
    setFormData((prev) => ({ ...prev, supervisorName: fullName }));
  };

  const handleBagsChange = (text: string) => {
    const num = parseInt(text);
    if (isNaN(num) || num <= 0) {
      setFormData((prev) => ({
        ...prev,
        bagsCollected: text,
        sealNumbers: [],
      }));
      return;
    }

    const seals = Array.from({ length: num }, (_, i) => ({
      bagno: i + 1,
      seal: '',
    }));

    setFormData((prev) => ({
      ...prev,
      bagsCollected: text,
      sealNumbers: seals,
    }));
  };

  const updateSealAtIndex = (value: string, index: number) => {
    const updated = [...formData.sealNumbers];
    if (updated[index]) {
      updated[index].seal = value;
      setFormData((prev) => ({
        ...prev,
        sealNumbers: updated,
      }));
    }
  };

  const handleSubmit = () => {
    console.log('Form submitted:', JSON.stringify(formData, null, 2));
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text variant="titleLarge" style={styles.title}>Sampling Form</Text>

        <SelectList
          setSelected={(val: string) => setFormData({ ...formData, truckNumber: val })}
          data={truckOptions}
          placeholder="Select Truck Number"
          boxStyles={styles.dropdown}
          dropdownStyles={styles.dropdownList}
          save="value"
          search={false}
        />

        <TextInput
          label="Sampling Agency"
          value={formData.samplingAgency}
          onChangeText={(text) => setFormData({ ...formData, samplingAgency: text })}
          style={styles.input}
          mode="outlined"
        />

        <TextInput
          label="Supervisor Name"
          value={supervisor}
          onChangeText={(text) => {
            setSupervisor(text);
            updateSupervisorName(text, sampler);
          }}
          style={styles.input}
          mode="outlined"
        />

        <TextInput
          label="Sampler Name"
          value={sampler}
          onChangeText={(text) => {
            setSampler(text);
            updateSupervisorName(supervisor, text);
          }}
          style={styles.input}
          mode="outlined"
        />

        <TextInput
          label="Number of Bags Collected"
          value={formData.bagsCollected}
          onChangeText={handleBagsChange}
          keyboardType="numeric"
          style={styles.input}
          mode="outlined"
        />

        {formData.sealNumbers.map((sealObj, index) => (
          <TextInput
            key={index}
            label={`Seal #${sealObj.bagno}`}
            value={sealObj.seal}
            onChangeText={(text) => updateSealAtIndex(text, index)}
            style={styles.input}
            mode="outlined"
          />
        ))}

        <SelectList
          setSelected={(val: string) => setFormData({ ...formData, samplingMode: val })}
          data={samplingModes}
          placeholder="Select Sampling Mode"
          boxStyles={styles.dropdown}
          dropdownStyles={styles.dropdownList}
          save="value"
          search={false}
        />

        <TextInput
          label="Sampling Date & Time"
          value={formData.samplingDateTime.toLocaleString()}
          onFocus={() => setShowPicker(true)}
          style={styles.input}
          mode="outlined"
        />

        {showPicker && (
          <DateTimePicker
            value={formData.samplingDateTime}
            mode="datetime"
            display="default"
            onChange={(event, selectedDate) => {
              setShowPicker(false);
              if (selectedDate) {
                setFormData((prev) => ({ ...prev, samplingDateTime: selectedDate }));
              }
            }}
          />
        )}

        <Button mode="contained" onPress={handleSubmit} style={styles.button}>
          Submit
        </Button>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 12,
  },
  title: {
    marginBottom: 12,
    textAlign: 'center',
  },
  input: {
    marginBottom: 8,
  },
  dropdown: {
    marginBottom: 8,
    borderRadius: 4,
    backgroundColor: 'white',
  },
  dropdownList: {
    zIndex: 1000,
    backgroundColor: 'white',
  },
  button: {
    marginTop: 16,
  },
});

export default HomeScreen;