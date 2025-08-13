import DateTimeComponent from '@/components/DateTimeSelect';
import { SelectComponentBYFORM } from '@/components/SelectComponent';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import React, { useState } from 'react';
import {
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { SelectList } from 'react-native-dropdown-select-list';
import {
  Button,
  Text,
  TextInput,
} from 'react-native-paper';
import NoOfTwoBoxComponent from './NoOfTwoBoxComponent';

dayjs.extend(customParseFormat);

const HomeScreen = () => {
  const [supervisor, setSupervisor] = useState('');
  const [sampler, setSampler] = useState('');
  const [customDateTime, setCustomDateTime] = useState<any>();

  const [formData, setFormData] = useState({
    truckNumber: 'Select Truck Number',
    samplingAgency: '',
    supervisorName: '',
    bagsCollected: '', // change this to array
    sealNumbers: [] as any, 
    // [] as { bagno: number; seal: string }[],
    samplingMode: 'Select Sampling Mode',
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
  
  const [boxes, setBoxes] = useState([]);
  const handleSubmit = () => {
    if (Platform.OS === "android") {
      if (!customDateTime) {
        return;
      }
      setFormData({
        ...formData,
        sealNumbers : boxes
      })
      setFormData({ ...formData, samplingDateTime: customDateTime });
      console.log(JSON.stringify(formData), "formdata");

    }
  };
  const [isTruckVisible, setIsTruckVisible] = useState(false);
  const [isSamplingModeVisible, setIsSamplingModeVisible] = useState(false);

  const screenHeight = Dimensions.get("window").height;
  const screenWidht = Dimensions.get("window").width;

  const bagsCollected = (boxs: any) => {
    setBoxes(boxs);
  console.log(boxes);
  
  }

  const handleChange = (field: any, val: any) => {
    setFormData({ ...formData, [field]: val })
  }

  return (
    <KeyboardAvoidingView behavior='padding' keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 100} >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text variant="titleLarge" style={styles.title}>Sampling Form</Text>
          <SelectComponentBYFORM
            field={{
              label: "Select Truck Number",
              name: "truckNumber",
              options: truckOptions
            }}
            formData={formData}
            handleChange={handleChange}
            isVisible={isTruckVisible}
            setIsVisible={setIsTruckVisible}
            screenHeight={screenHeight}
            screenWidth={screenWidht}
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
            placeholderTextColor={"#000"}
          />
          <NoOfTwoBoxComponent number={Number(formData?.bagsCollected) || 0} bagsCollected={bagsCollected} />
          {/* {formData.sealNumbers.map((sealObj, index) => {
            console.log(sealObj);
            
            return(
            <TextInput
              key={index}
              label={`Seal #${sealObj.bagno}`}
              value={sealObj.seal}
              onChangeText={(text) => updateSealAtIndex(text, index)}
              style={styles.input}
              mode="outlined"
            />
          )})} */}
          <SelectComponentBYFORM
            field={{
              label: "Select Sampling Mode",
              name: "samplingMode",
              options: samplingModes
            }}
            formData={formData}
            handleChange={handleChange}
            isVisible={isSamplingModeVisible}
            setIsVisible={setIsSamplingModeVisible}
            screenHeight={screenHeight}
            screenWidth={screenWidht}
          />
          <DateTimeComponent
            label={"Sampling Date & Time"}
            mode="outlined"
            style={styles.input}
            date={customDateTime}
            setDate={setCustomDateTime}
          />
          <Button mode="contained" onPress={handleSubmit} style={styles.button}>
            Submit
          </Button>
        </ScrollView>
      </TouchableWithoutFeedback></KeyboardAvoidingView>

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
    backgroundColor : "transparent",
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
  label: {
    fontSize: 16,
    marginTop: 20,
    marginBottom: 6,
    fontWeight: '600',
  },
  selectLabel: {
    height: 50,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'black',
    paddingVertical: 13,
    paddingHorizontal: 13,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
});

export default HomeScreen;


export const SelectComponent = ({
  field,
  formData,
  handleChange,
  isVisible,
  setIsVisible,
  screenHeight,
  screenWidth
}: any) => {
  return (<View>
    <Text style={styles.selectLabel}
      onPress={() => setIsVisible(true)}
    >
      {formData[field.name] || `Select field`}
    </Text>

    <Modal
      visible={isVisible}
      animationType="slide"
      transparent
    >
      <TouchableWithoutFeedback>
        <View style={styles.modalOverlay}>
          <View
            style={{
              height: screenHeight * 0.5,
              backgroundColor: 'white',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              paddingHorizontal: 12,
              paddingVertical: 10,
              rowGap: 10,
            }}
          >
            <Button
              style={{ width: screenWidth * 0.95 }}
              mode="contained-tonal"
              onPress={() => setIsVisible(false)}
            >
              Close
            </Button>
            <SelectList
              setSelected={(val: string) => {
                handleChange(field.name, val);
                setIsVisible(true);
              }}
              onSelect={() => {
                setIsVisible(true);
              }}
              data={field.options}
              save="value"
              boxStyles={{
                width: screenWidth * 0.95,
                borderWidth: 0,
                borderColor: 'transparent',
                backgroundColor: '#f1f1f1',
                borderRadius: 10,
              }}
              inputStyles={{
                padding: 2,
                fontSize: 16,
                color: '#333',
              }}
              dropdownStyles={{
                borderWidth: 0,
                backgroundColor: '#f1f1f1',
                elevation: 3,
                width: screenWidth * 0.95
              }}
              closeicon={
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={'#999'}
                  style={{ marginLeft: 10 }}
                />
              }
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  </View>
  );
};