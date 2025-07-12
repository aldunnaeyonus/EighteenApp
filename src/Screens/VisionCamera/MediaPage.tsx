import React, { useCallback, useMemo, useState } from "react";
import type { ImageLoadEventData, NativeSyntheticEvent } from "react-native";
import {
  StyleSheet,
  View,
  PermissionsAndroid,
  Platform,
  Image,
  StatusBar
} from "react-native";
import type { OnVideoErrorData, OnLoadData } from "react-native-video";
import Video from "react-native-video";
import { constants, SCREEN_WIDTH, SCREEN_HEIGHT } from "../../utils/constants";
import { useIsForeground } from "./hooks/useIsForeground";
import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import { useIsFocused } from "@react-navigation/core";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import momentDurationFormatSetup from "moment-duration-format";
import moment from "moment/min/moment-with-locales";
import FormData from "form-data";
import { ActivityIndicator } from "react-native-paper";
import axios from "axios";
import { axiosPull } from "../../utils/axiosPull";
import * as i18n from "../../../i18n";
import { useFocusEffect } from "@react-navigation/native";
import { storage, updateItemFeed } from "../../context/components/Storage";
import { useMMKVObject } from "react-native-mmkv";

const requestSavePermission = async (): Promise<boolean> => {
  if (Platform.OS !== "android" || Platform.Version >= 33) return true;

  const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;
  if (permission == null) return false;
  let hasPermission = await PermissionsAndroid.check(permission);
  if (!hasPermission) {
    const permissionRequestResult =
      await PermissionsAndroid.request(permission);
    hasPermission = permissionRequestResult === "granted";
  }
  return hasPermission;
};

type OnLoadImage = NativeSyntheticEvent<ImageLoadEventData>;
const isVideoOnLoadEvent = (
  event: OnLoadData | OnLoadImage
): event is OnLoadData => "duration" in event && "naturalSize" in event;

