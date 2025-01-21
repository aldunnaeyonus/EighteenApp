import React from "react";
import { View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const CreditsFont = (props) => {
  function splitNumberIntoDigits(number) {
    return number.toString().split("").map(Number);
  }
  let first = "";
  let second = "";

  const number = splitNumberIntoDigits(props.credits);

  if (parseInt(props.credits) < 0) {
    first = "numeric-0";
    second = "numeric-0";
  }else if (parseInt(props.credits) > 9) {
      first = `numeric-${number[0]}`;
      second = `numeric-${number[1]}`;
    }else if (parseInt(props.credits) < 10) {
      first = "numeric-0";
      second = `numeric-${number[0]}`;
  }


  return (
    <View
      style={{
        width: 30,
        flexDirection: "row",
        marginLeft: -6,
      }}
    >
      <>
        <MaterialCommunityIcons
          style={{
            marginRight: -8,
          }}
          name={first}
          size={30}
          color="white"
        />
        <MaterialCommunityIcons
          style={{
            marginLeft: -8,
          }}
          name={second}
          size={30}
          color="white"
        />
      </>
    </View>
  );
};
export default CreditsFont;
