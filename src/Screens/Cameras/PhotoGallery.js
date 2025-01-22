import {
  StyleSheet,
  View,
  Platform,
  TouchableOpacity,
  Dimensions,
  Text,
  Modal,
  Share,
} from "react-native";
import React, { useState, useRef, useCallback } from "react";
import { constants } from "../../utils";
const { height, width } = Dimensions.get("window");
import Carousel from "react-native-looped-carousel";
import Video from "react-native-video";
import VisibilitySensor from "@svanboxel/visibility-sensor-react-native";
import { Icon } from "react-native-elements";
import * as ImagePicker from "expo-image-picker";
import FormData from "form-data";
import EmptyStateView from "@tttstudios/react-native-empty-state";
import { storage, updateItemFeed } from "../../context/components/Storage";
import FastImage from "react-native-fast-image";
import { createImageProgress } from "react-native-image-progress";
const Image = createImageProgress(FastImage);
import Progress from "react-native-progress";
import Animated from "react-native-reanimated";
import moment from "moment";
import GalleryHeader from "../SubViews/gallery/listHeader";
import ImageGallery from "../SubViews/gallery/imageGallery";
import { axiosPull } from "../../utils/axiosPull";
import { useToast } from "react-native-styled-toast";
import { useMMKVObject } from "react-native-mmkv";
import { useFocusEffect } from "@react-navigation/native";
import { handleUpload } from "../SubViews/upload";
import * as i18n from "../../../i18n";
import AsyncStorage from "@react-native-async-storage/async-storage";
import PhotoEditor from "@baronha/react-native-photo-editor";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
const stickers = [];
import Zoom from "react-native-zoom-reanimated";
import Loading from "../SubViews/home/Loading";

