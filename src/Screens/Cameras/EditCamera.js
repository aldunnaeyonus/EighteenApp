import {
  View,
  ScrollView,
  Platform,
  Text,
  NativeModules,
  Alert,
  Linking,
  StyleSheet, // Added StyleSheet import
} from "react-native";
import { TouchableOpacity } from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import styles from "../../styles/SliderEntry.style";
import { ListItem, Switch, ButtonGroup, Input } from "@rneui/themed";
import React, { useState, useCallback, useRef, useMemo } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  ANDROID_MODE,
  IOS_MODE,
  ANDROID_DISPLAY,
  IOS_DISPLAY,
  constants,
  SCREEN_WIDTH,
  getExtensionFromFilename,
} from "../../utils/constants";
import * as ImagePicker from "expo-image-picker";
import FormData from "form-data";
import { storage } from "../../context/components/Storage";
import FastImage from "react-native-fast-image";
import { createImageProgress } from "react-native-image-progress";
const Image = createImageProgress(FastImage);
import Progress from "react-native-progress";
import moment from "moment";
import { useFocusEffect } from "@react-navigation/native";
import { ActivityIndicator } from "react-native-paper";
import * as i18n from "../../../i18n";
import { useMMKVObject } from "react-native-mmkv";
import { Icon } from "react-native-elements";
import * as RNLocalize from "react-native-localize";
import PhotoEditor from "@baronha/react-native-photo-editor";
const stickers = [];
import NotifService from "../../../NotifService";
import axios from "axios";
import { axiosPull } from "../../utils/axiosPull";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import Animated from "react-native-reanimated";

