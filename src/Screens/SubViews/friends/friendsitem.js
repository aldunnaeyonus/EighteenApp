import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from "react-native";
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
import FacePile from "react-native-face-pile";
import { getLocales } from "expo-localization";
import {
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  durationAsString,
} from "../../../utils/constants";

const FriendListItem = (props) => {
  const isFocused = useIsFocused();
  let FACES = JSON.parse(JSON.stringify(props.item.joinedAvatars));
  let [localLang] = useState(getLocales()[0].languageCode);

  useEffect(() => {
    if (props.item.end - moment().unix() <= 0) {
      clearInterval(timeout);
    }
    return () => {
      clearInterval(timeout);
    };
  }, [isFocused, props]);

  const startDate = (date) => {
    return moment.unix(parseInt(date)).locale(localLang).format("LLL");
  };

  let eventStart = startDate(props.item.start);
  let eventEnd = startDate(props.item.end);
  
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
    await axiosPull._pullFriendFeed(owner);
    }
  };
  fetchData();
  }, [isFocused, props, timeout, endEventTime]);

  return (
    <SafeAreaView key={props.item.UUID} style={style.listItem}>
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
              uri: props.item.illustration,
            }}
          />
          <View
            style={{
              position: "absolute",
              height: 60,
              backgroundColor: "rgba(0, 0, 0, 0.30)",
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
              {props.item.title.toUpperCase()}
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
          {props.item.subscribed == "1" ? (
            <View
                          style={[
                           props.lefthanded == "1"
                                         ? styles.imageUserNameContainersUserLeft
                                         : styles.imageUserNameContainersUser, {
                                          backgroundColor: "rgba(0, 0, 0, 0.60)",
                                                          borderRadius: 10,
                                                          margin:5
                           
                                         }]}
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
                size={30}
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
          ) : props.item.autoJoin == "1" &&
            props.item.camera_count <
              parseInt(props.item.cameras) +
                parseInt(props.item.camera_cameras_extra) &&
            props.item.subscribed == "0" &&
            props.item.end >= moment().unix() ? (
            <View style={styles.imageUserNameContainer}>
              <TouchableOpacity
                onPress={() =>
                  props._autoJoin(
                    props.item.owner,
                    props.item.pin,
                    props.item.end,
                    props.item.UUID
                  )
                }
              >
                <View
                  style={{
                    alignSelf: "flex-end",
                    backgroundColor: "rgba(0, 0, 0, 0.60)",
                    flexDirection: "row",
                    gap: 10,
                    overflow: "hidden",
                    height: 30,
                    margin: 15,
                    borderWidth: 1,
                    borderRadius: 5,
                    borderColor: "#fff",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "#fff",
                      fontWeight: "700",
                      fontSize: 15,
                      marginLeft: 10,
                      marginRight: 10,
                    }}
                  >
                    {i18n.t("e7")}
                  </Text>
                </View>
              </TouchableOpacity>
              <Icon
                onPress={() => {
                  props._repotPost(
                    props.item.pin,
                    props.item.owner,
                    props.item.title
                  );
                }}
                containerStyle={{
                  alignSelf: "flex-end",
                  width: 40,
                  paddingTop: 5,
                  height: 40,
                  marginRight: 15,
                  marginTop: 0,
                  borderRadius: 5,
                  backgroundColor: "rgba(0, 0, 0, 0.60)",
                }}
                type="material"
                size={25}
                name="report-problem"
                color="#fff"
              />
            </View>
          ) : (
            <View style={styles.imageUserNameContainer}>
              <View
                style={{
                  alignSelf: "flex-end",
                  backgroundColor: "rgba(0, 0, 0, 0.60)",
                  flexDirection: "row",
                  gap: 10,
                  overflow: "hidden",
                  height: 30,
                  margin: 15,
                  borderWidth: 1,
                  borderRadius: 5,
                  borderColor: "#fff",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontWeight: "700",
                    marginLeft: 10,
                    marginRight: 10,
                    fontSize: 15,
                  }}
                >
                  {i18n.t("Not Joined")}
                </Text>
              </View>
              <Icon
                onPress={() => {
                  props._repotPost(
                    props.item.pin,
                    props.item.owner,
                    props.item.title
                  );
                }}
                containerStyle={{
                  alignSelf: "flex-end",
                  width: 40,
                  paddingTop: 5,
                  height: 40,
                  marginRight: 15,
                  marginTop: 0,
                  borderRadius: 5,
                  backgroundColor: "rgba(0, 0, 0, 0.60)",
                }}
                type="material"
                size={25}
                name="report-problem"
                color="#fff"
              />
            </View>
          )}
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
            <FacePile numFaces={3} faces={FACES} circleSize={20} />

            <Text
              style={{
                color: "grey",
                fontSize: 14,
              }}
            >
              <Text
                style={{
                  color: "grey",
                  fontSize: 15,
                  fontWeight: "600",
                }}
              >
                {i18n.t("Cameras:")}
              </Text>{" "}
              {props.item.camera_count} of{" "}
              {parseInt(props.item.cameras) +
                parseInt(props.item.camera_cameras_extra)}{" "}
              |{" "}
              <Text
                style={{
                  color: "grey",
                  fontSize: 15,
                  fontWeight: "600",
                }}
              >
                {i18n.t("Media:")}
              </Text>{" "}
              {props.item.media_count - 1}
            </Text>
          </View>
          <View
            style={{
              marginBottom: 10,
              marginTop: 10,
              marginRight: 10,
              marginLeft: 10,
              height: 27,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text style={{ color: "grey", fontSize: 13 }}>
              {eventStart} - {eventEnd}
            </Text>
          </View>
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
    backgroundColor: "#FFF",
    width: SCREEN_WIDTH,
    height: 425,
    marginBottom: 20,
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
export default FriendListItem;
