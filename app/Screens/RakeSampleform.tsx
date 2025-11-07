import AlertMessage from "@/components/Cards/AlertMessage";
import DateTimeComponent from "@/components/DateTimeSelect";
import { SelectComponentBYFORM } from "@/components/SelectComponent";
import { useCallback, useEffect, useRef, useState } from "react";
import { Dimensions, Keyboard, KeyboardAvoidingView, Modal, Platform, RefreshControl, ScrollView, StyleSheet, TouchableWithoutFeedback, useColorScheme, useWindowDimensions, View } from "react-native";
import { ActivityIndicator, Button, Card, Text, TextInput, useTheme } from "react-native-paper";
import NoOfTwoBoxComponent, { BoxData } from "./NoOfTwoBoxComponent";
import axios from 'axios';
import dayjs from "dayjs";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "@/context/AuthContext";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import AlertSystem, { useAlerts } from "@/components/Cards/AlertSystem";

const initialFormData = {
  clientName: "TALWANDI SABO POWER LIMITED, TALWANDI",
  rakeNo: "",
  commodity: "",
  rakePlacementDateAndTime: new Date(),
  rakeUnloadingCommenceDateAndTime: new Date(),
  rakeUnloadingCompletedDateAndTime: new Date(),
  dateOfSampleCollection: dayjs().format("YYYYMMDD"), 
  SampleCollectionStartDateAndTime: new Date(),
  SampleCollectionEndDateAndTime: new Date(),
  noOfBagsCollected: 0,
  samplingAgency: "",
  supervisor: "",
  samplers: "",
  allSampleBagsSealChecked: "YES",
  samplingMode: "AUTO",
  autoSampler: "",
  fromWagon: "",
  toWagon: "",
  noOfWagons: 0,
  weatherCondition: "",
  remarks: ""
};



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



