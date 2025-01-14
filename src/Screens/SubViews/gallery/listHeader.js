import React from "react";
import { View, Text, Dimensions } from "react-native";
import Progress from "react-native-progress";
const { width } = Dimensions.get("window");
import FastImage from "react-native-fast-image";
import { createImageProgress } from "react-native-image-progress";
const Image = createImageProgress(FastImage);

const GalleryHeader = (props) => {
  return (
    <View
      key={props}
      style={{
        height: 350,
        width: width,
      }}
    >
      <Image
        indicator={Progress}
        style={{
          width: width,
          height: 351,
        }}
        resizeMode={FastImage.resizeMode.cover}
        source={{
          priority: FastImage.priority.normal,
          uri: props.image,
        }}
      />
      <View
        style={{
          position: "absolute",
          height: 60,
          backgroundColor: "rgba(0, 0, 0, 0.60)",
          width: width,
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
            width: width,
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
            width: width,
          }}
        >
          {props.endEventTime}
        </Text>
      </View>
    </View>
  );
};

export default GalleryHeader;
