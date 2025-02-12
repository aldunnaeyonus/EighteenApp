import React, { useState, useEffect } from "react";
import {
  Share,
  StyleSheet,
  Alert,
  Modal,
  View,
  Text,
  TouchableOpacity,
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
import RefreshableWrapper from "react-native-fresh-refresh";
import Animated from "react-native-reanimated";
import { useMMKVObject } from "react-native-mmkv";
import ListItem from "../SubViews/home/listItem";
import RefreshView from "../../utils/refreshView";
import FriendHeader from "../SubViews/home/homeHeader";
import { axiosPull } from "../../utils/axiosPull";
import * as i18n from "../../../i18n";
import { useIsFocused } from "@react-navigation/native";
import Loading from "../SubViews/home/Loading";
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
} from "react-native-vision-camera";
import RNFS from "react-native-fs";
import RNImageToPdf from "react-native-image-to-pdf";
import RNPrint from "react-native-print";

const Home = (props) => {
  const [cameraData, setcameraData] = useMMKVObject(
    "user.Camera.Feed",
    storage
  );
  const [modalQRCodeVisable, setmodalQRCodeVisable] = useState(false);
  const [modalVisable, setmodalVisable] = useState(false);
  const [user] = useMMKVObject("user.Data", storage);
  const [refreshing, setRefreshing] = useState(false);
  const [qrCodeURL, setQrCodeURL] = useState("");
  const AnimatedFlatList = Animated.FlatList;
  const isFocused = useIsFocused();
  const [uploading] = useMMKVObject("uploadData", storage);
  var timeout;
  const triggerProfileFunction = async () => {
    props.navigation.navigate("Profile");
  };
  const device = useCameraDevice("back");
  const [isBarcodeScannerEnabled, setisBarcodeScannerEnabled] = useState(true);
  const { hasPermission, requestPermission } = useCameraPermission();

  const codeScanner = useCodeScanner({
    codeTypes: ["qr"],
    onCodeScanned: (codes) => {
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
        }

        setisBarcodeScannerEnabled(false);
      }
    },
  });

  const _gotoCamera = (
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
    Alert.alert(
      i18n.t("Share Event"),
      i18n.t("ChooseOption"),
      user.isPro == "1"
        ? [
            {
              text: i18n.t("Cancel"),
              onPress: () => console.log("Cancel Pressed"),
              style: "destructive",
            },
            {
              text: i18n.t("OnlineGallery"),
              onPress: () => {
                const shareOptions = {
                  title: title,
                  url: constants.url + "/gallery/index.php?pin=" + pin,
                  message: i18n.t("ViewLiveGallery"),
                };
                try {
                  const ShareResponse = Share.share(shareOptions);
                  console.log("Result =>", ShareResponse);
                } catch (error) {
                  console.log("Error =>", error);
                }
              },
              style: "default",
            },
            {
              text: i18n.t("Share Event"),
              onPress: async () => {
                const shareOptions = {
                  title: title,
                  url:
                    constants.url +
                    "/qrcode.php?pin=" +
                    pin +
                    "&time=" +
                    time +
                    "&owner=" +
                    owner,
                  message: i18n.t("Join my Snap Eighteen Event") + ", " + title,
                };

                try {
                  const ShareResponse = await Share.share(shareOptions);
                  console.log("Result =>", ShareResponse);
                } catch (error) {
                  console.log("Error =>", error);
                }
              },
              style: "default",
            },
          ]
        : [
            {
              text: i18n.t("Cancel"),
              onPress: () => console.log("Cancel Pressed"),
              style: "destructive",
            },
            {
              text: i18n.t("Share Event"),
              onPress: async () => {
                const shareOptions = {
                  title: title,
                  url:
                    constants.url +
                    "/qrcode.php?pin=" +
                    pin +
                    "&time=" +
                    time +
                    "&owner=" +
                    owner,
                  message: i18n.t("Join my Snap Eighteen Event") + ", " + title,
                };

                try {
                  const ShareResponse = await Share.share(shareOptions);
                  console.log("Result =>", ShareResponse);
                } catch (error) {
                  console.log("Error =>", error);
                }
              },
              style: "default",
            },
          ],
      { cancelable: false }
    );
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
    setTimeout(async () => {
      setRefreshing(false);
    }, 1500);
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
            if (hasPermission){
            setisBarcodeScannerEnabled(true);
            setmodalQRCodeVisable(true);
            }else{
             requestPermission();
            }
          }}
          color="#3D4849"
        />
      ),
      headerRight: () => (
        <Icon
          containerStyle={{ zIndex: 0 }}
          type="material-community"
          name="account-settings-outline"
          size={30}
          onPress={() => {
            triggerProfileFunction();
          }}
          color="#3D4849"
        />
      ),
    });
    timeout = setInterval(async () => {
      await axiosPull._pullCameraFeed(user.user_id, "owner");
      await axiosPull._pullFriendsFeed(user.user_id);
    }, 15000);

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
    props.navigation.navigate("CreateCamera", {
      UUID: userID,
    });
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
        visible={modalQRCodeVisable}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setmodalQRCodeVisable(false)}
      >
        <View style={style.centeredView}>
          <View style={style.qrmodalView}>
            {device == null ? (
              <></>
            ) : (
              <Camera
                style={[StyleSheet.absoluteFill,{ overflow: "hidden", borderRadius: 20}]}
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
              borderRadius: 24,
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
      </Modal>
      <Modal
        visible={modalVisable}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setmodalVisable(false)}
      >
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
                backgroundColor: "rgba(250, 190, 0, 1)",
                borderRadius: 24,
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
                backgroundColor: "rgba(234, 85, 4, 1)",
                borderRadius: 24,
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
      </Modal>

      <RefreshableWrapper
        defaultAnimationEnabled={true}
        Loader={() => <RefreshView />}
        isLoading={refreshing}
        onRefresh={() => {
          _refresh();
        }}
      >
        <AnimatedFlatList
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicatorr={false}
          data={cameraData}
          extraData={cameraData}
          scrollEventThrottle={16}
          ListEmptyComponent={
            <EmptyStateView
              imageSource={require("../../../assets/empty.png")}
              imageStyle={style.imageStyle}
              headerText={i18n.t("SnapEighteen")}
              subHeaderText={i18n.t("Capturing Moments, Crafting Memories!")}
              headerTextStyle={style.headerTextStyle}
              subHeaderTextStyle={style.subHeaderTextStyle}
            />
          }
          ListHeaderComponent={
            <>
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
            </>
          }
          keyExtractor={(item, index) => index}
          renderItem={(item, index) => (
            <ListItem
              item={item}
              index={index}
              isPro={user == undefined ? "" : user.isPro}
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
          )}
        />
      </RefreshableWrapper>
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
    fontSize: 12,
    color: "rgb(147, 147, 147)",
    paddingHorizontal: 60,
    textAlign: "center",
    marginVertical: 10,
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
});

export default Home;
