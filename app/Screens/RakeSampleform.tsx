import AlertMessage from "@/components/Cards/AlertMessage";
import DateTimeComponent from "@/components/DateTimeSelect";
import { SelectComponentBYFORM } from "@/components/SelectComponent";
import { useCallback, useEffect, useState } from "react";
import { Dimensions, Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableWithoutFeedback, useColorScheme, useWindowDimensions, View } from "react-native";
import { Button, Card, Text, TextInput, useTheme } from "react-native-paper";
import NoOfTwoBoxComponent, { BoxData } from "./NoOfTwoBoxComponent";
import axios from 'axios';
import dayjs from "dayjs";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "@/context/AuthContext";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

const initialFormData = {
  clientName: "TALWANDI SABO POWER LIMITED, TALWANDI",
  rakeNo: "",
  commodity: "",
  rakePlacementDateAndTime: undefined as Date | undefined,
  rakeUnloadingCommenceDateAndTime: undefined as Date | undefined,
  rakeUnloadingCompletedDateAndTime: undefined as Date | undefined,
  dateOfSampleCollection: "",
  SampleCollectionStartDateAndTime: undefined as Date | undefined,
  SampleCollectionEndDateAndTime: undefined as Date | undefined,
  noOfBagsCollected: 0,
  samplingAgency: "",
  supervisor: "",
  samplers: "",
  allSampleBagsSealChecked: "",
  samplingMode: "",
  autoSampler: "",
  fromWagon: "",
  toWagon: "",
  noOfWagons: 0,
  weatherCondition: "",
  remarks: ""
};

