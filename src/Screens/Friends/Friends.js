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
  Pressable,
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
const Image = createImageProgress(FastImage);
import { useIsFocused } from "@react-navigation/native";
import { ActivityIndicator, MD2Colors } from "react-native-paper";
import Loading from "../SubViews/home/Loading";
import { getLocales } from "expo-localization";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";

const Friends = (props) => {
  const [cameraData] = useMMKVObject(
    `user.Camera.Friend.Feed.${props.route.params.userID}`,
    storage
  );
  const [friendData] = useMMKVObject(
    `user.Feed.${props.route.params.userID}`,
    storage
  );
  const [uploading] = useMMKVObject("uploadData", storage);
  const [cameraStatus] = ImagePicker.useCameraPermissions();
  const [ready, setReady] = useState(false);
  const [refreshing, serRefreshing] = useState(false);
  const [isFriend, setisFriend] = useState("2");
  const AnimatedFlatList = Animated.createAnimatedComponent(Animated.FlatList);
  const [user] = useMMKVObject("user.Data", storage);
  const [modalVisable, setmodalVisable] = useState(false);
  const [qrCodeURL] = useState(
    constants.url + "/friendQRCode.php?owner=" + props.route.params.userID
  );
  var timeout;
  const isFocused = useIsFocused();
  const [isLoading, setIsLoading] = useState(true);
  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ["17%"], []);
  const handlePresentModalPress = useCallback(() => {
    bottomSheetRef.current?.present();
  }, []);

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

  const _reportUser = async (owner) => {
    Alert.alert(
      i18n.t("Report Friend"),
      i18n.t("Are you sure you"),
      [
        {
          text: i18n.t("Cancel"),
          onPress: () => console.log("Cancel Pressed"),
          style: "destructive",
        },
        {
          text: i18n.t("Report Friend"),
          onPress: async () => {
            const data = {
              owner: owner,
              user: user.user_id,
              pin: "",
              title: "",
              type: "friend",
              locale: getLocales()[0].languageCode,
            };
            await axiosPull.postData("/camera/report.php", data);
            Alert.alert("", i18n.t("A report"));
          },
          style: "default",
        },
      ],
      { cancelable: false }
    );
  };

  const _deleteUser = async () => {
    Alert.alert(
      i18n.t("Delete Friend"),
      i18n.t("Are you sure"),
      [
        {
          text: i18n.t("Cancel"),
          onPress: () => console.log("Cancel Pressed"),
          style: "default",
        },
        {
          text: i18n.t("Delete Friend"),
          onPress: () => deleteMember(),
          style: "destructive",
        },
      ],
      { cancelable: false }
    );
  };

  const addMember = async () => {
    if (props.route.params.userID != user.user_id) {
      const data = { user: props.route.params.userID, owner: user.user_id };
      await axiosPull.postData("/users/add.php", data);
      await axiosPull._pullFriendCameraFeed(
        props.route.params.userID,
        "user",
        user.user_id
      );
      const datas = { friend: props.route.params.userID, owner: user.user_id };
      const results = await axiosPull.postData("/users/check.php", datas);
      setisFriend(results[0]["response"]);
      Alert.alert(i18n.t("SnapEighteen"), i18n.t("FreiendsNow"));
      await axiosPull._pullFriendFeed(props.route.params.userID);
    }
  };

  const deleteMember = async () => {
    const data = {
      user: props.route.params.userID,
      pin: "",
      type: "block",
      title: "",
      owner: user.user_id,
      locale: getLocales()[0].languageCode,
    };
    await axiosPull.postData("/camera/report.php", data);
    await axiosPull._pullFriendsFeed(user.user_id);
    storage.delete("user.Camera.Friend.Feed." + props.route.params.userID);

    props.navigation.pop(1);
  };

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
      if ((await AsyncStorage.getItem("uploadEnabled")) == "1") {
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
          lefthanded: user.lefthanded,
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
                  lefthanded: user.lefthanded,
                });
              },
              style: "destructive",
            },
          ],
          { cancelable: false }
        );
      }
    }
  };

  const _gotoStore = (pin, owner, name) => {
    props.navigation.navigate("Purchase", {
      pin: pin,
      owner: owner,
      type: "user",
      eventName: name,
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
      type: "user",
    });
  };

  const _refresh = async () => {
    serRefreshing(true);
    await axiosPull._pullFriendCameraFeed(
      props.route.params.userID,
      "user",
      user.user_id
    );
    setTimeout(() => {
      serRefreshing(false);
    }, 1500);
  };

  useEffect(() => {
    const fetchData = async () => {
      await axiosPull._pullFriendFeed(props.route.params.userID);
      const data = {
        friend: props.route.params.userID,
        owner: user.user_id,
      };
      const results = await axiosPull.postData("/users/check.php", data);
      setisFriend(results[0]["response"]);
      await axiosPull._pullFriendCameraFeed(
        props.route.params.userID,
        "user",
        user.user_id
      );
      props.navigation.setOptions({
        title:
          friendData != undefined
            ? friendData.friend_handle.toUpperCase()
            : "Loading...",
        headerRight: () => (
          <View style={{ flexDirection: "row" }}>
            {props.route.params.userID == user.user_id ? (
              <></>
            ) : isFriend == "0" ? (
              <Icon
                containerStyle={{ marginRight: 10 }}
                type="material"
                name="person-add-alt"
                size={30}
                onPress={() => {
                  addMember();
                }}
                color="#3D4849"
              />
            ) : isFriend == "1" ? (
              <Icon
                containerStyle={{ marginLeft: 5 }}
                type="material"
                name="menu"
                size={30}
                onPress={() => {
                  handlePresentModalPress();
                }}
                color="#3D4849"
              />
            ) : (
              <></>
            )}
          </View>
        ),
      });
      setReady(true);
      setIsLoading(false);
    };
    fetchData();

    timeout = setInterval(async () => {
      // await axiosPull._pullFriendCameraFeed(
      //   props.route.params.userID,
      //   "user",
      //   user.user_id
      // );
    }, 60000);

    return () => {
      clearInterval(timeout);
    };
  }, [
    isFocused,
    isFriend,
    friendData,
    props.route.params.userID,
    user.user_id,
    isLoading,
  ]);

  if (!ready) {
    return (
      <SafeAreaView
        style={{
          backgroundColor: "white",
          height: SCREEN_HEIGHT,
          width: SCREEN_WIDTH,
        }}
        edges={["bottom", "left", "right"]}
      >
        <ActivityIndicator
          size={80}
          style={{
            position: "absolute",
            top: SCREEN_HEIGHT / 3.5,
            left: SCREEN_WIDTH / 2 - 40,
          }}
          animating={isLoading}
          hidesWhenStopped={true}
          color={MD2Colors.orange900}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={{
          backgroundColor: "white",
          height: SCREEN_HEIGHT - 60,
          width: SCREEN_WIDTH,
        }}
        edges={["bottom", "left", "right", "top"]}
      >
        <AnimatedFlatList
          onScroll={() => {
            bottomSheetRef.current?.close();
          }}
          refreshing={refreshing} // Added pull to refesh state
          onRefresh={_refresh} // Added pull to refresh control
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
          bounces={true}
          style={{
            flex: 1,
            height: SCREEN_HEIGHT,
            width: SCREEN_WIDTH,
            marginBottom: 15,
          }}
          data={cameraData}
          extraData={cameraData}
          scrollEventThrottle={16}
          ListEmptyComponent={
            isFriend == "1" && (
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
                  headerText={""}
                  subHeaderText={i18n.t("A gallery")}
                  headerTextStyle={style.headerTextStyle}
                  subHeaderTextStyle={style.subHeaderTextStyle}
                />
              </View>
            )
          }
          ListHeaderComponent={
            <Pressable
              onPress={() => {
                bottomSheetRef.current?.close();
              }}
            >
              <FriendHeader
                id={props.route.params.userID}
                name={friendData.friend_handle}
                motto={friendData.friend_motto}
                avatar={friendData.friend_avatar}
                join={friendData.friend_join}
                create={friendData.friend_camera}
                upload={friendData.friend_media}
                isPro={friendData.friend_isPro}
              />

              <Loading
                message={uploading.message}
                flex={uploading.display}
                progress={uploading.progress}
              />
            </Pressable>
          }
          keyExtractor={(item) => item.UUID}
          renderItem={(item, index) =>
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
          visible={modalVisable}
          animationType="slide"
          transparent={true}
          onRequestClose={() => {
            setmodalVisable(false);
          }}
        >
          <TouchableWithoutFeedback onPressOut={() => setmodalVisable(false)}>
            <View style={style.centeredView}>
              <View style={style.modalView}>
                <Image
                  indicator={Progress}
                  style={{
                    width: 300,
                    height: 300,
                    backgroundColor: "white",
                    alignSelf: "auto",
                  }}
                  resizeMode={FastImage.resizeMode.contain}
                  source={{
                    cache: FastImage.cacheControl.immutable,
                    priority: FastImage.priority.high,
                    uri: qrCodeURL,
                  }}
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
                  marginBottom: 20,
                }}
                onPress={() => {
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
            </View>
          </TouchableWithoutFeedback>
        </Modal>
        <BottomSheetModal
          ref={bottomSheetRef}
          snapPoints={snapPoints}
          enablePanDownToClose
          keyboardBlurBehavior={"restore"}
          android_keyboardInputMode={"adjustPan"}
          enableDismissOnClose
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
                  marginTop: 15,
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
                    type="material"
                    size={40}
                    name="report-gmailerrorred"
                    color={"#000"}
                    containerStyle={{
                      height: 50,
                      width: 50,
                      alignContent: "center",
                      justifyContent: "center",
                      borderRadius: 22,
                    }}
                    onPress={() => {
                      bottomSheetRef.current?.close();
                      _reportUser(props.route.params.userID);
                    }}
                  />
                  <Text
                    style={{
                      textAlign: "center",
                      marginTop: 5,
                    }}
                  >
                    {i18n.t("Report Friend")}
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
                    type="antdesign"
                    size={40}
                    name="deleteuser"
                    color={"#000"}
                    containerStyle={{
                      height: 50,
                      width: 50,
                      alignContent: "center",
                      justifyContent: "center",
                      borderRadius: 22,
                    }}
                    onPress={() => {
                      bottomSheetRef.current?.close();
                      _deleteUser();
                    }}
                  />
                  <Text
                    style={{
                      textAlign: "center",
                      marginTop: 5,
                    }}
                  >
                    {i18n.t("Delete Friend")}
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
                    type="material-community"
                    size={40}
                    name="shield-account-variant-outline"
                    color={"#000"}
                    containerStyle={{
                      height: 50,
                      width: 50,
                      alignContent: "center",
                      justifyContent: "center",
                      borderRadius: 22,
                    }}
                    onPress={() => {
                      bottomSheetRef.current?.close();
                      props.navigation.navigate("About", {
                        items: friendData,
                      });
                    }}
                  />
                  <Text
                    style={{
                      textAlign: "center",
                      marginTop: 5,
                    }}
                  >
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

const style = StyleSheet.create({
  imageStyle: {
    marginTop: 50,
    height: 125,
    width: 300,
    resizeMode: "contain",
  },
  dividerTableStyle: {
    height: 0,
    marginTop: 10,
    marginBottom: 10,
    width: SCREEN_WIDTH * 1,
    alignSelf: "center",
    backgroundColor: "#ccc",
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
});

export default Friends;
