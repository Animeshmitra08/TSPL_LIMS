import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';

export interface BoxData {
  bagNo: string;
  seal: string;
  isEditable: boolean;
}

export default function NoOfTwoBoxComponent({ number ,
 boxes, setBoxes }:any
  ) {
 

  useEffect(() => {
    // Initialize box states
    const initialData: BoxData[] = Array.from({ length: number }, (_, index) => ({
      bagNo: '',
      seal: '',
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
    updatedBoxes[index].seal = text;
    setBoxes(updatedBoxes);
  };

  const handleSubmit = () => {             
    console.log("Submitted Data:", boxes);
  };

  return (
    <ScrollView contentContainerStyle={[styles.container,{
      paddingBottom : 0
    }]}>
      {boxes.map((box:any, index:any) => (
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
            value={box.seal}
            editable={box.isEditable}
            onChangeText={text => handleValueChange(index, text)}
          />
        </View>
      ))}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    // padding: 20,
    // marginTop : 2,
    // marginBottom : -12
    paddingBottom : 0
  },
  box: {
    flexDirection: 'row',
    marginBottom: 10,
    gap: 10,
    // margin : 3,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 7,
    borderRadius: 5,
  },
});
