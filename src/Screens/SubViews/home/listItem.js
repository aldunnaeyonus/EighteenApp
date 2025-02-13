import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable
} from "react-native";
import moment from "moment/min/moment-with-locales";
import { MenuView } from "@react-native-menu/menu";
import FastImage from "react-native-fast-image";
import { createImageProgress } from "react-native-image-progress";
const Image = createImageProgress(FastImage);
import Progress from "react-native-progress";
import { Icon } from "react-native-elements";
import { constants, SCREEN_WIDTH, SCREEN_HEIGHT } from "../../../utils/constants";
import styles from "../../../styles/SliderEntry.style";
import { useFocusEffect } from "@react-navigation/native";
import * as i18n from "../../../../i18n";
import FacePile from "react-native-face-pile";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { getLocales } from "expo-localization";

const ListItem = (props) => {
  let [localLang] = useState(getLocales()[0].languageCode);
  let FACES = JSON.parse(JSON.stringify(props.item.item.joinedAvatars));

  useFocusEffect(
    useCallback(() => {
      if (props.item.item.end - moment().unix() <= 0) {
        clearInterval(timeout);
        props._deleteFeedItemIndex(props.item.item.UUID);
      }
      return () => {
        clearInterval(timeout);
      };
    }, [timeout, props.item.item.end, props.item.item.UUID])
  );

  const startDate = (date) => {
    return moment.unix(parseInt(date)).locale(localLang).format("LLL");
  };

  let eventStart = startDate(props.item.item.start);
  let eventEnd = startDate(props.item.item.end);

  const durationAsString = (end, start) => {
    return parseInt(start) > moment().unix()
      ? i18n.t("Event Starts in:") +
          moment
            .duration(parseInt(start) - moment().unix(), "seconds")
            .locale(localLang)
            .humanize(true)
      : i18n.t("Event Ends in:") +
          moment
            .duration(parseInt(end), "seconds")
            .locale(localLang)
            .humanize(true);
  };

  let endEventTime = durationAsString(
    parseInt(props.item.item.end) - moment().unix(),
    parseInt(props.item.item.start)
  );

  let timeout = setInterval(() => {
    endEventTime = durationAsString(
      parseInt(props.item.item.end) - moment().unix(),
      parseInt(props.item.item.start)
    );
  }, 45000);

  return (
    <SafeAreaProvider
      key={props.item.item.UUID}
      style={style.listItem}
      edges={["right", "bottom", "left"]}
    >
      <View
        key={props}
        style={{
          height: 350,
          width: SCREEN_WIDTH,
        }}
      >
        <Image
          indicator={Progress}
          style={{
            width: SCREEN_WIDTH,
            height: 350,
          }}
          resizeMode={FastImage.resizeMode.cover}
          source={{
            priority: FastImage.priority.high,
            cache: FastImage.cacheControl.immutable,
            uri: props.item.item.illustration,
          }}
        />
        <View
          style={{
            position: "absolute",
            height: 62,
            backgroundColor: "rgba(0, 0, 0, 0.60)",
            width: SCREEN_WIDTH,
            bottom: 0,
          }}
        >
          <Text
            numberOfLines={2}
            style={{
              position: "absolute",
              color: "#fff",
              fontSize: 20,
              left: 20,
              bottom: 30,
              fontWeight: "bold",
              width: SCREEN_WIDTH,
            }}
          >
            {props.item.item.title == undefined
              ? ""
              : props.item.item.title.toUpperCase()}
          </Text>
          <Text
            numberOfLines={2}
            style={{
              position: "absolute",
              color: "#fff",
              fontSize: 15,
              bottom: 7,
              left: 20,
              width: SCREEN_WIDTH,
            }}
          >
            {endEventTime}
          </Text>
        </View>
         <View style={{ position: "absolute", bottom:-3, right:0 }}>
            <Pressable 
            onPress={()=> {
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
              )
          }}>
                          <View
                            style={{
                              margin: 15,
                              backgroundColor: props.item.item.badge == "0" ? "rgba(116, 198, 190, 0.0)" : "rgba(116, 198, 190, 0.8)",
                              width: 40,
                              height: 40,
                              borderRadius: 20,
                              justifyContent: "center",
                            }}
                          >
                            <Text
                              style={{
                                color: "#fff",
                                textAlignVertical: "center",
                                textAlign: "center",
                                fontSize: 17,
                                fontWeight: "bold",
                              }}
                            >
                              {props.item.item.badge > 99 ? "+99" : props.item.item.badge == "0" ? "" : props.item.item.badge}
                            </Text>
                          </View>
                              </Pressable>
                        </View>
        <View style={styles.imageUserNameContainer}>
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
                paddingTop:5,
                borderTopRightRadius: 5,
                borderTopLeftRadius: 5,
                backgroundColor: "rgba(0, 0, 0, 0.60)",
              }}
              type="material-community"
              size={30}
              name="delete-sweep-outline"
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
              paddingTop:5,
              backgroundColor: "rgba(0, 0, 0, 0.60)",
            }}
            type="entypo"
            size={25}
            name="images"
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
              paddingTop:5,
              backgroundColor: "rgba(0, 0, 0, 0.60)",
            }}
            type="font-awesome"
            size={25}
            name="camera-retro"
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
              paddingTop:5,
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
            justifyContent: "space-between",
          }}
        >
          <TouchableOpacity
            onPress={() => {
              props._joinFeedItem(
                props.item.item.UUID,
                props.item.item.owner,
                props.item.item.pin,
                props.item.item.title
              );
            }}
          >
            <FacePile numFaces={3} faces={FACES} circleSize={15} />
          </TouchableOpacity>
          <Text
            style={{
              color: "grey",
              fontSize: 14,
            }}
          >
            <Text
              style={{
                color: "grey",
                fontSize: 14,
                fontWeight: "600",
              }}
            >
              {i18n.t("Cameras:")}
            </Text>{" "}
            {props.item.item.camera_count} of{" "}
            {parseInt(props.item.item.cameras) +
              parseInt(props.item.item.camera_cameras_extra)}{" "}
            {props.item.item.cameras != (props.isPro == "1" ? 1000 : 18) && (
              <Text
                onPress={() => {
                  props._addMax(
                    props.item.item.pin,
                    props.item.item.owner,
                    props.isPro
                  );
                }}
                style={{
                  justifyContent: "center",
                  color: "#ea5504",
                  fontSize: 14,
                  fontWeight: "600",
                }}
              >
                ({i18n.t("Add Max")}){" "}
              </Text>
            )}
            |{" "}
            <Text
              style={{
                color: "grey",
                fontSize: 14,
                fontWeight: "600",
              }}
            >
              {i18n.t("Media:")}
            </Text>{" "}
            {props.item.item.media_count - 1}
          </Text>
        </View>
        <View
          style={{
            marginBottom: 10,
            marginRight: 10,
            marginLeft: 10,
            height: 27,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text style={{ color: "grey", fontSize: 12 }}>
            {eventStart} - {eventEnd}
          </Text>
        </View>
      </View>
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
    height: 200,
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
    backgroundColor: "#FFF",
    width: SCREEN_WIDTH,
    height: 425,
    flex: 1,
    marginTop: 5,
    marginBottom: 15,
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
