import {
  StyleSheet,
  View,
  Platform,
  TouchableOpacity,
  Text,
  Alert,
  Modal,
  StatusBar,
  TouchableWithoutFeedback,
} from "react-native";
import React, { useState, useRef, useCallback } from "react";
import { constants, SCREEN_WIDTH, SCREEN_HEIGHT } from "../../utils/constants";
import { Icon } from "react-native-elements";
import * as ImagePicker from "expo-image-picker";
import FormData from "form-data";
import EmptyStateView from "@tttstudios/react-native-empty-state";
import { storage, updateItemFeed } from "../../context/components/Storage";
import Animated from "react-native-reanimated";
import moment from "moment/min/moment-with-locales";
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
import Loading from "../SubViews/home/Loading";
import { getLocales } from "expo-localization";
import { useCameraPermission } from "react-native-vision-camera";
import axios from "axios";


const PhotoGallery = (props) => {
  const [filteredDataSource] = useMMKVObject(
    `user.Gallery.Friend.Feed.${props.route.params.pin}`,
    storage
  );
  const AnimatedFlatlist = Animated.FlatList;
  const [animating, setAnimating] = useState(false);
  const photo = useRef();
  const [pickedImages, setPickedImages] = useState([]);
  const [credits, setCredits] = useState(
    props.route.params.owner == props.route.params.user
      ? "99"
      : props.route.params.credits
  );
  const { hasPermission, requestPermission } = useCameraPermission();
  const [cameraStatus] = ImagePicker.useCameraPermissions();
  const [modalUpload, setModalUpload] = useState(false);
  const { toast } = useToast();
  const [cameraData] = useMMKVObject(
    `user.Camera.Friend.Feed.${props.route.params.owner}`,
    storage
  );
  let [localLang] = useState(getLocales()[0].languageCode);

  const [uploading] = useMMKVObject("uploadData", storage);
  const createEvent = async () => {
    setAnimating(false);
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

  if (pickedImages.length > 1){
    handleUpload(
      constants.url + "/camera/upload.php",
      formData,
      props.route.params.user,
      "gallery",
      props.route.params.pin,
      props.route.params.owner,
      i18n.t("Uploading2"),
      pickedImages[0],
      uploading
    );
  }else{
    storage.set("uploadData", JSON.stringify({"message": i18n.t("Uploading") + " " + i18n.t("PleaseWait"), "display":"flex", "image":pickedImages[0]}));
const postConclusion = async () => {
    await axios({
      method: "POST",
      url: constants.url + "/camera/upload.php",
      data: formData,
      headers: {
        Accept: "application/json",
        "content-Type": "multipart/form-data",
      },
    }).then(async (res) => {
      storage.set("uploadData", JSON.stringify({"message": "", "display":"none", "image":""}));
      await axiosPull._pullGalleryFeed(props.route.params.pin);
      await axiosPull._pullFriendCameraFeed(props.route.params.owner, "user", props.route.params.user);
      await axiosPull._pullCameraFeed(props.route.params.user, "owner");
    });
  }

  postConclusion();
  }

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
    setPickedImages([]);
  };

  const pickImageChooser = async () => {
    if (cameraStatus.status == ImagePicker.PermissionStatus.UNDETERMINED) {
      await ImagePicker.requestCameraPermissionsAsync();
    } else if (cameraStatus.status == ImagePicker.PermissionStatus.DENIED) {
      Alert.alert(
        i18n.t("Permissions"),
        i18n.t("To access photo"),
        [
          {
            text: i18n.t("Cancel"),
            onPress: () => console.log("Cancel Pressed"),
            style: "destructive",
          },
          {
            text: i18n.t("ViewSettings"),
            onPress: () => {
              _editItemFeed(UUID, owner, pin);
            },
            style: "default",
          },
        ],
        { cancelable: false }
      );
    } else {
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
        } else if (mime == "mov" || mime == "mpeg" || mime == "mp4") {
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
    }
  };

  const openCloseModal = useCallback(() => {
    setModalUpload(true);
  }, [modalUpload]);

  const preLoadImages = () => {
    let presloadImages = [];
    filteredDataSource.map((image) => {
      presloadImages.push({ uri: image.uri });
    });
    FastImage.preload(presloadImages);
  };

  useFocusEffect(
    useCallback(() => {
      StatusBar.setHidden(true, "none");

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
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => {
              StatusBar.setHidden(false, "none");
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
                height: 44,
                backgroundColor: "rgba(0, 0, 0, 0.60)",
                borderRadius: 22,
              }}
            />
          </TouchableOpacity>
        ),
        headerRight: () =>
          credits > 0 || props.route.params.owner == props.route.params.user ? (
            <TouchableOpacity
              onPress={() => {
                if (hasPermission) {
                  openCloseModal();
                } else {
                  requestPermission();
                }
              }}
            >
              <Icon
                type="material-community"
                size={30}
                name="account-box-multiple-outline"
                color="#fff"
                containerStyle={{
                  padding: 7,
                  height: 44,
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
                  height: 44,
                  backgroundColor: "rgba(0, 0, 0, 0.60)",
                  borderRadius: 22,
                }}
              />
            </TouchableOpacity>
          ),
      });
      var timeout = setInterval(async () => {
        await axiosPull._pullGalleryFeed(
          props.route.params.pin,
          props.route.params.user,
          props.route.params.owner
        );
      }, 15000);
      const fetchData = async () => {
        await axiosPull._pullGalleryFeed(
          props.route.params.pin,
          props.route.params.user,
          props.route.params.owner
        );
        preLoadImages();
      };
      fetchData();
      return async () => {
        clearInterval(timeout);
        if (props.route.params.type == "user") {
          await AsyncStorage.setItem("current", "0");
        }
      };
    }, [
      props.route.params.title,
      props.route.params.pin,
      props.route.params.owner,
      props.route.params.type,
      props.route.params.user,
      props.unsubscribe,
      credits,
      animating,
      pickedImages,
      uploading,
    ])
  );

  const durationAsString = (end, start) => {
    return parseInt(start) >= moment().unix()
      ? i18n.t("Event Starts in:") +
          moment
            .duration(parseInt(start) - moment().unix(), "seconds")
            .locale(localLang)
            .humanize(true)
      : i18n.t("Event Ends in:") +
          moment
            .duration(parseInt(end), "seconds")
            .locale(localLang)
            .humanize(true);
  };

  let endEventTime = durationAsString(
    parseInt(props.route.params.end) - moment().unix(),
    parseInt(props.route.params.start)
  );

  const showModalFunction = (index) => {
    props.navigation.navigate("MediaViewer", {
      index: index,
      data: filteredDataSource,
      pin: props.route.params.pin,
      title: props.route.params.title,
      owner: props.route.params.owner,
      user: props.route.params.user,
      type: props.route.params.type,
      share: props.route.params.camera_add_social,
      pagerIndex: index,
    });
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={{
          backgroundColor: "transparent",
          height: SCREEN_HEIGHT,
          width: SCREEN_WIDTH,
        }}
        edges={["left", "right"]}
      >
        <AnimatedFlatlist
          extraData={filteredDataSource}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          ListHeaderComponent={
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
          style={{ backgroundColor: "white", marginTop: 0 }}
          numColumns={4}
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
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalUpload}
          onRequestClose={() => {
            setModalUpload(!modalUpload);
          }}
        >
          <TouchableWithoutFeedback onPressOut={() => setModalUpload(false)}>
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
                    gap: 70,
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
                      name="image-outline"
                      color={"#fff"}
                      containerStyle={{
                        height: 55,
                        width: 55,
                        alignContent: "center",
                        justifyContent: "center",
                        backgroundColor: "rgba(116, 198, 190, 1)",
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
                          camera_add_social:
                            props.route.params.camera_add_social,
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
                  borderRadius: 8,
                  padding: 15,
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 20,
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
                  {i18n.t("Close")}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </SafeAreaView>
    </SafeAreaProvider>
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
    fontSize: 15,
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
