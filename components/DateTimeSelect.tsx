import DateTimePicker from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import { useEffect, useState } from "react";
import { Modal, Platform, StyleSheet, Text, View } from "react-native";
import { Button, TextInput } from 'react-native-paper';

const DateTimeComponent = (
    { label, date, setDate, mode, style }: any
) => {
    const [open, setOpen] = useState(false);
    const handleOpen = () => {
        setOpen(true);
    }
    const [date1, setDate1] = useState<any>();
    const [time1, setTime1] = useState<any>();
    const [date1Open, setDate1Open] = useState<any>();
    const [time1Open, setTime1Open] = useState<any>();

    useEffect(() => {
        if (Platform.OS === "android") {
            if (!(date1 && time1)) return;

            const dateStr = date1.toLocaleDateString();
            const timeStr = time1.toLocaleTimeString();

            const parsedDate = dayjs(`${dateStr} ${timeStr}`, 'M/D/YYYY h:mm:ss A');
            if (parsedDate.isValid()) {
                setDate(parsedDate.toDate());
            }
        }
    }, [date1, time1]);

    return (<View>
        <TextInput
            style={style}
            left={<TextInput.Icon icon="calendar" />} // Icon on the left side


            mode={mode ?? "outlined"} value={date?.toLocaleString()} onPress={handleOpen} placeholder={label ?? "Select Date & time"} />
        {open && (Platform.OS === "ios" ? <DateTimePicker
            value={date}
            mode="datetime"
            display="default"
            onChange={(event, selectedDate) => {
                setOpen(false);
                if (selectedDate) {
                    setDate(selectedDate);
                }
            }}
        /> :
            <Modal style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.4)' }} visible={open} animationType='slide' transparent>
                <View
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'rgba(0,0,0,0.4)', // dim background
                    }}
                >
                    <View style={{
                        margin: 20,
                        padding: 40,
                        borderRadius: 12,
                        backgroundColor: 'white',
                        shadowColor: '#000',
                        shadowOpacity: 0.2,
                        shadowRadius: 6,
                        elevation: 5,
                    }}>
                        {/* DateTime Row */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                            <Text style={{ fontSize: 16, fontWeight: 'bold', marginRight: 26 }}>DateTime is :</Text>
                            <Text style={{ fontSize: 16, fontWeight: 900, minWidth: 100 }}>
                                {date ? date.toLocaleString() : '_'}
                            </Text>
                        </View>

                        {/* Date Row */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                            <Text style={{ fontSize: 16, fontWeight: '700' }}>Date is :</Text>
                            <Text style={{ fontSize: 16, fontWeight: 900, minWidth: 100 }}>
                                {date1 ? date1.toLocaleDateString() : '_'}
                            </Text>
                        </View>

                        {/* Time Row */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <Text style={{ fontSize: 16, fontWeight: '700' }}>Time is :</Text>
                            <Text style={{ fontSize: 16, fontWeight: 900, minWidth: 100 }}>
                                {time1 ? time1.toLocaleTimeString() : '_'}
                            </Text>
                        </View>

                        <View style={{ gap: 10 }}>
                            <Button mode="outlined" onPress={() => setDate1Open(true)}>
                                Date Select
                            </Button>
                            <Button mode="outlined" onPress={() => setTime1Open(true)}>
                                Time Select
                            </Button>
                            <Button mode="outlined" onPress={() => setOpen(false)}>
                                Close
                            </Button>
                        </View>
                        {
                            date1Open && <DateTimePicker
                                value={new Date()}
                                mode="date"
                                display="default"
                                onChange={(event, selectedDate) => {
                                    if (selectedDate) {
                                        setDate1(selectedDate);
                                        setDate1Open(false);
                                    }
                                }}
                            />
                        }
                        {
                            time1Open && <DateTimePicker
                                value={new Date()}
                                mode="time"
                                display="default"
                                onChange={(event, selectedDate) => {
                                    if (selectedDate) {
                                        setTime1(selectedDate);
                                        setTime1Open(false);
                                    }
                                }}
                            />
                        }
                    </View>
                </View>
            </Modal>
        )}
    </View>
    )
}
export default DateTimeComponent

