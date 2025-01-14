import React from "react";
import { View, Text, Platform} from "react-native";


const CameraLensFriend = (props) => {
return (
    <View
              style={{
                position: "absolute",
                opacity: 0.6,
                top: Platform.OS == 'ios' ? -45: -50,
                right: Platform.OS == 'ios' ? -3: -4,
                height: 50,
                flexDirection: "row",
                width: 45,
                backgroundColor: "hsl(200, 8%, 94%)",
                borderRadius: 15,
                alignItems: "center",
                justifyContent: "center",
                borderColor: "#e35504",
              }}
            >
              <Text
                style={{
                  right: -24,
                  top: -15,
                  fontSize: 12,
                  fontWeight: 300,
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
                  fontWeight: 700,
                  color: "#3D4849",
                }}
              >
                {props.credits}
              </Text>
              <Text
                style={{
                  right:8,
                  top: 15,
                  fontSize: 12,
                  fontWeight: 300,
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
export default CameraLensFriend;
