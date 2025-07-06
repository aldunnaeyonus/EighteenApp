import React from "react";
import { View } from "react-native";
import { Icon } from "react-native-elements";

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
        alignSelf: "flex-end",
        width: 40,
        paddingTop: 5,
        alignItems: "center",
        justifyContent: "center",
        height: 60,
        marginRight: 5,
        paddingBottom:10,
        backgroundColor: "rgba(0, 0, 0, 0.60)",
        flexDirection: "row",
      }}
    >
      <Icon
        type="material-community"
        containerStyle={{
          marginRight: -15,
          paddingTop:5,
        }}
        name={first}
        size={30}
        color="white"
      />
      <Icon type="material-community" name={second} size={30} color="white"  containerStyle={{
          paddingTop:5,
        }}/>
    </View>
  );
};
export default CreditsFont;