export default function RakeSampleForm() {
  
  const { user } = useAuth();
  
  const { 
    alerts, 
    addAlert, 
    removeAlert, 
    addSuccess, 
    addError, 
    addInfo, 
    addWarning,
    clearAllAlerts 
  } = useAlerts();

  const Api_Base = process.env.EXPO_PUBLIC_BASE_URL;

  const [formData, setFormData] = useState(initialFormData);
  // form data change function
  const handleChange = (field: any, val: any) => {
    setFormData({ ...formData, [field]: val })
  }
  // Dimensions match
  const screenHeight = Dimensions.get("window").height;
  const screenWidht = Dimensions.get("window").width;
  // select bar dialogs
  const [isCommodity, setIsCommodity] = useState<boolean>(false);
  const [isWeather, setIsWeather] = useState<boolean>(false);
  const [isAutoSampler, setIsIsAutoSampler] = useState<boolean>(false);
  const [isSampleMode, setIsSampleMode] = useState<boolean>(false)
  const [isSampleBagsChecked, setIsSampleBagsChecked] = useState<boolean>(false);
  const [rakeModalVisible, setRakeModalVisible] = useState<boolean>(false);
  // date & time
  const [rpDateTime, setRpDateTime] = useState<Date>(new Date());
  const [rUnloadDateTime, setRUnloadDateTime] = useState<Date>(new Date());
  const [rakeCompleteDT, setRakeCompleteDT] = useState<Date>(new Date());

  // Numbers
  const [boxes, setBoxes] = useState<BoxData[]>([])

  
  const [rakeDataLoading, setRakeDataLoading] = useState<boolean>(false);

  
  const [rakeNumbers, setRakeNumbers] = useState<any[]>([]);
  const [commodities, setCommodities] = useState<{ key: string; value: string }[]>([]);
  const [autoSamplers, setAutoSamplers] = useState<{ key: string; value: string }[]>([]);
  const [weatherConditions, setWeatherConditions] = useState<{ key: string; value: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isUpdateMode, setIsUpdateMode] = useState(false);

  const [refreshing, setRefreshing] = useState(false);

  const [isProcessing, setIsProcessing] = useState(false);


  const rakeNoRef = useRef<any>(null);
  const commodityRef = useRef<any>(null);
  const noOfBagsRef = useRef<any>(null);
  const noOfWagonsRef = useRef<any>(null);
  const samplingAgencyRef = useRef<any>(null);
  const supervisorRef = useRef<any>(null);
  const samplersRef = useRef<any>(null);
  const remarksRef = useRef<any>(null);
  const scrollViewRef = useRef<any>(null);




  function parseRakeDateTime(dateStr: string, timeStr: string): Date | undefined {
    if (!dateStr || !timeStr || dateStr === "00000000") return undefined;

    const year = parseInt(dateStr.substring(0, 4));
    const month = parseInt(dateStr.substring(4, 6)) - 1;
    const day = parseInt(dateStr.substring(6, 8));

    const hour = parseInt(timeStr.substring(0, 2));
    const minute = parseInt(timeStr.substring(2, 4));
    const second = parseInt(timeStr.substring(4, 6));

    return new Date(year, month, day, hour, minute, second);
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
  }

  // helper
  const formatSapDate = (raw?: string | number | null) => {
    if (raw === null || raw === undefined) return "";
    const s = String(raw).trim();
    // accept only exactly 8 digits like 20250816 and ignore placeholders
    if (!/^\d{8}$/.test(s) || s === "00000000") return "";
    const parsed = dayjs(s, "YYYYMMDD", true); // strict parse
    return parsed.isValid() ? parsed.format("DD/MM/YYYY") : "";
  };


  // set disbalebed fields values
  useEffect(() => {
    const onlyDate = new Date(rUnloadDateTime);
    setFormData((prev) => ({
      ...prev,
      dateOfSampleCollection: onlyDate.toLocaleDateString(),
      SampleCollectionStartDateAndTime: rUnloadDateTime,
    }));
  }, [rUnloadDateTime]);

  useEffect(() => {
    if (rUnloadDateTime) {
      const { planT_ARV_DATE } = formatToSAPDateTime(new Date(rUnloadDateTime));

      setFormData((prev) => ({
        ...prev,
        dateOfSampleCollection: planT_ARV_DATE, 
        dateOfSampleCollectionDisplay: dayjs(rUnloadDateTime).format("DD/MM/YYYY"), 
        SampleCollectionStartDateAndTime: rUnloadDateTime,
      }));
    }
  }, [rUnloadDateTime]);

  useEffect(() => {
    if (rakeCompleteDT) {
      setFormData(prev => ({
        ...prev,
        SampleCollectionEndDateAndTime: rakeCompleteDT
      }));
    }
  }, [rakeCompleteDT]);

  const fetchDropdownData = useCallback(async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${Api_Base}/Sampling/POWERTYPE/COAL`
        );

        const data = res.data;

        if (Array.isArray(data.tRakeNo)) {
          setRakeNumbers(
            data.tRakeNo
              .filter((item: any) => item.tspL_RAKE_ID?.trim() !== "")
              .map((item: any, index: number) => ({
                key: String(index),
                value: item.tspL_RAKE_ID,
                planT_ARV_DATE: item.planT_ARV_DATE,
                froM_WAGON: item.froM_WAGON,
                tO_WAGON: item.tO_WAGON,
                planT_ARV_TIME: item.planT_ARV_TIME,
                totaL_WAGON: item.totaL_WAGON,
              }))
          );
        }

        // Filter dropdown data by field
        if (Array.isArray(data.tDropDownData)) {
          setCommodities(
            data.tDropDownData
              .filter((d: any) => d.field === "COMMODITY")
              .map((d: any, index: number) => ({
                key: String(index),
                value: d.value,
              }))
          );

          setAutoSamplers(
            data.tDropDownData
              .filter((d: any) => d.field === "AUTO_SAMPLER")
              .map((d: any, index: number) => ({
                key: String(index),
                value: d.value,
              }))
          );

          setWeatherConditions(
            data.tDropDownData
              .filter((d: any) => d.field === "WEATHER_COND")
              .map((d: any, index: number) => ({
                key: String(index),
                value: d.value,
              }))
          );
        }

        if (data?.tRakeNo?.length > 0) {
          addInfo(`Loaded ${data.tRakeNo.length} rake numbers`, {duration: 500});
        }
        
      } catch (err : any) {
          console.error("API fetch error", err.response.data);
          addError(`${err.response.data}`);
      } finally {
          setLoading(false);
      }
    },[Api_Base]);

  useEffect(() => {
    fetchDropdownData();
  }, []);

  // height and width calculate
  const height = useWindowDimensions().height;
  const width = useWindowDimensions().width;
  const isLandScape = width > height;

  

  function isDeepEqual(a: any, b: any): boolean {
    if (a instanceof Date && b instanceof Date) {
      return a.getTime() === b.getTime();
    }
    if (typeof a !== typeof b) return false;
    if (a && b && typeof a === "object") {
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);
      if (keysA.length !== keysB.length) return false;
      return keysA.every(key => isDeepEqual(a[key], b[key]));
    }
    return a === b;
  }

  const isFormEmpty =
    isDeepEqual(formData, initialFormData) &&
    boxes.length === 0 &&
    rpDateTime.getTime() === initialFormData.rakePlacementDateAndTime.getTime() &&
    rUnloadDateTime.getTime() === initialFormData.rakeUnloadingCommenceDateAndTime.getTime() &&
    rakeCompleteDT.getTime() === initialFormData.rakeUnloadingCompletedDateAndTime.getTime();

  const resetForm = () => {
    setFormData(initialFormData);
    setBoxes([]);
    setRpDateTime(new Date());
    setRUnloadDateTime(new Date());
    setRakeCompleteDT(new Date());
    setIsUpdateMode(false);
    addInfo("All Fields Cleared");
  };

  useFocusEffect(
    useCallback(() => {
      // Reset everything when screen is focused
      setFormData(initialFormData);
      setBoxes([]);
      setRpDateTime(new Date());
      setRUnloadDateTime(new Date());
      setRakeCompleteDT(new Date());
    }, [])
  );

  const fetchRakeData = useCallback(async (rakeId: string) => {
    setRakeDataLoading(true);
    try {
      const controller = new AbortController();
      const response = await axios.get(
        `${Api_Base}/Sampling/Filter/POWERTYPE/COAL?RakeNo=${rakeId}`,
        { signal : controller.signal,
          timeout: 10000
        }
      );
      const data = response.data;

      if (data?.tCoalSampling?.length > 0) {
        const existing = data.tCoalSampling[0];

        const placement = parseRakeDateTime(existing.rakE_PLACE_DT, existing.rakE_PLACE_TM) ?? new Date();
        const commence = parseRakeDateTime(existing.rakE_UNLD_CM_DT, existing.rakE_UNLD_CM_TM) ?? new Date();
        const complete = parseRakeDateTime(existing.rakE_UNLD_CT_DT, existing.rakE_UNLD_CT_TM) ?? new Date();

        requestAnimationFrame(()=>{
          setFormData((prev) => ({
            ...prev,
            rakeNo: existing.rakE_NO || rakeId,
            clientName: existing.clienT_NAME || prev.clientName,
            commodity: existing.commodity || "",
            rakePlacementDateAndTime: placement,
            rakeUnloadingCommenceDateAndTime: commence,
            rakeUnloadingCompletedDateAndTime: complete,
            dateOfSampleCollection: existing.samplE_COLLECTION_DATE || dayjs().format("YYYYMMDD"),
            SampleCollectionStartDateAndTime: parseRakeDateTime(existing.samplE_START_DT, existing.samplE_START_TM) ?? new Date(),
            SampleCollectionEndDateAndTime: parseRakeDateTime(existing.samplE_COMPT_DT, existing.samplE_COMPT_TM) ?? new Date(),
            noOfBagsCollected: Number(existing.nO_OF_BAGS_COL) || 0,
            samplingAgency: existing.samplE_AGENCY || "",
            supervisor: existing.supervisor || "",
            samplers: existing.sampler || "",
            allSampleBagsSealChecked: existing.seaL_CHECK || "",
            samplingMode: existing.samplinG_MODE || "",
            autoSampler: existing.autO_SAMPLER || "",
            fromWagon: existing.froM_WAGON || "",
            toWagon: existing.tO_WAGON || "",
            noOfWagons: Number(existing.nO_OF_WAGONS) || 0,
            weatherCondition: existing.weatheR_COND || "",
            remarks: existing.remarks || "",
          }));

          if (Array.isArray(data.tCoalBioBags)) {
            setBoxes(
              data.tCoalBioBags.map((b: any) => ({
                bagNo: b.baG_NO,
                seal: b.seaL_NO,
              }))
            );
          }

          setRpDateTime(placement);
          setRUnloadDateTime(commence);
          setRakeCompleteDT(complete);

          addSuccess(`Existing data loaded for ${rakeId}`);
          setIsUpdateMode(true);
        });
      } else {
        handleNewRakeEntry(rakeId);
      }
    } catch (error : any) {
      // if (!axios.isCancel(error)) {
      //   console.error("Error fetching rake data:", error.response.data);
      //   addInfo(error.response.data)
      // }

      handleNewRakeEntry(rakeId);
    } finally {
      setRakeDataLoading(false);
    }
  }, [rakeNumbers, Api_Base]);

  const handleNewRakeEntry = useCallback((rakeId: string) => {
    const selected = rakeNumbers.find(r => r.value === rakeId);
    const placement = parseRakeDateTime(selected?.planT_ARV_DATE, selected?.planT_ARV_TIME) ?? new Date();

    requestAnimationFrame(() => {
      setFormData(prev => ({
        ...prev,
        rakeNo: rakeId,
        commodity: "",
        rakePlacementDateAndTime: placement,
        rakeUnloadingCommenceDateAndTime: new Date(),
        rakeUnloadingCompletedDateAndTime: new Date(),
        dateOfSampleCollection: dayjs().format("YYYYMMDD"),
        SampleCollectionStartDateAndTime: new Date(),
        SampleCollectionEndDateAndTime: new Date(),
        noOfBagsCollected: 0,
        samplingAgency: "",
        supervisor: "",
        samplers: "",
        allSampleBagsSealChecked: "YES",
        samplingMode: "AUTO",
        autoSampler: "",
        fromWagon: selected?.froM_WAGON || "",
        toWagon: selected?.tO_WAGON || "",
        noOfWagons: Number(selected?.totaL_WAGON) || 0,
        weatherCondition: "CLOUDY",
        remarks: "",
      }));

      setBoxes([]);
      setRpDateTime(placement);
      setRUnloadDateTime(new Date());
      setRakeCompleteDT(new Date());
      setIsUpdateMode(false);
    });
  }, [rakeNumbers]);


  const handleRakeNoChange = useCallback( async(selectedRakeId: string) => {
    if (isProcessing) return;

    setIsProcessing(true);

    try {
      setFormData((prev) => ({
        ...prev,
        rakeNo: selectedRakeId,
      }));

      const selected = rakeNumbers.find((r) => r.tspL_RAKE_ID === selectedRakeId);

      if (selected) {
        // parse date & time
        const parsedDate = parseRakeDateTime(selected.planT_ARV_DATE, selected.planT_ARV_TIME);

        setFormData(prev => ({
          ...prev,
          rakeNo: selectedRakeId,
          rakePlacementDateAndTime: parsedDate || new Date(),
          fromWagon: selected.froM_WAGON || "",
          toWagon: selected.tO_WAGON || "",
          noOfWagons: Number(selected.totaL_WAGON) || 0,
        }));

        if (parsedDate) {
          setRpDateTime(parsedDate);
        }
      }

      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Fetch rake data
      await fetchRakeData(selectedRakeId);
      
    } catch (error) {
      console.error("Error in handleRakeNoChange:", error);
      addError("Failed to load rake data");
    } finally {
      setIsProcessing(false);
    }
  }, [rakeNumbers, fetchRakeData, isProcessing]);

  // Function to validate form and return missing fields
  const validateForm = () => {
    const missingFields: string[] = [];
    const fieldRefs: {[key: string]: any} = {
      rakeNo: rakeNoRef,
      commodity: commodityRef,
      noOfBagsCollected: noOfBagsRef,
      samplingAgency: samplingAgencyRef,
      supervisor: supervisorRef,
      samplers: samplersRef,
      remarks: remarksRef,
      noOfWagons: noOfWagonsRef
    };

    // Check required fields
    if (!formData.rakeNo || formData.rakeNo.trim() === "") {
      missingFields.push("Rake No");
    }
    if (!formData.commodity || formData.commodity.trim() === "") {
      missingFields.push("Commodity");
    }
    if (!formData.noOfBagsCollected || formData.noOfBagsCollected === 0) {
      missingFields.push("No of Bags Collected");
    }
    if (!formData.samplingAgency || formData.samplingAgency.trim() === "") {
      missingFields.push("Sampling Agency");
    }
    if (!formData.supervisor || formData.supervisor.trim() === "") {
      missingFields.push("Supervisor");
    }
    if (!formData.samplers || formData.samplers.trim() === "") {
      missingFields.push("Samplers");
    }
    if (!formData.remarks || formData.remarks.trim() === "") {
      missingFields.push("Remarks");
    }
    if (!formData.noOfWagons || formData.noOfWagons === 0) {
      missingFields.push("No of Wagons");
    }

    // Check if sampling mode is AUTO and autoSampler is required
    if (formData.samplingMode === "AUTO" && (!formData.autoSampler || formData.autoSampler.trim() === "")) {
      missingFields.push("Auto Sampler");
    }

    // Check if number of bags is valid
    if (formData.noOfBagsCollected > 100) {
      missingFields.push("No of Bags should be less than 100");
    }

    // NEW: Validate that bags and seal numbers are properly filled
    if (formData.noOfBagsCollected > 0 && formData.noOfBagsCollected <= 100) {
      // Check if we have the right number of boxes
      if (boxes.length !== formData.noOfBagsCollected) {
        missingFields.push(`Expected ${formData.noOfBagsCollected} bags, but found ${boxes.length} bag entries`);
      }

      // Check each box for missing or empty seal numbers
      const emptySeals: number[] = [];
      const emptyBags: number[] = [];
      const duplicateSeals: string[] = [];
      const seenSeals = new Set<string>();

      boxes.forEach((box, index) => {
        // Check for empty or missing bag numbers
        if (!box.bagNo || String(box.bagNo).trim() === "") {
          emptyBags.push(index + 1);
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
        missingFields.push(`Bag numbers missing for bag(s): ${emptyBags.join(', ')}`);
      }

      if (emptySeals.length > 0) {
        missingFields.push(`Seal numbers missing for bag(s): ${emptySeals.join(', ')}`);
      }

      if (duplicateSeals.length > 0) {
        missingFields.push(`Duplicate seal numbers found: ${duplicateSeals.join(', ')}`);
      }
    }

    return { missingFields, fieldRefs };
  };

  // Function to scroll to a specific input
  const scrollToInput = (ref: any) => {
    if (ref && ref.current) {
      ref.current.measureLayout(
        scrollViewRef.current,
        (x: number, y: number, width: number, height: number) => {
          scrollViewRef.current.scrollTo({ y: y - 100, animated: true });
        },
        () => {}
      );
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);

    // 🔹 Call your reload logic here
    // For example, refetch trucks, reset form, etc.
    Promise.all([
      fetchDropdownData(),
      resetForm()
    ])
    .finally(() => setRefreshing(false));
  }, []);

  const handleSubmit = async () => {
    const actualBagCount = Number(formData.noOfBagsCollected) || 0;
  
    // Only use the first 'actualBagCount' boxes for validation and submission
    const boxesToValidate = boxes.slice(0, actualBagCount);

    // Validate form first
    if (!formValidaty(formData)) {
      // Get detailed validation errors using the validateForm function
      const { missingFields, fieldRefs } = validateForm();
      
      if (missingFields.length > 0) {
        // Display each missing field as a separate error alert with staggered timing
        missingFields.forEach((field, index) => {
          setTimeout(() => {
            addError(`Please enter: ${field}`);
          }, index * 150);
        });

        // Focus on the first missing field
        const firstMissingField = missingFields[0].toLowerCase();
        // setTimeout(() => {
        //   if (firstMissingField.includes('rake no')) {
        //     rakeNoRef.current?.focus();
        //     scrollToInput(rakeNoRef);
        //   } else if (firstMissingField.includes('commodity')) {
        //     commodityRef.current?.focus();
        //     scrollToInput(commodityRef);
        //   } else if (firstMissingField.includes('bags collected')) {
        //     noOfBagsRef.current?.focus();
        //     scrollToInput(noOfBagsRef);
        //   } else if (firstMissingField.includes('sampling agency')) {
        //     samplingAgencyRef.current?.focus();
        //     scrollToInput(samplingAgencyRef);
        //   } else if (firstMissingField.includes('supervisor')) {
        //     supervisorRef.current?.focus();
        //     scrollToInput(supervisorRef);
        //   } else if (firstMissingField.includes('samplers')) {
        //     samplersRef.current?.focus();
        //     scrollToInput(samplersRef);
        //   } else if (firstMissingField.includes('remarks')) {
        //     remarksRef.current?.focus();
        //     scrollToInput(remarksRef);
        //   } else if (firstMissingField.includes('wagons')) {
        //     noOfWagonsRef.current?.focus();
        //     scrollToInput(noOfWagonsRef);
        //   } else if (firstMissingField.includes('seal') || firstMissingField.includes('bag')) {
        //     // If the error is related to bags/seals, scroll to the bags section
        //     scrollToInput(noOfBagsRef);
        //   }
        // }, 500);
        setTimeout(() => {
          if (firstMissingField.includes('rake no')) {
            rakeNoRef.current?.focus();
          } else if (firstMissingField.includes('commodity')) {
            commodityRef.current?.focus();
          } else if (firstMissingField.includes('bags collected')) {
            noOfBagsRef.current?.focus();
          } else if (firstMissingField.includes('sampling agency')) {
            samplingAgencyRef.current?.focus();
          } else if (firstMissingField.includes('supervisor')) {
            supervisorRef.current?.focus();
          } else if (firstMissingField.includes('samplers')) {
            samplersRef.current?.focus();
          } else if (firstMissingField.includes('remarks')) {
            remarksRef.current?.focus();
          } else if (firstMissingField.includes('wagons')) {
            noOfWagonsRef.current?.focus();
          }
        }, 500);
      }
    }

    let plantDate = "";
    let plantTime = "";

    if (rpDateTime) {
      const { planT_ARV_DATE, planT_ARV_TIME } = formatToSAPDateTime(rpDateTime);
      plantDate = planT_ARV_DATE;
      plantTime = planT_ARV_TIME;
    }

    try {
      const cleanedBoxes = boxesToValidate
      .filter(box => box.bagNo && box.seal)
      .map(({ bagNo, seal }) => ({
        zmode: "COAL",
        rakE_OR_TRUCK_NO: formData.rakeNo,
        baG_NO: String(bagNo),
        seaL_NO: String(seal), 
        entrY_BY: user?.fullname
      }));

      // helper for SAP date/time
      const getSAPDateTime = (date?: Date) => {
        if (!date) return { date: "", time: "" };
        const { planT_ARV_DATE, planT_ARV_TIME } = formatToSAPDateTime(date);
        return { date: planT_ARV_DATE, time: planT_ARV_TIME };
      };

      const rakePlacement = getSAPDateTime(formData.rakePlacementDateAndTime);
      const rakeUnloadStart = getSAPDateTime(formData.rakeUnloadingCommenceDateAndTime);
      const rakeUnloadComplete = getSAPDateTime(formData.rakeUnloadingCompletedDateAndTime);
      const sampleStart = getSAPDateTime(formData.SampleCollectionStartDateAndTime);
      const sampleEnd = getSAPDateTime(formData.SampleCollectionEndDateAndTime);

      // build payload with SAP formats
      const payload = {
        t_COAL_SAMPLING: [
          {
            slno: "",
            rakE_NO: formData.rakeNo,
            clienT_NAME: formData.clientName,
            commodity: formData.commodity,
            rakE_PLACE_DT: rakePlacement.date,
            rakE_PLACE_TM: rakePlacement.time,
            rakE_UNLD_CM_DT: rakeUnloadStart.date,
            rakE_UNLD_CM_TM: rakeUnloadStart.time,
            rakE_UNLD_CT_DT: rakeUnloadComplete.date,
            rakE_UNLD_CT_TM: rakeUnloadComplete.time,
            samplE_COLLECTION_DATE: formData.dateOfSampleCollection, 
            samplE_START_DT: sampleStart.date,
            samplE_START_TM: sampleStart.time,
            samplE_COMPT_DT: sampleEnd.date,
            samplE_COMPT_TM: sampleEnd.time,
            nO_OF_BAGS_COL: String(formData.noOfBagsCollected),
            samplE_AGENCY: formData.samplingAgency,
            supervisor: formData.supervisor,
            sampler: formData.samplers,
            seaL_CHECK: formData.allSampleBagsSealChecked,
            samplinG_MODE: formData.samplingMode,
            nO_OF_WAGONS: String(formData.noOfWagons),
            autO_SAMPLER: formData.autoSampler,
            weatheR_COND: formData.weatherCondition,
            remarks: formData.remarks,
            createD_BY: user?.fullname
          }
        ],
        t_CAOL_BIO_BAGS_TBL: cleanedBoxes,
        t_RAKE_NO: [
          {
            tspL_RAKE_ID: formData.rakeNo || "",
            planT_ARV_DATE: plantDate,
            planT_ARV_TIME: plantTime,
            froM_WAGON: formData.fromWagon || "",
            tO_WAGON: formData.toWagon || "",
            totaL_WAGON: String(formData.noOfWagons) || ""
          }
        ],
        t_BIO_SAMPLING: [],
        t_REGNO: [{ regno: "" }],
        t_DROPDOWN_DATA: [{ mandt: "", field: "", value: "" }]
      };

      console.log("Payload:", JSON.stringify(payload, null, 2));

      const response = await axios.post(
        `${Api_Base}/Sampling/PTYPE/COAL`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      console.log(response.data);
      

      addSuccess(`Coal Sampling Report ${isUpdateMode ? 'updated' : 'submitted'} successfully!`);
      setTimeout(() => {
        resetForm();
      }, 3000);
    } catch (error: any) {
      console.error("Error submitting data:", error);
      addError(`Failed to submit data. Please try again. ${error.response.data}`);
    }
  };

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

  let colorScheme = useColorScheme();
  const theme = useTheme();

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 100}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl onRefresh={onRefresh} refreshing={refreshing} />
          }
        >

          {/* 1. Client & Rake Details */}
          <Card style={styles.card}>
            <Card.Title title="Client & Rake Details" titleStyle={{ fontWeight: "bold", color: "#000000"}}/>
            <Card.Content>
              <TextInput
                label="Client Name"
                value={formData?.clientName}
                style={styles.input}
                mode="outlined"
                editable={false}
                multiline
                scrollEnabled={false}
              />

              <SelectComponentBYFORM
                ref={rakeNoRef}
                field={{ name: "rakeNo", label: "Rake No" }}
                formData={formData}
                // handleChange={async (field: any, val: any) => {
                //   handleChange(field, val);
                //   const selected = rakeNumbers.find(r => r.value === val);
                //   if (selected) {
                //     const parsedDate = parseRakeDateTime(selected.planT_ARV_DATE, selected.planT_ARV_TIME);
                //     if (parsedDate) {
                //       setRpDateTime(parsedDate);
                //       setFormData(prev => ({
                //         ...prev,
                //         rakePlacementDateAndTime: parsedDate,
                //         noOfWagons: Number(selected.totaL_WAGON) || 0,
                //         fromWagon: selected.froM_WAGON || "",
                //         toWagon: selected.tO_WAGON || "",
                //       }));
                //     }
                //   };
                //   await fetchRakeData(val);
                // }}
                handleChange={async (field: any, val: any) => {
                  setRakeModalVisible(false);
                  
                  // Handle the change with a small delay
                  requestAnimationFrame(async () => {
                    await handleRakeNoChange(val);
                  });
                }}
                isVisible={rakeModalVisible}
                setIsVisible={setRakeModalVisible}
                screenHeight={screenHeight}
                screenWidth={screenWidht}
                dataList={rakeNumbers}
                onOpen={null}
                disabled={isProcessing || rakeDataLoading}
                onSubmitEditing={() => {
                  if (!isProcessing) {
                    setIsCommodity(true);
                  }
                }}
                returnKeyType="next"
              />

              <SelectComponentBYFORM
                ref={commodityRef}
                field={{ name: "commodity", label: "Select Commodity" }}
                formData={formData}
                handleChange={handleChange}
                isVisible={isCommodity}
                setIsVisible={setIsCommodity}
                screenHeight={screenHeight}
                screenWidth={screenWidht}
                dataList={commodities}
                onOpen={null}
                onSubmitEditing={() => {
                  noOfBagsRef.current?.focus();
                }}
                returnKeyType="next"
              />
            </Card.Content>
            <View style={styles.cardBottom} />
          </Card>

          {/* 2. Dates & Sampling Timeline */}
          <Card style={styles.card}>
            <Card.Title title="Dates & Sampling Timeline" titleStyle={{ fontWeight: "bold", color: "#000000"}}/>
            <Card.Content>
              <DateTimeComponent
                label="Rake placement date & time"
                mode="outlined"
                style={styles.input}
                date={rpDateTime}
                setDate={(date: Date) => {
                  setRpDateTime(date);
                  setFormData(prev => ({ ...prev, rakePlacementDateAndTime: date }));
                }}
                editable={false}
              />

              <DateTimeComponent
                label="Rake unloading commence"
                mode="outlined"
                style={styles.input}
                date={rUnloadDateTime}
                setDate={(date: Date) => {
                  setRUnloadDateTime(date);
                  setFormData(prev => ({ ...prev, rakeUnloadingCommenceDateAndTime: date }));
                }}
              />

              <DateTimeComponent
                label="Rake unloading completed"
                mode="outlined"
                style={styles.input}
                date={rakeCompleteDT}
                setDate={(date: Date) => {
                  setRakeCompleteDT(date);
                  setFormData(prev => ({ ...prev, rakeUnloadingCompletedDateAndTime: date }));
                }}
              />

              <TextInput
                label="Date of Sample Collection"
                value={
                  formData.dateOfSampleCollection && dayjs(formData.dateOfSampleCollection, "YYYYMMDD").isValid()
                    ? dayjs(formData.dateOfSampleCollection, "YYYYMMDD").format("DD/MM/YYYY")
                    : ""
                }
                style={styles.input}
                mode="outlined"
                editable={false}
              />

              <DateTimeComponent
                label="Sample collection start"
                mode="outlined"
                style={styles.input}
                date={rUnloadDateTime}
                setDate={setRUnloadDateTime}
                editable={false}
              />

              <DateTimeComponent
                label="Sample collection completed"
                mode="outlined"
                style={styles.input}
                date={rakeCompleteDT}
                setDate={setRakeCompleteDT}
                editable={false}
              />
            </Card.Content>
            <View style={styles.cardBottom} />
          </Card>

          {/* 3. Bags & Wagons */}
          <Card style={styles.card}>
            <Card.Title title="Bags & Wagons" titleStyle={{ fontWeight: "bold", color: "#000000"}}/>
            <Card.Content>
              <TextInput
                ref={noOfBagsRef}
                label="No of bags Collected"
                value={`${formData?.noOfBagsCollected}`}
                onChangeText={text => setFormData({ ...formData, noOfBagsCollected: Number(text) })}
                style={styles.input}
                mode="outlined"
                keyboardType="numeric"
                onSubmitEditing={() => {
                  noOfWagonsRef.current?.focus();
                }}
                returnKeyType="next"
              />

              {Number(formData?.noOfBagsCollected) > 100 && (
                <Text style={styles.errorText}>bags less than 100</Text>
              )}

              {Number(formData?.noOfBagsCollected) < 100 && (
                <NoOfTwoBoxComponent number={formData?.noOfBagsCollected} boxes={boxes} setBoxes={setBoxes} />
              )}

              {Number(formData?.noOfBagsCollected) > 0 && Number(formData?.noOfBagsCollected) <= 100 && (
                <BagValidationDisplay 
                  boxes={boxes} 
                  expectedCount={Number(formData.noOfBagsCollected)} 
                />
              )}

              <TextInput
                ref={noOfWagonsRef}
                label="No of Wagons"
                value={`${formData?.noOfWagons}`}
                onChangeText={text => setFormData({ ...formData, noOfWagons: Number(text) })}
                style={styles.input}
                mode="outlined"
                keyboardType="numeric"
                onSubmitEditing={() => {
                  samplingAgencyRef.current?.focus();
                }}
                returnKeyType="next"
                blurOnSubmit={false}
              />
            </Card.Content>
            <View style={styles.cardBottom} />
          </Card>

          {/* 4. Agencies & Personnel */}
          <Card style={styles.card}>
            <Card.Title title="Agencies & Personnel" titleStyle={{ fontWeight: "bold", color: "#000000"}}/>
            <Card.Content>
              <TextInput
                ref={samplingAgencyRef}
                label="Sampling Agency"
                value={formData?.samplingAgency}
                onChangeText={text => setFormData({ ...formData, samplingAgency: text })}
                style={styles.input}
                mode="outlined"
                onSubmitEditing={() => {
                  supervisorRef.current?.focus();
                }}
                returnKeyType="next"
                blurOnSubmit={false}
              />

              <TextInput
                ref={supervisorRef}
                label="Supervisor"
                value={formData?.supervisor}
                onChangeText={text => setFormData({ ...formData, supervisor: text })}
                style={styles.input}
                mode="outlined"
                onSubmitEditing={() => {
                  samplersRef.current?.focus();
                }}
                returnKeyType="next"
                blurOnSubmit={false}
              />

              <TextInput
                ref={samplersRef}
                label="Samplers"
                value={formData?.samplers}
                onChangeText={text => setFormData({ ...formData, samplers: text })}
                style={styles.input}
                mode="outlined"
                onSubmitEditing={() => {
                  remarksRef.current?.focus();
                }}
                returnKeyType="next"
                blurOnSubmit={false}
              />

              <SelectComponentBYFORM
                field={{ name: "allSampleBagsSealChecked", label: "All Sample Bags Seal Checked?" }}
                formData={formData}
                handleChange={handleChange}
                isVisible={isSampleBagsChecked}
                setIsVisible={setIsSampleBagsChecked}
                screenHeight={screenHeight}
                screenWidth={screenWidht}
                dataList={[
                  { key: "1", value: "YES" },
                  { key: "2", value: "NO" }
                ]}
                onOpen={null}
              />

              <SelectComponentBYFORM
                field={{ name: "samplingMode", label: "Sampling Mode" }}
                formData={formData}
                handleChange={handleChange}
                isVisible={isSampleMode}
                setIsVisible={setIsSampleMode}
                screenHeight={screenHeight}
                screenWidth={screenWidht}
                dataList={[
                  { key: "1", value: "AUTO" },
                  { key: "2", value: "MANUAL" }
                ]}
                onOpen={null}
              />

              {formData?.samplingMode === "AUTO" && (
                <SelectComponentBYFORM
                  field={{ name: "autoSampler", label: "Auto Sampler" }}
                  formData={formData}
                  handleChange={handleChange}
                  isVisible={isAutoSampler}
                  setIsVisible={setIsIsAutoSampler}
                  screenHeight={screenHeight}
                  screenWidth={screenWidht}
                  dataList={autoSamplers}
                  onOpen={null}
                />
              )}
            </Card.Content>
            <View style={styles.cardBottom} />
          </Card>

          {/* 5. Conditions & Remarks */}
          <Card style={styles.card}>
            <Card.Title title="Conditions & Remarks" titleStyle={{ fontWeight: "bold", color: "#000000"}}/>
            <Card.Content>
              <SelectComponentBYFORM
                field={{ name: "weatherCondition", label: "Weather Condition" }}
                formData={formData}
                handleChange={handleChange}
                isVisible={isWeather}
                setIsVisible={setIsWeather}
                screenHeight={screenHeight}
                screenWidth={screenWidht}
                dataList={weatherConditions}
                onOpen={null}
              />

              <TextInput
                ref={remarksRef}
                label="Remarks"
                value={`${formData?.remarks}`}
                onChangeText={text => setFormData({ ...formData, remarks: text })}
                style={[styles.input, {color: "#000000"}]}
                multiline
                numberOfLines={4}
                mode="outlined"
                onSubmitEditing={() => {
                  handleSubmit();
                }}
                returnKeyType="done"
              />
            </Card.Content>
            <View style={styles.cardBottom} />
          </Card>

          <Button mode="contained" onPress={handleSubmit} style={styles.button}
          loading={loading}
          disabled={loading || rakeDataLoading}
          >
            {isUpdateMode ? "Update" : "Submit"}
          </Button>

          <Button
            mode="outlined"
            onPress={resetForm}
            disabled={isFormEmpty || loading || rakeDataLoading}
            style={[styles.button, { marginTop: 8 }]}
          >
            Clear
          </Button>
        </ScrollView>
      </TouchableWithoutFeedback>

      <LoadingModal 
        visible={rakeDataLoading || loading} 
        message="Loading rake data..."
      />

      {(isProcessing || rakeDataLoading) && (
        <View style={styles.processingIndicator}>
          <ActivityIndicator size="small" color="#193b86ff" />
          <Text style={styles.processingText}>Loading rake data...</Text>
        </View>
      )}

      {/* <AlertMessage
        key={alertMessage + alertVisible}
        visible={alertVisible}
        message={alertMessage}
        type={alertType}
        onDismiss={() => setAlertVisible(false)}
        isLandScape={isLandScape}
        handleVisible={handleVisible}
      /> */}

            <AlertSystem
              alerts={alerts}
              onDismiss={removeAlert}
              position="top"
              maxVisible={4}
              stackVertically={true}
              isLandScape={isLandScape}
            />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 24,
    flexGrow: 1,
    backgroundColor: "#f0f0f0"
  },
  card: {    
    borderRadius: 12,
    elevation: 4,
    backgroundColor: "#fff",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    overflow: "hidden",
  },
  cardBottom: {
    height: 4,
    backgroundColor: "#193b86ff",
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  input: {
    marginBottom: 16,
    backgroundColor: "#fff",
    color: "#000000"
  },
  button: {
    marginTop: 16,
    borderRadius: 8,
    paddingVertical: 2,
    color: "#fff"
  },
  errorText: {
    color: "red",
    marginBottom: 10,
    marginLeft: 2
  },
  title: {
    marginBottom: 12,
    textAlign: 'center',
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
    borderColor: 'black',
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
  validationContainer: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffeaa7',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  validationText: {
    color: '#856404',
    fontSize: 14,
    marginBottom: 4,
  },
  processingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#fffbe6',
    borderRadius: 8,
    margin: 16,
    elevation: 2,
  },
  processingText: {
    marginLeft: 8,
    color: '#856404',
    fontSize: 15,
  },
});

export function formValidaty(formData: any): boolean {
  // Fields that are required
  const requiredFields: (keyof typeof formData)[] = [
    "clientName",
    "rakePlacementDateAndTime",
    "rakeUnloadingCommenceDateAndTime",
    "rakeUnloadingCompletedDateAndTime",
    "dateOfSampleCollection",
    "SampleCollectionStartDateAndTime",
    "SampleCollectionEndDateAndTime",
    "noOfBagsCollected",
    "samplingAgency",
    "supervisor",
    "samplers",
    "allSampleBagsSealChecked",
    "samplingMode",
    "noOfWagons",
    "weatherCondition",
    "remarks",
  ];

  // If samplingMode is "auto", then autoSampler is required
  if (formData.samplingMode?.toLowerCase() === "auto") {
    requiredFields.push("autoSampler");
  }

  if (formData.noOfBagsCollected === 0 || formData.noOfBagsCollected > 100) {
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


export const validateBagsAndSeals = (currentBoxes: BoxData[], expectedCount: number) => {
  const issues: string[] = [];
  
  // Only validate the boxes within the expected count to avoid showing issues for extra empty entries
  const boxesToValidate = expectedCount > 0 ? currentBoxes.slice(0, expectedCount) : [];
  
  const emptySeals = boxesToValidate.filter(box => !box.seal || String(box.seal).trim() === "");
  if (emptySeals.length > 0) {
    issues.push(`${emptySeals.length} entry(s) missing seal numbers`);
  }
  
  const emptyBags = boxesToValidate.filter(box => !box.bagNo || String(box.bagNo).trim() === "");
  if (emptyBags.length > 0) {
    issues.push(`${emptyBags.length} entry(s) missing bag numbers`);
  }
  
  // Check for duplicates only in the boxes we're validating
  const seals = boxesToValidate.map(box => String(box.seal).trim()).filter(seal => seal !== "");
  const bags = boxesToValidate.map(box => String(box.bagNo).trim()).filter(bag => bag !== "");
  
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