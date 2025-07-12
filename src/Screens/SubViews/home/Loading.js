import React from "react";
import { View, Text } from "react-native";
import { ActivityIndicator, MD2Colors } from "react-native-paper";
import * as Progress from 'react-native-progress';
import { SCREEN_WIDTH } from "../../../utils/constants";

const Loading = (props) => {

  return (

    <View
      style={{
        display: props.flex == "flex" ? "flex" : "none",
        margin: 5,
        flex: 1,
        height: "auto",
        borderRadius: 6,
        overflow: "hidden",
        width: SCREEN_WIDTH - 10,
        flexDirection: "row",
        alignContent: "center",
        alignItems: "center",
      }}
    >
        <Progress.Bar progress={Number(props.progress)} width={SCREEN_WIDTH - 10} height={5}  style={{position:'absolute', bottom: 2}} color={MD2Colors.orange500}/>

     
      <ActivityIndicator
        style={{ marginLeft: 15, position:'absolute', left:-7, top:15 }}
        size={25}
        animating={true}
        color={MD2Colors.grey700}
      />
      <Text
        style={{
          marginBottom:15,
          marginLeft: 55,
          fontWeight: "600",
          width: SCREEN_WIDTH - 100,
          fontSize: 15,
        }}
      >
        The media is being processed to the event gallery. Navigating around the app will not stop the upload. 
      </Text>
    </View>
  );
};
export default Loading;
