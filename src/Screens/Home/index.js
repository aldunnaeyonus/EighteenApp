import React, { useState, useEffect, useCallback } from "react";
import {
  Share,
  StyleSheet,
  Alert,
  Modal,
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Linking,
  TouchableWithoutFeedback,
} from "react-native";
import EmptyStateView from "@tttstudios/react-native-empty-state";
import { constants, SCREEN_WIDTH, SCREEN_HEIGHT } from "../../utils/constants";
import "moment-duration-format";
import FastImage from "react-native-fast-image";
import { createImageProgress } from "react-native-image-progress";
const Image = createImageProgress(FastImage);
import Progress from "react-native-progress";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Icon } from "react-native-elements";
import { storage } from "../../context/components/Storage";
import Animated from "react-native-reanimated";
import { useMMKVObject } from "react-native-mmkv";
import ListItems from "../SubViews/home/listItem";
import FriendHeader from "../SubViews/home/homeHeader";
import { axiosPull } from "../../utils/axiosPull";
import * as i18n from "../../../i18n";
import { useIsFocused } from "@react-navigation/native";
import Loading from "../SubViews/home/Loading";
import FriendListItemHome from "../SubViews/friends/friendsViewListHome";
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
} from "react-native-vision-camera";
import RNFS from "react-native-fs";
import RNImageToPdf from "react-native-image-to-pdf";
import RNPrint from "react-native-print";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ListItem } from "@rneui/themed";

