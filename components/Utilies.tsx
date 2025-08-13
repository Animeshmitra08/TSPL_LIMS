import DateTimeComponent from "@/components/DateTimeSelect";
import { SelectComponentBYState } from "@/components/SelectComponent";
import { useState } from "react";
import { Dimensions, Text, View } from "react-native";

export default function HowTOUseAnyCustomComponet() {

  const [date, setDate] = useState<any>();
  console.log(date, "final Date");
  const [selectVal, setSelectVal] = useState("");
  const field = {
    name: "Select Data",
    label: "Select demo",
    options: [
      "date1", "date2", "date3"
    ]
  }
  const [open, setOpen] = useState(true);
  const width = Dimensions.get("window").width;
  const height = Dimensions.get("window").height;
  console.log(selectVal, "select value");
  return (
    <View>
      <Text>
        It is a Setting Page
        <DateTimeComponent label={"Select date & time"} date={date} setDate={setDate} mode="outlined" style={{marginTop : 2}} />
      </Text>

      <SelectComponentBYState
        field={field}
        isVisible={open}
        setIsVisible={setOpen}
        screenHeight={height}
        screenWidth={width}
        value={selectVal}
        setValue={setSelectVal}
      />

    </View>
  )
}