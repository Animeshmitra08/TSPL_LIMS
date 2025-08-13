import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';

interface BoxData {
  bagNo: string;
  value: string;
  isEditable: boolean;
}

export default function NoOfTwoBoxComponent({ number , bagsCollected }: { number: number, bagsCollected?:any }) {
  const [boxes, setBoxes] = useState<BoxData[]>([]);

  useEffect(() => {
    // Initialize box states
    const initialData: BoxData[] = Array.from({ length: number }, (_, index) => ({
      bagNo: '',
      value: '',
      isEditable: index === 0,
    }));
    setBoxes(initialData);
  }, [number]);

  const handleFirstBagNoChange = (text: string) => {
  const updatedBoxes = [...boxes];
  updatedBoxes[0].bagNo = text;

  // Auto-fill other bagNos
  const match = text.match(/^([A-Za-z]+)(\d+)$/); // letters + numbers
  if (match) {
    const prefix = match[1];
    const base = parseInt(match[2], 10);

    for (let i = 1; i < number; i++) {
      updatedBoxes[i].bagNo = `${prefix}${base + i}`;
      updatedBoxes[i].isEditable = true;
    }
  } else {
    // If pattern doesn't match, clear rest
    for (let i = 1; i < number; i++) {
      updatedBoxes[i].bagNo = '';
      updatedBoxes[i].isEditable = false;
    }
  }

  setBoxes(updatedBoxes);
};


  const handleValueChange = (index: number, text: string) => {
    const updatedBoxes = [...boxes];
    updatedBoxes[index].value = text;
    setBoxes(updatedBoxes);
  };

  const handleSubmit = () => {
    console.log("Submitted Data:", boxes);
    bagsCollected(boxes);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {boxes.map((box, index) => (
        <View key={index} style={styles.box}>
          <TextInput
            style={[styles.input, { backgroundColor: index === 0 ? '#fff' : '#eee' }]}
            placeholder="Bag No"
            value={box.bagNo}
            editable={index === 0}
            onChangeText={text => handleFirstBagNoChange(text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Value"
            value={box.value}
            editable={box.isEditable}
            onChangeText={text => handleValueChange(index, text)}
          />
        </View>
      ))}

      {/* <Button title="Submit" onPress={handleSubmit} /> */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    // padding: 20,
  },
  box: {
    flexDirection: 'row',
    // marginBottom: 10,
    gap: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 7,
    borderRadius: 5,
  },
});
