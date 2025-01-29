import React, {useRef,useState} from "react";
import { Dimensions, View, Text } from "react-native";
import { createImageProgress } from "react-native-image-progress";
import FastImage from "react-native-fast-image";
const Image = createImageProgress(FastImage);
import Progress from "react-native-progress";
const { width, height } = Dimensions.get("window");
import Zoom from "react-native-zoom-reanimated";
import Video from "react-native-video";
import VisibilitySensor from "@svanboxel/visibility-sensor-react-native";
import CachedVideoPlayer from '../camera/CachedVideoPlayer';

const ImageGalleryView = (props) => {
    const video = useRef();
    const [videoPlayPause, setVideoPlayPause] = useState(true);
    const [videoPlayMute] = useState(true);

  return (
    props.item.item.type == "video" ? (
        <View
          style={{
            flex: 1,
            height: "100%",
            width: "100%",
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
            }}
          >
            <Image
              indicator={Progress}
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                marginTop: 30,
                marginLeft: 2,
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
                uri: props.item.item.icon,
              }}
            />
            {props.item.item.isPro == "1" && (
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
                      marginLeft: 4,
                      marginTop: 1,
                      width: 17,
                      height: 17,
                      textAlignVertical: "center",
                      textAlignVertical: "center",
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
                fontSize: 20,
                marginLeft: 10,
                fontWeight: "bold",
                marginTop: 40,
              }}
            >
              {props.item.item.userName}
            </Text>
          </View>
          <VisibilitySensor
            style={{
              flex: 1,
              backgroundColor: "transparent",
            }}
            onChange={(isVisible) => {
              return isVisible
                ? setVideoPlayPause(true)
                : setVideoPlayPause(true);
            }}
          >
              <CachedVideoPlayer
                url={props.item.item.uri}
                fileName={String(props.item.item.uri).split("/").pop()}
              />
          </VisibilitySensor>
        </View>
      ) : (
        <View
          style={{
            flex: 1,
            height: "100%",
            width: "100%",
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
                width: 50,
                height: 50,
                borderRadius: 25,
                marginTop: 30,
                marginLeft: 2,
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
                uri: props.item.item.icon,
              }}
            />
            {props.item.item.isPro == "1" && (
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
                      marginLeft: 4,
                      marginTop: 1,
                      width: 17,
                      height: 17,
                      textAlignVertical: "center",
                      textAlignVertical: "center",
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
                fontSize: 20,
                marginLeft: 10,
                fontWeight: "bold",
                marginTop: 40,
              }}
            >
              {props.item.item.userName}
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
              ref={(component) => (mediaPlayer = component)}
              style={{ marginTop: 0, height: height, width: width }}
              resizeMode={FastImage.resizeMode.contain}
              source={{
                priority: FastImage.priority.high,
                cache: FastImage.cacheControl.immutable,
                uri: props.item.item.uri,
              }}
            ></Image>
          </Zoom>
        </View>
      )
)
};
export default ImageGalleryView;
