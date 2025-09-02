import AlertMessage from '@/components/Cards/AlertMessage';
import DateTimeComponent from '@/components/DateTimeSelect';
import { SelectComponentBYFORM } from '@/components/SelectComponent';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import {
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View
} from 'react-native';
import { SelectList } from 'react-native-dropdown-select-list';
import {
  Button,
  Card,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import NoOfTwoBoxComponent, { BoxData } from './NoOfTwoBoxComponent';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '@/context/AuthContext';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

dayjs.extend(customParseFormat);

type RegNoType = { regno: string };

const biomassDefault = {
  oP_TYPE: "G",
  poweR_TYPE: "BIOMASS",
  tCoalSampling: [],
  tBioSampling: [],
  tCoalBioBags: [],
  tRakeNo: [],
  tRegNo: [] as RegNoType[],
};

const HomeScreen = () => {
  const [supervisor, setSupervisor] = useState('');
  const [sampler, setSampler] = useState('');
  const [boxes, setBoxes] = useState<BoxData[]>([]);

  const [formData, setFormData] = useState({
    truckNumber: 'Select Truck Number',
    samplingAgency: '',
    supervisorName: '',
    bagsCollected: '',
    sealNumbers: [] as any,
    samplingMode: 'Select Sampling Mode',
    samplingDateTime: null as Date | null,
  });
  const [biomassData, setBiomassData] = useState<typeof biomassDefault>(biomassDefault);
  const [loadingTrucks, setLoadingTrucks] = useState(false);
  const [isUpdateMode, setIsUpdateMode] = useState(false);

  const baseurl = process.env.EXPO_PUBLIC_BASE_URL;

  const { user } = useAuth();

  const handleOpenTruckDropdown = async () => {
    if (!biomassData?.tRegNo || biomassData.tRegNo.length === 0) {
      setLoadingTrucks(true);
      try {
        const { data } = await axios.get(
          `${baseurl}/Sampling/POWERTYPE/BIOMASS`
        );

        setBiomassData((prev) => ({
          ...prev,
          tCoalSampling: data?.tCoalSampling ?? [],
          tBioSampling: data?.tBioSampling ?? [],
          tCoalBioBags: data?.tCoalBioBags ?? [],
          tRakeNo: data?.tRakeNo ?? [],
          tRegNo: data?.tRegNo ?? [],
          ...data,
        }));
      } catch (err) {
        console.error('Failed to fetch truck data', err);
      } finally {
        setLoadingTrucks(false);
      }
    }
  };

  const fetchBiomassData = async (truckNo: string) => {
    try {
      const res = await axios.get(
        `${baseurl}/Sampling/Filter/POWERTYPE/BIOMASS?TruckNo=${truckNo}`
      );

      const response = res.data;

      if (response?.tBioSampling?.length > 0) {
        const sampling = response.tBioSampling[0];
        const bags = response.tCoalBioBags || [];

        setFormData({
          truckNumber: sampling.trucK_NO,
          samplingAgency: sampling.samplE_AGENCY || "",
          supervisorName: sampling.supervisor || "",
          bagsCollected: String(bags.length || sampling.nO_OF_BAGS_COL || ""),
          sealNumbers: bags.map((b: any) => ({
            bagno: b.baG_NO,
            seal: b.seaL_NO,
          })),
          samplingMode: sampling.samplinG_MODE || "Select Sampling Mode",
          samplingDateTime: dayjs(
            `${sampling.samplinG_DT}${sampling.samplinG_TM}`,
            "YYYYMMDDHHmmss"
          ).toDate(),
        });

        setSupervisor(sampling.supervisor || "");
        setSampler(sampling.sampler || "");
        setBoxes(
          bags.map((b: any) => ({
            bagNo: b.baG_NO,
            seal: b.seaL_NO,
          }))
        );

        setAlertMessage("Existing data loaded for this Coal Sampling");
        setAlertType("info");
        setAlertVisible(true);
        setTimeout(() => setAlertVisible(false), 3000);
        
        setIsUpdateMode(true);
      } else {
        // reset form for new entry
        setFormData({
          truckNumber: truckNo,
          samplingAgency: "",
          supervisorName: "",
          bagsCollected: "",
          sealNumbers: [],
          samplingMode: "Select Sampling Mode",
          samplingDateTime: null,
        });

        setSupervisor("");
        setSampler("");
        setBoxes([]);
        setIsUpdateMode(false);
      }
    } catch (err) {
      console.error("Error fetching biomass data:", err);
      setFormData({
        truckNumber: truckNo,
        samplingAgency: "",
        supervisorName: "",
        bagsCollected: "",
        sealNumbers: [],
        samplingMode: "Select Sampling Mode",
        samplingDateTime: null,
      });

      setAlertMessage((err as any)?.message || "Failed to fetch data for this truck");
      setAlertType("error");
      setAlertVisible(true);
      setTimeout(() => setAlertVisible(false), 3000);

      setSupervisor("");
      setSampler("");
      setBoxes([]);
      setIsUpdateMode(false);
    }
  };

  const truckOptions = (biomassData?.tRegNo ?? []).map((item, index) => ({
    key: String(index + 1),
    value: item.regno,
  }));

  const handleChange = (field: any, val: any) => {
    if (field === "truckNumber" && val && val !== "Select Truck Number") {
      // ✅ reset state before fetching new truck data
      setFormData({
        truckNumber: val,
        samplingAgency: "",
        supervisorName: "",
        bagsCollected: "",
        sealNumbers: [],
        samplingMode: "Select Sampling Mode",
        samplingDateTime: null,
      });
      setSupervisor("");
      setSampler("");
      setBoxes([]);

      fetchBiomassData(val);
    } else {
      setFormData({ ...formData, [field]: val });
    }
  };

  const samplingModes = [
    { key: '1', value: 'AUTO' },
    { key: '2', value: 'MANUAL' },
  ];

  const updateSupervisorName = (sup: string, sam: string) => {
    const fullName = `${sup},${sam}`;
    setFormData((prev) => ({ ...prev, supervisorName: fullName }));
  };

  // messages
  const [alertVisible, setAlertVisible] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'info' | 'error' | 'success'>('info');

  // height and width calculate
  const height = useWindowDimensions().height;
  const width = useWindowDimensions().width;
  const isLandScape = width > height;

  function handleVisible() {
    setAlertVisible(false);
  }

  function formatToSAPDateTime(date: Date) {
    const pad = (n: number) => n.toString().padStart(2, "0");
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());
    return {
      planT_ARV_DATE: `${year}${month}${day}`, 
      planT_ARV_TIME: `${hours}${minutes}${seconds}`
    };
  };

  const getSAPDateTime = (date?: Date) => {
    if (!date) return { date: "", time: "" };
    const { planT_ARV_DATE, planT_ARV_TIME } = formatToSAPDateTime(date);
    return { date: planT_ARV_DATE, time: planT_ARV_TIME };
  };

  const SapSampleDateTime = getSAPDateTime(formData.samplingDateTime ?? undefined);

  useFocusEffect(
    useCallback(() => {
      setFormData({
        truckNumber: "Select Truck Number",
        samplingAgency: "",
        supervisorName: "",
        bagsCollected: "",
        sealNumbers: [],
        samplingMode: "Select Sampling Mode",
        samplingDateTime: null,
      });
      setBoxes([]);
      setSampler("");
      setSupervisor("");
      setBiomassData(biomassDefault);
    }, [])
  );

  const isFormEmpty =
    JSON.stringify(biomassData) === JSON.stringify(biomassDefault) &&
    boxes.length === 0 &&
    supervisor === "" &&
    sampler === "";

  const resetForm = () => {
    setFormData({
      truckNumber: "Select Truck Number",
      samplingAgency: "",
      supervisorName: "",
      bagsCollected: "",
      sealNumbers: [],
      samplingMode: "Select Sampling Mode",
      samplingDateTime: null,
    });
    setBoxes([]);
    setSampler("");
    setSupervisor("");
    setBiomassData(biomassDefault);
    setIsUpdateMode(false);
  };


  const handleSubmit = async () => {
    if (!formData.samplingDateTime) return;

    const cleanedBoxes = boxes.map(({ bagNo, seal }) => ({
      zmode: "BIOMASS",
      rakE_OR_TRUCK_NO: formData.truckNumber,
      baG_NO: String(bagNo),
      seaL_NO: seal,
      entrY_BY: user?.fullname || "User"
    }));

    const result = formValidaty(formData);
    if (!result.valid) {
      setAlertMessage(result.message || "Please enter all fields");
      setAlertType("error");
      setAlertVisible(true);
      setTimeout(() => setAlertVisible(false), 2000);
      return;
    }

    const payload = {
      t_COAL_SAMPLING: [],
      t_BIO_SAMPLING: [
        {
          slno: "1",
          trucK_NO: formData.truckNumber,
          samplinG_DT: SapSampleDateTime.date,
          samplinG_TM: SapSampleDateTime.time,
          totaL_TRUCKS: "1",
          samplE_AGENCY: formData.samplingAgency,
          supervisor,
          sampler,
          nO_OF_BAGS_COL: formData.bagsCollected,
          samplinG_MODE: formData.samplingMode,
          createD_BY: user?.fullname || "User",
        }
      ],
      t_CAOL_BIO_BAGS_TBL: cleanedBoxes,
      t_RAKE_NO: [],
      t_REGNO: [],
      t_DROPDOWN_DATA: []
    };

    try {
      const { data } = await axios.post(
        `${baseurl}/Sampling/PTYPE/BIOMASS`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("Submission success:", data);
      console.log("Payload to be submitted:", payload);
      
      setAlertMessage("Rake Sampling Report submitted");
      setAlertType("success");
      setAlertVisible(true);
      setTimeout(() => setAlertVisible(false), 2000);

      // Reset form state
      setFormData({
        truckNumber: "Select Truck Number",
        samplingAgency: "",
        supervisorName: "",
        bagsCollected: "",
        sealNumbers: [],
        samplingMode: "Select Sampling Mode",
        samplingDateTime: null,
      });
      setBoxes([]);
      setSampler("");
      setSupervisor("");
    } catch (err) {
      console.error("Error submitting data:", err);
      setAlertMessage("Failed to submit data");
      setAlertType("error");
      setAlertVisible(true);
      setTimeout(() => setAlertVisible(false), 2000);
    }
  };

  const [isTruckVisible, setIsTruckVisible] = useState(false);
  const [isSamplingModeVisible, setIsSamplingModeVisible] = useState(false);

  const screenHeight = Dimensions.get("window").height;
  const screenWidht = Dimensions.get("window").width;

  const theme = useTheme();

  return (
    <>
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#f0f0f0" }} edges={['top', 'left', 'right']}>        
        <KeyboardAvoidingView
          behavior="padding"
          keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 100}
          >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView contentContainerStyle={styles.container}>
              <Card style={styles.card}>
                <Card.Content>
                  <SelectComponentBYFORM
                    field={{
                      label: "Select Truck Number",
                      name: "truckNumber",
                    }}
                    formData={formData}
                    handleChange={handleChange}
                    isVisible={isTruckVisible}
                    setIsVisible={setIsTruckVisible}
                    screenHeight={screenHeight}
                    screenWidth={screenWidht}
                    dataList={truckOptions}
                    onOpen={() => {
                      setIsTruckVisible(true);
                      handleOpenTruckDropdown();
                    }}
                  />
                </Card.Content>    
                {/* <View style={styles.cardBottom} /> */}
              </Card>


              <Card style={styles.card}>
                <Card.Content>
                  <DateTimeComponent
                    label="Sampling Date & Time"
                    mode="outlined"
                    style={styles.input}
                    date={formData.samplingDateTime}
                    setDate={(date: Date) =>
                      setFormData((prev) => ({ ...prev, samplingDateTime: date }))
                    }
                  />

                  <TextInput
                    label="Sampling Agency"
                    value={formData.samplingAgency}
                    onChangeText={(text) =>
                      setFormData({ ...formData, samplingAgency: text })
                    }
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
                      setFormData({ ...formData, bagsCollected: text });
                    }}
                    keyboardType="numeric"
                    style={styles.input}
                    mode="outlined"
                    placeholderTextColor={"#000"}
                    theme={{ colors: { text: '#000' } }}
                  />

                  {Number(formData?.bagsCollected) > 100 && (
                    <Text
                      style={{
                        color: "red",
                        marginBottom: 10,
                        marginLeft: 2,
                      }}
                    >
                      Bags must be less than 100
                    </Text>
                  )}

                  <NoOfTwoBoxComponent
                    boxes={boxes}
                    setBoxes={(updated: BoxData[]) => {
                      setBoxes(updated);
                      setFormData((prev) => ({ ...prev, sealNumbers: updated }));
                    }}
                    number={Number(formData?.bagsCollected) || 0}
                  />

                  <SelectComponentBYFORM
                    field={{
                      label: "Select Sampling Mode",
                      name: "samplingMode",
                    }}
                    formData={formData}
                    handleChange={handleChange}
                    isVisible={isSamplingModeVisible}
                    setIsVisible={setIsSamplingModeVisible}
                    dataList={samplingModes}
                    screenHeight={screenHeight}
                    screenWidth={screenWidht}
                  />

                  <Button mode="contained" onPress={handleSubmit} style={styles.button}>
                    {isUpdateMode ? "Update" : "Submit"}
                  </Button>
                  <Button
                    mode="outlined"
                    onPress={resetForm}
                    disabled={isFormEmpty}
                    style={[styles.button, { marginTop: 8 }]}
                  >
                    Clear
                  </Button>

                </Card.Content>    
                {/* <View style={styles.cardBottom} /> */}
              </Card>
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
      </SafeAreaView>
    </SafeAreaProvider>
    </>

  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 16,
    flexGrow: 1,
  },
  card: {
    borderRadius: 12,
    elevation: 4,
    backgroundColor: "#fff",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    overflow: "hidden",
  },
  cardBottom: {
    height: 4,
    backgroundColor: "#eb6a2eff",
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  title: {
    marginBottom: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  input: {
    marginBottom: 12,
    backgroundColor: "#fff",
    // color: "#000",
  },
  button: {
    marginTop: 16,
    borderRadius: 8,
    paddingVertical: 2,
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

  const theme = useTheme();
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
              mode="contained"
              onPress={() => setIsVisible(false)}
              labelStyle={{ color: "#fff" }}
            >
              Close
            </Button>
            <SelectList
              setSelected={(val: string) => {
                handleChange(field.name, val);
                setIsVisible(false);
              }}
              onSelect={() => {
                setIsVisible(false);
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

export function formValidaty(formData: any): { valid: boolean; message?: string } {
  const requiredFields: (keyof typeof formData)[] = [
    "truckNumber",
    "samplingAgency",
    "supervisorName",
    "bagsCollected",
    "sealNumbers",
    "samplingMode",
    "samplingDateTime",
  ];

  if (Number(formData.bagsCollected) === 0 || Number(formData.bagsCollected) > 100) {
    return { valid: false, message: "Number of bags must be between 1 and 100" };
  }

  for (const field of requiredFields) {
    const value = formData[field];

    if (typeof value === "string") {
      if (
        value.trim() === "" ||
        value === "Select Truck Number" ||
        value === "Select Sampling Mode"
      ) {
        return { valid: false, message: `Please select/enter ${String(field)}` };
      }
    }

    if (Array.isArray(value) && value.length === 0) {
      return { valid: false, message: `Please add ${String(field)}` };
    }

    if (value === undefined || value === null) {
      return { valid: false, message: `Missing value for ${String(field)}` };
    }
  }

  return { valid: true };
}