import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  Alert,
  Dimensions,
  Modal,
  TouchableOpacity,
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
import ActionSheet from "react-native-actions-sheet";
import FriendListItem from "../SubViews/friends/friendsitem";
import EmptyStateView from "@tttstudios/react-native-empty-state";
import { ListItem } from "@rneui/themed";
const { width: ScreenWidth } = Dimensions.get("window");
import { constants } from "../../utils";
import Progress from "react-native-progress";
import FastImage from "react-native-fast-image";
import { createImageProgress } from "react-native-image-progress";
const Image = createImageProgress(FastImage);
import { useIsFocused } from "@react-navigation/native";
import { ActivityIndicator, MD2Colors } from "react-native-paper";
import Loading from "../SubViews/home/Loading";

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
  const [isFriend, setisFriend] = useState(2);
  const contentOffset = useSharedValue(0);
  const AnimatedFlatlist = Animated.FlatList;
  const [user] = useMMKVObject("user.Data", storage);
  const { toast } = useToast();
  const actionSheetRef = useRef(0);
  const [modalVisable, setmodalVisable] = useState(false);
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
    const data = { owner: props.route.params.userID, user: user.user_id };
    await axiosPull.postData("/users/add.php", data);
    await axiosPull._pullFriendCameraFeed(
      props.route.params.userID,
      "user",
      user.user_id
    );
    const results = await axiosPull.postData("/users/check.php", data);
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
                  actionSheetRef.current?.show();
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
    isLoading
  ]);

  if (!ready) {
    props.navigation.setOptions({
      title: i18n.t("Loading"),
    })
    
    return (
      <ActivityIndicator
      size={80}
      style={{
        position: "absolute",
        top: Dimensions.get("window").height / 3.5,
        left: Dimensions.get("window").width / 2 - 40,
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
          height: "100%",
          width: "100%",
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
                <EmptyStateView
                  headerText={""}
                  imageSource={require("../../../assets/friend.png")}
                  imageStyle={style.imageStyle}
                  subHeaderText={i18n.t("A gallery")}
                  headerTextStyle={style.headerTextStyle}
                  subHeaderTextStyle={style.subHeaderTextStyle}
                />
              )
            }
            ListHeaderComponent={
              <><FriendHeader
                id={props.route.params.userID}
                name={friendData.friend_handle}
                motto={friendData.friend_motto}
                avatar={friendData.friend_avatar}
                join={friendData.friend_join}
                create={friendData.friend_camera}
                upload={friendData.friend_media}
                isPro={friendData.friend_isPro} />
                
                <Loading
                  message={uploading.message}
                  flex={uploading.display}
                  image={uploading.image} /></>
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
        <ActionSheet
          ref={actionSheetRef}
          disableDragBeyondMinimumSnapPoint
          gestureEnabled
          snapPoints={[100]}
          containerStyle={{
            borderWidth: 1,
            borderColor: "#f0f0f0",
          }}
        >
          <View style={{ width: "100%", backgroundColor: "#fff" }}>
            <ListItem
              containerStyle={{
                paddingVertical: 5,
                alignContent: "center",
                justifyContent: "center",
                marginTop: 20,
              }}
              key="1"
              onPress={() => {
                actionSheetRef.current?.hide();
                _reportUser(props.route.params.userID);
              }}
            >
              <ListItem.Content>
                <ListItem.Title>{i18n.t("Report Friend")}</ListItem.Title>
              </ListItem.Content>
              <ListItem.Chevron />
            </ListItem>

            <ListItem
              containerStyle={{
                paddingVertical: 5,
                alignContent: "center",
                justifyContent: "center",
                marginTop: 20,
              }}
              key="2"
              onPress={() => {
                actionSheetRef.current?.hide();
                _deleteUser();
              }}
            >
              <ListItem.Content>
                <ListItem.Title>{i18n.t("Delete Friend")}</ListItem.Title>
              </ListItem.Content>
              <ListItem.Chevron />
            </ListItem>

            <ListItem
              containerStyle={{
                paddingVertical: 5,
                alignContent: "center",
                justifyContent: "center",
                marginTop: 20,
              }}
              key="3"
              onPress={() => {
                actionSheetRef.current?.hide();
                setTimeout(() => {
                  setmodalVisable(true);
                }, 500);
              }}
            >
              <ListItem.Content>
                <ListItem.Title>{i18n.t("QRCode")}</ListItem.Title>
              </ListItem.Content>
              <ListItem.Chevron />
            </ListItem>
            <ListItem
              containerStyle={{
                paddingVertical: 5,
                alignContent: "center",
                justifyContent: "center",
                marginTop: 20,
              }}
              key="4"
              onPress={() => {
                actionSheetRef.current?.hide();
                props.navigation.navigate("About", {
                  items: friendData,
                });
              }}
            >
              <ListItem.Content>
                <ListItem.Title>{i18n.t("About")}</ListItem.Title>
              </ListItem.Content>
              <ListItem.Chevron />
            </ListItem>
          </View>
        </ActionSheet>
        <Modal visible={modalVisable} animationType="slide" transparent={true}>
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
                borderRadius: 24,
                padding: 15,
                alignItems: "center",
                justifyContent: "center",
                marginbottom: 20,
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
                Close
              </Text>
            </TouchableOpacity>
          </View>
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
    width: ScreenWidth * 1,
    alignSelf: "center",
    backgroundColor: "#ccc",
  },
  headerTextStyle: {
    color: "rgb(76, 76, 76)",
    fontSize: 18,
    marginVertical: 10,
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
});

export default Friends;
