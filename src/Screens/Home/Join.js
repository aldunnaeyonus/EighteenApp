import React, { useState, useCallback } from "react";
import { StyleSheet } from "react-native";
import EmptyStateView from "@tttstudios/react-native-empty-state";
import { constants } from "../../utils";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Animated from "react-native-reanimated";
import { useToast } from "react-native-styled-toast";
import { storage } from "../../context/components/Storage";
import { useMMKVObject } from "react-native-mmkv";
import { useFocusEffect } from "@react-navigation/native";
import { axiosPull } from "../../utils/axiosPull";
import * as i18n from "../../../i18n";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Join = (props) => {
  const [message, setMessage] = useState([]);
  const [avatar, setavatar] = useState("");
  const [username, setusername] = useState("");
  const AnimatedFlatlist = Animated.FlatList;
  const [title, setTitle] = useState("Join Event");
  const [refreshing, setRefreshing] = useState(true);
  const [error, setError] = useState("");
  const { toast } = useToast();
  const [user] = useMMKVObject("user.Data", storage);

  useFocusEffect(
    useCallback(async () => {
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
        setMessage("");
        setavatar("default.png");
        setError("");
        setusername("Profile Loading");
        setTitle("Loading...");
        props.navigation.setOptions({
          title: title,
        });
        if ((await AsyncStorage.getItem("logedIn")) == "1") {
          checkHandle();
        } else {
          props.navigation.navigate("Begin");
        }
      };
      fetchData();
    }, [title, props, user, message, avatar, username, refreshing, error, user])
  );

  const checkHandle = useCallback(async () => {
    setRefreshing(true);
    const data = {
      pin: props.route.params.pin,
      time: props.route.params.time,
      owner: props.route.params.owner,
      user: user.user_id,
    };
    const reponse = await axiosPull.postData("/join.php", data);
    setMessage(reponse[0]);
    setavatar(reponse[0].avatar);
    setError(i18n.t(`${reponse[0].responeMessage}`));
    setusername(reponse[0].username);
    setTitle(reponse[0].title);
    if (reponse[0].title == undefined) {
      props.navigation.goBack();
    } else {
      props.navigation.setOptions({
        title: reponse[0].title,
      });
    }
    setRefreshing(false);
  }, [
    props.route.params.pin,
    props.route.params.time,
    props.route.params.owner,
    refreshing,
  ]);

  return (
    <SafeAreaProvider
      style={{ backgroundColor: "#fff", width: "100%", height: "100%" }}
    >
      <AnimatedFlatlist
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicatorr={false}
        data={message}
        extraData={message}
        scrollEventThrottle={16}
        ListHeaderComponent={
          <EmptyStateView
            imageSource={{
              uri: constants.url + "/avatars/" + avatar,
            }}
            imageStyle={style.imageStyle}
            headerText={username.toUpperCase()}
            subHeaderText={error}
            headerTextStyle={style.headerTextStyle}
            subHeaderTextStyle={style.subHeaderTextStyle}
          />
        }
        renderItem={() => <></>}
      />
    </SafeAreaProvider>
  );
};
const style = StyleSheet.create({
  headerTextStyle: {
    color: "rgb(76, 76, 76)",
    fontSize: 18,
    marginVertical: 10,
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
    marginTop: 10,
    height: 200,
    width: 200,
    borderRadius: 100,
    overflow: "hidden",
    resizeMode: "contain",
  },
  subHeaderTextStyle: {
    fontSize: 17,
    color: "#3D4849",
    paddingHorizontal: 60,
    textAlign: "center",
    fontWeight: "500",
    marginVertical: 10,
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
    elevation: 7,
    backgroundColor: "#FFF",
    width: "95%",
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

export default Join;
