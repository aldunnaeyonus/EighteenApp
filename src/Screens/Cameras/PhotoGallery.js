import {
  StyleSheet,
  View,
  Platform,
  TouchableOpacity,
  Text,
  Alert,
  Linking,
} from "react-native";
import React, { useState, useRef, useCallback, useMemo } from "react";
import {
  constants,
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  getExtensionFromFilename,
} from "../../utils/constants";
import { Icon } from "react-native-elements";
import * as ImagePicker from "expo-image-picker";
import FormData from "form-data";
import EmptyStateView from "@tttstudios/react-native-empty-state";
import { storage, updateItemFeed } from "../../context/components/Storage";
import Animated from "react-native-reanimated";
import moment from "moment/min/moment-with-locales";
import ImageGallery from "../SubViews/gallery/imageGallery";
import { axiosPull } from "../../utils/axiosPull";
import { useMMKVObject } from "react-native-mmkv";
import { useFocusEffect } from "@react-navigation/native";
import * as i18n from "../../../i18n";
import AsyncStorage from "@react-native-async-storage/async-storage";
import PhotoEditor from "@baronha/react-native-photo-editor";
import { SafeAreaView } from "react-native-safe-area-context";
const stickers = [];
import Loading from "../SubViews/home/Loading";
import axios from "axios";
import FastImage from "react-native-fast-image";
import { BottomSheetModal, BottomSheetView, BottomSheetBackdrop } from "@gorhom/bottom-sheet";

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
  const [cameraStatus] = ImagePicker.useCameraPermissions();
  const [libraryStatus] = ImagePicker.useMediaLibraryPermissions();
  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ["17%"], []);
  const [user] = useMMKVObject("user.Data", storage);

  const [cameraData] = useMMKVObject(
    `user.Camera.Friend.Feed.${props.route.params.owner}`,
    storage
  );
  const [uploading] = useMMKVObject("uploadData", storage);
  //user.Gallery.Friend.Feed.${pin}

  const createEvent = async () => {
    setAnimating(false);
    storage.set(
      "uploadData",
      JSON.stringify({
        message: i18n.t("Uploading") + " " + i18n.t("PleaseWait"),
        display: "flex",
        progress: 0,
      })
    );
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
        type: constants.mimes(getExtensionFromFilename(image).toLowerCase()), // set MIME type
        name:
          "SNAP18-gallary-" +
          props.route.params.pin +
          "-" +
          moment().unix() +
          "-" +
          image.replace(getExtensionFromFilename(image), "") +
          getExtensionFromFilename(image).toLowerCase(),
        uri: Platform.OS === "android" ? image : image.replace("file://", ""),
      });
    });

    const postConclusion = async () => {
      await AsyncStorage.setItem("uploadEnabled", "0");
      await axios({
        method: "POST",
        url: constants.url + "/camera/upload.php",
        data: formData,
        onUploadProgress: async (progressEvent) => {
          const { progress } = progressEvent;
          storage.set(
            "uploadData",
            JSON.stringify({
              display: "flex",
              progress: progress,
            })
          );
        },
        headers: {
          Accept: "application/json",
          "content-Type": "multipart/form-data",
        },
      }).then(async () => {
        await AsyncStorage.setItem("uploadEnabled", "1");
        const postLoading = async () => {
          storage.set(
            "uploadData",
            JSON.stringify({
              message: "",
              display: "none",
              progress: 0,
            })
          );
          await axiosPull._pullGalleryFeed(
            props.route.params.pin,
            props.route.params.user
          );
          await axiosPull._pullFriendCameraFeed(
            props.route.params.owner,
            "user",
            props.route.params.user
          );
          await axiosPull._pullCameraFeed(props.route.params.user, "owner");
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
        };
        postLoading();
      });
    };
    postConclusion();

    setPickedImages([]);
  };

  const pickImageChooser = async () => {
    if (libraryStatus.status == ImagePicker.PermissionStatus.UNDETERMINED) {
      await ImagePicker.requestCameraPermissionsAsync();
    } else if (libraryStatus.status == ImagePicker.PermissionStatus.DENIED) {
      Alert.alert(
        i18n.t("Permissions"),
        i18n.t("UseLibrary"),
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
      let result = await ImagePicker.launchImageLibraryAsync({
        allowsMultipleSelection: true,
        selectionLimit: parseInt(credits) >= 5 ? 5 : parseInt(credits),
        allowsEditing: false,
        videoMaxDuration: 30,
        exif: true,
        quality: 1,
        orderedSelection: true,
        mediaTypes: ImagePicker.MediaTypeOptions.All,
      });

      if (!result.canceled) {
        const mime = getExtensionFromFilename(
          result.assets[0].uri
        ).toLowerCase();
        setAnimating(true);
        if (result.assets.length > 1) {
          result.assets.forEach((file) => {
            pickedImages.push(file.uri);
          });
          createEvent();
        } else if (
          mime == "mov" ||
          mime == "mpeg" ||
          mime == "mp4" ||
          mime == "m4v"
        ) {
          pickedImages.push(result.assets[0].uri);
          createEvent();
        } else {
          try {
            await PhotoEditor.open({
              path: result.assets[0].uri,
              stickers,
            }).then((image) => {
              pickedImages.push(image);
              createEvent();
            });
          } catch (e) {
            console.log("e", e.message);
            setAnimating(false);
          }
        }
      }
    }
  };
  useFocusEffect(
    useCallback(() => {
      props.navigation.setOptions({
        headerTitle: props.route.params.title.toUpperCase(),
        headerTitleStyle: {
          fontSize: 15,
          fontWeight: "bold",
          textAlign: "center",
          flex: 1,
        },
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => {
              props.navigation.goBack();
            }}
          >
            <Icon type="material" size={25} name="arrow-back-ios-new" />
          </TouchableOpacity>
        ),
        headerRight: () =>
          parseInt(props.route.params.end) <= moment().unix() ? (
            <></>
          ) : credits > 0 ||
            props.route.params.owner == props.route.params.user ? (
            <TouchableOpacity
              onPress={async () => {
                if ((await AsyncStorage.getItem("uploadEnabled")) == "1") {
                  handlePresentModalPress();
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
                          handlePresentModalPress();
                        },
                        style: "destructive",
                      },
                    ],
                    { cancelable: false }
                  );
                }
              }}
            >
              <Icon
                type="material"
                size={25}
                name="library-add"
                containerStyle={{
                  padding: 5,
                  height: 40,
                  width: 40,
                  borderRadius: 15,
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
          props.route.params.user
        );
        await axiosPull._requestComments(props.route.params.pin);
      }, 15000);
      const fetchData = async () => {
        if (filteredDataSource != undefined && filteredDataSource.length > 0) {
          filteredDataSource.map((image) => {
            FastImage.preload([
              {
                cache: FastImage.cacheControl.immutable,
                priority: FastImage.priority.high,
                uri: image.uri,
              },
            ]);
          });
        }
        await axiosPull._requestComments(props.route.params.pin);
        await axiosPull._pullGalleryFeed(
          props.route.params.pin,
          props.route.params.user
        );
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
      credits,
      animating,
      pickedImages,
      uploading,
    ])
  );

  const showModalFunction = (index) => {
    props.navigation.navigate("MediaViewer", {
      index: index,
      pin: props.route.params.pin,
      title: props.route.params.title,
      owner: props.route.params.owner,
      user: props.route.params.user,
      type: props.route.params.type,
      share: props.route.params.camera_add_social,
      end: props.route.params.end,
      pagerIndex: index,
    });
  };

    const handleDismissPress = useCallback(() => {
      bottomSheetRef.current?.close();
    }, []);

  const handlePresentModalPress = useCallback(() => {
    bottomSheetRef.current?.present();
  }, []);

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
    <SafeAreaView
      style={{
        backgroundColor: "transparent",
        height: SCREEN_HEIGHT - 100,
        width: SCREEN_WIDTH,
      }}
      edges={["left", "right, top, bottom"]}
    >
      <AnimatedFlatlist
        extraData={filteredDataSource}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
        scrollEventThrottle={16}
        ListHeaderComponent={
          <Loading
            message={uploading.message}
            flex={uploading.display}
            progress={uploading.progress}
          />
        }
        ListEmptyComponent={
          <View style={style.empty}>
            <View style={style.fake}>
              <View style={style.fakeSquare} />
              <View style={[style.fakeSquare, { opacity: 0.5 }]} />
              <View style={[style.fakeSquare, { opacity: 0.4 }]} />
            </View>
            <View style={style.fake}>
              <View style={style.fakeSquare} />
              <View style={[style.fakeSquare, { opacity: 0.5 }]} />
              <View style={[style.fakeSquare, { opacity: 0.4 }]} />
            </View>
            <EmptyStateView
              headerText={""}
              subHeaderText={i18n.t("A gallery")}
              headerTextStyle={style.headerTextStyle}
              subHeaderTextStyle={style.subHeaderTextStyle}
            />
          </View>
        }
        ref={photo}
        style={{ backgroundColor: "white", marginTop: 0, flex: 1 }}
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

      <BottomSheetModal
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        enablePanDownToClose
        keyboardBlurBehavior={"restore"}
        android_keyboardInputMode={"adjustPan"}
        enableDismissOnClose
        enableDynamicSizing
        style={{
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 7,
          },
          shadowOpacity: 0.43,
          shadowRadius: 9.51,
            backgroundColor: "transparent",
          elevation: 15,
        }}
      >
        <BottomSheetView
          style={[StyleSheet.absoluteFill, { alignItems: "center" }]}
        >
          <Text>{i18n.t("Make a Selection")}</Text>
          <Animated.View
            style={{
              justifyContent: "flex-end",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                alignContent: "space-between",
                                  gap: 50,

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
                  onPress={() => {
                     handleDismissPress();
                    setTimeout(() => {
                      pickImageChooser();
                    }, 500);
                  }}
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
                  onPress={async () => {
                     handleDismissPress();
                    if (
                      cameraStatus.status ==
                      ImagePicker.PermissionStatus.UNDETERMINED
                    ) {
                      await ImagePicker.requestCameraPermissionsAsync();
                    } else if (
                      cameraStatus.status == ImagePicker.PermissionStatus.DENIED
                    ) {
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
                        lefthanded: user.lefthanded,
                      });
                    }
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
    paddingHorizontal: 16,
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
    width: 100,
    height: 100,
    margin: 10,
    backgroundColor: "#e8e9ed",
    borderRadius: 0,
  },
  fakeLine: {
    width: 200,
    height: 10,
    borderRadius: 4,
    backgroundColor: "lightgrey",
    marginBottom: 8,
  },
  empty: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 150,
  },
});
export default PhotoGallery;
