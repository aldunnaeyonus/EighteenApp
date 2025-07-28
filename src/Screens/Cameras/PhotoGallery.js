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
import Loading from "../SubViews/home/Loading";
import axios from "axios";
import FastImage from "react-native-fast-image";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
const stickers = []; // Placeholder for stickers array, if photo editor supports them

const PhotoGallery = (props) => {
  const [filteredDataSource] = useMMKVObject(
    `user.Gallery.Friend.Feed.${props.route.params.pin}`,
    storage
  );
  const AnimatedFlatlist = Animated.FlatList;
  const [animating, setAnimating] = useState(false);
  const [credits, setCredits] = useState(
    props.route.params.owner == props.route.params.user
      ? "99"
      : props.route.params.credits
  );
  const [selectedUris] = useState([]);
  const [cameraStatus] = ImagePicker.useCameraPermissions();
  const [libraryStatus] = ImagePicker.useMediaLibraryPermissions();
  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ["20%"], []);
  const [user] = useMMKVObject("user.Data", storage);

  const [cameraData] = useMMKVObject(
    `user.Camera.Friend.Feed.${props.route.params.owner}`,
    storage
  );
  const [uploading] = useMMKVObject("uploadData", storage);

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

   const processAndUploadImages = useCallback(
    async () => {
      setAnimating(true);
      storage.set(
        "uploadData",
        JSON.stringify({
          message: i18n.t("Uploading") + " " + i18n.t("PleaseWait"),
          display: "flex",
          progress: 0,
        })
      );

      const formData = new FormData();
      formData.append("pin", props.route.params.pin);
      formData.append("owner", props.route.params.owner);
      formData.append("user", props.route.params.user);
      formData.append("id", props.route.params.UUID);
      formData.append("count", uris.length);
      formData.append("device", Platform.OS);
      formData.append("camera", "0");

      selectedUris.forEach((uri) => {
        formData.append("file[]", {
          type: constants.mimes(getExtensionFromFilename(uri).toLowerCase()),
          name:
            "SNAP18-gallary-" +
            props.route.params.pin +
            "-" +
            moment().unix() +
            "-" +
            uri.replace(getExtensionFromFilename(uri), "") +
            getExtensionFromFilename(uri).toLowerCase(),
          uri: Platform.OS == "android" ? uri : uri.replace("file://", ""),
        });
      });

      try {
        await AsyncStorage.setItem("uploadEnabled", "0");
        await axios({
          method: "POST",
          url: constants.url + "/camera/upload.php",
          data: formData,
          onUploadProgress: (progressEvent) => {
            const { loaded, total } = progressEvent;
            const progress = loaded / total;
            storage.set(
              "uploadData",
              JSON.stringify({
                message: i18n.t("Uploading3"),
                display: "flex",
                progress: progress,
              })
            );
          },
          headers: {
            Accept: "application/json",
            "Content-Type": "multipart/form-data",
          },
       }).then(async () => {
    selectedUris([]);

        await AsyncStorage.setItem("uploadEnabled", "0");
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

        setCredits((prevCredits) => parseInt(prevCredits) - uris.length);

        if (props.route.params.owner != props.route.params.user) {
          updateItemFeed(
            JSON.stringify(cameraData),
            props.route.params.pin,
            String(parseInt(credits) - uris.length),
            `user.Camera.Friend.Feed.${props.route.params.owner}`,
            "1"
          );
        }
              });
      } catch (error) {
        console.error("Upload error:", error);
        Alert.alert(i18n.t("Error"), i18n.t("Failed to upload images."));
      } finally {
        setAnimating(false);
      }

    },
    [
      props.route.params.pin,
      props.route.params.owner,
      props.route.params.user,
      props.route.params.UUID,
      cameraData,
      credits, // Added credits as dependency
    ]
  );

  const pickImageChooser = useCallback(async () => {
    let permissionStatus = libraryStatus.status;

    if (permissionStatus == ImagePicker.PermissionStatus.UNDETERMINED) {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      permissionStatus = status;
    }

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
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      selectionLimit: parseInt(credits) >= 5 ? 5 : parseInt(credits),
      allowsEditing: false,
      videoMaxDuration: 30,
      exif: true,
      quality: 1,
      orderedSelection: true,
      mediaTypes: ImagePicker.MediaTypeOptions.All,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
        const mime = getExtensionFromFilename(asset.uri).toLowerCase();
         if (result.assets.length > 1) {
          result.assets.forEach((file) => {
            selectedUris.push(file.uri);
          });
        processAndUploadImages();
        } else {
          try {
           await PhotoEditor.open({
              path: result.assets[0].uri,
              stickers,
            }).then((image) => {
              selectedUris.push(image);
        processAndUploadImages();
            });
          } catch (e) {
            console.error("Photo editor error:", e.message);
            Alert.alert(i18n.t("Error"), i18n.t("Failed to edit image."));
            setAnimating(false);
            return;
          }
      }
    } else {
      setAnimating(false); // If selection is cancelled or no assets
    }
  }, [credits, libraryStatus, processAndUploadImages]);

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

        headerRight: () =>
          parseInt(props.route.params.end) <= moment().unix() ? (
            <></>
          ) : credits > 0 ||
            props.route.params.owner == props.route.params.user ? (
            <TouchableOpacity
              onPress={async () => {
                if ((await AsyncStorage.getItem("uploadEnabled")) == "0") {
                  handlePresentModalPress();
                } else {
                  Alert.alert(
                    i18n.t("ActiveUpload"),
                    i18n.t("WhileActiveUpload"),
                    [
                      {
                        text: i18n.t("Cancel"),
                        onPress: async () => {
                          console.log("Cancel Pressed");
                          await AsyncStorage.setItem("uploadEnabled", "0");
                        },
                        style: "default",
                      },
                      {
                        text: i18n.t("Continue"),
                        onPress: async () => {
                          await AsyncStorage.setItem("uploadEnabled", "0");
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
            <></>
          ),
      });

      const interval = setInterval(async () => {
        await axiosPull._pullGalleryFeed(
          props.route.params.pin,
          props.route.params.user
        );
        await axiosPull._requestComments(props.route.params.pin);
      }, 15000);

      const fetchData = async () => {
        if (filteredDataSource?.length > 0) {
          FastImage.preload(
            filteredDataSource.map((image) => ({
              cache: FastImage.cacheControl.immutable,
              priority: FastImage.priority.high,
              uri: image.uri,
            }))
          );
        }
        await axiosPull._requestComments(props.route.params.pin);
        await axiosPull._pullGalleryFeed(
          props.route.params.pin,
          props.route.params.user
        );
      };

      fetchData();

      return async () => {
        clearInterval(interval);
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
      props.route.params.end,
      props.route.params.UUID,
      props.route.params.camera_add_social,
      props.route.params.start,
      credits,
      animating,
      uploading,
      filteredDataSource,
      handlePresentModalPress,
      props.navigation,
    ])
  );

  const showModalFunction = useCallback(
    (index) => {
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
    },
    [
      props.navigation,
      props.route.params.pin,
      props.route.params.title,
      props.route.params.owner,
      props.route.params.user,
      props.route.params.type,
      props.route.params.camera_add_social,
      props.route.params.end,
    ]
  );

  return (
    <SafeAreaView
      style={{
        backgroundColor: "white", // Changed to white for consistency
        flex: 1, // Use flex: 1 to fill available space
        width: SCREEN_WIDTH,
      }}
      edges={["bottom", "left", "right"]} // Explicitly define edges
    >
      <AnimatedFlatlist
        extraData={filteredDataSource}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
        scrollEventThrottle={16}
        ListHeaderComponent={
          animating && uploading && uploading.display == "flex" ? (
            <Loading
              message={uploading.message}
              flex={uploading.display}
              progress={uploading.progress}
            />
          ) : null
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
              headerText={""} // Assuming you want no header text here as per example
              subHeaderText={i18n.t("A gallery")}
              headerTextStyle={style.headerTextStyle}
              subHeaderTextStyle={style.subHeaderTextStyle}
            />
          </View>
        }
        style={{ backgroundColor: "white", marginTop: 0, flex: 1 }}
        numColumns={4}
        data={filteredDataSource}
        keyExtractor={(item) => item.image_id}
        renderItem={(
          { item, index } // Destructure item and index
        ) => (
          <ImageGallery
            item={item}
            index={index}
            showModalFunction={showModalFunction}
          />
        )}
      />

      <BottomSheetModal
        ref={bottomSheetRef}
        backdropComponent={renderBackdrop}
        snapPoints={snapPoints}
        enablePanDownToClose
        keyboardBlurBehavior={"restore"}
        android_keyboardInputMode={"adjustPan"}
        enableDismissOnClose
        enableDynamicSizing
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 7 },
          shadowOpacity: 0.43,
          shadowRadius: 9.51,
          backgroundColor: "transparent",
          elevation: 15,
        }}
      >
        <BottomSheetView style={style.bottomSheetContent}>
          <Text style={style.bottomSheetTitle}>
            {i18n.t("Make a Selection")}
          </Text>
          <Animated.View
            style={{
              justifyContent: "flex-end",
              width: "100%", // Ensure it takes full width
              paddingHorizontal: 20, // Add padding
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 50,
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
                  name="image-outline"
                  color={"#000"}
                  containerStyle={{
                    height: 75,
                    width: 75,
                    alignContent: "center",
                    justifyContent: "center",
                    borderRadius: 37.5, // Half of height/width for perfect circle
                  }}
                  onPress={() => {
                    handleDismissPress();
                    pickImageChooser();
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
                  alignItems: "center", // Align items for consistency
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
                    borderRadius: 37.5, // Half of height/width for perfect circle
                  }}
                  onPress={async () => {
                    handleDismissPress();
                    let permissionStatus = cameraStatus.status;

                    if (
                      permissionStatus ==
                      ImagePicker.PermissionStatus.UNDETERMINED
                    ) {
                      const { status } =
                        await ImagePicker.requestCameraPermissionsAsync();
                      permissionStatus = status;
                    }

                    if (
                      permissionStatus == ImagePicker.PermissionStatus.DENIED
                    ) {
                      Alert.alert(
                        i18n.t("Permissions"),
                        i18n.t("UseCamera"),
                        [
                          { text: i18n.t("Cancel"), style: "destructive" },
                          {
                            text: i18n.t("Settings"),
                            onPress: () => Linking.openSettings(),
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
                        tCredits: "", // This seems to be an empty string always, consider if it's needed
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
  subHeaderTextStyle: {
    fontSize: 15,
    color: "rgb(147, 147, 147)",
    paddingHorizontal: 16,
    textAlign: "center",
    marginVertical: 10,
  },
  fake: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    opacity: 0.4,
  },
  fakeSquare: {
    width: 100,
    height: 100,
    margin: 10,
    backgroundColor: "#e8e9ed",
    borderRadius: 0,
  },
  empty: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 150,
  },
  bottomSheetContent: {
    flex: 1,
    alignItems: "center",
  },
  bottomSheetTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 15,
  },
});

export default PhotoGallery;
