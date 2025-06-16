import { useCallback, useEffect, useRef, useState } from "react";
import { View, StyleSheet, GestureResponderEvent, Text } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import {
  useCameraPermission,
  useCameraDevice,
  useCameraFormat,
  Camera,
  PhotoFile,
  TakePhotoOptions,
  useLocationPermission,
  runAtTargetFps,
  useFrameProcessor,
  VideoFile,
  CameraProps,
} from "react-native-vision-camera";
import { Ionicons } from "@expo/vector-icons";
import Reanimated, {
  Extrapolation,
  interpolate,
  useAnimatedGestureHandler,
  useAnimatedProps,
  useSharedValue,
} from "react-native-reanimated";
import { CaptureButton } from "../VisionCamera/CaptureButton";
import { constants } from "../../utils/constants";
import type { PinchGestureHandlerGestureEvent } from "react-native-gesture-handler";
import {
  PinchGestureHandler,
  TapGestureHandler,
} from "react-native-gesture-handler";
import momentDurationFormatSetup from "moment-duration-format";
import moment from "moment";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ViewStyle, StatusBar } from "react-native";

const ReanimatedCamera = Reanimated.createAnimatedComponent(Camera);
Reanimated.addWhitelistedNativeProps({
  zoom: true,
});
import "moment-duration-format";

const TempCamera = (props: {
  route: {
    params: {
      title: any;
    };
  };
  navigation: any;
}) => {
  momentDurationFormatSetup(moment);
  const [uiRotation, setUiRotation] = useState(0);
  const uiStyle: ViewStyle = {
    transform: [{ rotate: `${uiRotation}deg` }],
  };
  const { hasPermission, requestPermission } = useCameraPermission();
  const [isActive, setIsActive] = useState(false);
  const [flash, setFlash] = useState<TakePhotoOptions["flash"]>("off");
  const [cameraPosition, setCameraPosition] = useState<"front" | "back">(
    "back"
  );
  const device = useCameraDevice(cameraPosition);
  const [isCameraInitialized, setIsCameraInitialized] = useState(false);
  const location = useLocationPermission();

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
    });
  }, []);

  const SCALE_FULL_ZOOM = 3;
  const MAX_ZOOM_FACTOR = 10;

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
    setIsActive(true);
  }, [hasPermission]);

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
    { videoStabilizationMode: 'auto' },
    { autoFocusSystem: 'phase-detection' },
    { fps: 240 },
  ]);
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
  useEffect(() => {
    StatusBar.setHidden(true, 'none');
    location.requestPermission();
  }, [location]);

    const cameraAnimatedProps = useAnimatedProps<CameraProps>(() => {
    const z = Math.max(Math.min(zoom.value, maxZoom), minZoom);
    return {
      zoom: z,
    };
  }, [maxZoom, minZoom, zoom]);
  
  const onMediaCaptured = useCallback(
    async (media: PhotoFile | VideoFile, type: "photo" | "video") => {
      if (type == "photo") {
        await AsyncStorage.setItem("media.path", media.path);
            StatusBar.setHidden(false, 'none');
        props.navigation.goBack();
      }
    },
    [props]
  );
  const canToggleNightMode = device?.supportsLowLightBoost ?? false;

  const onDoubleTap = useCallback(() => {
    onFlipCameraPressed();
  }, [onFlipCameraPressed]);

  if (!hasPermission) {
    return <ActivityIndicator />;
  }
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
            onPress={() => {
              StatusBar.setHidden(false, 'none');
              props.navigation.goBack()
            }}
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
              style={StyleSheet.absoluteFill}
              isActive={isActive}
              onInitialized={onInitialized}
              outputOrientation="device"
              photoQualityBalance="balanced"
              onUIRotationChanged={(degrees) => setUiRotation(degrees)}
              isMirrored={cameraPosition == "front" ? true : false}
              enableZoomGesture={true}
              videoStabilizationMode={'auto'}
              androidPreviewViewType={"texture-view"}
              animatedProps={cameraAnimatedProps}
              photo={true}
              format={format}
              video={false}
              audio={false}
              device={device}
              exposure={0}
              enableLocation={location.hasPermission}
              lowLightBoost={canToggleNightMode}
              frameProcessor={frameProcessor}
            />
          </TapGestureHandler>
        </Reanimated.View>
      </PinchGestureHandler>
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
      ></Text>
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
            StatusBar.setHidden(false, 'none');
            props.navigation.goBack()
          }}
          size={30}
          color="white"
        />
        <Ionicons
          name={flash === "off" ? "flash-off-outline" : "flash-outline"}
          onPress={() =>
            setFlash((curValue) => (curValue === "off" ? "on" : "off"))
          }
          size={30}
          color="white"
        />
        <Ionicons
          name={"camera-reverse-outline"}
          onPress={onFlipCameraPressed}
          size={30}
          color="white"
        />
        {canToggleNightMode && (
          <Ionicons
            name={enableNightMode ? "moon" : "moon-outline"}
            color="white"
            size={30}
            onPress={() => setEnableNightMode(!enableNightMode)}
            disabledOpacity={0.4}
          />
        )}
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
        enabled={isCameraInitialized && isActive}
        setIsPressingButton={setIsPressingButton}
      />
    </View>
  );
};

export default TempCamera;
