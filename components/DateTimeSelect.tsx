import DateTimePicker from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import { useEffect, useState } from "react";
import { Modal, Platform, StyleSheet, Text, View } from "react-native";
import { Button, TextInput } from 'react-native-paper';

// -------------------- DateTimeComponent --------------------
const DateTimeComponent = (
    { label, date, setDate, mode, style, disabled, editable }: any
) => {
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);

    const [date1, setDate1] = useState<Date | null>(null);
    const [time1, setTime1] = useState<Date | null>(null);
    const [date1Open, setDate1Open] = useState(false);
    const [time1Open, setTime1Open] = useState(false);

    useEffect(() => {
        if (Platform.OS === "android") {
            if (!(date1 && time1)) return;

            const dateStr = dayjs(date1).format("YYYY-MM-DD");
            const timeStr = dayjs(time1).format("HH:mm:ss");

            const parsedDate = dayjs(`${dateStr} ${timeStr}`, "YYYY-MM-DD HH:mm:ss");
            if (parsedDate.isValid()) {
                setDate(parsedDate.toDate());
            }
        }
    }, [date1, time1]);

    return (
        <View>
            {date !== undefined && <Text>{label}</Text>}

            <TextInput
                style={style}
                left={<TextInput.Icon icon="calendar" />}
                disabled={disabled}
                editable={editable}
                mode={mode ?? "outlined"}
                value={date ? date.toLocaleString() : ""}
                onPress={handleOpen}
                placeholder={label ?? "Select Date & time"}
            />

            {open && (
                Platform.OS === "ios"
                    ? <DateTimePicker
                        value={date instanceof Date ? date : new Date()}
                        mode="datetime"
                        display="default"
                        onChange={(event, selectedDate) => {
                            setOpen(false);
                            if (selectedDate) setDate(selectedDate);
                        }}
                    />
                    : <Modal
                        visible={open}
                        animationType="slide"
                        transparent
                    >
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContent}>
                                {/* DateTime Row */}
                                <View style={styles.row}>
                                    <Text style={styles.rowLabel}>DateTime is :</Text>
                                    <Text style={styles.rowValue}>
                                        {date ? date.toLocaleString() : '_'}
                                    </Text>
                                </View>

                                {/* Date Row */}
                                <View style={styles.row}>
                                    <Text style={styles.rowLabel}>Date is :</Text>
                                    <Text style={styles.rowValue}>
                                        {date1 ? date1.toLocaleDateString() : '_'}
                                    </Text>
                                </View>

                                {/* Time Row */}
                                <View style={styles.row}>
                                    <Text style={styles.rowLabel}>Time is :</Text>
                                    <Text style={styles.rowValue}>
                                        {time1 ? time1.toLocaleTimeString() : '_'}
                                    </Text>
                                </View>

                                <View style={{ gap: 10 }}>
                                    <Button mode="outlined" onPress={() => setDate1Open(true)}>Date Select</Button>
                                    <Button mode="outlined" onPress={() => setTime1Open(true)}>Time Select</Button>
                                    <Button mode="contained" onPress={() => setOpen(false)}>
                                        {date1 && time1 ? "Save" : "Close"}
                                    </Button>
                                </View>

                                {date1Open && (
                                    <DateTimePicker
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
                                )}

                                {time1Open && (
                                    <DateTimePicker
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
                                )}
                            </View>
                        </View>
                    </Modal>
            )}
        </View>
    );
};
export default DateTimeComponent;


// -------------------- DateTimeComponentByForm --------------------
export function DateTimeComponentByForm({ label, formData, setFormData, name, mode, style, disabled }: any) {
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);

    const [date1, setDate1] = useState<Date | null>(null);
    const [time1, setTime1] = useState<Date | null>(null);
    const [date1Open, setDate1Open] = useState(false);
    const [time1Open, setTime1Open] = useState(false);

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

        if (unloadingCommence && !formData["dateOfSampleCollection"]) {
            updatedForm["dateOfSampleCollection"] = {
                date: unloadingCommence?.toLocaleDateString(),
            };
        }
        if (unloadingCommence && !formData["date&TimeofSampleCollectionStart"]) {
            updatedForm["date&TimeofSampleCollectionStart"] = unloadingCommence;
        }
        if (unloadingComplete && !formData["TimeofSampleCollectionCompleted"]) {
            updatedForm["TimeofSampleCollectionCompleted"] = unloadingComplete;
        }
        setFormData(updatedForm);
    }, [formData["rakeUnloadingCommenceDate&Time"], formData["rakeUnloadingCompletedDate&Time"]]);

    const currentValue = formData?.[name] instanceof Date ? formData[name] : new Date();

    return (
        <View style={{ marginBottom: 3 }}>
            <Text style={styles.label}>{label ?? "Select Date & Time"}</Text>
            <TextInput
                disabled={disabled}
                left={<TextInput.Icon icon="calendar" />}
                mode={mode ?? "outlined"}
                value={formData?.[name] ? formData[name].toLocaleString() : ""}
                onPress={handleOpen}
                placeholder="Select Date & time"
            />

            {open && (
                Platform.OS === "ios"
                    ? <DateTimePicker
                        value={currentValue}
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
                    />
                    : <Modal visible={open} animationType="slide" transparent>
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContent}>
                                {/* DateTime Row */}
                                <View style={styles.row}>
                                    <Text style={styles.rowLabel}>DateTime is :</Text>
                                    <Text style={styles.rowValue}>
                                        {formData?.[name] ? formData[name].toLocaleString() : 'Select date and time'}
                                    </Text>
                                </View>

                                {/* Date Row */}
                                <View style={styles.row}>
                                    <Text style={styles.rowLabel}>Date is :</Text>
                                    <Text style={styles.rowValue}>
                                        {date1 ? date1.toLocaleDateString() : '_'}
                                    </Text>
                                </View>

                                {/* Time Row */}
                                <View style={styles.row}>
                                    <Text style={styles.rowLabel}>Time is :</Text>
                                    <Text style={styles.rowValue}>
                                        {time1 ? time1.toLocaleTimeString() : '_'}
                                    </Text>
                                </View>

                                <View style={{ gap: 10 }}>
                                    <Button mode="outlined" onPress={() => setDate1Open(true)}>Date Select</Button>
                                    <Button mode="outlined" onPress={() => setTime1Open(true)}>Time Select</Button>
                                    <Button mode="contained" onPress={() => setOpen(false)}>
                                        {date1 && time1 ? "Save" : "Close"}
                                    </Button>
                                </View>

                                {date1Open && (
                                    <DateTimePicker
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
                                )}

                                {time1Open && (
                                    <DateTimePicker
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
                                )}
                            </View>
                        </View>
                    </Modal>
            )}
        </View>
    );
}


// -------------------- Styles --------------------
const styles = StyleSheet.create({
    container: { flex: 1 },
    label: {
        fontSize: 16,
        marginTop: 20,
        marginBottom: 6,
        fontWeight: '600',
    },
    input: {
        borderWidth: 1,
        padding: 8,
        borderRadius: 6,
        fontSize: 16,
        backgroundColor: "transparent",
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    modalContent: {
        margin: 20,
        padding: 40,
        borderRadius: 12,
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 5,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    rowLabel: { fontSize: 16, fontWeight: '700', marginRight: 26 },
    rowValue: { fontSize: 16, fontWeight: '900', minWidth: 100 },
});
