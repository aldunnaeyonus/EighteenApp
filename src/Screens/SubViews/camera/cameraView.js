import React from "react";
import { View, Text} from "react-native";


const CameraLens = (props) => {
return (
    <View
              style={{
                position: "absolute",
                opacity: 0.7,
                top: 5,
                right: 5,
                height: 50,
                flexDirection: "row",
                width: 45,
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
                  right: -24,
                  top: -15,
                  fontSize: 12,
                  fontWeight: '300',
                  color: "#3D4849",
                }}
              >
                {parseInt(props.credits) == 0
                  ? "--"
                  : parseInt(props.credits) - 1}
              </Text>
              <Text
                style={{
                  right: 7,
                  fontSize: 17,
                  fontWeight: '700',
                  color: "#3D4849",
                }}
              >
                {props.credits}
              </Text>
              <Text
                style={{
                  right:5,
                  top: 15,
                  fontSize: 12,
                  fontWeight: '300',
                  color: "#3D4849",
                }}
              >
                {parseInt(props.credits) ==
                parseInt(props.tCredits)
                  ? "0"
                  : parseInt(props.credits) + 1}
              </Text>
            </View>
);
}
export default CameraLens;
