import React, { useEffect, useState } from "react";
import { View, Text, Alert, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import moment from "moment/min/moment-with-locales";
import FastImage from "react-native-fast-image";
import { createImageProgress } from "react-native-image-progress";
const Image = createImageProgress(FastImage);
import Progress from "react-native-progress";
import { Icon } from "react-native-elements";
import styles from "../../../styles/SliderEntry.style";
import { useIsFocused } from "@react-navigation/native";
import * as i18n from "../../../../i18n";
import CreditsFont from "../camera/credits";
import { getLocales } from "expo-localization";
import {
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  durationAsString,
} from "../../../utils/constants";

const FriendListItemHome = (props) => {
  const isFocused = useIsFocused();
  let [localLang] = useState(getLocales()[0].languageCode);

  useEffect(() => {
    if (props.item.end - moment().unix() <= 0) {
      clearInterval(timeout);
    }
    return () => {
      clearInterval(timeout);
    };
  }, [isFocused, props]);
  let eventEnd = props.item.end;

  let endEventTime = durationAsString(
    parseInt(props.item.end),
    parseInt(props.item.start),
    localLang
  );

  let timeout = setInterval(() => {
    endEventTime = durationAsString(
      parseInt(props.item.end),
      parseInt(props.item.start),
      localLang
    );
  }, 45000);

  useEffect(() => {
    const fetchData = async () => {
      if (eventEnd - moment().unix() <= 0) {
        await axiosPull._pullCameraFeed(user.user_id, "owner");
      }
    };
    fetchData();
  }, [isFocused, props, endEventTime, timeout, eventEnd]);

  return (
    <SafeAreaView
      edges={["bottom", "left", "right"]}
      key={props.item.UUID}
      style={style.listItem}
    >
      <Pressable
        disabled={
          props.item.subscribed == "0"
            ? true
            : props.item.show_gallery == "1"
              ? false
              : false
        }
        onPress={() => {
          if (props.item.start < moment().unix()) {
            props._gotoMedia(
              props.item.pin,
              props.item.title,
              props.item.owner,
              props.item.UUID,
              props.item.end,
              props.item.start,
              props.item.credits,
              props.item.camera_add_social,
              props.item.illustration
            );
          }
        }}
      >
        <View
          key={props}
          style={{
            height: "auto",
            width: SCREEN_WIDTH,
          }}
        >
          <Image
            indicator={Progress}
            style={{
              width: SCREEN_WIDTH,
              height: 500,
              marginTop: 50,
            }}
            resizeMode={FastImage.resizeMode.cover}
            source={{
              priority: FastImage.priority.high,
              cache: FastImage.cacheControl.immutable,
              uri: props.item.illustration,
            }}
          />
          <View
            style={{
              backgroundColor: "transparent",
              position: "absolute",
              height: "100%",
              zIndex: 0,
              backgroundColor: "rgba(0, 0, 0, 0.0)",
              marginTop: 0,
              width: SCREEN_WIDTH,
              flexDirection: "row",
            }}
          >
            <Image
              indicator={Progress}
              style={{
                width: 30,
                height: 30,
                zIndex: 0,
                borderRadius: 20,
                borderColor: "rgba(0,0,0,1)",
                marginTop: 10,
                marginLeft: 5,
                borderWidth: 0.5,
                alignSelf: "auto",
                overflow: "hidden",
                backgroundColor: "transparent",
              }}
              showSpinner={true}
              spinnerColor={"rgba(0, 0, 0, 1.0)"}
              source={{
                priority: FastImage.priority.high,
                cache: FastImage.cacheControl.immutable,
                uri: props.item.icon,
              }}
            />
            {props.item.isPro == "1" && (
              <View style={{ position: "absolute" }}>
                <View
                  style={{
                    marginTop: 20,
                    marginLeft: 25,
                    zIndex: 1,
                    backgroundColor: "transparent",
                    width: 30,
                    height: 30,
                    justifyContent: "center",
                  }}
                >
                  <FastImage
                    style={{
                      width: 15,
                      height: 15,
                    }}
                    resizeMode={FastImage.resizeMode.contain}
                    source={require("../../../../assets/verified.png")}
                  />
                </View>
              </View>
            )}
            <View
              style={{
                marginTop: 5,
                marginLeft: 0,
                backgroundColor: "transparent",
                width: "auto",
                height: "auto",
                flexDirection: "column",
              }}
            >
              <Text
                numberOfLines={1}
                style={{
                  color: "#3D4849",
                  backgroundColor: "transparent",
                  numberOfLines: 3,
                  height: "auto",
                  fontSize: 14,
                  marginLeft: 10,
                  fontWeight: "700",
                  marginTop: 2,
                }}
              >
                {props.item.userName}
              </Text>
              <Text
                numberOfLines={1}
                style={{
                  color: "#3D4849",
                  backgroundColor: "transparent",
                  numberOfLines: 3,
                  height: "auto",
                  fontSize: 12,
                  marginLeft: 10,
                  fontWeight: "500",
                  marginTop: 2,
                }}
              >
                {props.item.title.toUpperCase()}
              </Text>
            </View>
          </View>
          <View
            style={[
             props.lefthanded == "1"
                           ? styles.imageUserNameContainersLeft
                           : styles.imageUserNameContainers, {
                            backgroundColor: "rgba(0, 0, 0, 0.60)",
                                            borderRadius: 10,
                                            margin:5
             
                           }]}
            pointerEvents={
              props.item.end >= moment().unix() ? "auto" : "none"
            }
          >
            <Icon
              onPress={() => {
                if (props.item.start > moment().unix()) {
                  Alert.alert("", i18n.t("Notstared"));
                } else {
                  props.item.show_gallery == "1"
                    ? props._gotoMedia(
                        props.item.pin,
                        props.item.title,
                        props.item.owner,
                        props.item.UUID,
                        props.item.end,
                        props.item.start,
                        props.item.credits,
                        props.item.camera_add_social,
                        props.item.illustration
                      )
                    : Alert.alert("", i18n.t("BlockedGallery"));
                }
              }}
              containerStyle={{
              alignSelf: "auto",
              margin: 15,
              }}
              type="material-community"
              size={27}
              name="view-gallery-outline"
              color="#fff"
            />
            <Icon
              onPress={() => {
                if (props.item.start > moment().unix()) {
                  Alert.alert("", i18n.t("Notstared"));
                } else {
                  if (parseInt(props.item.credits) <= 0) {
                    props._gotoStore(
                      props.item.pin,
                      props.item.owner,
                      props.item.title
                    );
                  } else {
                    props._gotoCamera(
                      props.item.pin,
                      props.item.title,
                      props.item.owner,
                      props.item.UUID,
                      props.item.end,
                      props.item.start,
                      props.item.credits,
                      props.item.tCredits,
                      props.item.camera_add_social
                    );
                  }
                }
              }}
              containerStyle={{
              alignSelf: "auto",
              margin: 15,
              }}
              type="material-community"
              size={30}
              name="camera-outline"
              color="#fff"
            />
            <CreditsFont credits={props.item.credits} />

            <Icon
              onPress={() => {
                props._gotoStore(
                  props.item.pin,
                  props.item.owner,
                  props.item.title
                );
              }}
              containerStyle={{
              alignSelf: "auto",
              margin: 15,
              }}
              type="material-community"
              size={30}
              name="cart-plus"
              color="#fff"
            />

            <Icon
              onPress={() => {
                props._repotPost(
                  props.item.pin,
                  props.item.owner,
                  props.item.title
                );
              }}
              containerStyle={{
              alignSelf: "auto",
              margin: 15,
              }}
              type="octicons"
              size={30}
              name="report"
              color="#fff"
            />
          </View>

          <View
            style={{
              marginTop: 10,
              marginRight: 10,
              marginLeft: 10,
              height: 27,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Icon type="material" size={13} name="camera" color="#3D4849" />
            <Text
              style={{
                color: "#000",
                fontSize: 13,
                marginRight: 20,
              }}
            >
              {" "}
              {props.item.camera_count} /{" "}
              {parseInt(props.item.cameras) +
                parseInt(props.item.camera_cameras_extra)}{" "}
            </Text>
            <Icon type="material" size={13} name="perm-media" color="#3D4849" />

            <Text
              style={{
                color: "#000",
                fontSize: 13,
                marginRight: 20,
              }}
            >
              {" "}
              {props.item.media_count - 1}
            </Text>
            <Icon
              type="material-community"
              size={13}
              name="calendar"
              color="#3D4849"
            />
            <Text
              numberOfLines={2}
              style={{
                color: "#000",
                fontSize: 13,
                width: "auto",
                textAlign: "left",
              }}
            >
              {" "}
              {endEventTime}
            </Text>
          </View>
        </View>
        <View
          style={{
            marginTop: 10,
            marginRight: 10,
            marginLeft: 10,
            height: 27,
            flexDirection: "row",
            alignItems: "center",
            display: props.item.lastComment == "" ? "none" : "flex",
          }}
        >
          <Icon
            onPress={() => {}}
            name={"comment-outline"}
            type="material-community"
            size={17}
            color="#3D4849"
          />

          <Text
          onPress={()=> {
            props._gotoFriend(props.item.lastCommentID);
          }}
            numberOfLines={3}
            style={{
              color: "#3D4849",
              marginLeft: 10,
              fontSize: 13,
              height: "auto",
              textAlign: "left",
              fontWeight:'700'
            }}
          >
            {props.item.lastCommentUser}
          </Text>
          <Text
            numberOfLines={3}
            style={{
              color: "#3D4849",
              marginLeft: 10,
              fontSize: 13,
              height: "auto",
              textAlign: "left",
            }}
          >
            {props.item.lastComment}
          </Text>
        </View>
      </Pressable>
    </SafeAreaView>
  );
};

const style = StyleSheet.create({
  container: {
    margin: 8,
    flex: 1,
    flexDirection: "row",
    height: 40,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  paragraph: {
    fontSize: 17,
    fontWeight: "500",
    textAlign: "center",
  },
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
    height: 200,
    resizeMode: "contain",
  },
  subHeaderTextStyle: {
    fontSize: 15,
    color: "rgb(147, 147, 147)",
    paddingHorizontal: 15,
    textAlign: "center",
    marginVertical: 10,
  },
  dividerTableStyle: {
    height: 0.2,
    marginTop: 0,
    marginBottom: 5,
    width: SCREEN_WIDTH * 1,
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
    width: SCREEN_WIDTH,
    color: "#fff",
    fontWeight: "bold",
    alignSelf: "center",
    justifyContent: "center",
    textAlign: "center",
    textTransform: "uppercase",
    textDecorationLine: "none",
  },
  listItem: {
    padding: 0,
    backgroundColor: "#fff",
    width: SCREEN_WIDTH,
    height: "auto",
    marginBottom: 0,
    flex: 1,
    marginTop: 0,
    alignSelf: "center",
    flexDirection: "row",
  },
  qrImageView: {
    position: "absolute",
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
});
export default FriendListItemHome;
