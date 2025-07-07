import React from "react";
import { TouchableOpacity, View } from "react-native";
import FastImage from "react-native-fast-image";
import { createImageProgress } from "react-native-image-progress";
const Image = createImageProgress(FastImage);
import Progress from "react-native-progress";
import { Icon } from "react-native-elements";
import { SCREEN_WIDTH } from "../../../utils/constants";

const ImageGallery = (props) => {
  return (
    <TouchableOpacity
      onPress={() => {
        props.showModalFunction(props.item.index);
      }}
    >
      <Image
        indicator={Progress}
        key={props.index}
        source={{
          cache: FastImage.cacheControl.immutable,
          priority: FastImage.priority.high,
          uri:
            props.item.item.type == "video"
              ? props.item.item.videoThumbnail
              : props.item.item.thumbnail,
        }}
        resizeMode={FastImage.resizeMode.cover}
        style={{
          backgroundColor: "#f2f2f2",
          borderColor: "#fff",
          borderWidth: 0.5,
          height: SCREEN_WIDTH / 4.0,
          width: SCREEN_WIDTH / 4.0,
        }}
      />
      {props.item.item.type == "video" && (
        <Icon
          type="material-community"
          name="play-box-outline"
          size={25}
          containerStyle={{
            position: "absolute",
            width: 50,
            height: 50,
            bottom: -25,
            left: -10,
          }}
          color="white"
        />
      )}
      {props.item.item.comments > 0 && (
      <Icon
        name={"comment-outline"}
        type="material-community"
        size={22}
        containerStyle={{
          position: "absolute",
          width: 50,
          height: 50,
          bottom: -27,
          right: -10,
        }}
        color="white"
      />
            )}
    </TouchableOpacity>
  );
};

export default ImageGallery;
