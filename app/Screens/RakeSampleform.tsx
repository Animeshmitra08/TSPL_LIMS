import AlertMessage from "@/components/Cards/AlertMessage";
import DateTimeComponent from "@/components/DateTimeSelect";
import { SelectComponentBYFORM } from "@/components/SelectComponent";
import { useEffect, useState } from "react";
import { Dimensions, Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableWithoutFeedback, useWindowDimensions } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import NoOfTwoBoxComponent, { BoxData } from "./NoOfTwoBoxComponent";

export default function RakeSampleForm() {
  const [formData, setFormData] = useState<{
    clientName: string,
    rankNo: string,
    commodity: string,
    rakePlacementDateAndTime: Date | undefined,
    rakeUnloadingCommenceDateAndTime: Date | undefined,
    rakeUnloadingCompletedDateAndTime: Date | undefined,
    dateOfSampleCollection: string,
    SampleCollectionStartDateAndTime: Date | undefined,
    SampleCollectionEndDateAndTime: Date | undefined,
    noOfBagsCollected: number,
    samplingAgency: string,
    supervisor: string,
    samplers: string,
    allSampleBagsSealChecked: string,
    samplingMode: string,
    autoSampler: string,
    noOfWagons: number,
    weatherCondition: string,
    remarks: number,
  }>({
    clientName: "Raj Soni", // api data
    rankNo: "",
    commodity: "",
    rakePlacementDateAndTime: undefined,
    rakeUnloadingCommenceDateAndTime: undefined,
    rakeUnloadingCompletedDateAndTime: undefined,
    dateOfSampleCollection: "",   // rakePlacementDateAndTime of date
    SampleCollectionStartDateAndTime: undefined,   //rakeUnloadingCompletedDateAndTime 
    SampleCollectionEndDateAndTime: undefined,//rakeUnloadingCompletedDateAndTime
    noOfBagsCollected: 0,
    samplingAgency: "",
    supervisor: "",
    samplers: "",
    allSampleBagsSealChecked: "",
    samplingMode: "",
    autoSampler: "",
    noOfWagons: 0,
    weatherCondition: "",
    remarks: 0,
  });
  // form data change function
  const handleChange = (field: any, val: any) => {
    setFormData({ ...formData, [field]: val })
  }
  // Dimensions match
  const screenHeight = Dimensions.get("window").height;
  const screenWidht = Dimensions.get("window").width;
  // select bar dialogs
  const [isRankNo, setIsRankNo] = useState<boolean>(false);
  const [isCommodity, setIsCommodity] = useState<boolean>(false);
  const [isWeather, setIsWeather] = useState<boolean>(false);
  const [isAutoSampler, setIsIsAutoSampler] = useState<boolean>(false);
  const [isSampleMode, setIsSampleMode] = useState<boolean>(false)
  const [isSampleBagsChecked, setIsSampleBagsChecked] = useState<boolean>(false);
  // date & time
  const [customDateTimeRakePlacementTimeAndDate, setCustomDateTimeRakePlacementTimeAndDate] = useState<any>();
  const [customDateTimeRakeUnloadingCommenceTimeAndDate, setCustomDateTimeTimeRakeUnloadingCommenceTimeAndDate] = useState<any>();
  const [customDateTimeRakeUnloadingCompletedTimeAndDate, setCustomDateTimeTimeRakeUnloadingCompletedTimeAndDate] = useState<any>();

  // Numbers
  const [boxes, setBoxes] = useState<BoxData[]>([])

  // set disbalebed fields values
  useEffect(() => {
    const onlyDate = new Date(customDateTimeRakeUnloadingCommenceTimeAndDate);
    setFormData((prev) => ({
      ...prev,
      dateOfSampleCollection: onlyDate.toLocaleDateString(),
      SampleCollectionStartDateAndTime: customDateTimeRakeUnloadingCommenceTimeAndDate,
    }));
  }, [customDateTimeRakeUnloadingCommenceTimeAndDate]);
  console.log(formData.dateOfSampleCollection, "date");

  useEffect(() => {

    setFormData((prev) => ({
      ...prev,
      SampleCollectionEndDateAndTime: customDateTimeRakeUnloadingCompletedTimeAndDate,
    }));
  }, [customDateTimeRakeUnloadingCompletedTimeAndDate]);

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
  return (
    <KeyboardAvoidingView behavior='padding' keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 100} >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text variant="titleLarge" style={styles.title}>Rake Sampling Report</Text>
          {/* CLient name come from api */}
          <TextInput
            label="Client Name"
            value={formData?.clientName}
            onChangeText={(text) => setFormData({ ...formData, clientName: text })}
            style={styles.input}
            mode="outlined"
            disabled={true}
          />
          {/* rank number is optional */}
          <SelectComponentBYFORM
            field={{
              label: "Select Rank Number",
              name: "rankNo",
              options: [
                { key: "1", value: "rankNo 1" },
                { key: "2", value: "rankNo 2" },
                { key: "3", value: "rankNo 3" },
              ]
            }}
            formData={formData}
            handleChange={handleChange}
            isVisible={isRankNo}
            setIsVisible={setIsRankNo}
            screenHeight={screenHeight}
            screenWidth={screenWidht}
          />
          {/* Commodity is optional */}
          <SelectComponentBYFORM
            field={{
              label: "Select Commodity",
              name: "commodity",
              options: [
                { key: "1", value: "commodity 1" },
                { key: "2", value: "commodity 2" },
                { key: "3", value: "commodity 3" },
              ]
            }}
            formData={formData}
            handleChange={handleChange}
            isVisible={isCommodity}
            setIsVisible={setIsCommodity}
            screenHeight={screenHeight}
            screenWidth={screenWidht}
          />
          {/* rake placement date & time */}
          <DateTimeComponent
            label={"Rake placement date & time"}
            mode="outlined"
            style={styles.input}
            date={customDateTimeRakePlacementTimeAndDate}
            setDate={(date: Date) => {
              setCustomDateTimeRakePlacementTimeAndDate(date);
              setFormData((prev) => ({
                ...prev,
                rakePlacementDateAndTime: date
              }));
            }}
          />
          {/* rake unloading commence date & time  */}
          <DateTimeComponent
            label={"Rake unloading commence"}
            mode="outlined"
            style={styles.input}
            date={customDateTimeRakeUnloadingCommenceTimeAndDate}
            setDate={(date: Date) => {
              setCustomDateTimeTimeRakeUnloadingCommenceTimeAndDate(date)
              setFormData((prev) => ({
                ...prev,
                rakeUnloadingCommenceDateAndTime: date
              }))
            }}
          />
          {/* rake unloading completed date & time  */}
          <DateTimeComponent
            label={"Rake unloading completed"}
            mode="outlined"
            style={styles.input}
            date={customDateTimeRakeUnloadingCompletedTimeAndDate}

            setDate={(date: Date) => {
              setCustomDateTimeTimeRakeUnloadingCompletedTimeAndDate(date)
              setFormData((prev) => ({
                ...prev,
                rakeUnloadingCompletedDateAndTime: date
              }))
            }}
          />
          {/* date of Sample of Collection */}
          {/* <DateTimeComponent
            label={"Date of Sample Collection"}
            mode="outlined"
            style={styles.input}
            date={formData?.dateOfSampleCollection}
            setDate={setCustomDateTimeTimeRakeUnloadingCommenceTimeAndDate}
            disabled={true}
          /> */}
          <TextInput
            label="Date of Sample Collection"
            value={`${formData?.dateOfSampleCollection === "Invalid Date" ? "date of sample collection" : formData?.dateOfSampleCollection}`}
            onChangeText={(text) => setFormData({ ...formData, dateOfSampleCollection: (text) })}
            style={styles.input}
            mode="outlined"
            disabled={true}
          />
          {/*  date & time of sample collection start */}
          <DateTimeComponent
            label={"Sample collection start"}
            mode="outlined"
            style={styles.input}
            date={customDateTimeRakeUnloadingCommenceTimeAndDate}
            setDate={setCustomDateTimeTimeRakeUnloadingCommenceTimeAndDate}
            disabled={true}
          />
          {/* rake date & time of sample collection completed  */}
          <DateTimeComponent
            label={"Sample collection completed"}
            mode="outlined"
            style={styles.input}
            date={customDateTimeRakeUnloadingCompletedTimeAndDate}
            setDate={setCustomDateTimeTimeRakeUnloadingCompletedTimeAndDate}
            disabled={true}
          />
          {/* no of bags collected */}
          <TextInput
            label="No of bags Collected"
            value={`${formData?.noOfBagsCollected}`}
            onChangeText={(text) => {
              setFormData({ ...formData, noOfBagsCollected: Number(text) })
            }}
            style={styles.input}
            mode="outlined"
            keyboardType="numeric"
          />
          {
            Number(formData?.noOfBagsCollected) > 100 && <Text style={{
              color : "red",
              marginBottom : 10,
              marginLeft : 2
            }}>bags less than 100</Text>
          }
          {/* {
            formData?.noOfBagsCollected > 0 && <NoOfTwoBoxComponent
              number={formData?.noOfBagsCollected}
              boxes={boxes}
              setBoxes={setBoxes}
            />
          } */}
          {
            Number(formData?.noOfBagsCollected) < 100 && <NoOfTwoBoxComponent
              number={formData?.noOfBagsCollected}
              boxes={boxes}
              setBoxes={setBoxes}
            />
          }
          {/* sampling agency */}
          <TextInput
            label="Sampling Agency"
            value={formData?.samplingAgency}
            onChangeText={(text) => setFormData({ ...formData, samplingAgency: text })}
            style={styles.input}
            mode="outlined"
          />
          {/* supervisor */}
          <TextInput
            label="Supervisor Agency"
            value={formData?.supervisor}
            onChangeText={(text) => setFormData({ ...formData, supervisor: text })}
            style={styles.input}
            mode="outlined"
          />
          {/* sampling agency */}
          <TextInput
            label="Samplers"
            value={formData?.samplers}
            onChangeText={(text) => setFormData({ ...formData, samplers: text })}
            style={styles.input}
            mode="outlined"
          />
          {/* All Samples Bags Seal Checked is optional */}
          <SelectComponentBYFORM
            field={{
              label: "All Sample Bags Seal Checked",
              name: "allSampleBagsSealChecked",
              options: [
                { key: "1", value: "YES" },
                { key: "2", value: "NO" },
              ]
            }}
            formData={formData}
            handleChange={handleChange}
            isVisible={isSampleBagsChecked}
            setIsVisible={setIsSampleBagsChecked}
            screenHeight={screenHeight}
            screenWidth={screenWidht}
          />
          {/* Sampling mode is optional */}
          <SelectComponentBYFORM
            field={{
              label: "Sampling Mode",
              name: "samplingMode",
              options: [
                { key: "1", value: "auto" },
                { key: "2", value: "manual" },
              ],
            }}
            formData={formData}
            handleChange={handleChange}
            isVisible={isSampleMode}
            setIsVisible={setIsSampleMode}
            screenHeight={screenHeight}
            screenWidth={screenWidht}
          />
          {/* Auto Sample is optional */}
          {
            formData?.samplingMode === "auto" &&
            <SelectComponentBYFORM
              field={{
                label: "Auto Sampler",
                name: "autoSampler",
                options: [
                  { key: "1", value: "autoSampler 1" },
                  { key: "2", value: "autoSampler 2" },
                  { key: "3", value: "autoSampler 3" },
                ],
              }}
              formData={formData}
              handleChange={handleChange}
              isVisible={isAutoSampler}
              setIsVisible={setIsIsAutoSampler}
              screenHeight={screenHeight}
              screenWidth={screenWidht}
            />}
          {/* no of wagons */}
          <TextInput
            label="No of Wagons"
            value={`${formData?.noOfWagons}`}
            onChangeText={(text) => setFormData({ ...formData, noOfWagons: Number(text) })}
            style={styles.input}
            mode="outlined"
            keyboardType="numeric"
          />
          {/* Weather is optional */}
          <SelectComponentBYFORM
            field={{
              label: "Weather Condition",
              name: "weatherCondition",
              options: [
                { key: "1", value: "fear" },
                { key: "2", value: "rain" },
                { key: "3", value: "cloudly" },
              ]
            }}
            formData={formData}
            handleChange={handleChange}
            isVisible={isWeather}
            setIsVisible={setIsWeather}
            screenHeight={screenHeight}
            screenWidth={screenWidht}
          />
          {/* remarks */}
          <TextInput
            label="Remarks"
            value={`${formData?.remarks}`}
            onChangeText={(text) => setFormData({ ...formData, remarks: Number(text) })}
            style={styles.input}
            mode="outlined"
            keyboardType="numeric"
          />
          <Button mode="contained" onPress={() => {
            console.log(JSON.stringify(formData));
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
            setFormData({
              clientName: "Raj Soni", // api data
              rankNo: "",
              commodity: "",
              rakePlacementDateAndTime: undefined,
              rakeUnloadingCommenceDateAndTime: undefined,
              rakeUnloadingCompletedDateAndTime: undefined,
              dateOfSampleCollection: "",   // rakePlacementDateAndTime of date
              SampleCollectionStartDateAndTime: undefined,   //rakeUnloadingCompletedDateAndTime 
              SampleCollectionEndDateAndTime: undefined,//rakeUnloadingCompletedDateAndTime
              noOfBagsCollected: 0,
              samplingAgency: "",
              supervisor: "",
              samplers: "",
              allSampleBagsSealChecked: "",
              samplingMode: "",
              autoSampler: "",
              noOfWagons: 0,
              weatherCondition: "",
              remarks: 0,
            });
            setCustomDateTimeRakePlacementTimeAndDate(undefined);
            setCustomDateTimeTimeRakeUnloadingCommenceTimeAndDate(undefined);
            setCustomDateTimeTimeRakeUnloadingCompletedTimeAndDate(undefined)

          }} style={styles.button}>
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
  )
}

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
