import React from "react";
import { TouchableOpacity } from "react-native";
import FastImage from "react-native-fast-image";
import { createImageProgress } from "react-native-image-progress";
const Image = createImageProgress(FastImage);
import Progress from "react-native-progress";
import { Icon } from "react-native-elements";
import { SCREEN_WIDTH } from "../../../utils/constants";

const ImageGallery = (props) => {
  return (
    <TouchableOpacity
      activeOpacity={0.5}
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
          borderWidth: 1.0,
          height: SCREEN_WIDTH / 4.0,
          width: SCREEN_WIDTH / 4.0,
        }}
      >
        {props.item.item.type === "video" && (
          <Icon
            type="material-community"
            name="play-box-outline"
            size={20}
            containerStyle={{
              width: 50,
              height: 50,
              top: 5,
              right: 10,
            }}
            color="white"
          />
        )}
      </Image>
    </TouchableOpacity>
  );
};

export default ImageGallery;