const EditCamera = (props) => {
  const [user] = useMMKVObject("user.Data", storage);

  const [switch1, setSwitch1] = useState(props.route.params.camera_add_social == "1");
  const [switch5, setSwitch5] = useState(props.route.params.isHidden == "1");
  const [switch3, setSwitch3] = useState(props.route.params.camera_purchase_more == "1");
  const [dname, setDName] = useState(props.route.params.description.trim());
  const [isPro] = useState(user.isPro == "1");
  const [switch2, setSwitch2] = useState(props.route.params.show_gallery == "1");
  const [switch4, setSwitch4] = useState(props.route.params.autoJoin == "1");

  const timestamp = parseInt(props.route.params.start);
  const timestampEnd = parseInt(props.route.params.end);
  const sourcedDate = moment(timestamp);
  const [selectedDate, setSelectedDate] = useState(sourcedDate.toDate());

  const snapPoints = useMemo(() => ["17%"], []);
  const bottomSheetRef = useRef(null);
  const handlePresentModalPress = useCallback(() => {
    bottomSheetRef.current?.present();
  }, []);
  const handleDismissModalPress = useCallback(() => {
    bottomSheetRef.current?.close();
  }, []);

  const [minimumDate] = useState(new Date());
  const [cameraStatus] = ImagePicker.useCameraPermissions();
  const [libraryStatus] = ImagePicker.useMediaLibraryPermissions();

  const [selectedIndex, setSelectedIndex] = useState(
    isPro
      ? constants.camera_time_text_PRO.indexOf(props.route.params.length_index)
      : constants.camera_time_text.indexOf(props.route.params.length_index)
  );
  const [cameras, setCameras] = useState(
    isPro
      ? constants.camera_amount_PRO.indexOf(props.route.params.cameras)
      : constants.camera_amount.indexOf(props.route.params.cameras)
  );
  const [media, setMedia] = useState(
    constants.media_amount.indexOf(props.route.params.shots)
  );
  const [name, setName] = useState(props.route.params.title);
  const [image, setImage] = useState(props.route.params.illustration);
  // Removed maximumDate as it was unused
  const [showDatePicker, setShowDatePicker] = useState(false); // Controls visibility of date picker
  const [showTimePicker, setShowTimePicker] = useState(false); // Controls visibility of time picker (Android only, shown after date)
  const [verified, setVerified] = useState(true);
  const errorColor = verified ? "#fafbfc" : "#ffa3a6";
  const [isAI, setIsAI] = useState(false); // Tracks if the current image is AI generated
  const [interval] = useState(1); // Interval for minute picker
  let deviceLanguage =
    Platform.OS == "ios"
      ? NativeModules.SettingsManager.settings.AppleLocale || NativeModules.SettingsManager.settings.AppleLanguages[0]
      : RNLocalize.getLocales()[0].languageTag; // More robust language tag
  const [start, setStart] = useState(timestamp);
  const [end, setEnd] = useState(timestampEnd);
  const [isEditing, setisEditing] = useState(false); // True when image is sent to editor, false when returned
  const [showSaveIndicator, setShowSaveIndicator] = useState(false); // For header right saving indicator

  let notification = new NotifService();
  const [seed, setSeed] = useState(72);
  const [showClose, setShowClose] = useState(true); // Controls visibility of save button vs loading

  const calculateEndTime = useCallback((selectedStartTime, durationIndex) => {
    const durationSeconds = isPro
      ? parseInt(constants.camera_time_seconds_PRO[durationIndex])
      : parseInt(constants.camera_time_seconds[durationIndex]);
    return parseInt(moment(selectedStartTime).unix()) + durationSeconds;
  }, [isPro, constants.camera_time_seconds_PRO, constants.camera_time_seconds]);

  const onChange = (event, selected) => {
    // This handles the general onChange for iOS (datetime) and Android (time after date)
    setShowDatePicker(false); // Hide date picker if shown
    setShowTimePicker(false); // Hide time picker if shown

    if (event.type == "set" && selected) {
      setSelectedDate(selected);
      setStart(moment(selected).unix());
      setEnd(calculateEndTime(selected, selectedIndex));
    }
  };

  const onChangeAndroid = (event, selected) => {
    setShowDatePicker(false); // Always hide date picker after interaction
    if (event.type == "set" && selected) {
      setSelectedDate(selected);
      setStart(moment(selected).unix());
      // On Android, after selecting a date, show the time picker
      setShowTimePicker(true);
    }
  };

  const onChangeIOS = (event, selected) => {
    // For iOS, which can show both date and time at once
    if (event.type == "neutralButtonPressed") {
      // Handle neutral button if needed, here we just keep current state
      setSelectedDate(selectedDate);
      setStart(moment(selectedDate).unix());
      setEnd(calculateEndTime(selectedDate, selectedIndex));
    } else if (selected) {
      setSelectedDate(selected);
      setStart(moment(selected).unix());
      setEnd(calculateEndTime(selected, selectedIndex));
    }
  };

  const cameraChange = useCallback((value) => {
    setCameras(value);
  }, []);

  const daysChange = useCallback((value) => {
    setSelectedIndex(value);
    setEnd(calculateEndTime(selectedDate, value));
  }, [selectedDate, calculateEndTime]);

  const mediaChange = useCallback((value) => {
    setMedia(value);
  }, []);

  const toggleSwitch1 = useCallback(() => setSwitch1(!switch1), [switch1]);
  const toggleSwitch3 = useCallback(() => setSwitch3(!switch3), [switch3]);
  const toggleSwitch2 = useCallback(() => setSwitch2(!switch2), [switch2]);
  const toggleSwitch4 = useCallback(() => setSwitch4(!switch4), [switch4]);
  const toggleSwitch5 = useCallback(() => setSwitch5(!switch5), [switch5]);

  const usePollinationsImages = useCallback((prompt, options = {}) => {
    const {
      width = 1024,
      height = 863,
      model = "flux",
      seed: currentSeed = seed, // Use the stateful seed
      nologo = true,
      enhance = false,
    } = options;
    const params = new URLSearchParams({
      width,
      height,
      model,
      seed: currentSeed,
      nologo,
      enhance,
    });
    return `https://pollinations.ai/p/${encodeURIComponent(prompt)}?${params.toString()}`;
  }, [seed]); // Depends on `seed`

  const AITexttoImage = useCallback(() => {
    setIsAI(true);
    const promptText = dname.length > 5
      ? dname
      : `Create a cinematic 4K photo shot on a 70mm, Ultra-Wide Angle, Depth of Field, Shutter Speed 1/1000, F/22 camera for a gathering that is titled ${name} and is in dramatic and stunning setting located in ${RNLocalize.getTimeZone()} and is also an award winning photo worthy of instagram.`;

    const userImage = usePollinationsImages(promptText, {
      seed: seed, // Pass the current seed
    });
    setImage(userImage);
    setisEditing(true);
    setShowClose(false);
  }, [dname, name, seed, usePollinationsImages]);

  const editImage = useCallback(async (imgUri) => {
    try {
      setisEditing(true);
      setShowClose(false);
      const result = await PhotoEditor.open({
        path: imgUri,
        stickers,
      });
      setShowClose(true);
      setImage(result);
      setisEditing(false);
    } catch (e) {
      console.log("Photo editor error:", e);
      Alert.alert(i18n.t("Error"), i18n.t("Failed to edit image."));
      setisEditing(false);
      setShowClose(true);
    } finally {
      await AsyncStorage.removeItem("media.path");
    }
  }, []); // No dependencies that change value here

  const pickImage = useCallback(async () => {
    handleDismissModalPress();
    setIsAI(false); // Reset AI state when picking from gallery

    let permissionStatus;
    // Request permission if not granted for media library
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    permissionStatus = status;

    if (permissionStatus == ImagePicker.PermissionStatus.DENIED) {
      Alert.alert(
        i18n.t("Permissions"),
        i18n.t("UseLibrary"),
        [
          { text: i18n.t("Cancel"), style: "destructive" },
          { text: i18n.t("Settings"), onPress: () => Linking.openSettings() },
        ],
        { cancelable: false }
      );
    } else if (permissionStatus == ImagePicker.PermissionStatus.GRANTED) {
      setShowClose(false);
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        exif: true,
        allowsEditing: true,
        selectionLimit: 1,
        allowsMultipleSelection: false,
        quality: 1,
        orderedSelection: true,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setShowClose(true);
        setImage(result.assets[0].uri);
        setisEditing(true); // Image might need editing
      } else {
        setImage(image); // Revert to original if cancelled
        setisEditing(false);
        setShowClose(true);
      }
    }
  }, [handleDismissModalPress, image]); // Added image as dependency to revert to it

  const takePhoto = useCallback(async () => {
    handleDismissModalPress();
    setIsAI(false); // Reset AI state when taking photo

    let permissionStatus;
    // Request permission if not granted for camera
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    permissionStatus = status;

    if (permissionStatus == ImagePicker.PermissionStatus.DENIED) {
      Alert.alert(
        i18n.t("Permissions"),
        i18n.t("UseCamera"),
        [
          { text: i18n.t("Cancel"), style: "destructive" },
          { text: i18n.t("Settings"), onPress: () => Linking.openSettings() },
        ],
        { cancelable: false }
      );
    } else if (permissionStatus == ImagePicker.PermissionStatus.GRANTED) {
      setShowClose(false);
      let result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        exif: true,
        allowsEditing: true,
        quality: 1,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setShowClose(true);
        setImage(result.assets[0].uri);
        setisEditing(true); // Image might need editing
      } else {
        setImage(image); // Revert to original if cancelled
        setisEditing(false);
        setShowClose(true);
      }
    }
  }, [handleDismissModalPress, image]); // Added image as dependency to revert to it

  const createEvent = useCallback(async () => {
    setShowSaveIndicator(true);

    const fileName =
      "SNAP18-cover-" +
      user.user_id +
      "-" +
      moment().unix() +
      "." +
      getExtensionFromFilename(image).toLowerCase();

    const formData = new FormData();
    formData.append("user", props.route.params.user);
    formData.append("owner", props.route.params.owner);
    formData.append("eventName", name);
    formData.append("purchases", "0");
    formData.append(
      "length",
      isPro
        ? constants.camera_time_text_PRO[selectedIndex]
        : constants.camera_time_text[selectedIndex]
    );
    formData.append("ai_description", dname);
    formData.append(
      "cameras",
      isPro
        ? constants.camera_amount_PRO[cameras]
        : constants.camera_amount[cameras]
    );
    formData.append("start", start);
    formData.append("end", end);
    formData.append("shots", isPro ? constants.media_amount[media] : "18");
    formData.append("photoGallery", switch2 ? "1" : "0");
    formData.append("socialMedia", isPro ? (switch1 ? "1" : "0") : "1");
    formData.append("pin", props.route.params.pin);
    formData.append("id", props.route.params.UUID);
    formData.append("autoJoin", switch4 ? "1" : "0");
    formData.append("isHidden", switch5 ? "1" : "0");
    formData.append("device", Platform.OS);
    formData.append("camera", "0");
    formData.append("isAI", isAI ? "1" : "0");
    formData.append("aiIMAGE", isAI ? "1" : "0");

    if (props.route.params.illustration != image) {
      formData.append("photoCount", "1");
      formData.append("photoName", fileName);
      formData.append("file", {
        name: fileName,
        type: constants.mimes(getExtensionFromFilename(image).toLowerCase()),
        uri: Platform.OS == "android" ? image : image.replace("file://", ""),
      });
    } else {
      formData.append("photoCount", "0");
    }

    try {
      await AsyncStorage.setItem("uploadEnabled", "0");

      await axios({
        method: "POST",
        url: constants.url + "/camera/save.php",
        data: formData,
        onUploadProgress: (progressEvent) => {
          let { loaded, total } = progressEvent;
          console.log(`Upload Progress: ${((loaded / total) * 100).toFixed(2)}%`);
        },
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
      });

      await AsyncStorage.setItem("uploadEnabled", "0");
      setIsAI(false);
      await axiosPull._pullCameraFeed(user.user_id, "owner");

      const currentMoment = moment().unix();
      if (start != props.route.params.start) {
        notification.cancelNotif(props.route.params.pin + "-start");
        if (parseInt(start) >= currentMoment) {
          notification.scheduleNotif(
            String(name),
            i18n.t("EvnetStart"),
            parseInt(start),
            props.route.params.pin + "-start",
            constants.urldata +
              "/" +
              user.user_id +
              "/events/" +
              props.route.params.pin +
              "/" +
              fileName
          );
        }
      }
      if (end != props.route.params.end) {
        notification.cancelNotif(props.route.params.pin + "-end");
        if (parseInt(end) >= currentMoment) {
          notification.scheduleNotif(
            String(name),
            i18n.t("EvnetEnd"),
            parseInt(end),
            props.route.params.pin + "-end",
            constants.urldata +
              "/" +
              user.user_id +
              "/events/" +
              props.route.params.pin +
              "/" +
              fileName
          );
        }
      }

      Alert.alert(i18n.t("Success"), i18n.t("Event updated successfully!"));
      props.navigation.goBack();

    } catch (error) {
      console.error("Error saving event:", error);
      Alert.alert(i18n.t("Error"), i18n.t("Failed to save event. Please try again."));
    } finally {
      setShowSaveIndicator(false);
    }
  }, [
    user.user_id,
    props.route.params.user,
    props.route.params.owner,
    props.route.params.pin,
    props.route.params.UUID,
    props.route.params.illustration,
    props.route.params.start,
    props.route.params.end,
    name,
    switch3,
    isPro,
    selectedIndex,
    dname,
    cameras,
    start,
    end,
    media,
    switch2,
    switch1,
    switch4,
    switch5,
    isAI,
    image,
    notification,
    props.navigation,
  ]);

  useFocusEffect(
    useCallback(() => {
      const checkAndEditImage = async () => {
        const value = await AsyncStorage.getItem("media.path");
        if (value) {
          setShowClose(false);
          await editImage(value);
        }
      };
      checkAndEditImage();

      props.navigation.setOptions({
        headerRight: () =>
          showSaveIndicator ? (
            <ActivityIndicator color="black" size={"small"} animating={true} />
          ) : showClose ? (
            <TouchableOpacity
              onPress={createEvent}
              disabled={showSaveIndicator}
            >
              <Text style={{ color: "#3D4849", marginRight: 10 }}>
                {i18n.t("Save")}
              </Text>
            </TouchableOpacity>
          ) : (
            <></>
          ),
      });
    }, [
      showClose,
      showSaveIndicator,
      editImage,
      createEvent,
      props.navigation,
    ])
  );

  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        enableTouchThrough={false}
        pressBehavior={"close"}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        {...props}
      />
    ),
    []
  );

  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={{
          backgroundColor: "white",
          height: "100%",
          width: SCREEN_WIDTH,
        }}
        edges={["bottom", "left", "right"]}
      >
        <ScrollView
          style={{ backgroundColor: "#fff", flex: 1 }}
          keyboardShouldPersistTaps={"never"}
          keyboardDismissMode="on-drag"
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={false}
        >
            <View style={styles.container}>
              <ListItem key="1">
                <Icon
                  type="material"
                  name="drive-file-rename-outline"
                  size={25}
                  color="#3D4849"
                  containerStyle={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                />
                <ListItem.Content>
                  <ListItem.Title style={styles.imageUserNameTitleBlack}>
                    {i18n.t("e4")}
                  </ListItem.Title>
                  <ListItem.Subtitle>{i18n.t("e5")}</ListItem.Subtitle>
                </ListItem.Content>
              </ListItem>
              <View style={[styles.dividerStyle]} />
              <ListItem
                containerStyle={{ height: 65, backgroundColor: errorColor }}
                key="2"
              >
                <ListItem.Content>
                  <ListItem.Input
                    style={{
                      height: 55,
                      fontSize: 20,
                      borderColor: "transparent",
                      borderWidth: 2,
                      borderRadius: 10,
                      paddingRight: 5,
                    }}
                    value={name}
                    keyboardType="default"
                    autoCapitalize="sentences"
                    maxLength={32}
                    onChangeText={(text) => {
                      setName(text);
                    }}
                    placeholder={i18n.t("e6")}
                  ></ListItem.Input>
                </ListItem.Content>
              </ListItem>
              <View style={[styles.dividerStyle]} />
              {isPro && (
                <>
                  <ListItem key="17">
                    <Icon
                      type="material"
                      name="text-snippet"
                      size={25}
                      color="#3D4849"
                      containerStyle={{
                        width: 28,
                        height: 28,
                        borderRadius: 6,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    />
                    <ListItem.Content>
                      <ListItem.Title style={styles.imageUserNameTitleBlack}>
                        {i18n.t("AI Image Decription")}
                      </ListItem.Title>
                      <ListItem.Subtitle>
                        {i18n.t("AIDescription")}
                      </ListItem.Subtitle>
                    </ListItem.Content>
                  </ListItem>
                  <View style={[styles.dividerStyle]} />
                  <ListItem
                    containerStyle={{
                      height: "auto",
                      backgroundColor: errorColor,
                    }}
                    key="18"
                  >
                    <ListItem.Content>
                      <Input
                        underlineColorAndroid="transparent"
                        inputContainerStyle={{ borderBottomWidth: 0 }}
                        style={{
                          height: "auto",
                          lineHeight: 20,
                          fontSize: 17,
                          borderWidth: 2,
                          borderColor: "transparent",
                          borderRadius: 10,
                          paddingRight: 5,
                        }}
                        value={dname}
                        autoCapitalize="sentences"
                        keyboardType="default"
                        onChangeText={(text) => {
                          setDName(text);
                          setIsAI(false);
                        }}
                        multiline={true}
                        placeholder={i18n.t("AIPlaceholder")}
                      ></Input>
                    </ListItem.Content>
                  </ListItem>
                  <View style={[styles.dividerStyle]} />
                </>
              )}
              <ListItem key="0">
                <Icon
                  type="ionicon"
                  name="image-outline"
                  size={25}
                  color="#3D4849"
                  containerStyle={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                />
                <ListItem.Content>
                  <ListItem.Title style={styles.imageUserNameTitleBlack}>
                    {i18n.t("e1")}
                  </ListItem.Title>
                  <ListItem.Subtitle>{i18n.t("e2")}</ListItem.Subtitle>
                </ListItem.Content>
              </ListItem>
              <View style={[styles.dividerStyle]} />
              <ListItem
                containerStyle={{ height: 250, backgroundColor: "#fafbfc" }}
                key="16"
              >
                <ListItem.Content
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <TouchableOpacity
                    onPress={handlePresentModalPress}
                  >
                    {image ? (
                      <Image
                        key={image}
                        indicator={Progress}
                        style={{
                          height: 200,
                          width: 300,
                          overflow: "hidden",
                          backgroundColor: "#f2f2f2",
                          borderRadius: 16,
                        }}
                        onLoad={async () => {
                          if (isEditing && !isAI) {
                            await editImage(image);
                          }
                        }}
                        // Provide a local fallback image for better UX
                        fallback={require("../../../assets/elementor-placeholder-image.png")}
                        onError={(e) => {
                          console.log("Image load error:", e.nativeEvent.error);
                          if (isAI && image.includes("pollinations.ai")) {
                            AITexttoImage(); // Try regenerating if AI image failed to load
                          }
                        }}
                        resizeMode={FastImage.resizeMode.cover}
                        source={{
                          uri: image,
                          priority: FastImage.priority.high,
                          cacheControl: FastImage.cacheControl.immutable,
                        }}
                      />
                    ) : (
                      <Image
                        key={"elementor-placeholder-image.png"}
                        source={require("../../../assets/elementor-placeholder-image.png")}
                        indicator={Progress}
                        resizeMode={FastImage.resizeMode.cover}
                        style={{
                          height: 200,
                          width: 300,
                          borderRadius: 16,
                          overflow: "hidden",
                        }}
                      />
                    )}
                  </TouchableOpacity>
                  <Text style={{ color: "#d2d2d2", margin: 5 }}>
                    {i18n.t("e3")}
                  </Text>
                </ListItem.Content>
              </ListItem>
              {image ? (
                <ListItem
                  containerStyle={{ height: 45, backgroundColor: "#fafbfc" }}
                  key="25"
                >
                  <ListItem.Content>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-around",
                      }}
                    >
                      <TouchableOpacity
                        style={{
                          width: "50%",
                          height: 40,
                          marginTop: 20,
                        }}
                        onPress={() => {
                          editImage(image);
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            gap: 10,
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Icon
                            type="material-community"
                            name="image-edit-outline"
                            size={20}
                            color="#3D4849"
                          />

                          <Text>{i18n.t("Edit Image")}</Text>
                        </View>
                      </TouchableOpacity>
                      {isAI && image.includes("pollinations.ai") ? (
                        <TouchableOpacity
                          style={{
                            width: "50%",
                            height: 40,
                            marginTop: 20,
                          }}
                          onPress={() => {
                            Alert.alert(
                              i18n.t("ReportAI"),
                              i18n.t("RReportAIImage"),
                              [
                                {
                                  text: i18n.t("Cancel"),
                                  onPress: () => console.log("Cancel Pressed"),
                                  style: "destructive",
                                },
                                {
                                  text: i18n.t("Flag & Redraw"),
                                  onPress: () => {
                                    setSeed(prevSeed => prevSeed - 1);
                                    AITexttoImage();
                                  },
                                  style: "default",
                                },
                              ],
                              { cancelable: false }
                            );
                          }}
                        >
                          <View
                            style={{
                              flexDirection: "row",
                              gap: 10,
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Icon
                              type="material"
                              name="report-gmailerrorred"
                              size={20}
                              color="#3D4849"
                            />

                            <Text>{i18n.t("Flag")}</Text>
                          </View>
                        </TouchableOpacity>
                      ) : (
                        <></>
                      )}
                      <TouchableOpacity
                        style={{
                          width: "50%",
                          height: 40,
                          marginTop: 20,
                        }}
                        onPress={() => {
                          setImage("");
                          setIsAI(false);
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            gap: 10,
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Icon
                            type="material-community"
                            name="delete-empty-outline"
                            size={20}
                            color="red"
                          />

                          <Text style={{ color: "red" }}>
                            {i18n.t("Delete Image")}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  </ListItem.Content>
                </ListItem>
              ) : (
                <></>
              )}
              {isPro && (
                <ListItem
                  containerStyle={{ height: 45, backgroundColor: "#fafbfc" }}
                  key="26_ai" // Changed key to avoid conflict
                >
                  <ListItem.Content>
                    <TouchableOpacity
                      style={{
                        width: "100%",
                        padding: 5, // Reduced padding
                        borderRadius: 10,
                        alignItems: "center",
                      }}
                      onPress={() => {
                        handleDismissModalPress(); // Dismiss bottom sheet if open
                        if (name.length < 1) {
                            setVerified(false);
                            Alert.alert(
                                i18n.t("e4"),
                                i18n.t("EventName"),
                                [
                                    { text: i18n.t("Close"), style: "destructive" },
                                ],
                                { cancelable: false }
                            );
                        } else {
                            setVerified(true);
                            Alert.alert(
                                i18n.t("AI Image Generator"),
                                i18n.t("Note: AI Image"),
                                [
                                    { text: i18n.t("Cancel"), style: "destructive" },
                                    {
                                        text: i18n.t("Continue"),
                                        onPress: () => {
                                            const proTitle = constants.badWords.some(
                                                (word) => dname.toLowerCase().includes(word.toLowerCase())
                                            );
                                            const title = constants.badWords.some(
                                                (word) => name.toLowerCase().includes(word.toLowerCase())
                                            );
                                            if (proTitle || title) {
                                                Alert.alert(
                                                    i18n.t("BadWords"),
                                                    i18n.t("BadWordsDescription"),
                                                    [{ text: i18n.t("Close"), style: "destructive" }],
                                                    { cancelable: false }
                                                );
                                            } else {
                                                AITexttoImage();
                                            }
                                        },
                                        style: "default",
                                    },
                                ],
                                { cancelable: false }
                            );
                        }
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          gap: 10,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Icon
                          type="material-community"
                          name="robot"
                          size={20}
                          color="#3D4849"
                        />

                        <Text>{i18n.t("Generate AI Image")}</Text>
                      </View>
                    </TouchableOpacity>
                  </ListItem.Content>
                </ListItem>
              )}
              <View style={[styles.dividerStyle]} />
              <ListItem key="13">
                <Icon
                  type="material-community"
                  name="refresh-auto"
                  size={25}
                  color="#3D4849"
                  containerStyle={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                />
                <ListItem.Content>
                  <ListItem.Title style={styles.imageUserNameTitleBlack}>
                    {i18n.t("e7")}
                  </ListItem.Title>
                  <ListItem.Subtitle>{i18n.t("e8")}</ListItem.Subtitle>
                </ListItem.Content>
              </ListItem>
              <View style={[styles.dividerStyle]} />
              <ListItem
                containerStyle={{ height: 65, backgroundColor: "#fafbfc" }}
                key="17_autoJoin" // Changed key for clarity
              >
                <ListItem.Content>
                  <Switch
                    style={{ alignSelf: "flex-end" }}
                    value={switch4}
                    onValueChange={toggleSwitch4}
                  />
                </ListItem.Content>
              </ListItem>

              <View style={[styles.dividerStyle]} />
              <ListItem key="5">
                <Icon
                  type="font-awesome-5"
                  name="camera-retro"
                  size={25}
                  color="#3D4849"
                  containerStyle={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                />
                <ListItem.Content>
                  <ListItem.Title style={styles.imageUserNameTitleBlack}>
                    {i18n.t("e9")}
                  </ListItem.Title>
                  <ListItem.Subtitle>{i18n.t("e10")}</ListItem.Subtitle>
                </ListItem.Content>
              </ListItem>

              <View style={[styles.dividerStyle]} />
              <ListItem
                containerStyle={{ height: 100, backgroundColor: "#fafbfc" }}
                key="6"
              >
                <ListItem.Content
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                    height: 65,
                  }}
                >
                  <ButtonGroup
                    selectedIndex={cameras}
                    buttons={
                      isPro
                        ? constants.camera_amount_PRO
                        : constants.camera_amount
                    }
                    onPress={cameraChange}
                    selectedButtonStyle={{ backgroundColor: "#ea5504" }}
                    containerStyle={{ marginBottom: 5 }}
                  />
                </ListItem.Content>
              </ListItem>
              {isPro && (
                <>
                 
                  <View style={[styles.dividerStyle]} />
                  <ListItem key="19">
                    <Icon
                      type="material-community"
                      name="upload"
                      size={25}
                      color="#3D4849"
                      containerStyle={{
                        width: 28,
                        height: 28,
                        borderRadius: 6,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    />
                    <ListItem.Content>
                      <ListItem.Title style={styles.imageUserNameTitleBlack}>
                        {i18n.t("Media")}
                      </ListItem.Title>
                      <ListItem.Subtitle>
                        {i18n.t("MediaDescription")}
                      </ListItem.Subtitle>
                    </ListItem.Content>
                  </ListItem>
                  <View style={[styles.dividerStyle]} />
                  <ListItem
                    containerStyle={{ height: 100, backgroundColor: "#fafbfc" }}
                    key="20"
                  >
                    <ListItem.Content
                      style={{
                        alignItems: "center",
                        justifyContent: "center",
                        height: 65,
                      }}
                    >
                      <ButtonGroup
                        buttons={constants.media_amount}
                        selectedIndex={media}
                        onPress={mediaChange}
                        selectedButtonStyle={{ backgroundColor: "#ea5504" }}
                        containerStyle={{ marginBottom: 5 }}
                      />
                    </ListItem.Content>
                  </ListItem>
                </>
              )}
              <View style={[styles.dividerStyle]} />
              <ListItem key="7_time">
                <Icon
                  type="ionicon" // Corrected type for 'today-outline'
                  name="today-outline"
                  size={25}
                  color="#3D4849"
                  containerStyle={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                />
                <ListItem.Content>
                  <ListItem.Title style={styles.imageUserNameTitleBlack}>
                    {i18n.t("e11")}
                  </ListItem.Title>
                  <ListItem.Subtitle>{i18n.t("e12")}</ListItem.Subtitle>
                </ListItem.Content>
              </ListItem>
              <View style={[styles.dividerStyle]} />
              <ListItem containerStyle={{ backgroundColor: "#fafbfc" }} key="8_duration">
                <ListItem.Content style={{ height: 65, margin: 10 }}>
                  <ButtonGroup
                    buttons={
                      isPro
                        ? constants.camera_time_text_PRO
                        : constants.camera_time_text
                    }
                    selectedIndex={selectedIndex}
                    onPress={daysChange}
                    selectedButtonStyle={{ backgroundColor: "#ea5504" }}
                    containerStyle={{ marginBottom: 20 }}
                  />
                </ListItem.Content>
              </ListItem>
              <View style={[styles.dividerStyle]} />
              <ListItem key="9_start_date">
                <Icon
                  type="material-community"
                  name="clock-start"
                  size={25}
                  color="#3D4849"
                  containerStyle={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                />
                <ListItem.Content>
                  <ListItem.Title style={styles.imageUserNameTitleBlack}>
                    {i18n.t("e13")}
                  </ListItem.Title>
                  <ListItem.Subtitle>{i18n.t("e14")}</ListItem.Subtitle>
                </ListItem.Content>
                <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                  <Text style={{ color: "#ea5504", fontWeight: "bold" }}>
                    {moment(selectedDate).format("LLL")}
                  </Text>
                </TouchableOpacity>
              </ListItem>
              <View style={[styles.dividerStyle]} />
              <ListItem
                containerStyle={{
                  // Height is managed by DateTimePicker directly if shown, otherwise minimal
                  height: Platform.OS == "ios" ? (showDatePicker ? 360 : 60) : 60,
                  backgroundColor: "#fafbfc",
                }}
                key="10_datetimepicker_container" // Changed key
              >
                <ListItem.Content
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%", // Let content take full height
                    marginBottom: 20, // Keep original margin if needed
                  }}
                >
                  {Platform.OS == "android" && !showDatePicker && !showTimePicker && (
                    <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                      <ListItem.Title
                        style={[
                          styles.imageUserNameTitleBlack,
                          {
                            marginTop: 20,
                            color: "#ea5504",
                            fontWeight: "bold",
                          },
                        ]}
                      >
                        {moment(selectedDate).format("LLL")}
                      </ListItem.Title>
                    </TouchableOpacity>
                  )}
                  {showDatePicker && Platform.OS == "android" && (
                    <DateTimePicker
                      testID="datePicker"
                      minuteInterval={interval}
                      locale={deviceLanguage}
                      is24Hour={RNLocalize.uses24HourClock()}
                      timeZoneName={RNLocalize.getTimeZone()}
                      value={selectedDate}
                      mode={ANDROID_MODE.DATE}
                      display={ANDROID_DISPLAY.CALENDAR}
                      onChange={onChangeAndroid}
                      minimumDate={minimumDate}
                    />
                  )}
                  {showTimePicker && Platform.OS == "android" && (
                    <DateTimePicker
                      testID="timePicker"
                      locale={deviceLanguage}
                      is24Hour={RNLocalize.uses24HourClock()}
                      timeZoneName={RNLocalize.getTimeZone()}
                      minuteInterval={interval}
                      value={selectedDate} // Use selectedDate for time picker as well
                      mode={ANDROID_MODE.TIME}
                      display={ANDROID_DISPLAY.CLOCK}
                      onChange={onChange}
                      minimumDate={minimumDate} // Pass minimumDate if applicable to time component
                    />
                  )}
                  {showDatePicker && Platform.OS == "ios" && (
                    <DateTimePicker
                      testID="dateTimePicker"
                      locale={deviceLanguage}
                      is24Hour={RNLocalize.uses24HourClock()}
                      timeZoneName={RNLocalize.getTimeZone()}
                      minuteInterval={interval}
                      value={selectedDate}
                      mode={IOS_MODE.DATETIME}
                      display={IOS_DISPLAY.COMPACT}
                      onChange={onChangeIOS}
                      minimumDate={minimumDate}
                    />
                  )}
                </ListItem.Content>
              </ListItem>
              <View style={[styles.dividerStyle]} />
              <ListItem key="11_gallery_toggle">
                <Icon
                  type="material-community"
                  name="view-gallery-outline"
                  size={25}
                  color="#3D4849"
                  containerStyle={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                />
                <ListItem.Content>
                  <ListItem.Title style={styles.imageUserNameTitleBlack}>
                    {i18n.t("e15")}
                  </ListItem.Title>
                  <ListItem.Subtitle>{i18n.t("e16")}</ListItem.Subtitle>
                </ListItem.Content>
              </ListItem>

              <View style={[styles.dividerStyle]} />
              <ListItem
                containerStyle={{ height: 65, backgroundColor: "#fafbfc" }}
                key="12_gallery_switch"
              >
                <ListItem.Content>
                  <Switch
                    style={{ alignSelf: "flex-end" }}
                    value={switch2}
                    onValueChange={toggleSwitch2}
                  />
                </ListItem.Content>
              </ListItem>

              <View style={[styles.dividerStyle]} />
              {isPro && (
                <>
                  <ListItem key="15_social_share">
                    <Icon
                      type="material-community"
                      name="share"
                      size={25}
                      color="#3D4849"
                      containerStyle={{
                        width: 28,
                        height: 28,
                        borderRadius: 6,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    />
                    <ListItem.Content>
                      <ListItem.Title style={styles.imageUserNameTitleBlack}>
                        {i18n.t("e17")}
                      </ListItem.Title>
                      <ListItem.Subtitle>{i18n.t("e18")}</ListItem.Subtitle>
                    </ListItem.Content>
                  </ListItem>
                  <View style={[styles.dividerStyle]} />
                  <ListItem
                    containerStyle={{ height: 65, backgroundColor: "#fafbfc" }}
                    key="16_social_switch"
                  >
                    <ListItem.Content>
                      <Switch
                        style={{ alignSelf: "flex-end" }}
                        value={switch1}
                        onValueChange={toggleSwitch1}
                      />
                    </ListItem.Content>
                  </ListItem>
                  <View style={[styles.dividerStyle]} />
                </>
              )}
              <ListItem key="26_hide_event">
                <Icon
                  type="material"
                  name="hide-source"
                  size={25}
                  color="#3D4849"
                  containerStyle={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                />
                <ListItem.Content>
                  <ListItem.Title style={styles.imageUserNameTitleBlack}>
                    {i18n.t("HideEvent")}
                  </ListItem.Title>
                  <ListItem.Subtitle>
                    {i18n.t("HideEventDesc")}
                  </ListItem.Subtitle>
                </ListItem.Content>
              </ListItem>
              <View style={[styles.dividerStyle]} />
              <ListItem
                containerStyle={{ height: 65, backgroundColor: "#fafbfc" }}
                key="27_hide_switch"
              >
                <ListItem.Content>
                  <Switch
                    style={{ alignSelf: "flex-end" }}
                    value={switch5}
                    onValueChange={toggleSwitch5}
                  />
                </ListItem.Content>
              </ListItem>
            </View>
        </ScrollView>
        <BottomSheetModal
          backdropComponent={renderBackdrop}
          ref={bottomSheetRef}
          snapPoints={snapPoints}
          enablePanDownToClose
          keyboardBlurBehavior={"restore"}
          android_keyboardInputMode={"adjustPan"}
          enableDismissOnClose
          enableDynamicSizing
          style={{
            backgroundColor: "transparent",
            elevation: 15,
          }}
        >
          <BottomSheetView
            style={[StyleSheet.absoluteFill, { alignItems: "center" }]}
          >
            <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 20 }}>{i18n.t("Make a Selection")}</Text>
            <Animated.View
              style={{
                justifyContent: "flex-end",
                width: '100%', // Ensure it takes full width of bottom sheet
                paddingHorizontal: 20, // Add padding
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-around", // Changed to space-around for better spacing
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon
                    type="material-community"
                    size={40}
                    name="robot" // Changed icon to robot for AI
                    color={"#000"}
                    containerStyle={{
                      height: 75,
                      width: 75,
                      alignContent: "center",
                      justifyContent: "center",
                      borderRadius: 22,
                    }}
                    onPress={() => {
                      handleDismissModalPress(); // Dismiss bottom sheet immediately
                      if (name.length < 1) {
                        setVerified(false);
                        Alert.alert(
                          i18n.t("e4"),
                          i18n.t("EventName"),
                          [
                            { text: i18n.t("Close"), style: "destructive" },
                          ],
                          { cancelable: false }
                        );
                      } else {
                        setVerified(true);
                        Alert.alert(
                          i18n.t("AI Image Generator"),
                          i18n.t("Note: AI Image"),
                          [
                            { text: i18n.t("Cancel"), style: "destructive" },
                            {
                              text: i18n.t("Continue"),
                              onPress: () => {
                                const proTitle = constants.badWords.some(
                                  (word) => dname.toLowerCase().includes(word.toLowerCase())
                                );
                                const title = constants.badWords.some((word) =>
                                  name.toLowerCase().includes(word.toLowerCase())
                                );
                                if (proTitle || title) {
                                  Alert.alert(
                                    i18n.t("BadWords"),
                                    i18n.t("BadWordsDescription"),
                                    [
                                      { text: i18n.t("Close"), style: "destructive" },
                                    ],
                                    { cancelable: false }
                                  );
                                } else {
                                  AITexttoImage();
                                }
                              },
                              style: "default",
                            },
                          ],
                          { cancelable: false }
                        );
                      }
                    }}
                  />
                  <Text
                    style={{
                      textAlign: "center",
                      marginTop: -10,
                    }}
                  >
                    {i18n.t("AI")}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon
                    type="material-community"
                    size={40}
                    name="image-outline"
                    color={"#000"}
                    containerStyle={{
                      height: 75,
                      width: 75,
                      alignContent: "center",
                      justifyContent: "center",
                      borderRadius: 22,
                    }}
                    onPress={pickImage} // Direct call
                  />
                  <Text
                    style={{
                      textAlign: "center",
                      marginTop: -10,
                    }}
                  >
                    {i18n.t("Gallery")}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon
                    type="material-community"
                    size={40}
                    name="camera-outline"
                    color={"#000"}
                    containerStyle={{
                      height: 75,
                      width: 75,
                      alignContent: "center",
                      justifyContent: "center",
                      borderRadius: 22,
                    }}
                    onPress={() => {
                        handleDismissModalPress();
                        takePhoto(); // Direct call
                    }}
                  />
                  <Text
                    style={{
                      textAlign: "center",
                      marginTop: -10,
                    }}
                  >
                    {i18n.t("Camera")}
                  </Text>
                </View>
              </View>
            </Animated.View>
          </BottomSheetView>
        </BottomSheetModal>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};
export default EditCamera;