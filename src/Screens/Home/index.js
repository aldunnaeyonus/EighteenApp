import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
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
  Platform, // Import Platform for OS-specific logic
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
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import { getLocales } from "expo-localization"; // Added for locale in report

const Home = ({ navigation, props }) => { // Destructure navigation from props
  const [cameraData, setCameraData] = useMMKVObject( // Renamed setcameraData for consistency
    "user.Camera.Feed",
    storage
  );
  const flatListViewer = useRef(null);
  const [modalQRCodeVisible, setModalQRCodeVisible] = useState(false); // Renamed for consistency
  const [modalVisible, setModalVisible] = useState(false); // Renamed for consistency
  const [user] = useMMKVObject("user.Data", storage);
  const [refreshing, setRefreshing] = useState(false);
  const [qrCodeURL, setQrCodeURL] = useState("");
  const AnimatedFlatList = useMemo( // Memoize AnimatedFlatList
    () => Animated.createAnimatedComponent(Animated.FlatList),
    []
  );
  const [modalVisibleAlert, setModalVisibleAlert] = useState(false);
  const isFocused = useIsFocused();
  const [uploading] = useMMKVObject("uploadData", storage);

  const device = useCameraDevice("back");
  const [isBarcodeScannerEnabled, setIsBarcodeScannerEnabled] = useState(true); // Renamed for consistency
  const { hasPermission, requestPermission } = useCameraPermission();
  const [shareOptions, setShareOptions] = useState({ // Renamed for consistency
    title: "",
    url: "",
    message: "",
  });
  const [shareOptionsGallery, setShareOptionsGallery] = useState({ // Renamed for consistency
    title: "",
    url: "",
    message: "",
  });
  const [cameraStatus] = ImagePicker.useCameraPermissions();
  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ["20%"], []);
  const handlePresentModalPress = useCallback(() => {
    bottomSheetRef.current?.present();
  }, []);
  const handleCloseModalPress = useCallback(() => {
    bottomSheetRef.current?.close();
  }, []);
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
  

  const _gotoCamera = useCallback(
    async (
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
      let permissionStatus = cameraStatus.status;

      if (permissionStatus == ImagePicker.PermissionStatus.UNDETERMINED) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        permissionStatus = status;
      }

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
      } else {
        const uploadEnabled = await AsyncStorage.getItem("uploadEnabled");
        if (uploadEnabled == "1") {
          navigation.navigate("CameraPage", {
            owner, pin, title, credits, tCredits, UUID, end, camera_add_social, start,
            user: user.user_id, lefthanded: user.lefthanded,
          });
        } else {
          Alert.alert(
            i18n.t("ActiveUpload"),
            i18n.t("WhileActiveUpload"),
            [
              { text: i18n.t("Cancel"), style: "default" },
              {
                text: i18n.t("Continue"),
                onPress: () => {
                  navigation.navigate("CameraPage", {
                    owner, pin, title, credits, tCredits, UUID, end, camera_add_social, start,
                    user: user.user_id, lefthanded: user.lefthanded,
                  });
                },
                style: "destructive",
              },
            ],
            { cancelable: false }
          );
        }
      }
    },
    [cameraStatus, navigation, user.user_id, user.lefthanded]
  );

  const _gotoAllFriends = useCallback(() => {
    navigation.navigate("AllFriends");
  }, [navigation]);

  const _gotoStore = useCallback(
    (pin, owner, type, name, cameras) => {
      navigation.navigate("Purchase", {
        pin, owner, user: user.user_id, type, eventName: name, cameras,
      });
    },
    [navigation, user.user_id]
  );

  const _editEvent = useCallback(
    (
      UUID, pin, owner, user_id, illustration, title, cameras, show_gallery,
      camera_add_social, start, camera_purchase_more, length_index, end, shots, description
    ) => {
      navigation.navigate("EditCamera", {
        UUID, pin, owner, user: user_id, illustration, title, cameras, show_gallery,
        camera_add_social, start, end, camera_purchase_more, length_index, shots, description,
      });
    },
    [navigation]
  );

  const _gotoMedia = useCallback(
    async (
      pin, title, owner, UUID, end, start, credits, camera_add_social, illustration
    ) => {
      navigation.navigate("MediaGallery", {
        pin, title, owner, user: user.user_id, UUID,
        avatar: user.user_avatar, handle: user.user_handle,
        end, start, credits, camera_add_social, illustration, type: "owner",
      });
      await axiosPull._resetBadge(user.user_id, pin);
      await axiosPull._pullCameraFeed(user.user_id, "owner");
    },
    [navigation, user.user_id, user.user_avatar, user.user_handle]
  );

  const _gotoShare = useCallback(
    async (pin, time, owner, title) => {
      const eventShareOptions = {
        title: title,
        url: constants.url + "/link.php?pin=" + pin + "." + time + "." + owner,
        message: i18n.t("Join my Snap Eighteen Event") + " " + title,
      };
      const galleryShareOptions = {
        title: title,
        url: constants.url + "/gallery/index.php?pin=" + pin,
        message: i18n.t("ViewLiveGallery"),
      };

      setShareOptions(eventShareOptions);
      setShareOptionsGallery(galleryShareOptions);

      if (user.isPro == "0") {
        try {
          await Share.share(eventShareOptions);
        } catch (error) {
          console.log("Error sharing event:", error);
        }
      } else {
        handlePresentModalPress();
      }
    },
    [user.isPro, handlePresentModalPress]
  );

  const _deleteFeedItemIndex = useCallback((UUIDToDelete) => {
    setCameraData((prevCameraData) => {
      const updatedData = prevCameraData.filter((item) => item.UUID != UUIDToDelete);
      storage.set("user.Camera.Feed", JSON.stringify(updatedData));
      return updatedData;
    });
  }, [setCameraData]);

  const _addMax = useCallback(
    async (pin, owner, pro) => {
      if (owner == user.user_id) {
        const data = {
          owner, pin, isPro: pro, user: user.user_id,
        };
        await axiosPull.postData("/camera/maxCamera.php", data);
        await axiosPull._pullCameraFeed(owner, "owner");
      }
    },
    [user.user_id]
  );

  const _joinFeedItem = useCallback(
    async (UUID, owner, pin, title) => {
      navigation.navigate("JoinedMembers", {
        UUID, pin, owner, title,
      });
    },
    [navigation]
  );

  const _editItemFeed = useCallback(
    async (UUID, owner, pin) => {
      const data = {
        owner, pin, id: UUID, user: user.user_id,
      };
      await axiosPull.postData("/camera/close.php", data);
      await axiosPull._pullCameraFeed(owner, "owner");
    },
    [user.user_id]
  );

  const _editItem = useCallback(
    (UUID, owner, pin) => {
      Alert.alert(
        i18n.t("Close Event"),
        i18n.t("close and end this event"),
        [
          { text: i18n.t("Cancel"), style: "default" },
          { text: i18n.t("Close Event"), onPress: () => _editItemFeed(UUID, owner, pin), style: "destructive" },
        ],
        { cancelable: false }
      );
    },
    [_editItemFeed]
  );

  const _repotPost = useCallback(
    async (pin, owner, title) => {
      Alert.alert(
        i18n.t("Report Event"),
        i18n.t("Are you sure you event"),
        [
          { text: i18n.t("Cancel"), style: "destructive" },
          {
            text: i18n.t("Report Event"),
            onPress: async () => {
              const data = {
                owner, user: user.user_id, pin, title, type: "event",
                locale: getLocales()[0].languageCode,
              };
              await axiosPull.postData("/camera/report.php", data);
              Alert.alert("", i18n.t("A report event"));
            },
          },
        ],
        { cancelable: false }
      );
    },
    [user.user_id]
  );

  const _autoJoin = useCallback(
    async (owner, pin, end, id) => {
      const data = {
        owner, user: user.user_id, pin, end, id,
      };
      await axiosPull.postData("/camera/autoJoin.php", data);
      await axiosPull._pullFriendFeed(owner);
      await axiosPull._pullFriendCameraFeed(owner, "user", user.user_id);
    },
    [user.user_id]
  );

  const _deleteFeedItemSource = useCallback(async (UUID, owner, pin) => {
    _deleteFeedItemIndex(UUID);
    const data = {
      owner, pin, id: UUID, user: user.user_id,
    };
    await axiosPull.postData("/camera/delete.php", data);
    storage.delete("user.Gallery.Friend.Feed." + pin);
  }, [_deleteFeedItemIndex, user.user_id]);

  const _deleteFeedItem = useCallback(
    (UUID, owner, pin) => {
      Alert.alert(
        i18n.t("Delete Event"),
        i18n.t("All data will be lost"),
        [
          { text: i18n.t("Cancel"), style: "default" },
          { text: i18n.t("Delete Event"), onPress: () => _deleteFeedItemSource(UUID, owner, pin), style: "destructive" },
        ],
        { cancelable: false }
      );
    },
    [_deleteFeedItemSource]
  );

  const _refresh = useCallback(async () => {
    setRefreshing(true);
    await axiosPull._pullCameraFeed(user.user_id, "owner");
    await axiosPull._pullFriendsFeed(user.user_id);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, [user.user_id]);

  const _gotoQRCode = useCallback((link) => {
    setQrCodeURL(link);
    setModalVisible(true);
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Icon
          containerStyle={{ zIndex: 0, marginRight: 20 }}
          type="material-community"
          name="qrcode-scan"
          size={30}
          onPress={async () => {
            if (hasPermission) {
              setIsBarcodeScannerEnabled(true);
              setModalQRCodeVisible(true);
            } else {
              const { status } = await requestPermission(); // Request permission directly
              if (status == 'granted') {
                setIsBarcodeScannerEnabled(true);
                setModalQRCodeVisible(true);
              } else {
                Alert.alert(
                  i18n.t("Permissions"),
                  i18n.t("UseCamera"),
                  [
                    { text: i18n.t("Cancel"), style: "destructive" },
                    { text: i18n.t("Settings"), onPress: () => Linking.openSettings() },
                  ],
                  { cancelable: false }
                );
              }
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
            navigation.navigate("Profile"); // Directly navigate to Profile
          }}
          color="#3D4849"
        />
      ),
    });

    const fetchData = async () => {
      await axiosPull._pullUser(user.user_id, "Home");
      await axiosPull._pullCameraFeed(user.user_id, "owner");
      await axiosPull._pullFriendsFeed(user.user_id);

      if (user.isActive == "0") {
        Alert.alert(
          i18n.t("Warning"),
          i18n.t("Inactive"),
          [{ text: i18n.t("Close"), style: "destructive" }],
          { cancelable: false }
        );
        await AsyncStorage.removeItem("UUID");
        await AsyncStorage.removeItem("logedIn");
        await AsyncStorage.removeItem("user_id");
        navigation.navigate("Begin");
      }
      const whatnew = await AsyncStorage.getItem(`whatnew.${user.user_id}`);
      if (whatnew == undefined || whatnew == "0") {
        setModalVisibleAlert(true);
        await AsyncStorage.setItem(`whatnew.${user.user_id}`, "1");
      }
    };
    if (isFocused) {
      fetchData();
    }
  }, [isFocused, navigation, hasPermission, requestPermission, user.user_id, user.isActive]); // Added navigation and user dependencies

  const goToFriend = useCallback((friendID) => {
    navigation.navigate("Friends", {
      userID: friendID,
    });
  }, [navigation]);

  const _createCamera = useCallback(async (userID) => {
    const uploadEnabled = await AsyncStorage.getItem("uploadEnabled");
    if (uploadEnabled == "1") {
      navigation.navigate("CreateCamera", {
        UUID: userID,
      });
    } else {
      Alert.alert(
        i18n.t("ActiveUpload"),
        i18n.t("WhileActiveUpload"),
        [
          { text: i18n.t("Cancel"), style: "default" },
          {
            text: i18n.t("Continue"),
            onPress: () => {
              navigation.navigate("CreateCamera", {
                UUID: userID,
              });
            },
            style: "destructive",
          },
        ],
        { cancelable: false }
      );
    }
  }, [navigation]);

  const fetchImage = useCallback(
    async (url) => {
      try {
        const flyer = constants.flyerdataEvent;
        const path = `${RNFS.CachesDirectoryPath}/qrcodeEvent.png`;
        
        // Ensure the directory exists
        const dir = `${RNFS.CachesDirectoryPath}`;
        await RNFS.mkdir(dir, {NSURLIsExcludedFromBackupKey: true});

        const fileExists = await RNFS.exists(path);
        if (fileExists) {
          await RNFS.unlink(path); // Delete old file if it exists
        }
        await RNFS.downloadFile({ fromUrl: flyer + url, toFile: path }).promise;
        myAsyncPDFFunction(path);
      } catch (err) {
        console.error("Error fetching image for PDF:", err);
        // Implement retry logic or show error to user
      }
    },
    []
  );

  const getItemLayout = useCallback(
    (_, index) => ({
      length: SCREEN_HEIGHT,
      offset: SCREEN_HEIGHT * index,
      index,
    }),
    []
  );

  const myAsyncPDFFunction = useCallback(
    async (url) => {
      const path = `${RNFS.CachesDirectoryPath}/qrcodeEvent.pdf`;
      const options = {
        imagePaths: [url],
        name: "qrcodeEvent",
        quality: 1.0,
      };

      try {
        const pdf = await RNImageToPdf.createPDFbyImages(options);
        handlePrint(pdf.filePath);
        await RNFS.unlink(url); // Delete the temporary image file
      } catch (e) {
        console.error("Error creating PDF:", e);
        // Implement retry logic or show error to user
      }
    },
    []
  );

  const handlePrint = useCallback(async (url) => {
    try {
      if (Platform.OS == 'ios') {
        await RNPrint.print({ filePath: url });
      } else {
        // For Android, print HTML requires a local file URI
        // RNPrint.print({ filePath: `file://${url}` });
        // The current implementation of RNPrint on Android might expect a content URI or a path that can be accessed by the system.
        // If issues arise, consider alternative print solutions or check RNPrint's latest documentation for Android.
        await RNPrint.print({ filePath: url });
      }
      await RNFS.unlink(url); // Delete the temporary PDF file
    } catch (error) {
      console.error("Error printing:", error);
      Alert.alert(i18n.t("Print Error"), i18n.t("Unable to print. Please try again."));
    }
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
    <SafeAreaProvider style={componentStyles.safeAreaProvider}>
      <Modal
        visible={modalQRCodeVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalQRCodeVisible(false)}
      >
        <TouchableWithoutFeedback
          onPressOut={() => {
            setModalQRCodeVisible(false);
            setIsBarcodeScannerEnabled(false);
          }}
        >
          <View style={componentStyles.centeredView}>
            <View style={componentStyles.qrModalView}>
              {device == null ? (
                <></>
              ) : (
                <Camera
                  style={componentStyles.cameraPreview}
                  device={device}
                  androidPreviewViewType={"texture-view"}
                  isActive={modalQRCodeVisible} // Only active when modal is visible
                  codeScanner={codeScanner}
                />
              )}
              <Image
                resizeMode="contain"
                style={componentStyles.scanOverlay}
                source={require("../../../assets/scan.png")}
              />
            </View>
            <TouchableOpacity
              style={componentStyles.closeModalButton}
              onPress={() => {
                setModalQRCodeVisible(false);
                setIsBarcodeScannerEnabled(false);
              }}
            >
              <Text style={componentStyles.closeModalButtonText}>
                {i18n.t("Close")}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPressOut={() => setModalVisible(false)}>
          <View style={componentStyles.centeredView}>
            <View style={componentStyles.modalView}>
              <Image
                indicator={Progress}
                style={componentStyles.qrCodeImage}
                resizeMode={FastImage.resizeMode.contain}
                source={{
                  priority: FastImage.priority.high,
                  cache: FastImage.cacheControl.immutable,
                  uri: qrCodeURL,
                }}
              />
            </View>
            <View style={componentStyles.modalButtonsContainer}>
              <TouchableOpacity
                style={componentStyles.modalCloseButton}
                onPress={() => {
                  setQrCodeURL("");
                  setModalVisible(false);
                }}
              >
                <Text style={componentStyles.modalButtonText}>
                  {i18n.t("Close")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={componentStyles.modalPrintButton}
                onPress={() => {
                  Alert.alert(
                    i18n.t("FlyerPrint"),
                    i18n.t("Note: FlyerPrint"),
                    [
                      { text: i18n.t("Cancel"), style: "destructive" },
                      { text: i18n.t("Continue"), onPress: () => fetchImage(qrCodeURL), style: "default" },
                    ],
                    { cancelable: false }
                  );
                }}
              >
                <Text style={componentStyles.modalPrintButtonText}>
                  {i18n.t("Print")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisibleAlert}
        onRequestClose={() => {
          setModalVisibleAlert(!modalVisibleAlert);
        }}
      >
        <ScrollView
          style={componentStyles.whatsNewScrollView}
          keyboardShouldPersistTaps={"never"}
          keyboardDismissMode="on-drag"
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={false}
        >
          <View style={componentStyles.centeredView}>
            <View style={componentStyles.modalView2}>
              <Text style={componentStyles.modalTitle}>{i18n.t("w1")}</Text>
              <Text style={componentStyles.modalText}>{i18n.t("w2")}</Text>

              <ListItem key="1">
                <Icon
                  type="ionicon"
                  name="film-outline"
                  size={25}
                  color="#3D4849"
                />
                <ListItem.Content>
                  <ListItem.Title style={componentStyles.listItemTitle}>
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
                  <ListItem.Title style={componentStyles.listItemTitle}>
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
                  <ListItem.Title style={componentStyles.listItemTitle}>
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
                  <ListItem.Title style={componentStyles.listItemTitle}>
                    {i18n.t("w9")}
                  </ListItem.Title>
                  <ListItem.Subtitle>{i18n.t("w10")}</ListItem.Subtitle>
                </ListItem.Content>
              </ListItem>
              <View style={componentStyles.modalViewButton}>
                <TouchableOpacity
                  style={componentStyles.whatsNewContinueButton}
                  onPress={() => {
                    setModalVisibleAlert(!modalVisibleAlert);
                  }}
                >
                  <Text style={componentStyles.whatsNewButtonText}>
                    {i18n.t("Continue")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </Modal>

      <AnimatedFlatList
        onScroll={handleCloseModalPress}
        ref={flatListViewer}
        refreshing={refreshing}
        onRefresh={_refresh}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
        style={componentStyles.flatList}
        data={cameraData}
        extraData={cameraData}
        scrollEventThrottle={16}
        ListEmptyComponent={
          <View style={componentStyles.empty}>
            <View style={componentStyles.fake}>
              <View style={componentStyles.fakeSquare}>
                <Image
                  source={require("../../../assets/elementor-placeholder-image.png")}
                  resizeMode={FastImage.resizeMode.cover}
                  style={componentStyles.fakeImage}
                />
              </View>
              <View
                style={[
                  componentStyles.fakeLine,
                  componentStyles.fakeLineLarge,
                ]}
              />
              <View
                style={[
                  componentStyles.fakeLine,
                  componentStyles.fakeLineSmallRight,
                ]}
              />
              <View
                style={[
                  componentStyles.fakeLine,
                  componentStyles.fakeLineSmallLeft,
                ]}
              />
            </View>
            <EmptyStateView
              headerText={i18n.t("Capturing Moments, Crafting Memories!")}
              subHeaderText={i18n.t("Start")}
              headerTextStyle={componentStyles.headerTextStyle}
              subHeaderTextStyle={componentStyles.subHeaderTextStyle}
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
            {uploading && (
              <Loading
                message={uploading.message}
                flex={uploading.display}
                progress={uploading.progress}
              />
            )}
          </View>
        }
        getItemLayout={getItemLayout}
        keyExtractor={(item) => item.UUID || item.id} // Use UUID or a unique ID from item
        renderItem={({ item, index }) => // Destructure item and index
          item.owner == user.user_id ? (
            <ListItems
              item={item}
              user={user}
              index={index}
              lefthanded={user.lefthanded}
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
              _gotoFriend={goToFriend}
              _gotoShare={_gotoShare}
              _editItem={_editItem}
              _addMax={_addMax}
            />
          ) : (
            <FriendListItemHome
              item={item}
              index={index}
              lefthanded={user.lefthanded}
              _gotoMedia={_gotoMedia}
              _gotoFriend={goToFriend}
              _gotoCamera={_gotoCamera}
              _gotoStore={_gotoStore}
              _autoJoin={_autoJoin}
              _repotPost={_repotPost}
            />
          )
        }
      />
      <BottomSheetModal
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        enablePanDownToClose
        keyboardBlurBehavior={"restore"}
        android_keyboardInputMode={"adjustPan"}
        enableDismissOnClose
        enableDynamicSizing
        style={componentStyles.bottomSheetModal}
        backdropComponent={renderBackdrop}
      >
        <BottomSheetView style={componentStyles.bottomSheetContent}>
          <Text style={componentStyles.bottomSheetTitle}>
            {i18n.t("Make a Selection")}
          </Text>
          <Animated.View style={componentStyles.bottomSheetActionsContainer}>
            <View style={componentStyles.bottomSheetIconsRow}>
              <View style={componentStyles.bottomSheetIconColumn}>
                <Icon
                  type="material-community"
                  size={40}
                  name="view-gallery-outline"
                  color={"#000"}
                  containerStyle={componentStyles.bottomSheetIconContainer}
                  onPress={useCallback(async () => { // Wrapped in useCallback
                    handleCloseModalPress();
                    try {
                      await Share.share(shareOptionsGallery);
                    } catch (error) {
                      console.log("Error sharing gallery:", error);
                    }
                  }, [shareOptionsGallery, handleCloseModalPress])}
                />
                <Text style={componentStyles.bottomSheetIconText}>
                  {i18n.t("OnlineGallery")}
                </Text>
              </View>
              <View style={componentStyles.bottomSheetIconColumn}>
                <Icon
                  type="material"
                  size={40}
                  name="photo-camera-back"
                  color={"#000"}
                  containerStyle={componentStyles.bottomSheetIconContainer}
                  onPress={useCallback(async () => { // Wrapped in useCallback
                    handleCloseModalPress();
                    try {
                      await Share.share(shareOptions);
                    } catch (error) {
                      console.log("Error sharing event:", error);
                    }
                  }, [shareOptions, handleCloseModalPress])}
                />
                <Text style={componentStyles.bottomSheetIconText}>
                  {i18n.t("Share Event")}
                </Text>
              </View>
            </View>
          </Animated.View>
        </BottomSheetView>
      </BottomSheetModal>
    </SafeAreaProvider>
  );
};

const componentStyles = StyleSheet.create({
  safeAreaProvider: {
    backgroundColor: "#fff",
    flex: 1,
    paddingBottom: 24,
  },
  headerTextStyle: {
    color: "rgb(76, 76, 76)",
    fontSize: 18,
    marginVertical: 10,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  qrModalView: {
    width: SCREEN_WIDTH - 50,
    height: SCREEN_WIDTH - 50,
    backgroundColor: "white",
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    overflow: "hidden",
    shadowOpacity: 0.25,
    shadowRadius: 22,
    elevation: 7,
  },
  noCameraText: {
    color: "black",
    fontSize: 18,
    marginTop: 20,
  },
  cameraPreview: {
    ...StyleSheet.absoluteFillObject, // Use absoluteFillObject for full coverage
    borderRadius: 20,
    overflow: "hidden",
  },
  scanOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  closeModalButton: {
    marginTop: 20,
    flexDirection: "row",
    width: 250,
    backgroundColor: "rgba(234, 85, 4, 1)",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  closeModalButtonText: {
    textTransform: "uppercase",
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
  },
  modalView2: {
    width: "100%",
    height: "100%",
    marginTop: 180,
    backgroundColor: "white",
    marginHorizontal: 35, // Use horizontal margin for better spacing
    padding: 10,
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 7,
  },
  qrCodeImage: {
    width: SCREEN_WIDTH - 100,
    height: SCREEN_WIDTH - 100,
    backgroundColor: "white",
    alignSelf: "auto",
  },
  modalButtonsContainer: {
    flexDirection: "row",
    width: SCREEN_WIDTH,
    margin: 20,
    justifyContent: "center",
  },
  modalCloseButton: {
    width: "40%",
    marginRight: 10,
    backgroundColor: "rgba(234, 85, 4, 1)",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  modalButtonText: {
    textTransform: "uppercase",
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
  },
  modalPrintButton: {
    width: "40%",
    marginLeft: 10,
    backgroundColor: "rgba(255, 255, 255, 1)",
    borderRadius: 8,
    padding: 15,
    borderWidth: 2,
    borderColor: "#3D4849",
    alignItems: "center",
    justifyContent: "center",
  },
  modalPrintButtonText: {
    textTransform: "uppercase",
    fontSize: 20,
    fontWeight: "600",
    color: "#3D4849",
  },
  whatsNewScrollView: {
    backgroundColor: "#fff",
    marginBottom: 0,
    width: "100%",
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
  listItemTitle: {
    fontWeight: "bold",
  },
  whatsNewContinueButton: {
    marginTop: 50,
    width: 250,
    backgroundColor: "#e35504",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
    borderColor: "#e35504",
  },
  whatsNewButtonText: {
    textTransform: "uppercase",
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  subHeaderTextStyle: {
    fontSize: 15,
    color: "rgb(147, 147, 147)",
    paddingHorizontal: 15,
    textAlign: "center",
    marginVertical: 15,
  },
  fake: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    opacity: 0.4,
  },
  fakeSquare: {
    width: SCREEN_WIDTH - 150,
    height: 175,
    backgroundColor: "#e8e9ed",
    borderRadius: 10,
  },
  fakeImage: {
    position: "absolute",
    height: 175,
    width: SCREEN_WIDTH - 150,
    borderRadius: 10,
    overflow: "hidden",
  },
  fakeLine: {
    width: 200,
    height: 10,
    borderRadius: 4,
    backgroundColor: "#e8e9ed",
    marginBottom: 8,
    opacity: 0.6,
  },
  fakeLineLarge: {
    width: SCREEN_WIDTH - 150,
    height: 40,
    marginBottom: 0,
    position: "absolute",
    bottom: 0,
  },
  fakeLineSmallRight: {
    width: 30,
    height: 120,
    marginBottom: 0,
    position: "absolute",
    top: 8,
    right: 5,
  },
  fakeLineSmallLeft: {
    width: 150,
    height: 20,
    marginBottom: 0,
    position: "absolute",
    bottom: 10,
    left: 5,
    backgroundColor: "#e8e9ed",
  },
  empty: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 50,
  },
  flatList: {
    flex: 1,
  },
  bottomSheetModal: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.43,
    shadowRadius: 9.51,
    backgroundColor: "transparent",
    elevation: 15,
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
  bottomSheetActionsContainer: {
    justifyContent: "flex-end",
    width: "100%",
  },
  bottomSheetIconsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 50,
  },
  bottomSheetIconColumn: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  bottomSheetIconContainer: {
    height: 70,
    width: 70,
    alignContent: "center",
    justifyContent: "center",
    borderRadius: 35, // Half of height/width for perfect circle
    backgroundColor: "#f0f0f0", // Added a subtle background for icons
  },
  bottomSheetIconText: {
    textAlign: "center",
    marginTop: 10,
  },
});

export default Home;