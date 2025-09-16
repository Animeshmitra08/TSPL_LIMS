import AlertMessage from '@/components/Cards/AlertMessage';
import DateTimeComponent from '@/components/DateTimeSelect';
import { SelectComponentBYFORM } from '@/components/SelectComponent';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
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
  ActivityIndicator,
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

// Cache for API responses
const apiCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Debounce utility
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Custom Loading Modal Component
const LoadingModal = ({ visible, message }: { visible: boolean; message: string }) => (
  <Modal transparent visible={visible} animationType="fade">
    <View style={styles.loadingOverlay}>
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#193b86ff" />
        <Text style={styles.loadingText}>{message}</Text>
      </View>
    </View>
  </Modal>
);

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
  const [loadingTruckData, setLoadingTruckData] = useState(false);
  const [isUpdateMode, setIsUpdateMode] = useState(false);

  const baseurl = process.env.EXPO_PUBLIC_BASE_URL;
  const { user } = useAuth();

  // Debounce truck selection to avoid rapid API calls
  const debouncedTruckNumber = useDebounce(formData.truckNumber, 300);

  const samplingAgencyRef = React.useRef<any>(null);
  const supervisorRef = React.useRef<any>(null);
  const samplerRef = React.useRef<any>(null);
  const bagsCollectedRef = React.useRef<any>(null);
  const samplingModeRef = React.useRef<any>(null);

  // Optimized fetch with caching and error handling
  const fetchWithCache = useCallback(async (url: string, cacheKey: string) => {
    const now = Date.now();
    const cached = apiCache.get(cacheKey);
    
    // Return cached data if valid
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      return cached.data;
    }

    try {
      const { data } = await axios.get(url);
      
      // Store in cache
      apiCache.set(cacheKey, {
        data,
        timestamp: now
      });
      
      return data;
    } catch (error) {
      console.error(`Failed to fetch from ${url}:`, error);
      
      // Return stale cache if available, otherwise throw
      if (cached) {
        console.warn('Using stale cached data due to network error');
        return cached.data;
      }
      throw error;
    }
  }, []);

  // Optimized truck data fetching with caching
  const fetchTruckData = useCallback(async () => {
    // Only fetch if we don't have data or it's stale
    if (biomassData?.tRegNo && biomassData.tRegNo.length > 0) {
      return;
    }

    setLoadingTrucks(true);
    try {
      const data = await fetchWithCache(
        `${baseurl}/Sampling/POWERTYPE/BIOMASS`,
        'biomass-trucks'
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
      // Show user-friendly error message
      setAlertMessage("Failed to load truck data. Please try again.");
      setAlertType("error");
      setAlertVisible(true);
    } finally {
      setLoadingTrucks(false);
    }
  }, [baseurl, fetchWithCache, biomassData?.tRegNo]);

  // Optimized biomass data fetching with caching and loading state
  const fetchBiomassData = useCallback(async (truckNo: string) => {
    if (!truckNo || truckNo === "Select Truck Number") return;

    setLoadingTruckData(true);
    try {
      const data = await fetchWithCache(
        `${baseurl}/Sampling/Filter/POWERTYPE/BIOMASS?TruckNo=${truckNo}`,
        `biomass-${truckNo}`
      );

      if (data?.tBioSampling?.length > 0) {
        const sampling = data.tBioSampling[0];
        const bags = data.tCoalBioBags || [];

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

        setAlertMessage("Existing data loaded for this truck");
        setAlertType("info");
        setAlertVisible(true);
        setTimeout(() => setAlertVisible(false), 3000);
        
        setIsUpdateMode(true);
      } else {
        // Reset form for new entry
        resetFormForNewTruck(truckNo);
        setIsUpdateMode(false);
      }
    } catch (err) {
      console.error('Error fetching biomass data:', err);
      resetFormForNewTruck(truckNo);
      setAlertMessage("No existing data for this truck");
      setAlertType("error");
      setAlertVisible(true);
      setTimeout(() => setAlertVisible(false), 3000);
      setIsUpdateMode(false);
    } finally {
      setLoadingTruckData(false);
    }
  }, [baseurl, fetchWithCache]);

  // Helper function to reset form for new truck
  const resetFormForNewTruck = useCallback((truckNo: string) => {
    setFormData({
      truckNumber: truckNo,
      samplingAgency: "",
      supervisorName: "",
      bagsCollected: "",
      sealNumbers: [],
      samplingMode: "Select Sampling Mode",
      samplingDateTime: new Date(),
    });
    setSupervisor("");
    setSampler("");
    setBoxes([]);
  }, []);

  // Fetch truck data on component mount
  useEffect(() => {
    fetchTruckData();
  }, [fetchTruckData]);

  // Handle debounced truck selection
  useEffect(() => {
    if (debouncedTruckNumber && debouncedTruckNumber !== "Select Truck Number") {
      fetchBiomassData(debouncedTruckNumber);
    }
  }, [debouncedTruckNumber, fetchBiomassData]);

  // Memoized truck options
  const truckOptions = useMemo(() => {
    return (biomassData?.tRegNo ?? []).map((item, index) => ({
      key: String(index + 1),
      value: item.regno,
    }));
  }, [biomassData?.tRegNo]);

  // Memoized sampling modes
  const samplingModes = useMemo(() => [
    { key: '1', value: 'AUTO' },
    { key: '2', value: 'MANUAL' },
  ], []);

  const handleChange = useCallback((field: any, val: any) => {
    if (field === "truckNumber" && val && val !== "Select Truck Number") {
      // Reset state immediately for better UX
      setFormData({
        truckNumber: val,
        samplingAgency: "",
        supervisorName: "",
        bagsCollected: "",
        sealNumbers: [],
        samplingMode: "Select Sampling Mode",
        samplingDateTime: new Date(),
      });
      setSupervisor("");
      setSampler("");
      setBoxes([]);
      // fetchBiomassData will be called by useEffect due to debounced value change
    } else {
      setFormData(prev => ({ ...prev, [field]: val }));
    }
  }, []);

  const updateSupervisorName = useCallback((sup: string, sam: string) => {
    const fullName = `${sup},${sam}`;
    setFormData((prev) => ({ ...prev, supervisorName: fullName }));
  }, []);

  // Alert state
  const [alertVisible, setAlertVisible] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'info' | 'error' | 'success'>('info');

  // Screen dimensions
  const height = useWindowDimensions().height;
  const width = useWindowDimensions().width;
  const isLandScape = width > height;

  const handleVisible = useCallback(() => {
    setAlertVisible(false);
  }, []);

  const formatToSAPDateTime = useCallback((date: Date) => {
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
  }, []);

  const getSAPDateTime = useCallback((date?: Date) => {
    if (!date) return { date: "", time: "" };
    const { planT_ARV_DATE, planT_ARV_TIME } = formatToSAPDateTime(date);
    return { date: planT_ARV_DATE, time: planT_ARV_TIME };
  }, [formatToSAPDateTime]);

  const SapSampleDateTime = useMemo(() => 
    getSAPDateTime(formData.samplingDateTime ?? undefined),
    [formData.samplingDateTime, getSAPDateTime]
  );

  // Reset form when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      setFormData({
        truckNumber: "Select Truck Number",
        samplingAgency: "",
        supervisorName: "",
        bagsCollected: "",
        sealNumbers: [],
        samplingMode: "Select Sampling Mode",
        samplingDateTime: new Date(),
      });
      setBoxes([]);
      setSampler("");
      setSupervisor("");
      setBiomassData(biomassDefault);
      setIsUpdateMode(false);
      
      // Clear cache when returning to screen to ensure fresh data
      apiCache.clear();
    }, [])
  );

  const isFormEmpty = useMemo(() => 
    JSON.stringify(biomassData) === JSON.stringify(biomassDefault) &&
    boxes.length === 0 &&
    supervisor === "" &&
    sampler === "",
    [biomassData, boxes, supervisor, sampler]
  );

  const resetForm = useCallback(() => {
    setFormData({
      truckNumber: "Select Truck Number",
      samplingAgency: "",
      supervisorName: "",
      bagsCollected: "",
      sealNumbers: [],
      samplingMode: "Select Sampling Mode",
      samplingDateTime: new Date(),
    });
    setBoxes([]);
    setSampler("");
    setSupervisor("");
    setBiomassData(biomassDefault);
    setIsUpdateMode(false);
  }, []);

  // Optimized submit with better error handling
  const handleSubmit = useCallback(async () => {
    if (!formData.samplingDateTime) return;

    const result = formValidaty(formData, supervisor, sampler, boxes);
    if (!result.valid) {
      setAlertMessage(result.message || "Please enter all required fields");
      setAlertType("error");
      setAlertVisible(true);
      setTimeout(() => setAlertVisible(false), 5000); 

      if (result.missingFields) {
        const firstField = result.missingFields[0].toLowerCase();
        if (firstField.includes('sampling agency')) {
          samplingAgencyRef.current?.focus();
        } else if (firstField.includes('supervisor')) {
          supervisorRef.current?.focus();
        } else if (firstField.includes('sampler')) {
          samplerRef.current?.focus();
        } else if (firstField.includes('bags collected')) {
          bagsCollectedRef.current?.focus();
        }
      }
      
      return;
    }

    const cleanedBoxes = boxes.map(({ bagNo, seal }) => ({
      zmode: "BIOMASS",
      rakE_OR_TRUCK_NO: formData.truckNumber,
      baG_NO: String(bagNo),
      seaL_NO: seal,
      entrY_BY: user?.fullname || "User"
    }));

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
      
      setAlertMessage("Biomass Sampling Report submitted successfully");
      setAlertType("success");
      setAlertVisible(true);
      setTimeout(() => setAlertVisible(false), 2000);

      // Clear cache after successful submission to ensure fresh data on next load
      apiCache.delete('biomass-data');
      
      // Reset form state
      resetForm();
    } catch (err) {
      console.error("Error submitting data:", err);
      setAlertMessage("Failed to submit data. Please try again.");
      setAlertType("error");
      setAlertVisible(true);
      setTimeout(() => setAlertVisible(false), 2000);
    }
  }, [formData, supervisor, sampler, boxes, SapSampleDateTime, user, baseurl, resetForm]);

  const [isTruckVisible, setIsTruckVisible] = useState(false);
  const [isSamplingModeVisible, setIsSamplingModeVisible] = useState(false);

  const screenHeight = Dimensions.get("window").height;
  const screenWidth = Dimensions.get("window").width;

  const theme = useTheme();

  const BagValidationDisplay = ({ boxes, expectedCount }: { boxes: BoxData[], expectedCount: number }) => {
    const issues = validateBagsAndSeals(boxes, expectedCount);
    
    if (issues.length === 0) return null;
    
    return (
      <View style={styles.validationContainer}>
        {issues.map((issue, index) => (
          <Text key={index} style={styles.validationText}>⚠️ {issue}</Text>
        ))}
      </View>
    );
  };

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
                      screenWidth={screenWidth}
                      dataList={truckOptions}
                      loading={loadingTrucks || loadingTruckData}
                      onOpen={() => {
                        setIsTruckVisible(true);
                      }}
                    />
                    {/* {loadingTruckData && (
                      <Text style={{ textAlign: 'center', color: '#666', marginTop: 8 }}>
                        Loading truck data...
                      </Text>
                    )} */}
                  </Card.Content>    
                </Card>

                <Card style={styles.card}>
                  <Card.Content>
                    <DateTimeComponent
                      label="Sampling Date & Time"
                      mode="outlined"
                      style={styles.input}
                      date={formData.samplingDateTime}
                      setDate={(date: Date | null) => {
                        const finalDate = date || new Date();
                        setFormData((prev) => ({ ...prev, samplingDateTime: finalDate }));
                      }}
                    />

                    <TextInput
                      ref={samplingAgencyRef}
                      label="Sampling Agency"
                      value={formData.samplingAgency}
                      onChangeText={(text) =>
                        setFormData({ ...formData, samplingAgency: text })
                      }
                      style={styles.input}
                      mode="outlined"
                    />

                    <TextInput
                      ref={supervisorRef}
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
                      ref={samplerRef}
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
                      ref={bagsCollectedRef}
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

                    {Number(formData?.bagsCollected) > 0 && Number(formData?.bagsCollected) <= 100 && (
                      <BagValidationDisplay 
                        boxes={boxes} 
                        expectedCount={Number(formData.bagsCollected)} 
                      />
                    )}

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
                      screenWidth={screenWidth}
                    />

                    <Button 
                      mode="contained" 
                      onPress={handleSubmit} 
                      style={styles.button}
                      disabled={loadingTruckData}
                    >
                      {isUpdateMode ? "Update" : "Submit"}
                    </Button>
                    <Button
                      mode="outlined"
                      onPress={resetForm}
                      disabled={isFormEmpty || loadingTruckData}
                      style={[styles.button, { marginTop: 8 }]}
                    >
                      Clear
                    </Button>

                  </Card.Content>    
                </Card>
              </ScrollView>
            </TouchableWithoutFeedback>

            <LoadingModal 
              visible={loadingTruckData} 
              message="Loading Truck data..."
            />

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
  validationContainer: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffeaa7',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    marginTop: 8,
  },
  validationText: {
    color: '#856404',
    fontSize: 14,
    marginBottom: 4,
  },
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 200,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
});

