import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import moment from "moment/min/moment-with-locales";
import FastImage from "react-native-fast-image";
import { createImageProgress } from "react-native-image-progress";
const Image = createImageProgress(FastImage);
import Progress from "react-native-progress";
import { Icon } from "react-native-elements";
import styles from "../../../styles/SliderEntry.style";
import { useIsFocused } from "@react-navigation/native";
import FacePile from "react-native-face-pile";
import { getLocales } from "expo-localization";
import {
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  durationAsString,
  constants,
} from "../../../utils/constants";
import { MenuView } from "@react-native-menu/menu";
import { axiosPull } from "../../../utils/axiosPull";

const ListItem = (props) => {
  const isFocused = useIsFocused();
  let FACES = JSON.parse(JSON.stringify(props.item.item.joinedAvatars));
  let [localLang] = useState(getLocales()[0].languageCode);

  useEffect(() => {
    if (props.item.item.end - moment().unix() <= 0) {
      clearInterval(timeout);
    }
    return () => {
      clearInterval(timeout);
    };
  }, [isFocused, props]);
  let eventEnd = props.item.item.end;

  let endEventTime = durationAsString(
    parseInt(props.item.item.end),
    parseInt(props.item.item.start),
    localLang
  );

  let timeout = setInterval(() => {
    endEventTime = durationAsString(
      parseInt(props.item.item.end),
      parseInt(props.item.item.start),
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
  }, [isFocused, props, timeout, endEventTime, eventEnd]);

  return (
    <SafeAreaView
      edges={["bottom", "left", "right"]}
      key={props.item.item.UUID}
      style={style.listItem}
    >
      <View
        key={props}
        style={{
          height: "auto",
          width: SCREEN_WIDTH,
        }}
      >
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
              uri: props.item.item.icon,
            }}
          />
          {props.item.item.isPro == "1" && (
            <View style={{ position: "absolute" }}>
              <View
                style={{
                  marginTop: 20,
                  marginLeft: 25,
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
              {props.item.item.userName}
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
              {props.item.item.title.toUpperCase()}
            </Text>
          </View>
          <View
            style={{
              top: 10,
              right: 45,
              height: 27,
              position: "absolute",
            }}
          >
            <FacePile
              numFaces={3}
              faces={FACES}
              circleSize={15}
              containerStyle={{ position: "absolute" }}
            />
          </View>
        </View>
        <Pressable
          onPress={() => {
            props._gotoMedia(
              props.item.item.pin,
              props.item.item.title,
              props.item.item.owner,
              props.item.item.UUID,
              props.item.item.end,
              props.item.item.start,
              props.item.item.credits,
              props.item.item.camera_add_social,
              props.item.item.illustration
            );
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
              uri: props.item.item.illustration,
            }}
          />
        </Pressable>
        <View
          style={
            props.lefthanded == "1"
              ? styles.imageUserNameContainersLeft
              : styles.imageUserNameContainers
          }
        >
          <MenuView
            key={props.item.item.UUID}
            index={props.item.index}
            title={
              props.item.item.title == undefined
                ? ""
                : props.item.item.title.toUpperCase()
            }
            isAnchoredToRight={true}
            onPressAction={async ({ nativeEvent }) => {
              if (nativeEvent.event == "Delete-" + props.item.item.UUID) {
                props._deleteFeedItem(
                  props.item.item.UUID,
                  props.item.item.owner,
                  props.item.item.pin
                );
              } else if (nativeEvent.event == "End-" + props.item.item.UUID) {
                props._editItem(
                  props.item.item.UUID,
                  props.item.item.owner,
                  props.item.item.pin
                );
              } else if (nativeEvent.event == "Edit-" + props.item.item.UUID) {
                props._editEvent(
                  props.item.item.UUID,
                  props.item.item.pin,
                  props.item.item.owner,
                  props.item.item.user,
                  props.item.item.illustration,
                  props.item.item.title,
                  props.item.item.cameras,
                  props.item.item.show_gallery,
                  props.item.item.camera_add_social,
                  props.item.item.start,
                  props.item.item.camera_purchase_more,
                  props.item.item.length_index,
                  props.item.item.end,
                  props.item.item.shots,
                  props.item.item.ai_description
                );
              }
            }}
            actions={
              props.item.item.start < moment().unix() && props.isPro != "1"
                ? constants.endActions(props.item.item.UUID)
                : constants.actions(props.item.item.UUID)
            }
            shouldOpenOnLongPress={false}
            themeVariant="light"
          >
            <Icon
              containerStyle={{
                alignSelf: "flex-end",
                width: 40,
                height: 40,
                marginRight: 5,
                marginTop: 5,
                paddingTop: 5,
                borderTopRightRadius: 5,
                borderTopLeftRadius: 5,
                backgroundColor: "rgba(0, 0, 0, 0.60)",
              }}
              type="material-community"
              size={30}
              name="menu-open"
              color="#fff"
            />
          </MenuView>
          <Icon
            onPress={() => {
              props._gotoMedia(
                props.item.item.pin,
                props.item.item.title,
                props.item.item.owner,
                props.item.item.UUID,
                props.item.item.end,
                props.item.item.start,
                props.item.item.credits,
                props.item.item.camera_add_social,
                props.item.item.illustration
              );
            }}
            containerStyle={{
              alignSelf: "flex-end",
              width: 40,
              height: 40,
              marginRight: 5,
              paddingTop: 5,
              backgroundColor: "rgba(0, 0, 0, 0.60)",
            }}
            type="material-community"
            size={25}
            name="view-gallery-outline"
            color="#fff"
          />
          <Icon
            onPress={() => {
              props._gotoCamera(
                props.item.item.pin,
                props.item.item.title,
                props.item.item.owner,
                props.item.item.UUID,
                props.item.item.end,
                props.item.item.start,
                props.item.item.credits,
                props.item.item.tCredits,
                props.item.item.camera_add_social
              );
            }}
            containerStyle={{
              alignSelf: "flex-end",
              width: 40,
              height: 40,
              marginRight: 5,
              paddingTop: 5,
              backgroundColor: "rgba(0, 0, 0, 0.60)",
            }}
            type="material-community"
            size={25}
            name="camera-outline"
            color="#fff"
          />
          <Icon
            onPress={() => {
              props._gotoQRCode(
                constants.url +
                  "/qrcode.php?pin=" +
                  props.item.item.pin +
                  "&time=" +
                  props.item.item.end +
                  "&owner=" +
                  props.item.item.owner +
                  "&UUID=" +
                  props.item.item.user
              );
            }}
            containerStyle={{
              alignSelf: "flex-end",
              width: 40,
              height: 40,
              marginRight: 5,
              paddingTop: 5,
              backgroundColor: "rgba(0, 0, 0, 0.60)",
            }}
            type="material-community"
            size={25}
            name="qrcode"
            color="#fff"
          />
          <Icon
            onPress={() => {
              props._joinFeedItem(
                props.item.item.UUID,
                props.item.item.owner,
                props.item.item.pin,
                props.item.item.title
              );
            }}
            containerStyle={{
              alignSelf: "flex-end",
              width: 40,
              height: 40,
              marginRight: 5,
              marginTop: 0,
              backgroundColor: "rgba(0, 0, 0, 0.60)",
            }}
            type="material-community"
            size={25}
            name="account-group-outline"
            color="#fff"
          />
          {props.isPro != "1" && (
            <Icon
              onPress={() => {
                props._gotoStore(
                  props.item.item.pin,
                  props.item.item.owner,
                  props.item.item.user == props.item.item.owner
                    ? "owner"
                    : "user",
                  props.item.item.title,
                  props.item.item.cameras
                );
              }}
              containerStyle={{
                alignSelf: "flex-end",
                width: 40,
                height: 40,
                marginRight: 5,
                marginTop: 0,
                backgroundColor: "rgba(0, 0, 0, 0.60)",
              }}
              type="ionicon"
              size={25}
              name="storefront-outline"
              color="#fff"
            />
          )}
          <Icon
            onPress={() => {
              props._gotoShare(
                props.item.item.pin,
                props.item.item.end,
                props.item.item.owner,
                props.item.item.title
              );
            }}
            containerStyle={{
              alignSelf: "flex-end",
              width: 40,
              height: 40,
              marginRight: 5,
              marginTop: 0,
              borderBottomRightRadius: 5,
              borderBottomLeftRadius: 5,
              backgroundColor: "rgba(0, 0, 0, 0.60)",
            }}
            type="material-community"
            size={25}
            name="share"
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
          <Icon type="material" size={17} name="camera" color="#3D4849" />
          <Text
            style={{
              color: "grey",
              fontSize: 15,
              marginRight: 20,
            }}
          >
            {" "}
            {props.item.item.camera_count} /{" "}
            {parseInt(props.item.item.cameras) +
              parseInt(props.item.item.camera_cameras_extra)}{" "}
          </Text>
          <Icon type="material" size={17} name="perm-media" color="#3D4849" />

          <Text
            style={{
              color: "grey",
              fontSize: 15,
              marginRight: 20,
            }}
          >
            {" "}
            {props.item.item.media_count - 1}
          </Text>
          <Icon
            type="material-community"
            size={17}
            name="calendar"
            color="#3D4849"
          />
          <Text
            numberOfLines={2}
            style={{
              color: "grey",
              fontSize: 15,
              width: "auto",
              textAlign: "left",
            }}
          >
            {" "}
            {endEventTime}
          </Text>
        </View>
        <View
          style={{
            marginTop: 10,
            marginRight: 10,
            marginLeft: 10,
            height: 27,
            flexDirection: "row",
            alignItems: "center",
            display: props.item.item.lastComment == "" ? "none" : "flex",
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
            onPress={() => {
              props._gotoFriend(props.item.item.lastCommentID);
            }}
            numberOfLines={3}
            style={{
              color: "#3D4849",
              marginLeft: 10,
              fontSize: 13,
              height: "auto",
              textAlign: "left",
              fontWeight: "700",
            }}
          >
            {props.item.item.lastCommentUser}
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
            {props.item.item.lastComment}
          </Text>
        </View>
      </View>
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
export default ListItem;
