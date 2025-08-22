import { Ionicons } from "@expo/vector-icons";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
  ActivityIndicator,
} from "react-native";
import { SelectList } from "react-native-dropdown-select-list";
import { Button } from "react-native-paper";
import React, { useState } from "react";

export function SelectComponentBYFORM({
  field,
  formData,
  handleChange,
  isVisible,
  setIsVisible,
  screenHeight,
  screenWidth,
  dataList,
  onOpen,
}: any) {
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState([]);

  const openDropdown = async () => {
    setLoading(true);
    setIsVisible(true);

    if (onOpen) {
      const fetchedData = await onOpen();
      setOptions(fetchedData ?? []);
    }

    setTimeout(() => {
      setLoading(false);
    }, 300);
  };


  return (
    <View style={styles.container}>
      {formData[field.name] !== field.label && <Text>{field.label}</Text>}

      <Text style={styles.selectLabel} onPress={openDropdown}>
        {formData[field.name] || `Select field`}
      </Text>

      <Modal visible={isVisible} animationType="slide" transparent>
        {/* This overlay closes modal when tapping outside */}
        <TouchableWithoutFeedback onPress={() => setIsVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View
                style={{
                  height: screenHeight * 0.5,
                  backgroundColor: "white",
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
                >
                  Close
                </Button>

                {loading ? (
                  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <ActivityIndicator animating={true} size="large" />
                    <Text style={{ marginTop: 10 }}>Loading...</Text>
                  </View>
                ) : (
                  <SelectList
                    setSelected={(val: string) => {
                      handleChange(field.name, val);
                      setIsVisible(false);
                    }}
                    data={dataList ?? []}
                    save="value"
                    boxStyles={{
                      borderWidth: 0,
                      backgroundColor: "#f1f1f1",
                      borderRadius: 10,
                    }}
                    inputStyles={{
                      fontSize: 16,
                      color: "#333",
                    }}
                    dropdownStyles={{
                      backgroundColor: "#f1f1f1",
                      elevation: 3,
                    }}
                  />
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  selectLabel: {
    borderWidth: 1,
    borderColor: "black",
    padding: 13,
    borderRadius: 3,
    fontSize: 16,
    opacity: 0.7,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
});