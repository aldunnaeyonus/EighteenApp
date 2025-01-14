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

  if (number.length > 1) {
    first = `numeric-${number[0]}`;
    second = `numeric-${number[1]}`;
  } else {
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