export default HomeScreen;

export function formValidaty(
  formData: any, 
  supervisor: string, 
  sampler: string, 
  boxes: BoxData[]
): { 
  valid: boolean; 
  message?: string;
  missingFields?: string[];
} {
  const missingFields: string[] = [];

  // Check truck number
  if (!formData.truckNumber || formData.truckNumber === "Select Truck Number") {
    missingFields.push("Truck Number");
  }

  // Check sampling date time
  if (!formData.samplingDateTime || !(formData.samplingDateTime instanceof Date)) {
    missingFields.push("Sampling Date & Time");
  }

  // Check sampling agency
  if (!formData.samplingAgency || formData.samplingAgency.trim() === "") {
    missingFields.push("Sampling Agency");
  }

  // Check supervisor (from separate state)
  if (!supervisor || supervisor.trim() === "") {
    missingFields.push("Supervisor Name");
  }

  // Check sampler (from separate state)
  if (!sampler || sampler.trim() === "") {
    missingFields.push("Sampler Name");
  }

  // Check number of bags
  const bagsCount = Number(formData.bagsCollected);
  if (!formData.bagsCollected || bagsCount === 0) {
    missingFields.push("Number of Bags Collected");
  } else if (bagsCount > 100) {
    missingFields.push("Number of bags must be less than 100");
  }

  // Check sampling mode
  if (!formData.samplingMode || formData.samplingMode === "Select Sampling Mode") {
    missingFields.push("Sampling Mode");
  }

  // Enhanced bag and seal validation
  if (bagsCount > 0 && bagsCount <= 100) {
    // Check if we have the right number of bag entries
    if (boxes.length !== bagsCount) {
      missingFields.push(`Expected ${bagsCount} bags, but found ${boxes.length} bag entries`);
    }

    // Check each box for missing or invalid data
    const emptySeals: number[] = [];
    const emptyBags: number[] = [];
    const duplicateSeals: string[] = [];
    const duplicateBags: string[] = [];
    const seenSeals = new Set<string>();
    const seenBags = new Set<string>();

    boxes.forEach((box, index) => {
      // Check for empty or missing bag numbers
      if (!box.bagNo || String(box.bagNo).trim() === "") {
        emptyBags.push(index + 1);
      } else {
        // Check for duplicate bag numbers
        const bagStr = String(box.bagNo).trim();
        if (seenBags.has(bagStr)) {
          duplicateBags.push(bagStr);
        } else {
          seenBags.add(bagStr);
        }
      }

      // Check for empty or missing seal numbers
      if (!box.seal || String(box.seal).trim() === "") {
        emptySeals.push(index + 1);
      } else {
        // Check for duplicate seal numbers
        const sealStr = String(box.seal).trim();
        if (seenSeals.has(sealStr)) {
          duplicateSeals.push(sealStr);
        } else {
          seenSeals.add(sealStr);
        }
      }
    });

    // Add specific error messages for bag/seal issues
    if (emptyBags.length > 0) {
      missingFields.push(`Bag numbers missing for entry(s): ${emptyBags.join(', ')}`);
    }

    if (emptySeals.length > 0) {
      missingFields.push(`Seal numbers missing for entry(s): ${emptySeals.join(', ')}`);
    }

    if (duplicateBags.length > 0) {
      missingFields.push(`Duplicate bag numbers found: ${[...new Set(duplicateBags)].join(', ')}`);
    }

    if (duplicateSeals.length > 0) {
      missingFields.push(`Duplicate seal numbers found: ${[...new Set(duplicateSeals)].join(', ')}`);
    }

    // Check if no bags/seals provided when bags count > 0
    if (boxes.length === 0 && bagsCount > 0) {
      missingFields.push("Please add bag and seal number entries");
    }
  }

  // Return validation result
  if (missingFields.length > 0) {
    const message = missingFields.length > 5 
      ? `Please fix the following issues:\n\n• ${missingFields.slice(0, 5).join('\n• ')}\n\n...and ${missingFields.length - 5} more issues`
      : `Please fix the following issues:\n\n• ${missingFields.join('\n• ')}`;
    
    return { 
      valid: false, 
      message,
      missingFields
    };
  }

  return { valid: true };
}

