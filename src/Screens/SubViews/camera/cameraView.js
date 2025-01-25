import React from "react";
import { View, Text} from "react-native";


const CameraLens = (props) => {
return (
    <View
              style={{
                opacity: 0.7,
                height: 60,
                marginLeft:30,
                flexDirection: "column",
                width: 75,
                borderColor:'lightgrey',
                borderWidth:0.5,
                backgroundColor: "hsl(200, 8%, 94%)",
                borderRadius: 15,
                alignItems: "center",
                justifyContent: "center",
              }}
            >

              <Text
                style={{
                  fontSize: 23,
                  fontWeight: '700',
                  textAlign:'center',
                  color: "#3D4849",
                }}
              >
                {props.credits}
              </Text>
              <Text
                style={{
                  fontSize: 10,
                  marginTop:5,
                  fontWeight: '700',
                  textAlign:'center',
                  color: "#3D4849",
                }}
              >
                Shots Left
              </Text>
            </View>
);
}
export default CameraLens;
