import { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  GestureResponderEvent,
  Text,
  Platform,
} from "react-native";
import {
  useCameraPermission,
  useMicrophonePermission,
  useCameraDevice,
  useCameraFormat,
  useLocationPermission,
  Camera,
  PhotoFile,
  TakePhotoOptions,
  runAtTargetFps,
  useFrameProcessor,
  CameraProps,
  VideoFile,
} from "react-native-vision-camera";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Reanimated, {
  Extrapolation,
  interpolate,
  useAnimatedGestureHandler,
  useAnimatedProps,
  useSharedValue,
} from "react-native-reanimated";
import { CaptureButton } from "./CaptureButton";
import { constants } from "../../utils/constants";
import type { PinchGestureHandlerGestureEvent } from "react-native-gesture-handler";
import {
  PinchGestureHandler,
  TapGestureHandler,
} from "react-native-gesture-handler";
import momentDurationFormatSetup from "moment-duration-format";
import moment from "moment/min/moment-with-locales";
import CreditsFont from "../SubViews/camera/camerCredits";
import * as i18n from "../../../i18n";
import { storage } from "../../context/components/Storage";
import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import { usePreferredCameraDevice } from "./hooks/usePreferredCameraDevice";
import { ActivityIndicator } from "react-native-paper";
const ReanimatedCamera = Reanimated.createAnimatedComponent(Camera);
Reanimated.addWhitelistedNativeProps({
  zoom: true,
});
import "moment-duration-format";
import PhotoEditor from "@baronha/react-native-photo-editor";
const stickers: never[] = [];
import { handleUpload } from "../SubViews/upload";
import { useMMKVObject } from "react-native-mmkv";
import { ViewStyle } from "react-native";
import { getLocales } from "expo-localization";