export const validateBagsAndSeals = (currentBoxes: BoxData[], expectedCount: number) => {
  const issues: string[] = [];
  
  if (currentBoxes.length !== expectedCount && expectedCount > 0) {
    issues.push(`Expected ${expectedCount} entries, found ${currentBoxes.length}`);
  }
  
  const emptySeals = currentBoxes.filter(box => !box.seal || String(box.seal).trim() === "");
  if (emptySeals.length > 0) {
    issues.push(`${emptySeals.length} entry(s) missing seal numbers`);
  }
  
  const emptyBags = currentBoxes.filter(box => !box.bagNo || String(box.bagNo).trim() === "");
  if (emptyBags.length > 0) {
    issues.push(`${emptyBags.length} entry(s) missing bag numbers`);
  }
  
  // Check for duplicates
  const seals = currentBoxes.map(box => String(box.seal).trim()).filter(seal => seal !== "");
  const bags = currentBoxes.map(box => String(box.bagNo).trim()).filter(bag => bag !== "");
  
  const duplicateSeals = seals.filter((seal, index) => seals.indexOf(seal) !== index);
  const duplicateBags = bags.filter((bag, index) => bags.indexOf(bag) !== index);
  
  if (duplicateSeals.length > 0) {
    issues.push(`Duplicate seal numbers: ${[...new Set(duplicateSeals)].join(', ')}`);
  }
  
  if (duplicateBags.length > 0) {
    issues.push(`Duplicate bag numbers: ${[...new Set(duplicateBags)].join(', ')}`);
  }
  
  return issues;
};