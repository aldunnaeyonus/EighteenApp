import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Alert,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Text,
} from "react-native";
import RefreshableWrapper from "react-native-fresh-refresh";
import "moment-duration-format";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { storage } from "../../context/components/Storage";
import Animated, { useSharedValue } from "react-native-reanimated";
import { useMMKVObject } from "react-native-mmkv";
import FriendHeader from "../SubViews/friends/friendHeader";
import RefreshView from "../../utils/refreshView";
import { Icon } from "react-native-elements";
import { axiosPull } from "../../utils/axiosPull";
import { useToast } from "react-native-styled-toast";
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

  const [ready, setReady] = useState(false);
  const [refreshing, serRefreshing] = useState(false);
  const [isFriend, setisFriend] = useState("2");
  const contentOffset = useSharedValue(0);
  const AnimatedFlatlist = Animated.FlatList;
  const [user] = useMMKVObject("user.Data", storage);
  const { toast } = useToast();
  const [modalVisable, setmodalVisable] = useState(false);
  const [modalActionVisable, setmodalActionVisable] = useState(false);
  const [qrCodeURL] = useState(
    constants.url + "/friendQRCode.php?owner=" + props.route.params.userID
  );
  var timeout;
  const isFocused = useIsFocused();
  const [isLoading, setIsLoading] = useState(true);

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
  };

  const deleteMember = async () => {
    const data = { owner: props.route.params.userID, user: user.user_id };
    await axiosPull.postData("/camera/removeUser.php", data);
    storage.delete("user.Camera.Friend.Feed." + props.route.params.userID);

    props.navigation.pop(1);
  };

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
        title: friendData.friend_handle.toUpperCase(),
        headerRight: () => (
          <View style={{ flexDirection: "row" }}>
            {isFriend == "0" ? (
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
                  setmodalActionVisable(true);
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
      await axiosPull._pullFriendCameraFeed(
        props.route.params.userID,
        "user",
        user.user_id
      );
    }, 60000);

    return () => {
      clearInterval(timeout);
    };
  }, [
    isFocused,
    isFriend,
    friendData,
    props.route.params.userID,
    props.unsubscribe,
    user.user_id,
    isLoading,
  ]);

  if (!ready) {
    return (
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
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={{
          backgroundColor: "white",
          height: SCREEN_HEIGHT,
          width: SCREEN_WIDTH,
        }}
        edges={["bottom", "left", "right"]}
      >
        <RefreshableWrapper
          contentOffset={contentOffset}
          managedLoading={true}
          bounces={true}
          defaultAnimationEnabled={true}
          Loader={() => <RefreshView refreshing={refreshing} />}
          isLoading={refreshing}
          onRefresh={() => {
            _refresh();
          }}
        >
          <AnimatedFlatlist
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicatorr={false}
            data={cameraData}
            extraData={cameraData}
            scrollEventThrottle={16}
            ListEmptyComponent={
              isFriend == "1" && (
                  <View style={style.empty}>
                    <View style={style.fake}>
                      <View style={style.fakeSquare} >
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
                        { width: SCREEN_WIDTH - 150, height:40, marginBottom: 0, position: "absolute", bottom:0, },
                      ]} />
                       <View
                      style={[
                        style.fakeLine,
                        { width:30, height:120, marginBottom: 0, position: "absolute", top:8, right:5 },
                      ]} />
                     <View
                      style={[
                        style.fakeLine,
                        { width:150, height:20, marginBottom: 0, position: "absolute", bottom:10, left:5, backgroundColor: '#e8e9ed', },
                      ]} />
                  </View>
                  <EmptyStateView
                      headerText={""}
                      subHeaderText={i18n.t("A gallery")}
                      headerTextStyle={style.headerTextStyle}
                      subHeaderTextStyle={style.subHeaderTextStyle} />
                  </View>
              )
            }
            ListHeaderComponent={
              <>
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
                  image={uploading.image}
                />
              </>
            }
            keyExtractor={(item) => item.UUID}
            renderItem={(item, index) =>
              isFriend == "1" && (
                <FriendListItem
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
        </RefreshableWrapper>
        <Modal
          visible={modalActionVisable}
          animationType="slide"
          transparent={true}
          onRequestClose={() => {
            setmodalActionVisable(false);
          }}
        >
          <TouchableWithoutFeedback
            onPressOut={() => setmodalActionVisable(false)}
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
                    alignContent: "space-between",
                    width: "100%",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "column",
                      alignContent: "center",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "50%",
                    }}
                  >
                    <Icon
                      type="material"
                      size={30}
                      name="report-gmailerrorred"
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
                        setmodalActionVisable(false);
                        _reportUser(props.route.params.userID);
                      }}
                    />
                    <Text
                      style={{
                        textAlign: "center",
                        marginTop: 10,
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
                      width: "50%",
                    }}
                  >
                    <Icon
                      type="antdesign"
                      size={30}
                      name="deleteuser"
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
                        setmodalActionVisable(false);
                        _deleteUser();
                      }}
                    />
                    <Text
                      style={{
                        textAlign: "center",
                        marginTop: 10,
                      }}
                    >
                      {i18n.t("Delete Friend")}
                    </Text>
                  </View>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    height: 25,
                  }}
                ></View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    alignContent: "space-between",
                    width: "100%",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "column",
                      alignContent: "center",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "50%",
                    }}
                  >
                    <Icon
                      type="material-community"
                      size={30}
                      name="qrcode"
                      color={"#fff"}
                      containerStyle={{
                        height: 55,
                        width: 55,
                        alignContent: "center",
                        justifyContent: "center",
                        backgroundColor: "#3D4849",
                        borderRadius: 22,
                      }}
                      onPress={() => {
                        setmodalActionVisable(false);
                        setTimeout(() => {
                          setmodalVisable(true);
                        }, 200);
                      }}
                    />
                    <Text
                      style={{
                        textAlign: "center",
                        marginTop: 10,
                      }}
                    >
                      {i18n.t("QRCode")}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "column",
                      alignContent: "center",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "50%",
                    }}
                  >
                    <Icon
                      type="material-community"
                      size={30}
                      name="shield-account-variant-outline"
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
                        setmodalActionVisable(false);
                        props.navigation.navigate("About", {
                          items: friendData,
                        });
                      }}
                    />
                    <Text
                      style={{
                        textAlign: "center",
                        marginTop: 10,
                      }}
                    >
                      {i18n.t("About")}
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
                  setmodalActionVisable(false);
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
    /** Fake */
    fake: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 24,
      opacity:0.4
    },
    fakeCircle: {
      width: 44,
      height: 44,
      borderRadius: 9999,
      backgroundColor: '#e8e9ed',
      marginRight: 16,
    },
    fakeSquare: {
      width: SCREEN_WIDTH - 150,
      height: 175,
      backgroundColor: '#e8e9ed',
      borderRadius: 10,
    },
    fakeLine: {
      width: 200,
      height: 10,
      borderRadius: 4,
      backgroundColor: 'lightgrey',
      marginBottom: 8,
      opacity:0.6
    },
    empty: {
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: 0,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 50,
    },
});

export default Friends;