const MediaPage = (props: {
  route: {
    params: {
      path: any;
      type: any;
      title: any;
      start: any;
      end: any;
      user: any;
      owner: any;
      pin: any;
      UUID: any;
      unsubscribe: any;
      credits: any;
    };
  };
  navigation: any;
}) => {
  const { path, type } = props.route.params;
  const [hasMediaLoaded, setHasMediaLoaded] = useState(false);
  const isForeground = useIsForeground();
  const isScreenFocused = useIsFocused();
  const isVideoPaused = !isForeground || !isScreenFocused;
  momentDurationFormatSetup(moment);
  const [animating, setAnimating] = useState(false);
  const [uploading] = useMMKVObject("uploadData", storage);
  const [credits, setCredits] = useState(props.route.params.credits);
  const onMediaLoad = useCallback((event: OnLoadData | OnLoadImage) => {
    if (isVideoOnLoadEvent(event)) {
      console.log(
        `Video loaded. Size: ${event.naturalSize.width}x${event.naturalSize.height} (${event.naturalSize.orientation}, ${event.duration} seconds)`
      );
    } else {
      const source = event.nativeEvent.source;
      console.log(`Image loaded. Size: ${source.width}x${source.height}`);
    }
  }, []);
  const [cameraData] = useMMKVObject(
    `user.Camera.Friend.Feed.${props.route.params.owner}`,
    storage
  );
  const onMediaLoadEnd = useCallback(() => {
    console.log("media has loaded.");
    setHasMediaLoaded(true);
  }, []);
  const onMediaLoadError = useCallback((error: OnVideoErrorData) => {
    console.error(`failed to load media: ${JSON.stringify(error)}`);
  }, []);

  const source = useMemo(() => ({ uri: `file://${path}` }), [path]);
  const screenStyle = useMemo(
    () => ({ opacity: hasMediaLoaded ? 1 : 0 }),
    [hasMediaLoaded]
  );

  useFocusEffect(
    useCallback(() => {
      props.navigation.setOptions({
        title: props.route.params.title.toUpperCase(),
      });
      requestSavePermission();
    }, [props])
  );

  const createEvent = () => {
    setAnimating(true);
    var formData = new FormData();
    formData.append("pin", props.route.params.pin);
    formData.append("owner", props.route.params.owner);
    formData.append("user", props.route.params.user);
    formData.append("id", props.route.params.UUID);
    formData.append("count", "1");
    formData.append("device", Platform.OS);
    formData.append("camera", "1");
    formData.append("file[]", {
      name:
        "SNAP18-camera-" +
        props.route.params.pin +
        "-" +
        moment().unix() +
        "-" +
        source.uri.split("/").pop(),
      type: constants.mimes(source.uri.split(".").pop()), // set MIME type
      uri: source.uri,
    });

    const postConclusion = async () => {
            storage.set("uploadData", JSON.stringify({"message": i18n.t("Uploading") + " " + i18n.t("PleaseWait"), "display":"flex", "image":source.uri, progress:""}));
      await axios({
        method: "POST",
        url: constants.url + "/camera/upload.php",
        data: formData,
        headers: {
          Accept: "application/json",
          "content-Type": "multipart/form-data",
        },
      }).then(async (res) => {
        const postLoading = async () => {
          storage.set("uploadData", JSON.stringify({"message": "", "display":"none", "image":"",  progress:""}));
        await CameraRoll.saveAsset(source.uri);
        await axiosPull._pullGalleryFeed(props.route.params.pin, props.route.params.user);
        await axiosPull._pullFriendCameraFeed(props.route.params.owner, "user", props.route.params.user);
        await axiosPull._pullCameraFeed(props.route.params.user, "owner");
        if (props.route.params.owner != props.route.params.user) {
          setCredits(String(parseInt(credits) - 1));
          updateItemFeed(
            JSON.stringify(cameraData),
            props.route.params.pin,
            String(parseInt(credits) - 1),
            `user.Camera.Friend.Feed.${props.route.params.owner}`,
            "1"
          );
        }
        StatusBar.setHidden(false, 'none');
      }
      postLoading();
      });
    }
  
    postConclusion();
    props.navigation.pop(2);

    // handleUpload(
    //   constants.url + "/camera/upload.php",
    //   formData,
    //   props.route.params.user,
    //   "camera",
    //   props.route.params.pin,
    //   props.route.params.owner,
    //   i18n.t("Uploading2"),
    //   source.uri,
    //   uploading
    // );
  };

  return (
    <View style={[styles.container, screenStyle]}>
      {type === "photo" && (
        <Image
          source={source}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
          onLoadEnd={onMediaLoadEnd}
          onLoad={onMediaLoad}
        />
      )}
      {type === "video" && (
        <Video
          source={source}
          style={{width:SCREEN_WIDTH, height:SCREEN_HEIGHT}}
          paused={isVideoPaused}
          resizeMode="contain"
          allowsExternalPlayback={false}
          automaticallyWaitsToMinimizeStalling={false}
          disableFocus={true}
          repeat={false}
          controls={true}
          playWhenInactive={true}
          ignoreSilentSwitch="obey"
          onReadyForDisplay={onMediaLoadEnd}
          onLoad={onMediaLoad}
          onError={onMediaLoadError}
        />
      )}
      <View
        style={{
          position: "absolute",
          right: 10,
          top: 110,
          padding: 10,
          borderRadius: 5,
          backgroundColor: "rgba(0, 0, 0, 0.40)",
          gap: 30,
        }}
      >

        {animating ? (
          <ActivityIndicator
            color="white"
            size={"small"}
            animating={animating}
            hidesWhenStopped={true}
          />
        ) : (
          <MaterialCommunityIcons
            name={"content-save-move-outline"}
            size={30}
            onPress={() => {
              createEvent();
            }}
            color="white"
          />
        )}
                <Ionicons
          name={"close"}
          size={30}
          onPress={() => {
            props.navigation.goBack();
            StatusBar.setHidden(false, 'none');
          }}
          color="white"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "black",
  },
  saveButton: {
    position: "absolute",
    bottom: constants.SAFE_AREA_PADDING.paddingBottom,
    left: constants.SAFE_AREA_PADDING.paddingLeft,
    width: 40,
    height: 40,
  },
  icon: {
    textShadowColor: "black",
    textShadowOffset: {
      height: 0,
      width: 0,
    },
    textShadowRadius: 1,
  },
  video: {
    transform: [{ rotate: "180deg" }], // This flips the video
  },
});

export default MediaPage;
