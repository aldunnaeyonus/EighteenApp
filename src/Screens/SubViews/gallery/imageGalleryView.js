import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { createImageProgress } from "react-native-image-progress";
import FastImage from "react-native-fast-image";
const Image = createImageProgress(FastImage);
import Progress from "react-native-progress";
import Zoom from "react-native-zoom-reanimated";
import CachedVideoPlayer from "../camera/CachedVideoPlayer";
import { SCREEN_WIDTH, SCREEN_HEIGHT } from "../../../utils/constants";

const ImageGalleryView = (props) => {
  const [videoPlayPause] = useState(true);
  const [videoPlayMute] = useState(true);

  return props.item.type == "video" ? (
    <View
      style={{
        flex: 1,
        height: SCREEN_HEIGHT,
        width: SCREEN_WIDTH,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "transparent",
      }}
    >
      <CachedVideoPlayer
        url={props.item.uri2}
        fileName={String(props.item.uri2).split("/").pop()}
        videoPlayPause={videoPlayPause}
        videoPlayMute={videoPlayMute}
      />
      <View
        style={{
          backgroundColor: "transparent",
          position: "absolute",
          top: 0,
          height: 60,
          marginTop: 30,
          width: SCREEN_WIDTH,
          flexDirection: "row",
        }}
      >
        <Image
          indicator={Progress}
          style={{
            width: 30,
            height: 30,
            borderRadius: 25,
            marginTop: 10,
            marginLeft: 10,
            borderWidth: 0.5,
            alignSelf: "auto",
            overflow: "hidden",
            backgroundColor: "transparent",
          }}
          showSpinner={true}
          spinnerColor={"rgba(0, 0, 0, 1.0)"}
          source={{
            priority: FastImage.priority.high,
            cache: FastImage.cacheControl.immutable,
            uri: props.item.icon,
          }}
        />

        <Text
          numberOfLines={1}
          style={{
            color: "white",
            backgroundColor: "transparent",
            fontSize: 15,
            marginLeft: 10,
            fontWeight: "bold",
            marginTop: 15,
          }}
        >
          {props.item.userName}
        </Text>
      </View>
    </View>
  ) : (
    <View
      style={{
        flex: 1,
        height: SCREEN_HEIGHT,
        width: SCREEN_WIDTH,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "transparent",
      }}
    >
      <View
        style={{
          backgroundColor: "transparent",
          position: "absolute",
          top: 0,
          zIndex: 2,
          height: 60,
          top: 60,
          left:10,
          width: SCREEN_WIDTH,
          flexDirection: "row",
          opacity: 0.9,
        }}
      >
        <View
          style={{
            borderWidth: 1.5,
            borderRadius: 17,
            borderBottomColor:
              props.item.isPro == "1" ? "rgba(116, 198, 190, 1)" : "#ea5504",
            borderTopColor: props.item.isPro == "1" ? "#ea5504" : "#ea5504",
            borderRightColor:
              props.item.isPro == "1" ? "rgba(250, 190, 0, 1)" : "#ea5504",
            borderLeftColor: props.item.isPro == "1" ? "#3D4849" : "#ea5504",
            width: 35,
            height: 35,
            backgroundColor: "white",
            alignContent: "center",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Image
            indicator={Progress}
            style={{
              width: 30,
              borderWidth: 0.7,
              borderColor: "white",
              height: 30,
              borderRadius: 15,
              overflow: "hidden",
            }}
            showSpinner={true}
            spinnerColor={"rgba(0, 0, 0, 1.0)"}
            resizeMode={FastImage.resizeMode.cover}
            source={{
              priority: FastImage.priority.high,
              cache: FastImage.cacheControl.immutable,
              uri: props.item.icon,
            }}
          />
        </View>
        <Text
          numberOfLines={1}
          style={{
            color: "white",
            backgroundColor: "transparent",
            fontSize: 15,
            marginLeft: 10,
            fontWeight: "bold",
            marginTop: 10,
          }}
        >
          {props.item.userName}
        </Text>
      </View>
      <Zoom
        doubleTapConfig={{
          defaultScale: 5,
          minZoomScale: 1,
          maxZoomScale: 10,
        }}
      >
        <Image
          indicator={Progress}
          style={{ marginTop: 0, height: SCREEN_HEIGHT, width: SCREEN_WIDTH }}
          resizeMode={FastImage.resizeMode.contain}
          source={{
            priority: FastImage.priority.high,
            cache: FastImage.cacheControl.immutable,
            uri: props.item.uri,
          }}
        ></Image>
      </Zoom>
    </View>
  );
};
export default ImageGalleryView;
