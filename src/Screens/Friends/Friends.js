import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import {
  StyleSheet,
  View,
  Alert,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Linking,
  Text,
  ActivityIndicator,
} from "react-native";
import "moment-duration-format";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { storage } from "../../context/components/Storage";
import Animated from "react-native-reanimated";
import { useMMKVObject } from "react-native-mmkv";
import FriendHeader from "../SubViews/friends/friendHeader";
import { Icon } from "react-native-elements";
import { axiosPull } from "../../utils/axiosPull";
import * as i18n from "../../../i18n";
import FriendListItem from "../SubViews/friends/friendsitem";
import EmptyStateView from "@tttstudios/react-native-empty-state";
import { constants, SCREEN_WIDTH, SCREEN_HEIGHT } from "../../utils/constants";
import Progress from "react-native-progress";
import FastImage from "react-native-fast-image";
import { createImageProgress } from "react-native-image-progress";
import { useIsFocused } from "@react-navigation/native";
import { MD2Colors } from "react-native-paper";
import Loading from "../SubViews/home/Loading";
import { getLocales } from "expo-localization";
import * as  ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";

const Image = createImageProgress(FastImage);

const Friends = ({ route, navigation }) => {
  const { userID } = route.params;

  const [cameraData] = useMMKVObject(
    `user.Camera.Friend.Feed.${userID}`,
    storage
  );
  const [friendData] = useMMKVObject(`user.Feed.${userID}`, storage);
  const [uploading] = useMMKVObject("uploadData", storage);
  const [cameraStatus] = ImagePicker.useCameraPermissions();
  const [ready, setReady] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isFriend, setIsFriend] = useState("2");
  const AnimatedFlatList = Animated.createAnimatedComponent(Animated.FlatList);
  const [user] = useMMKVObject("user.Data", storage);
  const [modalVisible, setModalVisible] = useState(false);
  const qrCodeURL = useMemo(
    () => constants.url + "/friendQRCode.php?owner=" + userID,
    [userID]
  );
  const isFocused = useIsFocused();
  const [isLoading, setIsLoading] = useState(true);
  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ["22%"], []);

  const handlePresentModalPress = useCallback(() => {
    bottomSheetRef.current?.present();
  }, []);

  const handleDismissPress = useCallback(() => {
    bottomSheetRef.current?.close();
  }, []);

  const _autoJoin = useCallback(
    async (owner, pin, end, id) => {
      const data = { owner, user: user.user_id, pin, end, id };
      await axiosPull.postData("/camera/autoJoin.php", data);
      await axiosPull._pullFriendFeed(owner);
      await axiosPull._pullFriendCameraFeed(owner, "user", user.user_id);
    },
    [user.user_id]
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
                owner,
                user: user.user_id,
                pin,
                title,
                type: "event",
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

  const _reportUser = useCallback(
    async (owner) => {
      Alert.alert(
        i18n.t("Report Friend"),
        i18n.t("Are you sure you"),
        [
          { text: i18n.t("Cancel"), style: "destructive" },
          {
            text: i18n.t("Report Friend"),
            onPress: async () => {
              const data = {
                owner,
                user: user.user_id,
                pin: "",
                title: "",
                type: "friend",
                locale: getLocales()[0].languageCode,
              };
              await axiosPull.postData("/camera/report.php", data);
              Alert.alert("", i18n.t("A report"));
            },
          },
        ],
        { cancelable: false }
      );
    },
    [user.user_id]
  );

  const deleteMember = useCallback(async () => {
    const data = {
      user: userID,
      pin: "",
      type: "block",
      title: "",
      owner: user.user_id,
      locale: getLocales()[0].languageCode,
    };
    await axiosPull.postData("/camera/report.php", data);
    await axiosPull._pullFriendsFeed(user.user_id);
    storage.delete("user.Camera.Friend.Feed." + userID);
    navigation.pop(1);
  }, [userID, user.user_id, navigation]);

  const _deleteUser = useCallback(() => {
    Alert.alert(
      i18n.t("Delete Friend"),
      i18n.t("Are you sure"),
      [
        { text: i18n.t("Cancel"), style: "default" },
        { text: i18n.t("Delete Friend"), onPress: deleteMember, style: "destructive" },
      ],
      { cancelable: false }
    );
  }, [deleteMember]);

  const addMember = useCallback(async () => {
    if (userID != user.user_id) {
      const addFriendData = { user: userID, owner: user.user_id };
      await axiosPull.postData("/users/add.php", addFriendData);
      await axiosPull._pullFriendCameraFeed(userID, "user", user.user_id);

      const checkFriendData = { friend: userID, owner: user.user_id };
      const results = await axiosPull.postData("/users/check.php", checkFriendData);
      setIsFriend(results[0]?.["response"]); // Use optional chaining for safety
      Alert.alert(i18n.t("SnapEighteen"), i18n.t("FreiendsNow"));
      await axiosPull._pullFriendFeed(userID);
    }
  }, [userID, user.user_id]);

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
      let cameraPermissionStatus = cameraStatus.status;

      if (cameraPermissionStatus == ImagePicker.PermissionStatus.UNDETERMINED) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        cameraPermissionStatus = status;
      }

      if (cameraPermissionStatus == ImagePicker.PermissionStatus.DENIED) {
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
        if (uploadEnabled == "0") {
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

  const _gotoStore = useCallback(
    (pin, owner, name) => {
      navigation.navigate("Purchase", { pin, owner, type: "user", eventName: name });
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
        end, start, credits, camera_add_social, illustration, type: "user",
      });
    },
    [navigation, user.user_id, user.user_avatar, user.user_handle]
  );

  const _refresh = useCallback(async () => {
    setRefreshing(true);
    await axiosPull._pullFriendCameraFeed(userID, "user", user.user_id);
    setRefreshing(false);
  }, [userID, user.user_id]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
        await axiosPull._pullFriendFeed(userID);
        const data = { friend: userID, owner: user.user_id };
        const results = await axiosPull.postData("/users/check.php", data);
        setIsFriend(results[0]?.["response"]); // Use optional chaining for safety
        await axiosPull._pullFriendCameraFeed(userID, "user", user.user_id);
        navigation.setOptions({
          title: friendData?.friend_handle?.toUpperCase() || "...",
          headerRight: () => (
            <View style={{ flexDirection: "row" }}>
              {userID == user.user_id ? null : isFriend == "0" ? (
                <Icon
                  containerStyle={{ marginRight: 10 }}
                  type="material"
                  name="person-add-alt"
                  size={30}
                  onPress={addMember}
                  color="#3D4849"
                />
              ) : results[0]?.["response"] == "1" ? (
                <Icon
                  containerStyle={{ marginLeft: 5 }}
                  type="material"
                  name="menu"
                  size={30}
                  onPress={handlePresentModalPress}
                  color="#3D4849"
                />
              ) : null}
            </View>
          ),
        });
    };

    if (isFocused) {
      fetchData();
    }
  }, [
    isFocused,
    userID,
    user.user_id,
    isFriend,
    friendData, // Added friendData to dependencies for title update
    navigation,
    addMember,
    handlePresentModalPress,
  ]);

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
        style={componentStyles.safeArea}
        edges={["bottom", "left", "right", "top"]}
      >
        <AnimatedFlatList
          refreshing={refreshing}
          onRefresh={_refresh}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
          bounces={true}
          style={componentStyles.flatList}
          data={cameraData}
          extraData={cameraData}
          scrollEventThrottle={16}
          ListEmptyComponent={
            isFriend == "1" && (
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
                  headerText={""}
                  subHeaderText={i18n.t("A gallery")}
                  headerTextStyle={componentStyles.headerTextStyle}
                  subHeaderTextStyle={componentStyles.subHeaderTextStyle}
                />
              </View>
            )
          }
          ListHeaderComponent={
            <View>
              {friendData && (
                <FriendHeader
                  id={userID}
                  name={friendData.friend_handle}
                  motto={friendData.friend_motto}
                  avatar={friendData.friend_avatar}
                  join={friendData.friend_join}
                  create={friendData.friend_camera}
                  upload={friendData.friend_media}
                  isPro={friendData.friend_isPro}
                />
              )}
              {uploading && ( // Ensure uploading object exists before accessing its properties
                <Loading
                  message={uploading.message}
                  flex={uploading.display}
                  progress={uploading.progress}
                />
              )}
            </View>
          }
          keyExtractor={(item) => item.UUID}
          renderItem={({ item, index }) =>
            isFriend == "1" && (
              <FriendListItem
                item={item}
                index={index}
                lefthanded={user.lefthanded}
                _gotoMedia={_gotoMedia}
                _gotoCamera={_gotoCamera}
                _gotoStore={_gotoStore}
                _autoJoin={_autoJoin}
                _repotPost={_repotPost}
              />
            )
          }
        />
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
                    cache: FastImage.cacheControl.immutable,
                    priority: FastImage.priority.high,
                    uri: qrCodeURL,
                  }}
                />
              </View>
              <TouchableOpacity
                style={componentStyles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={componentStyles.closeButtonText}>
                  {i18n.t("Close")}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
        <BottomSheetModal
          backdropComponent={renderBackdrop}
          ref={bottomSheetRef}
          snapPoints={snapPoints}
          enablePanDownToClose
          keyboardBlurBehavior={"restore"}
          android_keyboardInputMode={"adjustPan"}
          enableDismissOnClose
          style={componentStyles.bottomSheetModal}
        >
          <BottomSheetView style={componentStyles.bottomSheetContent}>
            <Text style={componentStyles.bottomSheetTitle}>
              {i18n.t("Make a Selection")}
            </Text>
            <Animated.View style={componentStyles.bottomSheetActionsContainer}>
              <View style={componentStyles.bottomSheetIconsRow}>
                <View style={componentStyles.bottomSheetIconColumn}>
                  <Icon
                    type="material"
                    size={40}
                    name="report-gmailerrorred"
                    color={"#000"}
                    containerStyle={componentStyles.bottomSheetIconContainer}
                    onPress={() => {
                      handleDismissPress();
                      _reportUser(userID);
                    }}
                  />
                  <Text style={componentStyles.bottomSheetIconText}>
                    {i18n.t("Report Friend")}
                  </Text>
                </View>
                <View style={componentStyles.bottomSheetIconColumn}>
                  <Icon
                    type="antdesign"
                    size={40}
                    name="deleteuser"
                    color={"#000"}
                    containerStyle={componentStyles.bottomSheetIconContainer}
                    onPress={() => {
                      handleDismissPress();
                      _deleteUser();
                    }}
                  />
                  <Text style={componentStyles.bottomSheetIconText}>
                    {i18n.t("Delete Friend")}
                  </Text>
                </View>
                <View style={componentStyles.bottomSheetIconColumn}>
                  <Icon
                    type="material-community"
                    size={40}
                    name="shield-account-variant-outline"
                    color={"#000"}
                    containerStyle={componentStyles.bottomSheetIconContainer}
                    onPress={() => {
                      handleDismissPress();
                      navigation.navigate("About", { items: friendData });
                    }}
                  />
                  <Text style={componentStyles.bottomSheetIconText}>
                    {i18n.t("About")}
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

const componentStyles = StyleSheet.create({
  loadingContainer: {
    backgroundColor: "white",
    height: SCREEN_HEIGHT,
    width: SCREEN_WIDTH,
    justifyContent: "center",
    alignItems: "center",
  },
  activityIndicator: {
    position: "absolute",
    top: SCREEN_HEIGHT / 3.5,
    left: SCREEN_WIDTH / 2 - 40,
  },
  safeArea: {
    backgroundColor: "white",
    flex: 1, // Use flex: 1 instead of fixed height to adapt to screen size
    width: SCREEN_WIDTH,
  },
  flatList: {
    flex: 1,
    width: SCREEN_WIDTH,
    marginBottom: 15,
  },
  headerTextStyle: {
    color: "rgb(76, 76, 76)",
    fontSize: 18,
    marginVertical: 10,
  },
  subHeaderTextStyle: {
    fontSize: 15,
    color: "rgb(147, 147, 147)",
    paddingHorizontal: 15,
    textAlign: "center",
    marginVertical: 10,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)", // Dim background for modal
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
    width: 300,
    height: 300,
    backgroundColor: "white",
    alignSelf: "auto",
  },
  closeButton: {
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
  closeButtonText: {
    textTransform: "uppercase",
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
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
    width: "100%", // Ensure container takes full width
  },
  bottomSheetIconsRow: {
    flexDirection: "row",
    justifyContent: "center", // Changed to center for better spacing
    alignItems: "center",
    marginTop: 15,
    gap: 50, // Use gap for spacing instead of fixed margins
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

export default Friends;