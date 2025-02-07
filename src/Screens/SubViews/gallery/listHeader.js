import React from "react";
import { View, Text } from "react-native";
import Progress from "react-native-progress";
import FastImage from "react-native-fast-image";
import { createImageProgress } from "react-native-image-progress";
import { SCREEN_WIDTH } from "../../../utils/constants";

const Image = createImageProgress(FastImage);
constants
const GalleryHeader = (props) => {
  return (
    <View
      key={props}
      style={{
        height: 350,
        width: SCREEN_WIDTH,
      }}
    >
      <Image
        indicator={Progress}
        style={{
          width: SCREEN_WIDTH,
          height: 350,
        }}
        resizeMode={FastImage.resizeMode.cover}
        source={{
          priority: FastImage.priority.high,
          cache: FastImage.cacheControl.immutable,
          uri: props.image,
        }}
      />
      <View
        style={{
          position: "absolute",
          height: 60,
          backgroundColor: "rgba(0, 0, 0, 0.60)",
          width: SCREEN_WIDTH,
          bottom: 0,
        }}
      >
        <Text
          numberOfLines={2}
          style={{
            position: "absolute",
            color: "#fff",
            fontSize: 20,
            left: 20,
            bottom: 30,
            fontWeight: "bold",
            width: SCREEN_WIDTH,
          }}
        >
          {props.title.toUpperCase()}
        </Text>
        <Text
          numberOfLines={2}
          style={{
            position: "absolute",
            color: "#fff",
            fontSize: 15,
            bottom: 7,
            left: 20,
            width: SCREEN_WIDTH,
          }}
        >
          {props.endEventTime}
        </Text>
      </View>
    </View>
  );
};

export default GalleryHeader;
