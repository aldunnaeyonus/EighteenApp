import React from "react";
import { Dimensions, View, Text } from "react-native";
import FastImage from "react-native-fast-image";
import { createImageProgress } from "react-native-image-progress";
const Image = createImageProgress(FastImage);
import Progress from "react-native-progress";
const { width } = Dimensions.get("window");
import * as i18n from "../../../../i18n";

const ProHeader = (props) => {
  return (
    <View
      key={props}
      style={{
        height: 400,
        width: width,
      }}
    >
      <Image
        indicator={Progress}
        key={"1"}
        source={require("../../../../assets/decour.jpeg")}
        style={{
          height: 400,
          width: width,
          backgroundColor: "#f2f2f2",
          overflow: "hidden",
          borderBottomLeftRadius: 30,
          borderBottomRightRadius: 30,
        }}
      ></Image>
      <View
        style={{
          position: "absolute",
          height: 60,
          backgroundColor: "rgba(0, 0, 0, 0.30)",
          width: width,
          bottom: 0,
          borderBottomLeftRadius: 30,
          borderBottomRightRadius: 30,
        }}
      >
        <Text
          numberOfLines={2}
          style={{
            position: "absolute",
            textAlign: "center",
            color: "#fff",
            fontSize: 25,
            bottom: 30,
            fontWeight: "bold",
            width: width,
          }}
        >
          {i18n.t("GoPro")}
        </Text>
        <Text
          numberOfLines={2}
          style={{
            position: "absolute",
            textAlign: "center",
            color: "#fff",
            fontSize: 16,
            fontWeight: "bold",
            bottom: 10,
            width: width,
          }}
        >
          {i18n.t("Unshakle your creative spirit")}
        </Text>
      </View>
    </View>
  );
};

export default ProHeader;