const Home = (props) => {
  const [cameraData, setcameraData] = useMMKVObject(
    "user.Camera.Feed",
    storage
  );
  const [modalQRCodeVisable, setmodalQRCodeVisable] = useState(false);
  const [modalShareVisable, setModalShareVisable] = useState(false);
  const [modalVisable, setmodalVisable] = useState(false);
  const [user] = useMMKVObject("user.Data", storage);
  const [refreshing, setRefreshing] = useState(false);
  const [qrCodeURL, setQrCodeURL] = useState("");
  const AnimatedFlatList = Animated.createAnimatedComponent(Animated.FlatList);
  const [modalVisibleAlert, setModalVisibleAlert] = useState(false);
  const isFocused = useIsFocused();
  const [uploading] = useMMKVObject("uploadData", storage);
  var timeout;
  const triggerProfileFunction = async () => {
    props.navigation.navigate("Profile");
  };
  const device = useCameraDevice("back");
  const [isBarcodeScannerEnabled, setisBarcodeScannerEnabled] = useState(true);
  const { hasPermission, requestPermission } = useCameraPermission();
  const [shareOptions, setshareOptions] = useState({
    title: "",
    url: "",
    message: "",
  });
  const [shareOptionsGallery, setshareOptionsGallery] = useState({
    title: "",
    url: "",
    message: "",
  });
  const [cameraStatus] = ImagePicker.useCameraPermissions();
  const codeScanner = useCodeScanner({
    codeTypes: ["qr"],
    onCodeScanned: async (codes) => {
      if (isBarcodeScannerEnabled) {
        setmodalQRCodeVisable(false);
        const code = JSON.parse(JSON.stringify(codes[0].value));
        if (code.includes("friends")) {
          let removeCode = code.replace("snapseighteenapp://friends/", "");
          let newCode = removeCode.split("/");
          if (newCode[0] == user.user_id) {
            props.navigation.navigate("Profile");
          } else {
            props.navigation.navigate("Friends", {
              userID: newCode[0],
              type: newCode[1],
            });
          }
        } else if (code.includes("join")) {
          let removeCode = code.replace("snapseighteenapp://join/", "");
          let newCode = removeCode.split("/");
          props.navigation.navigate("Join", {
            pin: newCode[0],
            time: newCode[1],
            owner: newCode[2],
          });
        } else {
          await Linking.openURL(code);
        }
        setisBarcodeScannerEnabled(false);
      }
    },
  });

  const _gotoCamera = async (
    pin,
    title,
    owner,
    UUID,
    end,
    start,
    credits,
    tCredits,
    camera_add_social
  ) => {
    if (cameraStatus.status == ImagePicker.PermissionStatus.UNDETERMINED) {
      await ImagePicker.requestCameraPermissionsAsync();
    } else if (cameraStatus.status == ImagePicker.PermissionStatus.DENIED) {
      Alert.alert(
        i18n.t("Permissions"),
        i18n.t("UseCamera"),
        [
          {
            text: i18n.t("Cancel"),
            onPress: () => console.log("Cancel Pressed"),
            style: "destructive",
          },
          {
            text: i18n.t("Settings"),
            onPress: () => {
              Linking.openSettings();
            },
            style: "default",
          },
        ],
        { cancelable: false }
      );
    } else {
      props.navigation.navigate("CameraPage", {
        owner: owner,
        pin: pin,
        title: title,
        credits: credits,
        tCredits: tCredits,
        UUID: UUID,
        end: end,
        camera_add_social: camera_add_social,
        start: start,
        user: user.user_id,
      });
    }
  };

  const _gotoAllFriends = () => {
    props.navigation.navigate("AllFriends");
  };
  const _gotoStore = (pin, owner, type, name, camaras) => {
    props.navigation.navigate("Purchase", {
      pin: pin,
      owner: owner,
      user: user.user_id,
      type: type,
      eventName: name,
      cameras: camaras,
    });
  };

  const _editEvent = (
    UUID,
    pin,
    owner,
    user,
    illustration,
    title,
    cameras,
    show_gallery,
    camera_add_social,
    start,
    camera_purchase_more,
    length_index,
    end,
    shots,
    description
  ) => {
    props.navigation.navigate("EditCamera", {
      UUID: UUID,
      pin: pin,
      owner: owner,
      user: user,
      illustration: illustration,
      title: title,
      cameras: cameras,
      show_gallery: show_gallery,
      camera_add_social: camera_add_social,
      start: start,
      end: end,
      camera_purchase_more: camera_purchase_more,
      length_index: length_index,
      shots: shots,
      description: description,
    });
  };

  const _gotoMedia = async (
    pin,
    title,
    owner,
    UUID,
    end,
    start,
    credits,
    camera_add_social,
    illustration
  ) => {
    props.navigation.navigate("MediaGallery", {
      pin: pin,
      title: title,
      owner: owner,
      user: user.user_id,
      UUID: UUID,
      avatar: user.user_avatar,
      handle: user.user_handle,
      end: end,
      start: start,
      credits: credits,
      camera_add_social: camera_add_social,
      illustration: illustration,
      type: "owner",
    });
    await axiosPull._resetBadge(user.user_id, pin);
    await axiosPull._pullCameraFeed(user.user_id, "owner");
  };

  const _gotoShare = async (pin, time, owner, title) => {
    setshareOptions({
      title: title,
      url: constants.url + "/link.php?pin=" + pin + "." + time + "." + owner,
      message: i18n.t("Join my Snap Eighteen Event") + " " + title,
    });
    setshareOptionsGallery({
      title: title,
      url: constants.url + "/gallery/index.php?pin=" + pin,
      message: i18n.t("ViewLiveGallery"),
    });
    if (user.isPro == "0") {
      try {
        const ShareResponse = await Share.share(shareOptions);
        console.log("Result =>", ShareResponse);
      } catch (error) {
        console.log("Error =>", error);
      }
    } else {
      setModalShareVisable(true);
    }
  };

  const _deleteFeedItemIndex = (UUID) => {
    cameraData.forEach((res, index) => {
      if (res.UUID == UUID) {
        setcameraData((prevState) => {
          prevState.splice(index, 1);
          storage.set("user.Camera.Feed", JSON.stringify(prevState));
          return [...prevState];
        });
      }
    });
  };

  const _addMax = async (pin, owner, pro) => {
    const data = {
      owner: owner,
      pin: pin,
      isPro: pro,
    };
    await axiosPull.postData("/camera/maxCamera.php", data);
    await axiosPull._pullCameraFeed(owner, "owner");
  };

  const _joinFeedItem = async (UUID, owner, pin, title) => {
    props.navigation.navigate("JoinedMembers", {
      UUID: UUID,
      pin: pin,
      owner: owner,
      title: title,
    });
  };

  const _editItem = (UUID, owner, pin) => {
    Alert.alert(
      i18n.t("Close Event"),
      i18n.t("close and end this event"),
      [
        {
          text: i18n.t("Cancel"),
          onPress: () => console.log("Cancel Pressed"),
          style: "default",
        },
        {
          text: i18n.t("Close Event"),
          onPress: () => _editItemFeed(UUID, owner, pin),
          style: "destructive",
        },
      ],
      { cancelable: false }
    );
  };

  const _editItemFeed = async (UUID, owner, pin) => {
    const data = {
      owner: owner,
      pin: pin,
      id: UUID,
    };
    await axiosPull.postData("/camera/close.php", data);
    await axiosPull._pullCameraFeed(owner, "owner");
  };

  const _deleteFeedItem = (UUID, owner, pin) => {
    Alert.alert(
      i18n.t("Delete Event"),
      i18n.t("All data will be lost"),
      [
        {
          text: i18n.t("Cancel"),
          onPress: () => console.log("Cancel Pressed"),
          style: "default",
        },
        {
          text: i18n.t("Delete Event"),
          onPress: () => {
            //deleteItemIndex(JSON.stringify(cameraData), UUID, "user.Camera.Feed");

            _deleteFeedItemSource(UUID, owner, pin);
          },
          style: "destructive",
        },
      ],
      { cancelable: false }
    );
  };

  const _repotPost = async (pin, owner, title) => {
    Alert.alert(
      i18n.t("Report Event"),
      i18n.t("Are you sure you event"),
      [
        {
          text: i18n.t("Cancel"),
          onPress: () => console.log("Cancel Pressed"),
          style: "destructive",
        },
        {
          text: i18n.t("Report Event"),
          onPress: async () => {
            const data = {
              owner: owner,
              user: user.user_id,
              pin: pin,
              title: title,
              type: "event",
              locale: getLocales()[0].languageCode,
            };
            await axiosPull.postData("/camera/report.php", data);
            Alert.alert("", i18n.t("A report event"));
          },
          style: "default",
        },
      ],
      { cancelable: false }
    );
  };

  const _autoJoin = async (owner, pin, end, id) => {
    const data = {
      owner: owner,
      user: user.user_id,
      pin: pin,
      end: end,
      id: id,
    };
    await axiosPull.postData("/camera/autoJoin.php", data);
    await axiosPull._pullFriendFeed(owner);
    await axiosPull._pullFriendCameraFeed(owner, "user", user.user_id);
  };
  const _deleteFeedItemSource = async (UUID, owner, pin) => {
    _deleteFeedItemIndex(UUID);
    const data = {
      owner: owner,
      pin: pin,
      id: UUID,
    };
    await axiosPull.postData("/camera/delete.php", data);
    storage.delete("user.Gallery.Friend.Feed." + pin);
  };

  const _refresh = async () => {
    setRefreshing(true);
    await axiosPull._pullCameraFeed(user.user_id, "owner");
    await axiosPull._pullFriendsFeed(user.user_id);
    setTimeout(async () => {
      setRefreshing(false);
    }, 1000);
  };

  const _gotoQRCode = (link) => {
    setQrCodeURL(link);
    setmodalVisable(true);
  };

  useEffect(() => {
    props.navigation.setOptions({
      headerLeft: () => (
        <Icon
          containerStyle={{ zIndex: 0, marginRight: 20 }}
          type="material-community"
          name="qrcode-scan"
          size={30}
          onPress={() => {
            if (hasPermission) {
              setisBarcodeScannerEnabled(true);
              setmodalQRCodeVisable(true);
            } else {
              requestPermission();
            }
          }}
          color="#3D4849"
        />
      ),
      headerRight: () => (
        <Icon
          containerStyle={{ zIndex: 0 }}
          type="material"
          name="menu"
          size={30}
          onPress={() => {
            triggerProfileFunction();
          }}
          color="#3D4849"
        />
      ),
    });
    //timeout = setInterval(async () => {
      //await axiosPull._pullCameraFeed(user.user_id, "owner");
      //await axiosPull._pullFriendsFeed(user.user_id);
    //}, 5000);

    const fetchData = async () => {
      await axiosPull._pullUser(user.user_id, "Home");
      await axiosPull._pullCameraFeed(user.user_id, "owner");
      await axiosPull._pullFriendsFeed(user.user_id);
      if (user.isActive == "0") {
        Alert.alert(
          i18n.t("Warning"),
          i18n.t("Inactive"),
          [
            {
              text: i18n.t("Close"),
              onPress: () => console.log("Cancel Pressed"),
              style: "desructive",
            },
          ],
          { cancelable: false }
        );
        await AsyncStorage.removeItem("UUID");
        await AsyncStorage.removeItem("logedIn");
        await AsyncStorage.removeItem("user_id");
        props.navigation.navigate("Begin");
      }
      const whatnew = await AsyncStorage.getItem(`whatnew.${user.user_id}`);
      if (whatnew == undefined || whatnew == "0") {
        setModalVisibleAlert(true);
        await AsyncStorage.setItem(`whatnew.${user.user_id}`, "1");
      }
    };
    fetchData();

    return () => {
      clearInterval(timeout);
    };
  }, [isFocused, timeout, uploading]);

  const goToFriend = async (friendID) => {
    props.navigation.navigate("Friends", {
      userID: friendID,
    });
  };

  const _createCamera = async (userID) => {
    if ((await AsyncStorage.getItem("uploadEnabled")) == "1") {
      props.navigation.navigate("CreateCamera", {
        UUID: userID,
      });
    } else {
      Alert.alert(
        i18n.t("ActiveUpload"),
        i18n.t("WhileActiveUpload"),
        [
          {
            text: i18n.t("Cancel"),
            onPress: () => console.log("Cancel Pressed"),
            style: "default",
          },
          {
            text: i18n.t("Continue"),
            onPress: async () => {
              props.navigation.navigate("CreateCamera", {
                UUID: userID,
              });
            },
            style: "destructive",
          },
        ],
        { cancelable: false }
      );
    }
  };
  const fetchImage = async (qrCodeURL) => {
    try {
      const flyer = constants.flyerdataEvent;
      const path = `${RNFS.CachesDirectoryPath}/qrcodeEvent.png`;
      const fileExists = await RNFS.exists(path);
      if (!fileExists) {
        await RNFS.downloadFile({ fromUrl: flyer + qrCodeURL, toFile: path })
          .promise;
      } else {
        await RNFS.unlink(path);
        await RNFS.downloadFile({ fromUrl: flyer + qrCodeURL, toFile: path })
          .promise;
      }
      myAsyncPDFFunction(path);
    } catch (err) {
      fetchImage(qrCodeURL);
    } finally {
    }
  };

  const myAsyncPDFFunction = async (url) => {
    const path = `${RNFS.CachesDirectoryPath}/qrcodeEvent.pdf`;
    const fileExists = await RNFS.exists(path);
    const options = {
      imagePaths: [url],
      name: "qrcodeEvent",
      quality: 1.0, // optional compression paramter
    };
    if (!fileExists) {
      try {
        const pdf = await RNImageToPdf.createPDFbyImages(options);
        handlePrint(pdf.filePath);
        RNFS.unlink(url);
      } catch (e) {
        console.log(e);
        myAsyncPDFFunction(url);
      }
    } else {
      RNFS.unlink(url);
      try {
        const pdf = await RNImageToPdf.createPDFbyImages(options);
        handlePrint(pdf.filePath);
        RNFS.unlink(url);
      } catch (e) {
        myAsyncPDFFunction(url);
      }
    }
  };

  const handlePrint = async (url) => {
    await RNPrint.print({ filePath: url });
    RNFS.unlink(url);
  };

  return (
    <SafeAreaProvider
      style={{ backgroundColor: "#fff", flex: 1, paddingBottom: 24 }}
    >
      <Modal
        visible={modalShareVisable}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setModalShareVisable(false);
        }}
      >
        <TouchableWithoutFeedback
          onPressOut={() => setModalShareVisable(false)}
        >
          <View style={style.centeredView}>
            <View style={style.modalView}>
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
                <View
                  style={{
                    flexDirection: "column",
                    alignContent: "center",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon
                    type="material-community"
                    size={30}
                    name="view-gallery-outline"
                    color={"#fff"}
                    containerStyle={{
                      height: 55,
                      width: 55,
                      alignContent: "center",
                      justifyContent: "center",
                      backgroundColor: "rgba(250, 190, 0, 1)",
                      borderRadius: 22,
                    }}
                    onPress={async () => {
                      console.log(shareOptionsGallery);
                      setModalShareVisable(false);
                      try {
                        const ShareResponse =
                          await Share.share(shareOptionsGallery);
                        console.log("Result =>", ShareResponse);
                      } catch (error) {
                        console.log("Error =>", error);
                      }
                    }}
                  />
                  <Text
                    style={{
                      textAlign: "center",
                      marginTop: 10,
                    }}
                  >
                    {i18n.t("OnlineGallery")}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: "column",
                    alignContent: "center",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon
                    type="material"
                    size={30}
                    name="photo-camera-back"
                    color={"#fff"}
                    containerStyle={{
                      height: 55,
                      width: 55,
                      alignContent: "center",
                      justifyContent: "center",
                      backgroundColor: "#ea5504",
                      borderRadius: 22,
                    }}
                    onPress={async () => {
                      setModalShareVisable(false);
                      try {
                        const ShareResponse = await Share.share(shareOptions);
                        console.log("Result =>", ShareResponse);
                      } catch (error) {
                        console.log("Error =>", error);
                      }
                    }}
                  />
                  <Text
                    style={{
                      textAlign: "center",
                      marginTop: 10,
                    }}
                  >
                    {i18n.t("Share Event")}
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
                borderRadius: 8,
                padding: 15,
                alignItems: "center",
                justifyContent: "center",
                marginbottom: 20,
              }}
              onPress={() => {
                setModalShareVisable(false);
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
                {i18n.t("Close")}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      <Modal
        visible={modalQRCodeVisable}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setmodalQRCodeVisable(false)}
      >
        <TouchableWithoutFeedback
          onPressOut={() => setmodalQRCodeVisable(false)}
        >
          <View style={style.centeredView}>
            <View style={style.qrmodalView}>
              {device == null ? (
                <></>
              ) : (
                <Camera
                  style={[
                    StyleSheet.absoluteFill,
                    { overflow: "hidden", borderRadius: 20 },
                  ]}
                  device={device}
                  androidPreviewViewType={"texture-view"}
                  isActive={true}
                  codeScanner={codeScanner}
                />
              )}
              <Image
                resizeMode="contain"
                style={[StyleSheet.absoluteFill]}
                source={require("../../../assets/scan.png")}
              />
            </View>
            <TouchableOpacity
              style={{
                marginTop: 20,
                flexDirection: "row",
                width: 250,
                backgroundColor: "rgba(234, 85, 4, 1)",
                borderRadius: 8,
                padding: 15,
                alignItems: "center",
                justifyContent: "center",
                marginbottom: 20,
              }}
              onPress={() => {
                setmodalQRCodeVisable(false);
                setisBarcodeScannerEnabled(false);
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
                {i18n.t("Close")}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      <Modal
        visible={modalVisable}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setmodalVisable(false)}
      >
        <TouchableWithoutFeedback onPressOut={() => setmodalVisable(false)}>
          <View style={style.centeredView}>
            <View style={style.modalView}>
              <Image
                indicator={Progress}
                style={{
                  width: SCREEN_WIDTH - 100,
                  height: SCREEN_WIDTH - 100,
                  backgroundColor: "white",
                  alignSelf: "auto",
                }}
                resizeMode={FastImage.resizeMode.contain}
                source={{
                  priority: FastImage.priority.high,
                  cache: FastImage.cacheControl.immutable,
                  uri: qrCodeURL,
                }}
              />
            </View>
            <View
              style={{
                flexDirection: "row",
                width: SCREEN_WIDTH,
                margin: 20,
                justifyContent: "center",
              }}
            >
              <TouchableOpacity
                style={{
                  width: "40%",
                  marginRight: 10,
                  backgroundColor: "rgba(234, 85, 4, 1))",
                  borderRadius: 8,
                  padding: 15,
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onPress={() => {
                  setQrCodeURL("");
                  setmodalVisable(false);
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
                  {i18n.t("Close")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  width: "40%",
                  marginLeft: 10,
                  backgroundColor: "rgba(116, 198, 190, 1)",
                  borderRadius: 8,
                  padding: 15,
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onPress={() => {
                  Alert.alert(
                    i18n.t("FlyerPrint"),
                    i18n.t("Note: FlyerPrint"),
                    [
                      {
                        text: i18n.t("Cancel"),
                        onPress: () => console.log("Cancel Pressed"),
                        style: "destructive",
                      },
                      {
                        text: i18n.t("Continue"),
                        onPress: async () => {
                          fetchImage(qrCodeURL);
                        },
                        style: "default",
                      },
                    ],
                    { cancelable: false }
                  );
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
                  {i18n.t("Print")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      <Modal
        animationType="fade" // or "fade", "none"
        transparent={true}
        visible={modalVisibleAlert}
        onRequestClose={() => {
          setModalVisibleAlert(!modalVisibleAlert);
        }}
      >
                  <ScrollView
                    style={{ backgroundColor: "#fff", marginBottom: 0, width:'100%' }}
                    keyboardShouldPersistTaps={"never"}
                    keyboardDismissMode="on-drag"
                    nestedScrollEnabled={true}
                    showsVerticalScrollIndicator={false}
                  >
        <View style={style.centeredView}>
          <View style={style.modalView2}>
            <Text style={style.modalTitle}>{i18n.t("w1")}</Text>
            <Text style={style.modalText}>{i18n.t("w2")}</Text>

            <ListItem key="1">
              <Icon
                type="ionicon"
                name="film-outline"
                size={25}
                color="#3D4849"
              />
              <ListItem.Content>
                <ListItem.Title style={{ fontWeight: "bold" }}>
                  {i18n.t("w3")}
                </ListItem.Title>
                <ListItem.Subtitle>{i18n.t("w4")}</ListItem.Subtitle>
              </ListItem.Content>
            </ListItem>
            <ListItem key="2">
              <Icon
                type="material-community"
                name="face-man-profile"
                size={25}
                color="#3D4849"
              />
              <ListItem.Content>
                <ListItem.Title style={{ fontWeight: "bold" }}>
                  {i18n.t("w5")}
                </ListItem.Title>
                <ListItem.Subtitle>{i18n.t("w6")}</ListItem.Subtitle>
              </ListItem.Content>
            </ListItem>
            <ListItem key="3">
              <Icon
                type="ionicon"
                name="notifications-circle-outline"
                size={25}
                color="#3D4849"
              />
              <ListItem.Content>
                <ListItem.Title style={{ fontWeight: "bold" }}>
                  {i18n.t("w7")}
                </ListItem.Title>
                <ListItem.Subtitle>{i18n.t("w8")}</ListItem.Subtitle>
              </ListItem.Content>
            </ListItem>
            <ListItem key="4">
              <Icon
                type="material-community"
                name="account-edit-outline"
                size={25}
                color="#3D4849"
              />
              <ListItem.Content>
                <ListItem.Title style={{ fontWeight: "bold" }}>
                  {i18n.t("w9")}
                </ListItem.Title>
                <ListItem.Subtitle>{i18n.t("w10")}</ListItem.Subtitle>
              </ListItem.Content>
            </ListItem>
            <View style={style.modalViewButton}>
              <TouchableOpacity
                style={{
                  marginTop: 50,
                  width: 250,
                  backgroundColor: "#e35504",
                  borderRadius: 8,
                  padding: 15,
                  alignItems: "center",
                  justifyContent: "center",
                  borderColor: "#e35504",
                }}
                onPress={() => {
                  setModalVisibleAlert(!modalVisibleAlert);
                }}
              >
                <Text
                  style={{
                    textTransform: "uppercase",
                    fontSize: 20,
                    fontWeight: "bold",
                    color: "#fff",
                  }}
                >
                  {i18n.t("Continue")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        </ScrollView>
      </Modal>
      <AnimatedFlatList
        refreshing={refreshing} // Added pull to refesh state
        onRefresh={_refresh} // Added pull to refresh control
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicatorr={false}
        nestedScrollEnabled={true}
        bounces={true}
        style={{ flex: 1, height: SCREEN_HEIGHT, width: SCREEN_WIDTH }}
        data={cameraData}
        extraData={cameraData}
        scrollEventThrottle={16}
        ListEmptyComponent={
          <View style={style.empty}>
            <View style={style.fake}>
              <View style={style.fakeSquare}>
                <Image
                  source={require("../../../assets/elementor-placeholder-image.png")}
                  resizeMode={FastImage.resizeMode.cover}
                  style={{
                    position: "absolute",
                    height: 175,
                    width: SCREEN_WIDTH - 150,
                    borderRadius: 10,
                    overflow: "hidden",
                  }}
                />
              </View>
              <View
                style={[
                  style.fakeLine,
                  {
                    width: SCREEN_WIDTH - 150,
                    height: 40,
                    marginBottom: 0,
                    position: "absolute",
                    bottom: 0,
                  },
                ]}
              />
              <View
                style={[
                  style.fakeLine,
                  {
                    width: 30,
                    height: 120,
                    marginBottom: 0,
                    position: "absolute",
                    top: 8,
                    right: 5,
                  },
                ]}
              />
              <View
                style={[
                  style.fakeLine,
                  {
                    width: 150,
                    height: 20,
                    marginBottom: 0,
                    position: "absolute",
                    bottom: 10,
                    left: 5,
                    backgroundColor: "#e8e9ed",
                  },
                ]}
              />
            </View>
            <EmptyStateView
              headerText={i18n.t("Capturing Moments, Crafting Memories!")}
              subHeaderText={i18n.t("Start")}
              headerTextStyle={style.headerTextStyle}
              subHeaderTextStyle={style.subHeaderTextStyle}
            />
          </View>
        }
        ListHeaderComponent={
          <View>
            <FriendHeader
              _createCamera={_createCamera}
              _gotoAllFriends={_gotoAllFriends}
              goToFriend={goToFriend}
            />

            <Loading
              message={uploading.message}
              flex={uploading.display}
              image={uploading.image}
            />
          </View>
        }
        keyExtractor={(_, index) => index}
        renderItem={(item, index) => 
          item.item.owner == user.user_id ? (
            <ListItems
              item={item}
              index={index}
              isPro={user.isPro == undefined ? "0" : user.isPro}
              _gotoStore={_gotoStore}
              _deleteFeedItem={_deleteFeedItem}
              _joinFeedItem={_joinFeedItem}
              _deleteFeedItemIndex={_deleteFeedItemIndex}
              _editEvent={_editEvent}
              _gotoMedia={_gotoMedia}
              _gotoCamera={_gotoCamera}
              setQrCodeURL={setQrCodeURL}
              _gotoQRCode={_gotoQRCode}
              _gotoShare={_gotoShare}
              _editItem={_editItem}
              _addMax={_addMax}
            />
          ) : (
            <FriendListItemHome
              item={item}
              index={index}
              _gotoMedia={_gotoMedia}
              _gotoCamera={_gotoCamera}
              _gotoStore={_gotoStore}
              _autoJoin={_autoJoin}
              _repotPost={_repotPost}
            />
          )
        }
          />
    </SafeAreaProvider>
  );
};
const style = StyleSheet.create({
  headerTextStyle: {
    color: "rgb(76, 76, 76)",
    fontSize: 18,
    marginVertical: 10,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  qrmodalView: {
    width: SCREEN_WIDTH - 50,
    height: SCREEN_WIDTH - 50,
    backgroundColor: "white",
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    overflow: "hidden",
    shadowOpacity: 0.25,
    shadowRadius: 22,
    elevation: 7,
  },
  modalView2: {
    width: "100%",
    height: "100%",
    marginTop: 180,
    backgroundColor: "white",
    margin: 35,
    padding:10,
  },
  modalViewButton: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  modalView: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 7,
  },
  whiteIcon2: {
    marginTop: 5,
    paddingRight: 5,
    color: "#000",
    justifyContent: "center",
  },
  vertDots: {
    color: "#000",
    marginRight: -15,
    alignItems: "center",
  },
  imageStyle: {
    marginTop: 0,
    height: 300,
    width: 300,
    resizeMode: "contain",
  },
  subHeaderTextStyle: {
    fontSize: 15,
    color: "rgb(147, 147, 147)",
    paddingHorizontal: 15,
    textAlign: "center",
    marginVertical: 15,
  },
  dividerTableStyle: {
    height: 0.2,
    marginTop: 0,
    marginBottom: 5,
    width: SCREEN_WIDTH * 1,
    alignSelf: "center",
    backgroundColor: "#ccc",
  },
  buttonStyle: {
    flexDirection: "row",
    marginTop: 20,
    height: 65,
    width: "80%",
    backgroundColor: "#3D4849",
    borderRadius: 10,
    paddingHorizontal: 62,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#3D4849",
  },
  buttonTextStyle: {
    fontSize: 19,
    width: SCREEN_WIDTH,
    color: "#fff",
    fontWeight: "bold",
    alignSelf: "center",
    justifyContent: "center",
    textAlign: "center",
    textTransform: "uppercase",
    textDecorationLine: "none",
  },
  listItem: {
    marginBottom: 20,
    padding: 10,
    borderRadius: 20,
    shadowColor: "rgba(0, 0, 0, 1)",
    shadowOpacity: 0.4,
    shadowRadius: 5,
    shadowOffset: {
      height: 1,
      width: 1,
    },
    backgroundColor: "#FFF",
    width: "95%",
    elevation: 7,
    flex: 1,
    alignSelf: "center",
    flexDirection: "row",
  },
  qrImageView: {
    position: "absolute",
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  /** Fake */
  fake: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    opacity: 0.4,
  },
  fakeCircle: {
    width: 44,
    height: 44,
    borderRadius: 9999,
    backgroundColor: "#e8e9ed",
    marginRight: 16,
  },
  fakeSquare: {
    width: SCREEN_WIDTH - 150,
    height: 175,
    backgroundColor: "#e8e9ed",
    borderRadius: 10,
  },
  fakeLine: {
    width: 200,
    height: 10,
    borderRadius: 4,
    backgroundColor: "#e8e9ed",
    marginBottom: 8,
    opacity: 0.6,
  },
  empty: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 50,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
  },
  modalText: {
    fontSize: 17,
    fontWeight: "500",
    textAlign: "left",
    marginBottom: 15,
  },
});

export default Home;
