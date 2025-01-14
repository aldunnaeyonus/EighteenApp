import {
  View,
  ScrollView,
  Platform,
  Text,
  Modal,
  Alert,
  NativeModules,
} from "react-native";
import { TouchableOpacity } from "react-native";
import styles from "../../styles/SliderEntry.style";
import { ListItem, Switch, ButtonGroup, Input } from "@rneui/themed";
import React, { useState, useCallback } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  ANDROID_MODE,
  IOS_MODE,
  ANDROID_DISPLAY,
  IOS_DISPLAY,
  constants,
} from "../../utils";
import * as ImagePicker from "expo-image-picker";
import FormData from "form-data";
import { storage } from "../../context/components/Storage";
import { useMMKVObject } from "react-native-mmkv";
import FastImage from "react-native-fast-image";
import { createImageProgress } from "react-native-image-progress";
const Image = createImageProgress(FastImage);
import Progress from "react-native-progress";
import { useToast } from "react-native-styled-toast";
import moment from "moment";
import { useFocusEffect } from "@react-navigation/native";
import { handleUpload } from "../SubViews/upload";
import { ActivityIndicator } from "react-native-paper";
import * as i18n from "../../../i18n";
import { Icon } from "react-native-elements";
import * as RNLocalize from "react-native-localize";
import PhotoEditor from "@baronha/react-native-photo-editor";
const stickers = [];
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import NotifService from "../../../NotifService";

