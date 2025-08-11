
import { DateTimeComponentByForm } from '@/components/DateTimeSelect';
import { SelectComponentBYFORM } from '@/components/SelectComponent';
import React, { useEffect, useMemo, useState } from 'react';
import {
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';
import { Button } from 'react-native-paper';
import NoOfTwoBoxComponent from './NoOfTwoBoxComponent';

export default function RankSamplingReportForm() {
    const screenHeight = Dimensions.get('window').height;
    const screenWidth = Dimensions.get('window').width;
    const [formData, setFormData] = useState({});
    const handleChange = (fieldName: string, value: any) => {
        setFormData(prev => ({ ...prev, [fieldName]: value }));
    };
    // fields
    const [objAutoField, setObjAutoField] = useState({
        date_TimeofSampleCollectionStart: formData["rakeUnloadingCommenceDate&Time"],
        TimeofSampleCollectionCompleted: formData["rakeUnloadingCompletedDate&Time"]?.date,
        dateOfSampleCollection: formData["rakeUnloadingCommenceDate&Time"],
    });
    const fields =
        useMemo(() => [
            {
                name: "clientName",
                type: "auto",
                label: "Client Name",
                disabled: true,
                value: "RAJ SONI"
            },
            {
                name: "rankNo",
                type: "dropdown",
                label: "Rank No",
                options: [
                    { key: "1", value: "rankNo 1" },
                    { key: "2", value: "rankNo 2" },
                    { key: "3", value: "rankNo 3" },
                ]
            },
            {
                name: "commodity",
                type: "dropdown",
                label: "Commodity",
                options: [
                    { key: "1", value: "commodity 1" },
                    { key: "2", value: "commodity 2" },
                    { key: "3", value: "commodity 3" },
                ]
            },
            {
                name: "rakePlacementTime&Date",
                type: "auto",
                label: "Rake Placement Time & Date",
                dateSpecific: "date&Time",
                disabled: false,
                value: "24/05/2025, 12:33:00 PM"
            },
            {
                name: "rakeUnloadingCommenceDate&Time",
                type: "manual",
                label: "Rake Unloading Commence Date & Time",
                dateSpecific: "date&Time",
            },
            {
                name: "rakeUnloadingCompletedDate&Time",
                type: "manual",
                label: "Rake Unloading Completed Date & Time",
                dateSpecific: "date&Time",
            },
            {
                name: "dateOfSampleCollection",
                type: "auto",
                label: "Date Of Sample Collection",
                // dateSpecific: "date",
                disabled: true,
                autoCompleted: true,
                value: formData["dateOfSampleCollection"],
            }, {
                name: "date&TimeofSampleCollectionStart",
                type: "auto",
                label: "Date & Time of Sample Collection Start",
                dateSpecific: "date&Time",
                disabled: true,
                autoCompleted: true,
                value: objAutoField.date_TimeofSampleCollectionStart
            },
            {
                name: "TimeofSampleCollectionCompleted",
                type: "auto",
                label: "Date & Time of Sample Collection Completed",
                dateSpecific: "date&Time",
                disabled: true,
                autoCompleted: true,
                value: objAutoField.TimeofSampleCollectionCompleted,
            },

            {
                name: "noOfBagsCollected",
                type: "manual",
                label: "No Of Bags Collected",
            },
            {
                name: "samplingAgency",
                type: "manual",
                label: "Sampling Agency"
            },
            {
                name: "supervisor",
                type: "manual",
                label: "Supervisor"
            },
            {
                name: "samplers",
                type: "manual",
                label: "Samplers"
            },
            {
                name: "allSampleBagsSealChecked",
                type: "dropdown",
                label: "All Sample Bags Seal Checked",
                options: [
                    { key: "1", value: "YES" },
                    { key: "2", value: "NO" },
                ]
            },
            {
                name: "samplingMode",
                type: "dropdown",
                label: "Sampling Mode",
                options: [
                    { key: "1", value: "auto" },
                    { key: "2", value: "manual" },
                ],
            }, {
                name: "autoSampler",
                type: "dropdown",
                label: "Auto Sampler",
                options: [
                    { key: "1", value: "autoSampler 1" },
                    { key: "2", value: "autoSampler 2" },
                    { key: "3", value: "autoSampler 3" },
                ],
                autoVisiable: false
            },
            {
                name: "noOfWagons",
                type: "manual",
                label: "No Of Wagons",
            },
            {
                name: "weatherCondition",
                type: "dropdown",
                label: "Weather Condition",
                options: [
                    { key: "1", value: "fear" },
                    { key: "2", value: "rain" },
                    { key: "3", value: "cloudly" },
                ]
            },
            {
                name: "remarks",
                type: "manual",
                label: "Remarks"
            },
        ], [objAutoField])

    useEffect(() => {
        setObjAutoField(prev => ({
            ...prev,
            date_TimeofSampleCollectionStart: formData["rakeUnloadingCommenceDate&Time"],
            TimeofSampleCollectionCompleted: formData["rakeUnloadingCompletedDate&Time"]?.date,
            dateOfSampleCollection: formData["rakeUnloadingCommenceDate&Time"]
        }));
    }, [formData["rakeUnloadingCommenceDate&Time"], formData["rakeUnloadingCompletedDate&Time"]]);

    return (
        <KeyboardAvoidingView style={styles.container} behavior='padding' keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 100}>
            <ScrollView contentContainerStyle={styles.form}>
                <View><Text style={styles.title}>Rake Sampling Report</Text></View>
                {
                    fields?.map((field: any, index: number) => {
                        // Skip invisible fields
                        // Handle dynamic visibility for autoSampler
                        // Skip autoSampler if not auto
                        if (field?.dateSpecific === "date&Time") {
                            return (
                                <View key={index}>
                                    <DateTimeComponentByForm
                                        label={field?.label}
                                        formData={formData}
                                        setFormData={setFormData}
                                        name={field?.name}
                                        mode={"outlined"}
                                        style={styles.input}
                                        disabled={field.disabled}
                                        autoCompleted={field.autoCompleted}
                                        value={field.value}
                                    />
                                </View>
                            );
                        } else if (field.name === "noOfWagons") {
                            return (
                                <View key={index}>
                                    <TextComponent
                                        key={index}
                                        field={field}
                                        formData={formData}
                                        handleChange={handleChange}
                                        keyboardType="numeric"
                                    />
                                    {
                                        formData["noOfWagons"] > 0 && <NoOfTwoBoxComponent number={formData["noOfWagons"]} />
                                    }
                                </View>
                            );
                        } else if (field.type === "manual" || field.type === "auto") {
                            return (
                                <TextComponent
                                    key={index}
                                    field={field}
                                    formData={formData}
                                    handleChange={handleChange}
                                />
                            );
                        } else if (field.type === "dropdown") {
                            const [visible, setVisible] = useState(false);
                            if (field.name === "autoSampler" && formData["samplingMode"] !== "auto") {
                                return <View />
                            }
                            return (
                                <View key={index}>
                                    <Text style={styles.label}>{field.label}</Text>
                                    <SelectComponentBYFORM
                                        field={field}
                                        formData={formData}
                                        handleChange={handleChange}
                                        isVisible={visible}
                                        setIsVisible={setVisible}
                                        screenHeight={screenHeight}
                                        screenWidth={screenWidth}
                                    // setSampleingMode={setSampleingMode}
                                    />
                                </View>
                            );
                        }
                    })
                }
                <Button
                    style={styles.button}
                    mode="outlined"
                    onPress={() => console.log('Form Data:', formData)}
                >
                    Submit Report
                </Button>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    form: {
        padding: 20,
    },
    label: {
        fontSize: 16,
        marginTop: 20,
        marginBottom: 6,
        fontWeight: '600',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 12,
        borderRadius: 6,
        fontSize: 16,
    },
    selectLabel: {
        height: 50,
        backgroundColor: 'whitesmoke',
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
    button: {
        marginTop: 20,
        marginBottom: 30,
    },
    title: {
        fontSize: 24,
        fontWeight: 700,
        alignContent: "center",
    }
});

export const TextComponent = ({ field, formData, handleChange }: any) => {
    const fieldValue = field.autoCompleted
        ? formData[field.name] || ''
        : field.value || formData[field.name] || '';

    //  console.log(field,formData,fieldValue);

    return (
        <View>
            <Text style={styles.label}>{field.label}</Text>
            <TextInput
                style={[
                    styles.input,
                    field.disabled && { backgroundColor: '#f0f0f0' }
                ]}
                placeholder={field.name === "dateOfSampleCollection" ? "Date of Sample Collection" : "Type here..."}
                // value={fieldValue}
                value={
                    field.name === "dateOfSampleCollection" ? fieldValue?.date : fieldValue
                }
                editable={!field.disabled}
                onChangeText={(text) => handleChange(field.name, text)}
            />
        </View>
    );
};



