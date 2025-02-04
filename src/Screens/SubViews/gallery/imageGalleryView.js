import React, {useState} from "react";
import { Dimensions, View, Text } from "react-native";
import { createImageProgress } from "react-native-image-progress";
import FastImage from "react-native-fast-image";
const Image = createImageProgress(FastImage);
import Progress from "react-native-progress";
const { width, height } = Dimensions.get("screen");
import Zoom from "react-native-zoom-reanimated";
import CachedVideoPlayer from '../camera/CachedVideoPlayer';

const ImageGalleryView = (props) => {
    const [videoPlayPause] = useState(true);
    const [videoPlayMute] = useState(true);
   
    return (
    props.item.type == "video" ? (
        <View
          style={{
            flex: 1,
            height: '100%',
            width: width,
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
              height: 60,
              marginTop: 30,
              width: width,
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
            {props.item.isPro == "1" && (
              <View style={{ position: "absolute" }}>
                <View
                  style={{
                    marginTop: 42,
                    marginLeft: 35,
                    backgroundColor: "transparent",
                    width: 20,
                    height: 20,
                    justifyContent: "center",
                  }}
                >
                  <FastImage
                    style={{
                      marginLeft: -5,
                      marginTop: -30,
                      width: 10,
                      height: 10,
                    }}
                    resizeMode={FastImage.resizeMode.contain}
                    source={require("../../../../assets/verified.png")}
                  />
                </View>
              </View>
            )}
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
              <CachedVideoPlayer
                url={props.item.uri}
                height={height}
                width={width}
                fileName={String(props.item.uri).split("/").pop()}
                videoPlayPause={videoPlayPause}
                videoPlayMute={videoPlayMute}
              />
        </View>
      ) : (
        <View
          style={{
            flex: 1,
            height: '100%',
            width: width,
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
              marginTop: 30,
              width: width,
              flexDirection: "row",
              opacity: 0.9,
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
            {props.item.isPro == "1" && (
              <View style={{ position: "absolute" }}>
                <View
                  style={{
                    marginTop: 62,
                    marginLeft: 35,
                    backgroundColor: "transparent",
                    width: 20,
                    height: 20,
                    justifyContent: "center",
                  }}
                >
                  <FastImage
                    style={{
                      marginLeft: -5,
                      marginTop: -70,
                      width: 10,
                      height: 10,
                    }}
                    resizeMode={FastImage.resizeMode.contain}
                    source={require("../../../../assets/verified.png")}
                  />
                </View>
              </View>
            )}
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
          <Zoom
            doubleTapConfig={{
              defaultScale: 5,
              minZoomScale: 1,
              maxZoomScale: 10,
            }}
          >
            <Image
              indicator={Progress}
              style={{ marginTop: 0, height: height, width: width }}
              resizeMode={FastImage.resizeMode.contain}
              source={{
                priority: FastImage.priority.high,
                cache: FastImage.cacheControl.immutable,
                uri: props.item.uri,
              }}
            ></Image>
          </Zoom>
        </View>
      )
)
};
export default ImageGalleryView;