export function DateTimeComponentByForm({ label, formData, setFormData, name, mode, style, disabled }: any) {
    const [open, setOpen] = useState(false);
    const handleOpen = () => {
        setOpen(true);
    }
    const [date1, setDate1] = useState<any>();
    const [time1, setTime1] = useState<any>();
    const [date1Open, setDate1Open] = useState<any>();
    const [time1Open, setTime1Open] = useState<any>();

    useEffect(() => {
        if (Platform.OS === "android") {
            if (!(date1 && time1)) return;

            const dateStr = date1.toLocaleDateString();
            const timeStr = time1.toLocaleTimeString();

            const parsedDate = dayjs(`${dateStr} ${timeStr}`, 'M/D/YYYY h:mm:ss A');
            if (parsedDate.isValid()) {
                setFormData({ ...formData, [name]: parsedDate.toDate() });
            }
        }
    }, [date1, time1]);

    useEffect(() => {
  const unloadingCommence = formData["rakeUnloadingCommenceDate&Time"];
  const unloadingComplete = formData["rakeUnloadingCompletedDate&Time"];

  const updatedForm: any = { ...formData };

  // Set 'dateOfSampleCollection' if not already manually filled
  if (unloadingCommence && !formData["dateOfSampleCollection"]) {
    updatedForm["dateOfSampleCollection"] = {
      date: unloadingCommence?.toLocaleDateString(),
    };
  }

  // Set 'date&TimeofSampleCollectionStart'
  if (unloadingCommence && !formData["date&TimeofSampleCollectionStart"]) {
    updatedForm["date&TimeofSampleCollectionStart"] = unloadingCommence;
  }

  // Set 'TimeofSampleCollectionCompleted'
  if (unloadingComplete && !formData["TimeofSampleCollectionCompleted"]) {
    updatedForm["TimeofSampleCollectionCompleted"] = unloadingComplete
  }

  setFormData(updatedForm);
}, [formData["rakeUnloadingCommenceDate&Time"], formData["rakeUnloadingCompletedDate&Time"]]);


    return (<View
        style={{
            marginBottom: 3,
        }}
    >
        <Text style={styles.label}>{label ?? "Select Date & Time"}</Text>
        <TextInput
        disabled={disabled}
            left={<TextInput.Icon icon="calendar" />} // Icon on the left side
            mode={mode ?? "outlined"}
            value={formData?.[`${name}`]?.toLocaleString()} onPress={handleOpen} placeholder={"Select Date & time"} />
        {open && (Platform.OS === "ios" ? <DateTimePicker
            value={formData?.[`${name}`]}
            mode="datetime"
            display="default"
            onChange={(event, selectedDate) => {
                setOpen(false);
                if (selectedDate) {
                    setFormData({ ...formData, [name]: selectedDate });
                }
            }}
            disabled={disabled}
            style={styles.input}
        /> :
            <Modal style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.4)' }} visible={open} animationType='slide' transparent>
                <View
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'rgba(0,0,0,0.4)', // dim background
                    }}
                >
                    <View style={{
                        margin: 20,
                        padding: 40,
                        borderRadius: 12,
                        backgroundColor: 'white',
                        shadowColor: '#000',
                        shadowOpacity: 0.2,
                        shadowRadius: 6,
                        elevation: 5,
                    }}>
                        {/* DateTime Row */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                            <Text style={{ fontSize: 16, fontWeight: 'bold', marginRight: 26 }}>DateTime is :</Text>
                            <Text style={{ fontSize: 16, fontWeight: 900, minWidth: 100 }}>
                                {formData?.[`${name}`] ? formData?.[`${name}`].toLocaleString() : 'Select date and time is:'}
                            </Text>
                        </View>

                        {/* Date Row */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                            <Text style={{ fontSize: 16, fontWeight: '700' }}>Date is :</Text>
                            <Text style={{ fontSize: 16, fontWeight: 900, minWidth: 100 }}>
                                {date1 ? date1.toLocaleDateString() : '_'}
                            </Text>
                        </View>

                        {/* Time Row */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <Text style={{ fontSize: 16, fontWeight: '700' }}>Time is :</Text>
                            <Text style={{ fontSize: 16, fontWeight: 900, minWidth: 100 }}>
                                {time1 ? time1.toLocaleTimeString() : '_'}
                            </Text>
                        </View>

                        <View style={{ gap: 10 }}>
                            <Button mode="outlined" onPress={() => setDate1Open(true)}>
                                Date Select
                            </Button>
                            <Button mode="outlined" onPress={() => setTime1Open(true)}>
                                Time Select
                            </Button>
                            <Button mode="outlined" onPress={() => setOpen(false)}>
                                Close
                            </Button>
                        </View>
                        {
                            date1Open && <DateTimePicker
                                value={new Date()}
                                mode="date"
                                display="default"
                                onChange={(event, selectedDate) => {
                                    if (selectedDate) {
                                        setDate1(selectedDate);
                                        setDate1Open(false);
                                    }
                                }}
                            />
                        }
                        {
                            time1Open && <DateTimePicker
                                value={new Date()}
                                mode="time"
                                display="default"
                                onChange={(event, selectedDate) => {
                                    if (selectedDate) {
                                        setTime1(selectedDate);
                                        setTime1Open(false);
                                    }
                                }}
                                disabled={disabled}
                            />
                        }
                    </View>
                </View>
            </Modal>
        )}
    </View>
    )

}
const styles = StyleSheet.create({
    container: {
        flex: 1,
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
        padding: 8,
        borderRadius: 6,
        fontSize: 16,
    },
})