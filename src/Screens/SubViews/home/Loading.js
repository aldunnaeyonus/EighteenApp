import React, { useRef, useEffect, useState } from "react";
import { View, Text } from "react-native";
import { ActivityIndicator, MD2Colors } from "react-native-paper";
import FastImage from "react-native-fast-image";
import { createImageProgress } from "react-native-image-progress";
const Image = createImageProgress(FastImage);
import Progress from "react-native-progress";
import Video from "react-native-video";
import { SCREEN_WIDTH } from "../../../utils/constants";
import * as i18n from "../../../../i18n";

const Loading = (props) => {
  const video = useRef();
  const photo = useRef();
  const mime = String(props.image).split(".").pop().toLowerCase();
  const [displayText, setDisplayText] = useState("");
  const [displayTextLong] = useState(props.message);
  const [displayTextSort] = useState(i18n.t("LongWaitTime"));

  useEffect(() => {
    setDisplayText(displayTextLong);
    if (props.flex != "none") {
    setTimeout(() => {
      setDisplayText(displayTextSort);
    }, 15000);
    setTimeout(() => {
      setDisplayText(displayTextLong);
    }, 35000);
  }
  }, [props.flex]);

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
      {mime == "mov" || mime == "mpeg" || mime == "mp4" || mime == "m4v"? (
        <Video
          fullscreen={false}
          fullscreenAutorotate={false}
          ignoreSilentSwitch="obey"
          showNotificationControls={false}
          playWhenInactive={false}
          playInBackground={false}
          ref={video}
          controls={false}
          repeat={false}
          muted={true}
          resizeMode={"cover"}
          paused={true}
          style={{
            borderRadius: 6,
            overflow: "hidden",
            height: 40,
            width: 40,
          }}
          source={{
            cache: FastImage.cacheControl.immutable,
            priority: FastImage.priority.high,
            uri: props.image,
          }}
        />
      ) : (
        <Image
          ref={photo}
          style={{
            width: 40,
            height: 40,
            borderRadius: 6,
            overflow: "hidden",
          }}
          indicator={Progress}
          source={{
            cache: FastImage.cacheControl.immutable,
            priority: FastImage.priority.high,
            uri: props.image,
          }}
        />
      )}
      <ActivityIndicator
        style={{ marginLeft: 15 }}
        size={15}
        hidesWhenStopped={true}
        color={MD2Colors.orange900}
      />
      <Text
        style={{
          marginLeft: 15,
          fontWeight: "600",
          width: SCREEN_WIDTH - 100,
          fontSize: 15,
        }}
      >
        {displayText}
      </Text>
    </View>
  );
};
export default Loading;
