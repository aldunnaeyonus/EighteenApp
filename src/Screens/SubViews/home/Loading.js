import React, { useRef } from "react";
import { View, Text } from "react-native";
import { ActivityIndicator, MD2Colors } from "react-native-paper";
import FastImage from "react-native-fast-image";
import { createImageProgress } from "react-native-image-progress";
const Image = createImageProgress(FastImage);
import * as Progress from 'react-native-progress';
import Video from "react-native-video";
import { SCREEN_WIDTH } from "../../../utils/constants";

const Loading = (props) => {
  const video = useRef();
  const photo = useRef();
  const mime = String(props.image).split(".").pop().toLowerCase();


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
        <Progress.Bar progress={props.progress} width={SCREEN_WIDTH - 10} height={5}  style={{position:'absolute', bottom: 2}} color={MD2Colors.orange900}/>

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
            borderRadius: 2,
            overflow: "hidden",
            marginBottom:9
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
        style={{ marginLeft: 15, position:'absolute', left:-7, top:15 }}
        size={25}
        hidesWhenStopped={true}
        color={MD2Colors.grey700}
      />
      <Text
        style={{
          marginBottom:15,
          marginLeft: 15,
          fontWeight: "600",
          width: SCREEN_WIDTH - 100,
          fontSize: 15,
        }}
      >
        The media is being processed to the event gallery. Navigating around the app will not stop the upload. 
      </Text>
    </View>
  );
};
export default Loading;
