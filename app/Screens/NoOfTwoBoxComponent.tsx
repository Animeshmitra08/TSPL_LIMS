import React, { useEffect } from "react";
import { ScrollView, StyleSheet, TextInput, View } from "react-native";

export interface BoxData {
  bagNo: string;
  seal: string;
}

export default function NoOfTwoBoxComponent({
  number,
  boxes,
  setBoxes,
}: {
  number: number;
  boxes: BoxData[];
  setBoxes: (boxes: BoxData[]) => void;
}) {
  // Auto-fill logic (works for bagNo & seal)
  const handleAutoFill = (field: "bagNo" | "seal", text: string) => {
    const updatedBoxes = [...boxes];
    updatedBoxes[0][field] = text;

    const match = text.match(/^([A-Za-z]+)(\d+)$/);
    const numberOnlyMatch = text.match(/^(\d+)$/);

    if (match) {
      // Prefix + number (e.g., ABC1001)
      const prefix = match[1];
      const base = parseInt(match[2], 10);
      for (let i = 1; i < number; i++) {
        if (!updatedBoxes[i]) updatedBoxes[i] = { bagNo: "", seal: "" };
        updatedBoxes[i][field] = `${prefix}${base + i}`;
      }
    } else if (numberOnlyMatch) {
      const base = parseInt(numberOnlyMatch[1], 10);
      for (let i = 1; i < number; i++) {
        if (!updatedBoxes[i]) updatedBoxes[i] = { bagNo: "", seal: "" };
        updatedBoxes[i][field] = `${base + i}`;
      }
    } else {
      for (let i = 1; i < number; i++) {
        if (!updatedBoxes[i]) updatedBoxes[i] = { bagNo: "", seal: "" };
        updatedBoxes[i][field] = text;
      }
    }

    setBoxes(updatedBoxes);
  };

  useEffect(() => {
    let updated = [...boxes];
    
    if (number > boxes.length) {
      for (let i = boxes.length; i < number; i++) {
        updated.push({ bagNo: `${i + 1}`, seal: "" });
      }
    }

    setBoxes(updated);
  }, [number, boxes.length, setBoxes]);

  const handleChange = (
    index: number,
    field: "bagNo" | "seal",
    text: string
  ) => {
    const updatedBoxes = [...boxes];
    if (!updatedBoxes[index]) updatedBoxes[index] = { bagNo: "", seal: "" };
    updatedBoxes[index][field] = text;
    setBoxes(updatedBoxes);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {boxes.slice(0, number).map((box, index) => (
        <View key={index} style={styles.box}>
          <TextInput
            style={styles.input}
            placeholder="Bag No"
            value={box.bagNo}
            onChangeText={text =>
              index === 0
                ? handleAutoFill("bagNo", text)
                : handleChange(index, "bagNo", text)
            }
          />
          <TextInput
            style={styles.input}
            placeholder="Seal"
            value={box.seal}
            onChangeText={text =>
              index === 0
                ? handleAutoFill("seal", text)
                : handleChange(index, "seal", text)
            }
          />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 0,
  },
  box: {
    flexDirection: "row",
    gap: 10,
    margin: 3,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 7,
    borderRadius: 5,
  },
});