export default function RakeSampleForm() {
  
  const { user } = useAuth();

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
  const [rpDateTime, setRpDateTime] = useState<any>();
  const [rUnloadDateTime, setRUnloadDateTime] = useState<any>();
  const [rakeCompleteDT, setRakeCompleteDT] = useState<any>();

  // Numbers
  const [boxes, setBoxes] = useState<BoxData[]>([])

  
  const [rakeNumbers, setRakeNumbers] = useState<any[]>([]);
  const [commodities, setCommodities] = useState<{ key: string; value: string }[]>([]);
  const [autoSamplers, setAutoSamplers] = useState<{ key: string; value: string }[]>([]);
  const [weatherConditions, setWeatherConditions] = useState<{ key: string; value: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isUpdateMode, setIsUpdateMode] = useState(false);

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

  useEffect(() => {
    const fetchDropdownData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          "https://tsplindia.info/TSPLSAMPLING/api/Sampling/POWERTYPE/COAL"
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
      } catch (err) {
        console.error("API fetch error", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDropdownData();
  }, []);

  const [alertVisible, setAlertVisible] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'info' | 'error' | 'success'>('info');
  // height and width calculate
  const height = useWindowDimensions().height;
  const width = useWindowDimensions().width;
  const isLandScape = width > height;
  // Custom handle Close alert visible function
  function handleVisible() {
    setAlertVisible(false);
  }

  const handleRakeNoChange = (selectedRakeId: string) => {
    setFormData((prev) => ({
      ...prev,
      rakeNo: selectedRakeId,
    }));

    const selected = rakeNumbers.find((r) => r.tspL_RAKE_ID === selectedRakeId);

    if (selected) {
      // parse date & time
      const parsedDate = parseRakeDateTime(selected.planT_ARV_DATE, selected.planT_ARV_TIME);
      if (parsedDate) {
        setRpDateTime(parsedDate);
        setFormData((prev) => ({
          ...prev,
          rakePlacementDateAndTime: parsedDate,
        }));
      }

      // wagons
      setFormData((prev) => ({
        ...prev,
        fromWagon: selected.froM_WAGON || "",
        toWagon: selected.tO_WAGON || "",
        noOfWagons: selected.totaL_WAGON || "",
      }));
    }
  };

  const isFormEmpty =
    JSON.stringify(formData) === JSON.stringify(initialFormData) &&
    boxes.length === 0 &&
    rpDateTime === undefined &&
    rUnloadDateTime === undefined &&
    rakeCompleteDT === undefined;

  // console.log(formData, boxes, rpDateTime, rUnloadDateTime, rakeCompleteDT);
  


  const resetForm = () => {
    setFormData(initialFormData);
    setBoxes([]);
    setRpDateTime(undefined);
    setRUnloadDateTime(undefined);
    setRakeCompleteDT(undefined);
  }

  useFocusEffect(
    useCallback(() => {
      // Reset everything when screen is focused
      setFormData(initialFormData);
      setBoxes([]);
      setRpDateTime(undefined);
      setRUnloadDateTime(undefined);
      setRakeCompleteDT(undefined);
    }, [])
  );


  const fetchRakeData = async (rakeId: string) => {
    try {
      const response = await axios.get(
        `https://tsplindia.info/TSPLSAMPLING/api/Sampling/Filter/POWERTYPE/COAL?RakeNo=${rakeId}`
      );
      const data = response.data;

      if (data?.tCoalSampling?.length > 0) {
        const existing = data.tCoalSampling[0];

        const placement = parseRakeDateTime(existing.rakE_PLACE_DT, existing.rakE_PLACE_TM);
        const commence = parseRakeDateTime(existing.rakE_UNLD_CM_DT, existing.rakE_UNLD_CM_TM);
        const complete = parseRakeDateTime(existing.rakE_UNLD_CT_DT, existing.rakE_UNLD_CT_TM);

        setFormData((prev) => ({
          ...prev,
          rakeNo: existing.rakE_NO || rakeId,
          clientName: existing.clienT_NAME || prev.clientName,
          commodity: existing.commodity || "",
          rakePlacementDateAndTime: placement,
          rakeUnloadingCommenceDateAndTime: commence,
          rakeUnloadingCompletedDateAndTime: complete,
          dateOfSampleCollection: existing.samplE_COLLECTION_DATE || "",
          SampleCollectionStartDateAndTime: parseRakeDateTime(existing.samplE_START_DT, existing.samplE_START_TM),
          SampleCollectionEndDateAndTime: parseRakeDateTime(existing.samplE_COMPT_DT, existing.samplE_COMPT_TM),
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
              seal: b.seaL_NO
            }))
          );
        }

        setRpDateTime(placement);
        setRUnloadDateTime(commence);
        setRakeCompleteDT(complete);

        setAlertMessage("Existing data loaded for this Coal Sampling");
        setAlertType("info");
        setAlertVisible(true);
        setTimeout(() => setAlertVisible(false), 3000);

        setIsUpdateMode(true);
      } else {
        setFormData((prev) => ({
          ...prev,
          commodity: "",
          rakeUnloadingCommenceDateAndTime: undefined,
          rakeUnloadingCompletedDateAndTime: undefined,
          dateOfSampleCollection: "",
          SampleCollectionStartDateAndTime: undefined,
          SampleCollectionEndDateAndTime: undefined,
          noOfBagsCollected: 0,
          samplingAgency: "",
          supervisor: "",
          samplers: "",
          allSampleBagsSealChecked: "",
          samplingMode: "",
          autoSampler: "",
          weatherCondition: "",
          remarks: "",
        }));
        setBoxes([]);

        setIsUpdateMode(false);
        setAlertMessage("No existing data. Enter new record.");
        setAlertType("info");
        setAlertVisible(true);
        setTimeout(() => setAlertVisible(false), 3000);
      }
    } catch (error) {
      console.error("Error fetching rake data:", error);
      setFormData((prev) => ({
        ...prev,
        commodity: "",
        rakeUnloadingCommenceDateAndTime: undefined,
        rakeUnloadingCompletedDateAndTime: undefined,
        dateOfSampleCollection: "",
        SampleCollectionStartDateAndTime: undefined,
        SampleCollectionEndDateAndTime: undefined,
        noOfBagsCollected: 0,
        samplingAgency: "",
        supervisor: "",
        samplers: "",
        allSampleBagsSealChecked: "",
        samplingMode: "",
        autoSampler: "",
        weatherCondition: "",
        remarks: "",
      }));
      setBoxes([]);
      setRUnloadDateTime(undefined);
      setRakeCompleteDT(undefined);
      
      setIsUpdateMode(false)
      setAlertMessage("No existing data. Enter new record.");
      setAlertType("info");
      setAlertVisible(true);
      setTimeout(() => setAlertVisible(false), 3000);
    }
  };





  const handleSubmit = async () => {
    let plantDate = "";
    let plantTime = "";

    if (rpDateTime) {
      const { planT_ARV_DATE, planT_ARV_TIME } = formatToSAPDateTime(rpDateTime);
      plantDate = planT_ARV_DATE;
      plantTime = planT_ARV_TIME;
    }

    try {
      const cleanedBoxes = boxes.map(({ bagNo, seal }) => ({
        zmode: "COAL",
        rakE_OR_TRUCK_NO: formData.rakeNo,
        baG_NO: String(bagNo),
        seaL_NO: seal,
        entrY_BY: user?.fullname
      }));

      if (!formValidaty(formData)) {
        setAlertMessage("Please enter all fields");
        setAlertType("error");
        setAlertVisible(true);
        setTimeout(() => setAlertVisible(false), 3000);
        return;
      }

      // ✅ helper for SAP date/time
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
        "https://tsplindia.info/TSPLSAMPLING/api/Sampling/PTYPE/COAL",
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("API Response:", response.data);

      setAlertMessage("Data submitted successfully");
      setAlertType("success");
      setAlertVisible(true);
      setTimeout(() => setAlertVisible(false), 3000);
    } catch (error: any) {
      console.error("Error submitting data:", error);
      setAlertMessage(error.response?.data?.message || "Failed to submit data");
      setAlertType("error");
      setAlertVisible(true);
      setTimeout(() => setAlertVisible(false), 3000);
    }
  };

  let colorScheme = useColorScheme();
  const theme = useTheme();

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 100}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.container}>

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
                field={{ name: "rakeNo", label: "Rake No" }}
                formData={formData}
                handleChange={async (field: any, val: any) => {
                  handleChange(field, val);
                  const selected = rakeNumbers.find(r => r.value === val);
                  if (selected) {
                    const parsedDate = parseRakeDateTime(selected.planT_ARV_DATE, selected.planT_ARV_TIME);
                    if (parsedDate) {
                      setRpDateTime(parsedDate);
                      setFormData(prev => ({
                        ...prev,
                        rakePlacementDateAndTime: parsedDate,
                        noOfWagons: Number(selected.totaL_WAGON) || 0,
                        fromWagon: selected.froM_WAGON || "",
                        toWagon: selected.tO_WAGON || "",
                      }));
                    }
                  };
                  await fetchRakeData(val);
                }}
                isVisible={rakeModalVisible}
                setIsVisible={setRakeModalVisible}
                screenHeight={screenHeight}
                screenWidth={screenWidht}
                dataList={rakeNumbers}
                onOpen={null}
              />

              <SelectComponentBYFORM
                field={{ name: "commodity", label: "Select Commodity" }}
                formData={formData}
                handleChange={handleChange}
                isVisible={isCommodity}
                setIsVisible={setIsCommodity}
                screenHeight={screenHeight}
                screenWidth={screenWidht}
                dataList={commodities}
                onOpen={null}
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
                label="No of bags Collected"
                value={`${formData?.noOfBagsCollected}`}
                onChangeText={text => setFormData({ ...formData, noOfBagsCollected: Number(text) })}
                style={styles.input}
                mode="outlined"
                keyboardType="numeric"
              />

              {Number(formData?.noOfBagsCollected) > 100 && (
                <Text style={styles.errorText}>bags less than 100</Text>
              )}

              {Number(formData?.noOfBagsCollected) < 100 && (
                <NoOfTwoBoxComponent number={formData?.noOfBagsCollected} boxes={boxes} setBoxes={setBoxes} />
              )}

              <TextInput
                label="No of Wagons"
                value={`${formData?.noOfWagons}`}
                onChangeText={text => setFormData({ ...formData, noOfWagons: Number(text) })}
                style={styles.input}
                mode="outlined"
                keyboardType="numeric"
              />
            </Card.Content>
            <View style={styles.cardBottom} />
          </Card>

          {/* 4. Agencies & Personnel */}
          <Card style={styles.card}>
            <Card.Title title="Agencies & Personnel" titleStyle={{ fontWeight: "bold", color: "#000000"}}/>
            <Card.Content>
              <TextInput
                label="Sampling Agency"
                value={formData?.samplingAgency}
                onChangeText={text => setFormData({ ...formData, samplingAgency: text })}
                style={styles.input}
                mode="outlined"
              />

              <TextInput
                label="Supervisor"
                value={formData?.supervisor}
                onChangeText={text => setFormData({ ...formData, supervisor: text })}
                style={styles.input}
                mode="outlined"
              />

              <TextInput
                label="Samplers"
                value={formData?.samplers}
                onChangeText={text => setFormData({ ...formData, samplers: text })}
                style={styles.input}
                mode="outlined"
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
                label="Remarks"
                value={`${formData?.remarks}`}
                onChangeText={text => setFormData({ ...formData, remarks: text })}
                style={[styles.input, {color: "#000000"}]}
                multiline
                numberOfLines={4}
                mode="outlined"
              />
            </Card.Content>
            <View style={styles.cardBottom} />
          </Card>

          <Button mode="contained" onPress={handleSubmit} style={styles.button}
          // disabled={isFormEmpty}
          loading={loading}
          // labelStyle={{ color: colorScheme === "dark" ? "#ffffff" : isFormEmpty ? "#656566" : "#ffffff" }}
          >
            {isUpdateMode ? "Update" : "Submit"}
          </Button>

          <Button
            mode="outlined"
            onPress={resetForm}
            disabled={isFormEmpty}
            style={[styles.button, { marginTop: 8 }]}
            // labelStyle={{ color: colorScheme === "dark" && !isFormEmpty ? "#ffffff" : "#656566" }}
          >
            Clear
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
      </SafeAreaView>
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    // padding: 16,
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