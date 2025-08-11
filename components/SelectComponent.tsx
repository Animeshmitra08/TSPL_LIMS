import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Modal, StyleSheet, Text, TouchableWithoutFeedback, View } from "react-native";
import { SelectList } from "react-native-dropdown-select-list";
import { Button } from "react-native-paper";

export function SelectComponentBYFORM({
    field,
    formData,
    handleChange,
    isVisible,
    setIsVisible,
    screenHeight,
    screenWidth,
    // setSampleingMode,
}: any) {

    return (

        <TouchableWithoutFeedback onPress={() => setIsVisible(false)} >
            <View style={styles.container}>
                {/* <Text style={styles.label}>{field.label}</Text> */}
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
                                        // setSampleingMode(()=>{
                                        //     if (val === "manual") {
                                        //         return false;
                                        //     }
                                        //     else{
                                        //         return true;
                                        //     }
                                        // })
                                        handleChange(field.name, val);
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
        </TouchableWithoutFeedback>
    );
};

export function SelectComponentBYState({
    field,
    isVisible,
    setIsVisible,
    screenHeight,
    screenWidth,
    value,
    setValue,
}: any) {
    const selectOutside = useRef(null);
    const handleCLickOutlide = (e) => {
        if (selectOutside.current && !selectOutside.current.contains(e.target)) {
            setIsVisible(false);
        }
    }
    useEffect(() => {
        document.addEventListener("mousedown", handleCLickOutlide);
        document.addEventListener("touchstart", handleCLickOutlide);
    }, [])
    return (<View>
        {/* <Text style={styles.label}>{field.label}</Text> */}
        <Text style={styles.selectLabel}
            onPress={() => setIsVisible(true)}
        >
            {value || `Select field`}
        </Text>
        <Modal
            visible={isVisible}
            animationType="slide"
            transparent
            ref={selectOutside}
        >
            <TouchableWithoutFeedback>
                <View style={styles.modalOverlay}>
                    <View
                        style={{
                            height: screenHeight * 0.3,
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
                                setValue(val);
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
                                color: '#ccc',
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


const styles = StyleSheet.create({
    container : {
     marginBottom :10,
    },
    selectLabel: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 13,
        borderRadius: 6,
        fontSize: 16,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
})

// rank sampling report form
// export const SelectComponent = ({
//     field,
//     formData,
//     handleChange,
//     isVisible,
//     setIsVisible,
//     screenHeight,
//     screenWidth
// }: any) => {
//     return (<View>
//         <Text style={styles.label}>{field.label}</Text>
//         <Text style={styles.selectLabel}
//             onPress={() => setIsVisible(true)}
//         >
//             {formData[field.name] || `Select field`}
//         </Text>

//         <Modal
//             visible={isVisible}
//             animationType="slide"
//             transparent
//         >
//             <TouchableWithoutFeedback>
//                 <View style={styles.modalOverlay}>
//                     <View
//                         style={{
//                             height: screenHeight * 0.5,
//                             backgroundColor: 'white',
//                             borderTopLeftRadius: 20,
//                             borderTopRightRadius: 20,
//                             paddingHorizontal: 12,
//                             paddingVertical: 10,
//                             rowGap: 10,
//                         }}
//                     >
//                         <Button
//                             style={{ width: screenWidth * 0.95 }}
//                             mode="contained-tonal"
//                             onPress={() => setIsVisible(false)}
//                         >
//                             Close
//                         </Button>
//                         <SelectList
//                             setSelected={(val: string) => {
//                                 handleChange(field.name, val);
//                                 setIsVisible(true);
//                             }}
//                             onSelect={() => {
//                                 setIsVisible(true);
//                             }}
//                             data={field.options}
//                             save="value"
//                             boxStyles={{
//                                 width: screenWidth * 0.95,
//                                 borderWidth: 0,
//                                 borderColor: 'transparent',
//                                 backgroundColor: '#f1f1f1',
//                                 borderRadius: 10,
//                             }}
//                             inputStyles={{
//                                 padding: 4,
//                                 fontSize: 16,
//                                 color: '#333',
//                             }}
//                             dropdownStyles={{
//                                 borderWidth: 0,
//                                 backgroundColor: '#f1f1f1',
//                                 elevation: 3,
//                                 width: screenWidth * 0.95
//                             }}
//                             closeicon={
//                                 <Ionicons
//                                     name="close-circle"
//                                     size={20}
//                                     color={'#999'}
//                                     style={{ marginLeft: 10 }}
//                                 />
//                             }
//                         />
//                     </View>
//                 </View>
//             </TouchableWithoutFeedback>
//         </Modal>
//     </View>
//     );
// };
