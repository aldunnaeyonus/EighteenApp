import React from "react";
import {
    View,
    Text,
    Dimensions,
    Image
  } from "react-native";
const { width: ScreenWidth } = Dimensions.get("window");
import { ActivityIndicator, MD2Colors } from "react-native-paper";

const Loading = (props) => {

  return (
    <View
    style={{
      display:props.flex == undefined ? "none" : props.flex == "none" ? 'none' : props.flex,
      margin:5,
      flex:1,
      height: 40,
      width: ScreenWidth,
      flexDirection:'row',
      alignContent:'center',
      alignItems:'center',
    }}
  >
    
     <Image
     blurRadius={3}
      style={{
        width: 40,
        height: 40,
        borderRadius:6
      }}
      defaultSource={{
        source: require("../../../../assets/adaptive-icon.png")
      }}

      source={{
        uri: props.image
      }}
    />
     <ActivityIndicator
            style={{marginLeft:15}}
            size={15}
            hidesWhenStopped={true}
            color={MD2Colors.orange900}
          />
    <Text 
     style={{
        marginLeft:15,
        fontWeight:'600',
        fontSize:15
      }}
    >{props.message}</Text>

    </View>
)
}
export default Loading;