const VisionCamera = (props: {
  route: {
    params: {
      title: any;
      user: any;
      owner: any;
      credits: any;
      end: any;
      start: any;
      pin: any;
      UUID: any;
      action: any;
    };
  };
  navigation: any;
}) => {
  momentDurationFormatSetup(moment);
  const [uiRotation, setUiRotation] = useState(0);

  const uiStyle: ViewStyle = {
    transform: [{ rotate: `${uiRotation}deg` }],
  };
  const [credits] = useState(
    props.route.params.user == props.route.params.owner
      ? "99"
      : props.route.params.credits
  );
  const location = useLocationPermission();
  let [localLang] = useState(getLocales()[0].languageCode);

  const { hasPermission, requestPermission } = useCameraPermission();
  const {
    hasPermission: microphonePermission,
    requestPermission: requestMicrophonePermission,
  } = useMicrophonePermission();
  const [isActive, setIsActive] = useState(false);
  const [flash, setFlash] = useState<TakePhotoOptions["flash"]>("off");
  const [cameraPosition, setCameraPosition] = useState<"front" | "back">(
    "back"
  );
  const [preferredDevice] = usePreferredCameraDevice();
  let device = useCameraDevice(cameraPosition);
  if (preferredDevice != null && preferredDevice.position === cameraPosition) {
    // override default device with the one selected by the user in settings
    device = preferredDevice;
  }
  const [isCameraInitialized, setIsCameraInitialized] = useState(false);
  const [uploading] = useMMKVObject("uploadData", storage);

  const durationAsString = (end: any, start: any) => {
    return start >= moment().unix()
      ? i18n.t("Event Starts in:") +
          moment
            .duration(parseInt(start) - moment().unix(), "seconds")
            .locale(String(localLang))
            .humanize(true)
      : i18n.t("Event Ends in:") +
          moment
            .duration(parseInt(end), "seconds")
            .locale(String(localLang))
            .humanize(true);
  };
  let endEventTime = durationAsString(
    parseInt(props.route.params.end) - moment().unix(),
    parseInt(props.route.params.start)
  );
  const camera = useRef<Camera>(null);

  const onFocusTap = useCallback(
    ({ nativeEvent: event }: GestureResponderEvent) => {
      if (!device?.supportsFocus) return;
      camera.current?.focus({
        x: event.locationX,
        y: event.locationY,
      });
    },
    [device?.supportsFocus]
  );

  const frameProcessor = useFrameProcessor((frame) => {
    "worklet";

    runAtTargetFps(10, () => {
      "worklet";
      //console.log(`${frame.timestamp}: ${frame.width}x${frame.height} ${frame.pixelFormat} Frame (${frame.orientation})`)
      //examplePlugin(frame)
      // exampleKotlinSwiftPlugin(frame)
    });
  }, []);

  const SCALE_FULL_ZOOM = 3;
  const MAX_ZOOM_FACTOR = 10;

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
    setIsActive(true);

    if (!microphonePermission) {
      requestMicrophonePermission();
    }
  }, [hasPermission, microphonePermission]);

  const onFlipCameraPressed = useCallback(() => {
    setCameraPosition((p) => (p === "back" ? "front" : "back"));
  }, []);
  const minZoom = device?.minZoom ?? 1;
  const maxZoom = Math.min(device?.maxZoom ?? 1, MAX_ZOOM_FACTOR);
  const zoom = useSharedValue(1);

  const onPinchGesture = useAnimatedGestureHandler<
    PinchGestureHandlerGestureEvent,
    { startZoom?: number }
  >({
    onStart: (_, context) => {
      context.startZoom = zoom.value;
    },
    onActive: (event, context) => {
      // we're trying to map the scale gesture to a linear zoom here
      const startZoom = context.startZoom ?? 0;
      const scale = interpolate(
        event.scale,
        [1 - 1 / SCALE_FULL_ZOOM, 1, SCALE_FULL_ZOOM],
        [-1, 0, 1],
        Extrapolation.CLAMP
      );
      zoom.value = interpolate(
        scale,
        [-1, 0, 1],
        [minZoom, startZoom, maxZoom],
        Extrapolation.CLAMP
      );
    },
  });
  const screenAspectRatio = constants.SCREEN_HEIGHT / constants.SCREEN_WIDTH;

  const format = useCameraFormat(device, [
    { videoAspectRatio: screenAspectRatio },
    { videoResolution: "max" },
    { photoAspectRatio: screenAspectRatio },
    { photoResolution: "max" },
    { photoHdr: true },
    { videoHdr: true },
    { videoStabilizationMode: 'auto' },
    { autoFocusSystem: 'phase-detection' },
    { fps: 240 },
  ]);
  const [enableHdr, setEnableHdr] = useState(false);
  const [enableNightMode, setEnableNightMode] = useState(false);

  const onInitialized = useCallback(() => {
    setIsCameraInitialized(true);
  }, []);
  const isPressingButton = useSharedValue(false);

  const setIsPressingButton = useCallback(
    (_isPressingButton: boolean) => {
      isPressingButton.value = _isPressingButton;
    },
    [isPressingButton]
  );

  const createEvent = async (path: String) => {
    var formData = new FormData();
    formData.append("pin", props.route.params.pin);
    formData.append("owner", props.route.params.owner);
    formData.append("user", props.route.params.user);
    formData.append("id", props.route.params.UUID);
    formData.append("count", "1");
    formData.append("device", Platform.OS);
    formData.append("camera", "1");
    var fileName =
      "SNAP18-camera-" +
      props.route.params.pin +
      "-" +
      Date.now() +
      +"-" +
      path.split("/").pop();
    formData.append("file[]", {
      name: fileName,
      type: constants.mimes(path.split(".").pop()), // set MIME type
      uri: path,
    });

    handleUpload(
      constants.url + "/camera/upload.php",
      formData,
      props.route.params.user,
      "camera",
      props.route.params.pin,
      props.route.params.owner,
      i18n.t("Uploading") + " " + i18n.t("PleaseWait"),
      path,
      uploading
    );
    props.navigation.goBack();
  };

  const onMediaCaptured = useCallback(
    async (media: PhotoFile | VideoFile, type: "photo" | "video") => {
      if (type == "photo") {
        try {
          const path = await PhotoEditor.open({
            path: media.path,
            stickers,
          });
          await CameraRoll.saveAsset(String(path), {
            type: type,
          });
          createEvent(path);
        } catch (e) {
          console.log("e", e);
        }
      } else {
        props.navigation.navigate("VisionCameraMediaPage", {
          path: media.path,
          type: type,
          UUID: props.route.params.UUID,
          title: props.route.params.title,
          end: props.route.params.end,
          start: props.route.params.start,
          pin: props.route.params.pin,
          owner: props.route.params.owner,
          user: props.route.params.user,
          credits: credits,
        });
      }
    },
    [props]
  );
  const supportsHdr = format?.supportsPhotoHdr;
  const canToggleNightMode = device?.supportsLowLightBoost ?? false;

  const onDoubleTap = useCallback(() => {
    onFlipCameraPressed();
  }, [onFlipCameraPressed]);

  if (!hasPermission || !microphonePermission) {
    return <ActivityIndicator />;
  }

  useEffect(() => {
    location.requestPermission();
  }, [location]);

  const cameraAnimatedProps = useAnimatedProps<CameraProps>(() => {
    const z = Math.max(Math.min(zoom.value, maxZoom), minZoom);
    return {
      zoom: z,
    };
  }, [maxZoom, minZoom, zoom]);
  const videoHdr = format?.supportsVideoHdr && enableHdr;

  if (device == null)
    return (
      <View style={[StyleSheet.absoluteFill, { backgroundColor: "black" }]}>
        <View style={[uiStyle]}>
          <Text
            style={{
              color: "white",
              textAlign: "center",
              fontWeight: "600",
              fontSize: 20,
              top: constants.SAFE_AREA_PADDING.paddingBottom + 45,
            }}
          >
            No Camera Device
          </Text>
        </View>
        <View
          style={[
            uiStyle,
            {
              position: "absolute",
              right: 10,
              top: 50,
              padding: 10,
              borderRadius: 5,
              backgroundColor: "rgba(0, 0, 0, 0.60)",
              gap: 30,
            },
          ]}
        >
          <Ionicons
            name={"close"}
            onPress={() => props.navigation.goBack()}
            size={30}
            color="white"
          />
        </View>
      </View>
    );
  return (
    <View style={{ flex: 1, backgroundColor: "black" }}>
      <PinchGestureHandler onGestureEvent={onPinchGesture} enabled={isActive}>
        <Reanimated.View
          onTouchEnd={onFocusTap}
          style={StyleSheet.absoluteFill}
        >
          <TapGestureHandler onEnded={onDoubleTap} numberOfTaps={2}>
            
            <ReanimatedCamera
              ref={camera}
              {...props}
              device={device}
              style={StyleSheet.absoluteFill}
              isActive={isActive}
              onInitialized={onInitialized}
              videoHdr={videoHdr}
              onUIRotationChanged={(degrees) => setUiRotation(degrees)}
              enableZoomGesture={true}
              photo={true}
              videoStabilizationMode={'auto'}
              androidPreviewViewType={"texture-view"}
              isMirrored={cameraPosition == "front" ? true : false}
              video={true}
              animatedProps={cameraAnimatedProps}
              audio={true}
              format={format}
              exposure={0}
              enableLocation={location.hasPermission}
              lowLightBoost={canToggleNightMode}
            />
          </TapGestureHandler>
        </Reanimated.View>
      </PinchGestureHandler>
      <View>
        <Text
          style={{
            color: "white",
            textAlign: "center",
            fontWeight: "600",
            fontSize: 20,
            top: constants.SAFE_AREA_PADDING.paddingBottom + 45,
          }}
        >
          {props.route.params.title}
        </Text>
        <Text
          style={{
            color: "white",
            textAlign: "center",
            fontSize: 15,
            top: constants.SAFE_AREA_PADDING.paddingBottom + 45,
          }}
        >
          {endEventTime}
        </Text>
      </View>
      <View
        style={{
          position: "absolute",
          right: 10,
          top: 50,
          padding: 10,
          borderRadius: 5,
          backgroundColor: "rgba(0, 0, 0, 0.60)",
          gap: 30,
        }}
      >
        <Ionicons
          name={"close"}
          onPress={() => {
            props.navigation.goBack();
          }}
          size={30}
          color="white"
        />
        <Ionicons
          name={flash === "off" ? "flash-off-outline" : "flash-outline"}
          onPress={() =>
            setFlash((curValue) => (curValue === "off" ? "on" : "off"))
          }
          style={[uiStyle]}
          size={30}
          color="white"
        />
        <Ionicons
          name={"camera-reverse-outline"}
          onPress={onFlipCameraPressed}
          size={30}
          style={[uiStyle]}
          color="white"
        />
        {supportsHdr && (
          <MaterialCommunityIcons
            name={enableHdr ? "hdr" : "hdr-off"}
            color="white"
            size={30}
            style={[uiStyle]}
            onPress={() => setEnableHdr((h) => !h)}
          />
        )}
        {canToggleNightMode && (
          <Ionicons
            name={enableNightMode ? "moon" : "moon-outline"}
            color="white"
            size={30}
            style={[uiStyle]}
            onPress={() => setEnableNightMode(!enableNightMode)}
            disabledOpacity={0.4}
          />
        )}
        <CreditsFont credits={credits} newStyle={uiStyle} />
      </View>
      <CaptureButton
        style={{
          position: "absolute",
          alignSelf: "center",
          bottom: constants.SAFE_AREA_PADDING.paddingBottom + 30,
        }}
        camera={camera}
        onMediaCaptured={onMediaCaptured}
        cameraZoom={zoom}
        minZoom={minZoom}
        maxZoom={maxZoom}
        flash={flash == "off" ? "off" : "on"}
        enabled={isCameraInitialized && isActive && credits > 0}
        setIsPressingButton={setIsPressingButton}
      />
    </View>
  );
};

export default VisionCamera;
