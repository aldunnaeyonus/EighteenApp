import React, { useState, useEffect } from "react";
import {
  Share,
  StyleSheet,
  Dimensions,
  Alert,
  Modal,
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import EmptyStateView from "@tttstudios/react-native-empty-state";
import { constants } from "../../utils";
import "moment-duration-format";
import FastImage from "react-native-fast-image";
import { createImageProgress } from "react-native-image-progress";
const Image = createImageProgress(FastImage);
import Progress from "react-native-progress";
const { width: ScreenWidth } = Dimensions.get("window");
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
import NotifService from "../../../NotifService";
import { useIsFocused } from "@react-navigation/native";
import Loading from "../SubViews/home/Loading";

const Home = (props) => {
  const [cameraData, setcameraData] = useMMKVObject(
    "user.Camera.Feed",
    storage
  );
  const [modalVisable, setmodalVisable] = useState(false);
  const [friendData] = useMMKVObject("user.Friend.Feed", storage);
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

  useEffect(() => {
    new NotifService();
  }, []);

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
  };

  const _gotoShare = async (pin, time, owner, title) => {
    const link =
      constants.url + "/link.php?pin=" + pin + "." + time + "." + owner;
    const message =
      i18n.t("Join my Snap Eighteen Event") + "[" + title + "] at " + link;
    const url =
      constants.url +
      "/qrcode.php?pin=" +
      pin +
      "&time=" +
      time +
      "&owner=" +
      owner;
    const shareOptions = {
      title: title,
      url: url,
      message: message,
    };
    try {
      const ShareResponse = await Share.share(shareOptions);
      console.log("Result =>", ShareResponse);
    } catch (error) {
      console.log("Error =>", error);
    }
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

  const _addMax = async (pin, owner) => {
    const data = {
      owner: owner,
      pin: pin,
      isPro: user.isPro,
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
      headerLeft: () => <></>,
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
    };
    fetchData();

    return () => {
      clearInterval(timeout);
    };
  }, [isFocused, timeout]);

  const goToFriend = async (friendID) => {
    await axiosPull._pullFriendCameraFeed(props.friendID, "user", user.user_id);
    props.navigation.navigate("Friends", {
      userID: friendID,
    });
  };

  const _createCamera = async (userID) => {
    props.navigation.navigate("CreateCamera", {
      UUID: userID,
    });
  };

  return (
    <SafeAreaProvider
      style={{ backgroundColor: "#fff", flex: 1, paddingBottom: 24 }}
    >
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
                width: 300,
                height: 300,
                backgroundColor: "white",
                alignSelf: "auto",
              }}
              resizeMode={FastImage.resizeMode.contain}
              source={{
                priority: FastImage.priority.normal,
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
              Close
            </Text>
          </TouchableOpacity>
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
              {uploading.display == "flex" && (
                <Loading
                  message={uploading.message}
                  flex={uploading.display}
                  image={uploading.image}
                />
              )}
              <FriendHeader
                _createCamera={_createCamera}
                user={user}
                friendData={friendData}
                _gotoAllFriends={_gotoAllFriends}
                goToFriend={goToFriend}
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
    width: ScreenWidth * 1,
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
    width: "100%",
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
    width: "100%",
    height: "100%",
  },
});

export default Home;