const PhotoGallery = (props) => {
  const [filteredDataSource] = useMMKVObject(
    `user.Gallery.Friend.Feed.${props.route.params.pin}`,
    storage
  );
  const AnimatedFlatlist = Animated.FlatList;
  const [videoPlayPause, setVideoPlayPause] = useState(true);
  const [videoPlayMute] = useState(true);
  const [animating, setAnimating] = useState(false);
  const [pagerIndex, setPageIndex] = useState(0);
  const video = useRef();
  const photo = useRef();
  const [pickedImages, setPickedImages] = useState([]);
  const [credits, setCredits] = useState(
    props.route.params.owner == props.route.params.user
      ? "99"
      : props.route.params.credits
  );
  const [modalVisibleStatus, setModalVisibleStatus] = useState(false);
  const [modalUpload, setModalUpload] = useState(false);
  const { toast } = useToast();
  const [cameraData] = useMMKVObject(
    `user.Camera.Friend.Feed.${props.route.params.owner}`,
    storage
  );
  const [uploading] = useMMKVObject("uploadData", storage);

  const preLoad = () => {
    let presloadImages = [];
    filteredDataSource.map((image) => {
      presloadImages.push({ uri: image.uri });
    });
    FastImage.preload(presloadImages);
  };

  const createEvent = async () => {
    var formData = new FormData();
    formData.append("pin", props.route.params.pin);
    formData.append("owner", props.route.params.owner);
    formData.append("user", props.route.params.user);
    formData.append("id", props.route.params.UUID);
    formData.append("count", pickedImages.length);
    formData.append("device", Platform.OS);
    formData.append("camera", "0");
    pickedImages.map((image) => {
    formData.append("file[]", {
        type: constants.mimes(image.split(".").pop()), // set MIME type
        name:
          "SNAP18-gallary-" +
          props.route.params.pin +
          "-" +
          Date.now() +
          "-" +
          image.split("/").pop(),
        uri: Platform.OS === "android" ? image : image.replace("file://", ""),
      });
    });

    handleUpload(
      constants.url + "/camera/upload.php",
      formData,
      props.route.params.user,
      "gallery",
      props.route.params.pin,
      props.route.params.owner,
      i18n.t("Uploading") + " " + i18n.t("PleaseWait"),
      pickedImages[0],
      uploading
    );

    setCredits(parseInt(credits) - pickedImages.length);
    if (props.route.params.owner != props.route.params.user) {
      updateItemFeed(
        JSON.stringify(cameraData),
        props.route.params.pin,
        String(parseInt(credits) - pickedImages.length),
        `user.Camera.Friend.Feed.${props.route.params.owner}`,
        "1"
      );
    }

    setAnimating(false);
    setPickedImages([]);
  };

  const _gotoShare = async (image) => {
    const shareOptions = {
      title: "Snap Eighteen",
      url: image,
      message: props.route.params.title,
    };
    try {
      const ShareResponse = await Share.share(shareOptions);
      console.log("Result =>", ShareResponse);
    } catch (error) {
      console.log("Error =>", error);
    }
  };

  const pickImageChooser = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      selectionLimit: parseInt(credits) >= 5 ? 5 : parseInt(credits),
      allowsEditing: false,
      videoMaxDuration: 30,
      quality: 1,
      mediaTypes: ImagePicker.MediaTypeOptions.All,
    });
    const mime = result.assets[0].uri.split(".").pop().toLowerCase();

    if (!result.canceled) {
      setAnimating(true);
      if (result.assets.length > 1) {
        result.assets.forEach((file) => {
          pickedImages.push(file.uri);
        });
        createEvent();
      }else if ((mime == "mov") || (mime == "mpeg") || (mime == "mp4")) {
        pickedImages.push(result.assets[0].uri);
        createEvent();
      } else {
        try {
          const path = await PhotoEditor.open({
            path: result.assets[0].uri,
            stickers,
          });
          pickedImages.push(path);
          createEvent();
        } catch (e) {
          console.log("e", e.message);
          setAnimating(false);
        }
      }
    }
  };

  const openGalleryModal = useCallback(() => {
    setModalVisibleStatus(!modalVisibleStatus);
  }, [modalVisibleStatus]);

  const openCloseModal = useCallback(() => {
    setModalUpload(true);
  }, [modalUpload]);

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
        headerLeft: () =>
          modalVisibleStatus ? (
            <></>
          ) : (
            <TouchableOpacity
              onPress={() => {
                props.navigation.goBack();
              }}
            >
              <Icon
                type="material"
                size={30}
                name="arrow-back-ios-new"
                color="#fff"
                containerStyle={{
                  padding: 7,
                  height: animating ? "0%" : "100%",
                  backgroundColor: "rgba(0, 0, 0, 0.60)",
                  borderRadius: 22,
                }}
              />
            </TouchableOpacity>
          ),
        headerRight: () =>
          !modalVisibleStatus ? (
            credits > 0 ? (
              <TouchableOpacity
                onPress={() => {
                  openCloseModal();
                }}
              >
                <Icon
                  type="material-community"
                  size={30}
                  name="account-box-multiple-outline"
                  color="#fff"
                  containerStyle={{
                    padding: 7,
                    height: animating ? "0%" : "100%",
                    backgroundColor: "rgba(0, 0, 0, 0.60)",
                    borderRadius: 22,
                  }}
                />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => {
                  props.navigation.navigate("Purchase", {
                    pin: props.route.params.pin,
                    owner: props.route.params.owner,
                    type: "user",
                    eventName: props.route.params.title,
                  });
                }}
              >
                <Icon
                  type="ionicon"
                  size={30}
                  name="storefront-outline"
                  color="#fff"
                  containerStyle={{
                    padding: 7,
                    height: animating ? "0%" : "100%",
                    backgroundColor: "rgba(0, 0, 0, 0.60)",
                    borderRadius: 22,
                  }}
                />
              </TouchableOpacity>
            )
          ) : (
            <>
              {filteredDataSource[0].share == "1" &&
              props.route.params.owner == props.route.params.user ? (
                <TouchableOpacity
                  onPress={async () => {
                    _gotoShare(
                      filteredDataSource[
                        parseInt(await AsyncStorage.getItem("current"))
                      ].uri
                    );
                  }}
                >
                  <Icon
                    type="material-community"
                    size={30}
                    name="share"
                    color="#fff"
                    containerStyle={{
                      padding: 7,
                      height: animating ? "0%" : "100%",
                      backgroundColor: "rgba(0, 0, 0, 0.60)",
                      borderRadius: 22,
                    }}
                  />
                </TouchableOpacity>
              ) : (
                <></>
              )}
              <TouchableOpacity
                onPress={() => {
                  openGalleryModal();
                }}
              >
                <Icon
                  type="material-community"
                  size={30}
                  name="close-circle-outline"
                  color="#fff"
                  containerStyle={{
                    padding: 7,
                    height: animating ? "0%" : "100%",
                    backgroundColor: "rgba(0, 0, 0, 0.60)",
                    borderRadius: 22,
                  }}
                />
              </TouchableOpacity>
            </>
          ),
      });
      var timeout = setInterval(async () => {
        await axiosPull._pullGalleryFeed(props.route.params.pin);
      }, 15000);
      const fetchData = async () => {
        await axiosPull._pullGalleryFeed(props.route.params.pin);
        preLoad();
      };
      fetchData();
      return async () => {
        clearInterval(timeout);
        if (props.route.params.pin == "user") {
          storage.delete("user.Gallery.Friend.Feed." + props.route.params.pin);
          await AsyncStorage.setItem("current", "0");
        }
      };
    }, [
      props,
      modalVisibleStatus,
      credits,
      modalUpload,
      animating,
      modalVisibleStatus,
      pickedImages,
      uploading
    ])
  );

  const durationAsString = (end, start) => {
    return parseInt(start) >= moment().unix()
      ? i18n.t("Event Starts in:") +
          moment
            .duration(parseInt(start) - moment().unix(), "seconds")
            .format("d [days], h [hrs], m [min]")
      : i18n.t("Event Ends in:") +
          moment
            .duration(parseInt(end), "seconds")
            .format("d [days], h [hrs], m [min]");
  };

  let endEventTime = durationAsString(
    parseInt(props.route.params.end) - moment().unix(),
    parseInt(props.route.params.start)
  );

  const showModalFunction = async (visible, index) => {
    setModalVisibleStatus(visible);
    setPageIndex(index);
  };
  return modalVisibleStatus ? (
    <SafeAreaProvider>
      <SafeAreaView
        style={{
          backgroundColor: "black",
          height: "100%",
          width: "100%",
        }}
        edges={["bottom", "left", "right"]}
      >
        <Carousel
          pageInfoBackgroundColor={"#fff"}
          doubleTapZoomEnabled={true}
          style={{ width, height }}
          currentPage={pagerIndex}
          useNativeDriver={false}
          autoplay={false}
          isLooped={false}
          pageInfo={true}
          swipe={true}
        >
          {filteredDataSource.map((image) =>
            image.type == "video" ? (
              <View
              key={"i" + image.image_id}
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
                key={"g" + image.image_id}
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
                    ref={(component) => (mediaPlayer = component)}
                    key={"k" + image.image_id}
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 15,
                      marginTop: 30,
                      marginLeft: 2,
                      borderWidth: 0.5,
                      alignSelf: "auto",
                      overflow: "hidden",
                    }}
                    source={{
                      priority: FastImage.priority.normal,
                      uri: image.icon,
                    }}
                  />
                  {image.isPro == "1" && (
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
                          source={require("../../../assets/verified.png")}
                        />
                      </View>
                    </View>
                  )}
                  <Text
                    numberOfLines={1}
                    key={"j" + image.image_id}
                    style={{
                      color: "#fff",
                      marginLeft: 5,
                      fontWeight: "bold",
                      marginTop: 40,
                    }}
                  >
                    {image.userName}
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
                  <Video
                    fullscreen={true}
                    fullscreenAutorotate={true}
                    fullscreenOrientation={"all"}
                    ignoreSilentSwitch="ignore"
                    playWhenInactive={false}
                    playInBackground={false}
                    ref={video}
                    key={"m" + image.image_id}
                    repeat={false}
                    muted={videoPlayMute}
                    resizeMode={"contain"}
                    paused={videoPlayPause}
                    style={{
                      position: "absolute",
                      backgroundColor: "black",
                      top: -200,
                      left: 0,
                      bottom: 0,
                      right: 0,
                    }}
                    controls={true}
                    source={{ uri: image.uri }}
                  />
                </VisibilitySensor>
              </View>
            ) : (
              <View
                key={"i" + image.image_id}
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
                  key={"g" + image.image_id}
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
                    key={"f" + image.image_id}
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
                      priority: FastImage.priority.normal,
                      uri: image.icon,
                    }}
                  />
                  {image.isPro == "1" && (
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
                          source={require("../../../assets/verified.png")}
                        />
                      </View>
                    </View>
                  )}
                  <Text
                    numberOfLines={1}
                    key={"e" + image.image_id}
                    style={{
                      color: "white",
                      backgroundColor: "transparent",
                      fontSize: 20,
                      marginLeft: 10,
                      fontWeight: "bold",
                      marginTop: 40,
                    }}
                  >
                    {image.userName}
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
                    style={{ marginTop: 30, height: height, width: width }}
                    resizeMode={FastImage.resizeMode.contain}
                    source={{
                      priority: FastImage.priority.normal,
                      uri: image.uri,
                    }}
                    key={"h" + props.image_id}
                  ></Image>
                </Zoom>
              </View>
            )
          )}
        </Carousel>
      </SafeAreaView>
    </SafeAreaProvider>
  ) : (
    <>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalUpload}
        onRequestClose={() => {
          setModalUpload(!modalUpload);
        }}
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
              <View style={{ flexDirection: "column" }}>
                <Icon
                  type="material-community"
                  size={30}
                  name="image-outline"
                  color={"#fff"}
                  containerStyle={{
                    height: 55,
                    width: 55,
                    alignContent: "center",
                    justifyContent: "center",
                    backgroundColor: "#ea5504",
                    borderRadius: 22,
                  }}
                  onPress={() => {
                    setTimeout(() => {
                      pickImageChooser();
                    }, 500);
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
              <View
                style={{
                  flexDirection: "column",
                }}
              >
                <Icon
                  type="material-community"
                  size={30}
                  name="camera-outline"
                  color={"#fff"}
                  containerStyle={{
                    height: 55,
                    width: 55,
                    alignContent: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(250, 190, 0, 1)",
                    borderRadius: 22,
                  }}
                  onPress={() => {
                    props.navigation.navigate("CameraPage", {
                      owner: props.route.params.owner,
                      pin: props.route.params.pin,
                      title: props.route.params.title,
                      credits: credits,
                      tCredits: "",
                      UUID: props.route.params.UUID,
                      end: props.route.params.end,
                      camera_add_social: props.route.params.camera_add_social,
                      start: props.route.params.start,
                      user: props.route.params.user,
                    });
                    setModalUpload(false);
                  }}
                />
                <Text
                  style={{
                    textAlign: "center",
                    marginTop: 10,
                  }}
                >
                  {i18n.t("Camera")}
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
            backgroundColor: "transparent",
            height: "100%",
            width: "100%",
          }}
          edges={["bottom", "left", "right"]}
        >
          <AnimatedFlatlist
            extraData={filteredDataSource}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicatorr={false}
            scrollEventThrottle={16}
            ListHeaderComponent={
              !modalVisibleStatus && (
                <>
                  <GalleryHeader
                    UUID={props.route.params.UUID}
                    image={props.route.params.illustration}
                    title={props.route.params.title}
                    endEventTime={endEventTime}
                  />

                  <Loading
                    message={uploading.message}
                    flex={uploading.display}
                    image={uploading.image}
                  />
                </>
              )
            }
            ListEmptyComponent={
              <EmptyStateView
                imageSource={require("../../../assets/2802783.png")}
                imageStyle={style.imageStyle}
                headerText={props.route.params.title.toUpperCase()}
                subHeaderText={i18n.t("A gallery")}
                headerTextStyle={style.headerTextStyle}
                subHeaderTextStyle={style.subHeaderTextStyle}
              />
            }
            ref={photo}
            style={{ backgroundColor: "white", marginTop: -3 }}
            numColumns={3}
            data={filteredDataSource}
            keyExtractor={(item) => item.image_id}
            renderItem={(item, index) => (
              <ImageGallery
                item={item}
                index={index}
                showModalFunction={showModalFunction}
              />
            )}
          />
        </SafeAreaView>
      </SafeAreaProvider>
    </>
  );
};

const style = StyleSheet.create({
  headerTextStyle: {
    color: "rgb(76, 76, 76)",
    fontSize: 18,
    marginVertical: 10,
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
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
});
export default PhotoGallery;
