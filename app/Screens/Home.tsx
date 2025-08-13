import AlertMessage from '@/components/Cards/AlertMessage';
import DateTimeComponent from '@/components/DateTimeSelect';
import { SelectComponentBYFORM } from '@/components/SelectComponent';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View
} from 'react-native';
import {
  Button,
  Text,
  TextInput,
} from 'react-native-paper';
import NoOfTwoBoxComponent, { BoxData } from './NoOfTwoBoxComponent';

dayjs.extend(customParseFormat);

const HomeScreen = () => {
  const [supervisor, setSupervisor] = useState('');
  const [sampler, setSampler] = useState('');
  const [customDateTime, setCustomDateTime] = useState<any>();
  const [boxes, setBoxes] = useState<BoxData[]>([]);

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

  // messages
  const [alertVisible, setAlertVisible] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'info' | 'error' | 'success'>('info');
  // height and width calculate
  const height = useWindowDimensions().height;
  const width = useWindowDimensions().width;
  const isLandScape = width > height;

  const baseurl = process.env.EXPO_PUBLIC_BASE_URL;

  useEffect(()=>{
    const fun = async()=>{
      const res = await fetch(`${baseurl}/Sampling/POWERTYPE/COAL`)
      const data = await res.json();
      console.log(data);      
    } 

    fun();
  },[])

  // Custom handle Close alert visible function
  function handleVisible() {
    setAlertVisible(false);
  }

  const handleSubmit = () => {
    if (Platform.OS === "android") {
      if (!customDateTime) {
        return;
      }
      const cleanedBoxes = boxes.map(({ bagNo, seal }) => ({ bagNo, seal }));
      // setFormData({
      //   ...formData,
      //   sealNumbers : cleanedBoxes
      // })
      setFormData({ ...formData, samplingDateTime: customDateTime, sealNumbers: cleanedBoxes });
      // validate
      if (!formValidaty(formData)) {
        setAlertMessage("Please enter all fields");
        setAlertType('error')
        setAlertVisible(true)
        setTimeout(() => {
          setAlertVisible(false)
        })
        return;
      } else {
        setAlertMessage('Rake Sampling Report submitted');
        setAlertType('success')
        setAlertVisible(true)
        setTimeout(() => {
          setAlertVisible(false)
        })
      }

      console.log(JSON.stringify(formData), "formdata");
      setFormData({
        truckNumber: 'Select Truck Number',
        samplingAgency: '',
        supervisorName: '',
        bagsCollected: '', // change this to array
        sealNumbers: [] as any,
        // [] as { bagno: number; seal: string }[],
        samplingMode: 'Select Sampling Mode',
        samplingDateTime: new Date(),
      });
      setBoxes([])
      setSampler("")
      setSupervisor("")
      setCustomDateTime(undefined)
    }
  };
  const [isTruckVisible, setIsTruckVisible] = useState(false);
  const [isSamplingModeVisible, setIsSamplingModeVisible] = useState(false);

  const screenHeight = Dimensions.get("window").height;
  const screenWidht = Dimensions.get("window").width;


  const handleChange = (field: any, val: any) => {
    setFormData({ ...formData, [field]: val })
  }


  return (
    <KeyboardAvoidingView behavior='padding' keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 100} >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text variant="titleLarge" style={styles.title}>Sampling Form</Text>
          {/* disabled when api integert */}
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
            onChangeText={(text: string) => {
              setFormData({ ...formData, bagsCollected: text })
            }}
            keyboardType='numeric'
            style={styles.input}
            mode='outlined'
            placeholderTextColor={"#000"}
          />
          {
            Number(formData?.bagsCollected) > 100 && <Text style={{
              color: "red",
              marginBottom: 10,
              marginLeft: 2
            }}>bags less than 100</Text>}
          {
            Number(formData?.bagsCollected) < 100 && <NoOfTwoBoxComponent boxes={boxes} setBoxes={setBoxes} number={Number(formData?.bagsCollected) || 0} />
          }

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
          <View style={{
            marginBottom : 2
          }}>

          </View>
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
      </TouchableWithoutFeedback>
      <AlertMessage
        key={alertMessage + alertVisible}
        visible={alertVisible}
        message={alertMessage}
        type={alertType}
        onDismiss={() => setAlertVisible(false)}
        isLandScape={isLandScape}
        handleVisible={handleVisible}
      />
    </KeyboardAvoidingView>

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
    backgroundColor: "transparent",
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


// export const SelectComponent = ({
//   field,
//   formData,
//   handleChange,
//   isVisible,
//   setIsVisible,
//   screenHeight,
//   screenWidth
// }: any) => {
//   return (<View>
//     <Text style={styles.selectLabel}
//       onPress={() => setIsVisible(true)}
//     >
//       {formData[field.name] || `Select field`}
//     </Text>

//     <Modal
//       visible={isVisible}
//       animationType="none"
//       transparent
//     >
//       <TouchableWithoutFeedback>
//         <View style={styles.modalOverlay}>
//           <View
//             style={{
//               height: screenHeight * 0.5,
//               backgroundColor: 'white',
//               borderTopLeftRadius: 20,
//               borderTopRightRadius: 20,
//               paddingHorizontal: 12,
//               paddingVertical: 10,
//               rowGap: 10,
//             }}
//           >
//             <Button
//               style={{ width: screenWidth * 0.95 }}
//               mode="contained-tonal"
//               onPress={() => setIsVisible(false)}
//             >
//               Close
//             </Button>
//             <SelectList
//               setSelected={(val: string) => {
//                 handleChange(field.name, val);
//                 setIsVisible(true);
//               }}
//               onSelect={() => {
//                 setIsVisible(true);
//               }}
//               data={field.options}
//               save="value"
//               boxStyles={{
//                 width: screenWidth * 0.95,
//                 borderWidth: 0,
//                 borderColor: 'transparent',
//                 backgroundColor: '#f1f1f1',
//                 borderRadius: 10,
//               }}
//               inputStyles={{
//                 padding: 2,
//                 fontSize: 16,
//                 color: '#333',
//               }}
//               dropdownStyles={{
//                 borderWidth: 0,
//                 backgroundColor: '#f1f1f1',
//                 elevation: 3,
//                 width: screenWidth * 0.95
//               }}
//               closeicon={
//                 <Ionicons
//                   name="close-circle"
//                   size={20}
//                   color={'#999'}
//                   style={{ marginLeft: 10 }}
//                 />
//               }
//             />
//           </View>
//         </View>
//       </TouchableWithoutFeedback>
//     </Modal>
//   </View>
//   );
// };

export function formValidaty(formData: any): boolean {
  const requiredFields: (keyof typeof formData)[] = [
    "truckNumber", "samplingAgency", "supervisorName", "bagsCollected", "sealNumbers", "samplingMode", "samplingDateTime"
  ]
  if (Number(formData.bagsCollected) === 0 || Number(formData.bagsCollected) > 100) {
    return false;
  }
  for (const field of requiredFields) {
    const value = formData[field];

    if (typeof value === "string" && value.trim() === "") {
      console.log("Missing string field:", field, value);
      return false;
    }

    if (value === undefined || value === null) {
      console.log("Missing required field:", field, value);
      return false;
    }
  }
  return true;
}