const CreateCamera = (props) => {
  var newDate = new Date();
  const [switch2, setSwitch2] = useState(true);
  const [switch3, setSwitch3] = useState(false);
  const [switch4, setSwitch4] = useState(false);
  const [switch1, setSwitch1] = useState(false);
  const [interval] = useState(1);
  const [minimumDate] = useState(newDate);
  const [maximumDate] = useState();
  const [selectedDate, setSelectedDate] = useState(newDate);
  const [timeDate, setTimeDate] = useState(newDate);
  const [show, setShow] = useState(false);
  const [clockShow, setClockShow] = useState(false);
  const [isEditing, setisEditing] = useState(false);
  const [modalUpload, setModalUpload] = useState(false);
  const [isAI, setIsAI] = useState(false);
  const { toast } = useToast();
  const [user] = useMMKVObject("user.Data", storage);
  const [cameras, setCameras] = useState(0);
  const [media, setMedia] = useState(0);
  const [name, setName] = useState("");
  const [dname, setDName] = useState("");
  const [isPro] = useState(user.isPro == "1" ? true : false);
  const [image, setImage] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [start, setStart] = useState(moment().unix());
  const [end, setEnd] = useState(moment().unix() + 28800);
  const [verified, setVerified] = useState(true);
  const [errorColor] = useState(verified ? "#fafbfc" : "#ffa3a6");
  const [uploading] = useMMKVObject("uploadData", storage);
  var notification;

  useFocusEffect(
    useCallback(async () => {
      notification = new NotifService();
    }, [])
  );

  const MODE_VALUES = Platform.select({
    ios: Object.values(IOS_MODE),
    android: Object.values(ANDROID_MODE),
    windows: [],
  });
  const DISPLAY_VALUES = Platform.select({
    ios: Object.values(IOS_DISPLAY),
    android: Object.values(ANDROID_DISPLAY),
    windows: [],
  });
  let deviceLanguage =
    Platform.OS === "ios"
      ? NativeModules.SettingsManager.settings.AppleLocale
      : NativeModules.I18nManager.localeIdentifier;
  const usePollinationsImages = (prompt, options = {}) => {
    const {
      width = 1024,
      height = 863,
      model = "flux",
      seed = 72,
      nologo = true,
      enhance = false,
    } = options;
    const imageUrl = () => {
      const params = new URLSearchParams({
        width,
        height,
        model,
        seed,
        nologo,
        enhance,
      });
      return `https://pollinations.ai/p/${encodeURIComponent(prompt)}?${params.toString()}`;
    };
    return imageUrl;
  };

  const editImage = async (image) => {
    try {
      const path = await PhotoEditor.open({
        path: image,
        stickers,
      });
      setImage(path);
      setisEditing(false);
    } catch (e) {
      console.log("e", e);
      setisEditing(false);
    }
  };
  const cameraChange = (value) => {
    setCameras(value);
  };

  const mediaChange = (value) => {
    setMedia(value);
  };

  const daysChange = (value) => {
    setSelectedIndex(value);
    setEnd(
      start +
        (isPro
          ? parseInt(constants.camera_time_seconds_PRO[value])
          : parseInt(constants.camera_time_seconds_PRO[value]))
    );
  };

  const onChangeIOS = (event, selectDate) => {
    if (event.type === "neutralButtonPressed") {
      setSelectedDate(selectedDate);
      setStart(moment(selectedDate).unix());
      setEnd(
        moment(selectedDate).unix() +
          (isPro
            ? parseInt(constants.camera_time_seconds_PRO[selectedIndex])
            : parseInt(constants.camera_time_seconds_PRO[selectedIndex]))
      );
    } else {
      setSelectedDate(selectDate);
      setStart(moment(selectDate).unix());
      setEnd(
        moment(selectDate).unix() +
          (isPro
            ? parseInt(constants.camera_time_seconds_PRO[selectedIndex])
            : parseInt(constants.camera_time_seconds_PRO[selectedIndex]))
      );
    }
  };

  const onChange = (event, selectDate) => {
    if (event.type === "set") {
      setClockShow(false);
      setSelectedDate(selectDate);
      setStart(moment(selectDate).unix());
      setEnd(
        moment(selectDate).unix() +
          (isPro
            ? parseInt(constants.camera_time_seconds_PRO[selectedIndex])
            : parseInt(constants.camera_time_seconds_PRO[selectedIndex]))
      );
    } else {
      setClockShow(false);
      setSelectedDate(selectedDate);
      setStart(moment(selectedDate).unix());
      setEnd(
        moment(selectedDate).unix() +
          (isPro
            ? parseInt(constants.camera_time_seconds_PRO[selectedIndex])
            : parseInt(constants.camera_time_seconds_PRO[selectedIndex]))
      );
    }
  };

  const AITexttoImage = async () => {
    const userImage = usePollinationsImages(
      dname.length > 1
        ? dname
        : `Create a cinematic 4K photo shot on a 70mm, Ultra-Wide Angle, Depth of Field, Shutter Speed 1/1000, F/22 camera for a gathering that is titled ${name} and is in dramatic and stunning setting located in ${RNLocalize.getTimeZone()} and is also an award winning photo worthy of instagram.`,
      {
        width: 1024,
        height: 863,
        seed: 72,
        model: "flux",
        nologo: true,
        enhance: true,
      }
    );
    setImage(userImage);
    setisEditing(true);
  };

  const onChangeAndroid = (event, selectDate) => {
    if (event.type === "set") {
      setShow(false);
      setSelectedDate(selectDate);
      setTimeDate(selectDate);
      setClockShow(true);
    } else {
      setShow(false);
      setSelectedDate(selectedDate);
      setTimeDate(selectedDate);
      setClockShow(false);
    }
  };

  const toggleSwitch1 = () => {
    setSwitch1(!switch1);
  };

  const toggleSwitch2 = () => {
    setSwitch2(!switch2);
  };

  const toggleSwitch4 = () => {
    setSwitch4(!switch4);
  };

  const toggleSwitch3 = () => {
    setSwitch3(!switch3);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setisEditing(true);
    } else {
      setImage(image);
      setisEditing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (!props.unsubscribe) {
        toast({
          message: i18n.t("No internet connection"),
          toastStyles: {
            bg: "#3D4849",
            borderRadius: 5,
          },
          duration: 5000,
          color: "white",
          iconColor: "white",
          iconFamily: "Entypo",
          iconName: "info-with-circle",
          closeButtonStyles: {
            px: 4,
            bg: "translucent",
          },
          closeIconColor: "white",
          hideAccent: true,
        });
      }
      props.navigation.setOptions({
        title: isPro == "1" ? i18n.t("CreatePro") : i18n.t("Create"),
        headerRight: () =>
          name.length > 0 && image.length > 0 ? (
            <TouchableOpacity
              onPress={() => {
                createEvent();
              }}
            >
              <Text
                style={{
                  color: "#3D4849",
                  marginRight: 10,
                  fontSize: 15,
                  fontWeight: "bold",
                }}
              >
                {i18n.t("Create")}
              </Text>
            </TouchableOpacity>
          ) : (
            <></>
          ),
      });
    }, [
      verified,
      props,
      name,
      isEditing,
      verified,
      image,
      errorColor,
      selectedIndex,
      selectedDate,
      start,
      end,
      cameras,
      switch4,
      switch2,
      switch3,
      isAI,
      user,
      show,
    ])
  );

  const makeid = (length) => {
    let result = "";
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
  };

  const createEvent = async () => {
    const pin =
      "SNAP-" +
      makeid(4) +
      "-" +
      makeid(5) +
      "-" +
      moment().unix() +
      "-" +
      makeid(3);
    var formData = new FormData();
    var fileName = "";
    formData.append("owner", user.user_id);
    formData.append("eventName", String(name));
    formData.append("purchases", switch3 ? "1" : "0");
    formData.append(
      "length",
      String(
        isPro
          ? constants.camera_time_text_PRO[selectedIndex]
          : constants.camera_time_text[selectedIndex]
      )
    );
    formData.append(
      "cameras",
      isPro
        ? constants.camera_amount_PRO[cameras]
        : constants.camera_amount[cameras]
    );
    formData.append("shots", isPro ? constants.media_amount[media] : "18");
    formData.append("start", start);
    formData.append("pin", pin);
    formData.append("ai_description", isPro ? dname : "");
    formData.append("end", end);
    formData.append("photoGallery", switch2 ? "1" : "0");
    formData.append("socialMedia", isPro ? (switch1 ? "1" : "0") : "1");
    formData.append("autoJoin", switch4 ? "1" : "0");
    formData.append("device", Platform.OS);
    formData.append("camera", "0");
    fileName =
      "SNAP18-cover-" +
      user.user_id +
      "-" +
      Date.now() +
      image.split("/").pop();
    formData.append("aiIMAGE", "");
    formData.append("file", {
      name: fileName,
      type: constants.mimes(image.split(".").pop()), // set MIME type
      uri: Platform.OS === "android" ? image : image.replace("file://", ""),
    });
    formData.append("photoName", fileName);
    formData.append("isAI", "0");
    props.navigation.setOptions({
      headerRight: () => (
        <ActivityIndicator color="black" size={"small"} animating={true} />
      ),
    });
    await CameraRoll.saveAsset(image);

    handleUpload(
      constants.url + "/camera/create.php",
      formData,
      user.user_id,
      "create",
      "",
      name,
      i18n.t("CreatingEvent") + " " + i18n.t("PleaseWait"),
      image,
      uploading
    );
    if (parseInt(start) >= moment().unix()) {
      notification.scheduleNotif(
        String(name),
        i18n.t("EvnetStart"),
        parseInt(start * 1000),
        pin + "-start",
        constants.urldata +
          "/" +
          user.user_id +
          "/events/" +
          pin +
          "/" +
          fileName
      );
    }
    notification.scheduleNotif(
      String(name),
      i18n.t("EvnetEnd"),
      parseInt(end * 1000),
      pin + "-end",
      constants.urldata + "/" + user.user_id + "/events/" + pin + "/" + fileName
    );

    setTimeout(() => {
      setIsAI(false);
      props.navigation.goBack();
    }, 1000);
  };

  return (
    <>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalUpload}
        onRequestClose={() => {
          setModalUpload(!modalUpload);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View
              style={{
                flexDirection: "column",
                marginTop: -20,
                marginBottom: 25,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 30,
                  alignContent: "space-between",
                }}
              >
                <Text
                  style={{
                    textAlign: "center",
                    fontSize: 20,
                    fontWeight: 500,
                  }}
                >
                  {i18n.t("Make a Selection")}
                </Text>
              </View>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                gap: 30,
                alignContent: "space-between",
              }}
            >
              <View style={{ flexDirection: "column" }}>
                <Icon
                  type="material-community"
                  size={40}
                  name="chip"
                  color={"#fff"}
                  containerStyle={{
                    height: 75,
                    width: 75,
                    alignContent: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(116, 198, 190, 1)",
                    borderRadius: 22,
                  }}
                  onPress={() => {
                    setModalUpload(false);
                    if (name.length < 1) {
                      setisEditing(false);
                      setVerified(false);
                    } else {
                      setVerified(true);
                      Alert.alert(
                        i18n.t("AI Image Generator"),
                        i18n.t("Note: AI Image"),
                        [
                          {
                            text: i18n.t("Cancel"),
                            onPress: () => console.log("Cancel Pressed"),
                            style: "destructive",
                          },
                          {
                            text: i18n.t("Continue"),
                            onPress: async () => {
                              setTimeout(() => {
                                setIsAI(true);
                                AITexttoImage();
                              }, 500);
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
                    marginTop: 10,
                  }}
                >
                  {i18n.t("AI")}
                </Text>
              </View>
              <View style={{ flexDirection: "column" }}>
                <Icon
                  type="material-community"
                  size={40}
                  name="image-outline"
                  color={"#fff"}
                  containerStyle={{
                    height: 75,
                    width: 75,
                    alignContent: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(250, 190, 0, 1)",
                    borderRadius: 22,
                  }}
                  onPress={() => {
                    setTimeout(() => {
                      setIsAI(false);
                      pickImage();
                    }, 200);
                    setModalUpload(false);
                  }}
                />
                <Text
                  style={{
                    textAlign: "center",
                    marginTop: 10,
                  }}
                >
                  {i18n.t("Gallery")}
                </Text>
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={{
              marginTop: 20,
              flexDirection: "row",
              width: 250,
              backgroundColor: "rgba(234, 85, 4, 1)",
              borderRadius: 24,
              padding: 15,
              alignItems: "center",
              justifyContent: "center",
              marginbottom: 20,
            }}
            onPress={() => {
              setModalUpload(false);
            }}
          >
            <Text
              style={{
                textTransform: "uppercase",
                fontSize: 20,
                fontWeight: 600,
                color: "#fff",
              }}
            >
              Close
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
      <SafeAreaProvider>
        <SafeAreaView
          style={{
            backgroundColor: "white",
            height: "100%",
            width: "100%",
          }}
          edges={["bottom", "left", "right"]}
        >
          <ScrollView
            style={{ backgroundColor: "#fff", marginBottom: 0 }}
            keyboardShouldPersistTaps={"never"}
            keyboardDismissMode="on-drag"
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
                containerStyle={{ height: "auto", backgroundColor: errorColor }}
                key="2"
              >
                <ListItem.Content>
                  <ListItem.Input
                    style={{
                      height: "auto",
                      fontSize: 17,
                      borderWidth: 2,
                      borderColor: "transparent",
                      borderRadius: 10,
                      paddingRight: 5,
                    }}
                    underlineColorAndroid="transparent"
                    inputContainerStyle={{ borderBottomWidth: 0 }}
                    autoCapitalize="sentences"
                    keyboardType="default"
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
                        autoCapitalize="sentences"
                        keyboardType="default"
                        onChangeText={(text) => {
                          setDName(text);
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
                    onPress={() => {
                      setTimeout(() => {
                        //pickImage();
                        setModalUpload(true);
                      }, 500);
                    }}
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
                        onLoadEnd={async () => {}}
                        onLoad={async () => {
                          {
                            isEditing ? editImage(image) : null;
                          }
                        }}
                        fallback={{ uri: image }}
                        onError={() => {
                          {
                            isAI ? AITexttoImage() : null;
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
                  <Text style={{ color: "grey", margin: 5 }}>
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
                      <TouchableOpacity
                        style={{
                          width: "50%",
                          height: 40,
                          marginTop: 20,
                        }}
                        onPress={() => setImage("")}
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
                key="17"
              >
                <ListItem.Content>
                  <Switch
                    style={{ alignSelf: "flex-end" }}
                    value={switch4}
                    onValueChange={(value) => toggleSwitch4(value)}
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
                    buttons={
                      isPro
                        ? constants.camera_amount_PRO
                        : constants.camera_amount
                    }
                    selectedIndex={cameras}
                    onPress={(value) => {
                      cameraChange(value);
                    }}
                    selectedButtonStyle={{ backgroundColor: "#ea5504" }}
                    containerStyle={{ marginBottom: 5 }}
                  />
                </ListItem.Content>
              </ListItem>
              {isPro && (
                <>
                  <View style={[styles.dividerStyle]} />
                  <ListItem key="23">
                    <Icon
                      type="material"
                      name="18-up-rating"
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
                        {i18n.t("Purchase More Shots")}
                      </ListItem.Title>
                      <ListItem.Subtitle>
                        {i18n.t("Allow members")}
                      </ListItem.Subtitle>
                    </ListItem.Content>
                  </ListItem>
                  <View style={[styles.dividerStyle]} />
                  <ListItem
                    containerStyle={{ height: 65, backgroundColor: "#fafbfc" }}
                    key="22"
                  >
                    <ListItem.Content>
                      <Switch
                        style={{ alignSelf: "flex-end" }}
                        value={switch3}
                        onValueChange={(value) => toggleSwitch3(value)}
                      />
                    </ListItem.Content>
                  </ListItem>
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
                        buttons={constants.camera_amount}
                        selectedIndex={media}
                        onPress={(value) => {
                          mediaChange(value);
                        }}
                        selectedButtonStyle={{ backgroundColor: "#ea5504" }}
                        containerStyle={{ marginBottom: 5 }}
                      />
                    </ListItem.Content>
                  </ListItem>
                </>
              )}

              <View style={[styles.dividerStyle]} />
              <ListItem key="7">
                <Icon
                  type="ionicon"
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
              <ListItem containerStyle={{ backgroundColor: "#fafbfc" }} key="8">
                <ListItem.Content style={{ height: 65, margin: 10 }}>
                  <ButtonGroup
                    buttons={
                      isPro
                        ? constants.camera_time_text_PRO
                        : constants.camera_time_text
                    }
                    selectedIndex={selectedIndex}
                    onPress={(value) => {
                      daysChange(value);
                    }}
                    selectedButtonStyle={{ backgroundColor: "#ea5504" }}
                    containerStyle={{ marginBottom: 5 }}
                  />
                </ListItem.Content>
              </ListItem>
              <View style={[styles.dividerStyle]} />
              <ListItem key="9">
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
              </ListItem>
              <View style={[styles.dividerStyle]} />
              <ListItem
                containerStyle={{
                  height: Platform.OS == "ios" ? 360 : 60,
                  backgroundColor: "#fafbfc",
                }}
                key="10"
              >
                <ListItem.Content
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                    height: 65,
                    marginBottom: 20,
                  }}
                >
                  {Platform.OS == "android" && (
                    <TouchableOpacity onPress={() => setShow(true)}>
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
                        {String(selectedDate)}
                      </ListItem.Title>
                    </TouchableOpacity>
                  )}
                  {Platform.OS == "android" ? (
                    show ? (
                      <DateTimePicker
                        testID="datePicker"
                        minuteInterval={interval}
                        locale={deviceLanguage}
                        maximumDate={maximumDate}
                        is24Hour={RNLocalize.uses24HourClock()}
                        timeZoneName={RNLocalize.getTimeZone()}
                        minimumDate={minimumDate}
                        value={selectedDate}
                        mode={MODE_VALUES[2]}
                        display={DISPLAY_VALUES[0]}
                        negativeButton={{ label: "Cancel", textColor: "red" }}
                        onChange={onChangeAndroid}
                      />
                    ) : clockShow ? (
                      <DateTimePicker
                        testID="timePicker"
                        locale={deviceLanguage}
                        timeZoneName={RNLocalize.getTimeZone()}
                        minuteInterval={interval}
                        maximumDate={timeDate}
                        is24Hour={RNLocalize.uses24HourClock()}
                        minimumDate={timeDate}
                        value={timeDate}
                        mode={MODE_VALUES[1]}
                        display={DISPLAY_VALUES[0]}
                        negativeButton={{ label: "Cancel", textColor: "red" }}
                        onChange={onChange}
                      />
                    ) : (
                      <></>
                    )
                  ) : (
                    <DateTimePicker
                      testID="dateTimePicker"
                      locale={deviceLanguage}
                      is24Hour={RNLocalize.uses24HourClock()}
                      timeZoneName={RNLocalize.getTimeZone()}
                      minuteInterval={interval}
                      maximumDate={maximumDate}
                      minimumDate={minimumDate}
                      value={selectedDate}
                      mode={MODE_VALUES[2]}
                      display={DISPLAY_VALUES[3]}
                      onChange={onChangeIOS}
                    />
                  )}
                </ListItem.Content>
              </ListItem>

              <View style={[styles.dividerStyle]} />
              <ListItem key="11">
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
                key="12"
              >
                <ListItem.Content>
                  <Switch
                    style={{ alignSelf: "flex-end" }}
                    value={switch2}
                    onValueChange={(value) => toggleSwitch2(value)}
                  />
                </ListItem.Content>
              </ListItem>
              <View style={[styles.dividerStyle]} />
              {isPro && (
                <>
                  <ListItem key="15">
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
                    key="16"
                  >
                    <ListItem.Content>
                      <Switch
                        style={{ alignSelf: "flex-end" }}
                        value={switch1}
                        onValueChange={(value) => toggleSwitch1(value)}
                      />
                    </ListItem.Content>
                  </ListItem>
                  <View style={[styles.dividerStyle]} />
                </>
              )}
            </View>
          </ScrollView>
        </SafeAreaView>
      </SafeAreaProvider>
    </>
  );
};

export default CreateCamera;
