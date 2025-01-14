import React, { useEffect } from "react";
import {
  View,
  Text,
  Alert,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import moment from "moment";
import FastImage from "react-native-fast-image";
import { createImageProgress } from "react-native-image-progress";
const Image = createImageProgress(FastImage);
import Progress from "react-native-progress";
import { Icon } from "react-native-elements";
import styles from "../../../styles/SliderEntry.style";
const { width: ScreenWidth } = Dimensions.get("window");
import { useIsFocused } from "@react-navigation/native";
import * as i18n from "../../../../i18n";
import CreditsFont from "../camera/credits";
import FacePile from "react-native-face-pile";

const FriendListItem = (props) => {
  const isFocused = useIsFocused();
  let FACES = JSON.parse(JSON.stringify(props.item.item.joinedAvatars));

  useEffect(() => {
    if (props.item.item.end - moment().unix() <= 0) {
      clearInterval(timeout);
    }
    return () => {
      clearInterval(timeout);
    };
  }, [isFocused, props]);

  const startDate = (date) => {
    return moment.unix(parseInt(date)).format("LLL");
  };

  let eventStart = startDate(props.item.item.start);
  let eventEnd = startDate(props.item.item.end);

  const durationAsString = (end, start) => {
    return parseInt(start) >= moment().unix()
      ? i18n.t("Event Starts in:") +
          moment
            .duration(parseInt(start) - moment().unix(), "seconds")
            .format("d [days], h [hrs], m [min]")
      : i18n.t("Event Ends in:") +
          moment
            .duration(parseInt(end), "seconds")
            .format("d [days], h [hrs], m [min]");
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
    <SafeAreaView key={props.item.item.UUID} style={style.listItem}>
      <View
        key={props}
        style={{
          height: 350,
          width: ScreenWidth,
        }}
      >
        <Image
          indicator={Progress}
          style={{
            width: ScreenWidth,
            height: 350,
          }}
          resizeMode={FastImage.resizeMode.cover}
          source={{
            priority: FastImage.priority.normal,
            uri: props.item.item.illustration,
          }}
        />
        <View
          style={{
            position: "absolute",
            height: 60,
            backgroundColor: "rgba(0, 0, 0, 0.60)",
            width: ScreenWidth,
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
              width: ScreenWidth,
            }}
          >
            {props.item.item.title.toUpperCase()}
          </Text>
          <Text
            numberOfLines={2}
            style={{
              position: "absolute",
              color: "#fff",
              fontSize: 15,
              bottom: 7,
              left: 20,
              width: ScreenWidth,
            }}
          >
            {endEventTime}
          </Text>
        </View>
        {props.item.item.subscribed == "1" ? (
          <View
            style={styles.imageUserNameContainer}
            pointerEvents={
              props.item.item.end >= moment().unix() ? "auto" : "none"
            }
          >
            <Icon
              onPress={() => {
                props.item.item.show_gallery == "1"
                  ? props._gotoMedia(
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
                  : Alert.alert("", i18n.t("BlockedGallery"));
              }}
              containerStyle={{
                alignSelf: "flex-end",
                width: 40,
                paddingTop: 5,
                height: 40,
                marginRight: 5,
                marginTop: 10,
                borderTopRightRadius: 5,
                borderTopLeftRadius: 5,
                backgroundColor: "rgba(0, 0, 0, 0.60)",
              }}
              type="entypo"
              size={25}
              name="images"
              color="#fff"
            />
            <Icon
              onPress={() => {
                if (parseInt(props.item.item.credits) <= 0) {
                  props._gotoStore(
                    props.item.item.pin,
                    props.item.item.owner,
                    props.item.item.title
                  );
                } else {
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
                }
              }}
              containerStyle={{
                alignSelf: "flex-end",
                width: 40,
                height: 40,
                marginRight: 5,
                paddingTop: 10,
                marginTop: 0,
                backgroundColor: "rgba(0, 0, 0, 0.60)",
              }}
              type="font-awesome"
              size={25}
              name="camera-retro"
              color="#fff"
            />
            <CreditsFont credits={props.item.item.credits} />
            <Text
              style={{
                color: "white",
                alignSelf: "flex-end",
                width: 40,
                height: 40,
                marginRight: 5,
                marginTop: 0,
                fontSize: 9,
                textAlign: "center",
                backgroundColor: "rgba(0, 0, 0, 0.60)",
              }}
            >
              Credits
            </Text>
            <Icon
              onPress={() => {
                props._gotoStore(
                  props.item.item.pin,
                  props.item.item.owner,
                  props.item.item.title
                );
              }}
              containerStyle={{
                alignSelf: "flex-end",
                width: 40,
                height: 40,
                marginRight: 5,
                marginTop: -10,
                backgroundColor: "rgba(0, 0, 0, 0.60)",
              }}
              type="ionicon"
              size={25}
              name="storefront-outline"
              color="#fff"
            />

            <Icon
              onPress={() => {
                props._repotPost(
                  props.item.item.pin,
                  props.item.item.owner,
                  props.item.item.title
                );
              }}
              containerStyle={{
                alignSelf: "flex-end",
                width: 40,
                paddingTop: 5,
                height: 40,
                marginRight: 5,
                marginTop: 0,
                borderBottomRightRadius: 5,
                borderBottomLeftRadius: 5,
                backgroundColor: "rgba(0, 0, 0, 0.60)",
              }}
              type="material"
              size={25}
              name="report-problem"
              color="#fff"
            />
          </View>
        ) : props.item.item.autoJoin == "1" &&
          props.item.item.camera_count <
            parseInt(props.item.item.cameras) +
              parseInt(props.item.item.camera_cameras_extra) &&
          props.item.item.subscribed == "0" &&
          props.item.item.end >= moment().unix() ? (
          <View style={styles.imageUserNameContainer}>
            <TouchableOpacity
              onPress={() =>
                props._autoJoin(
                  props.item.item.owner,
                  props.item.item.pin,
                  props.item.item.end,
                  props.item.item.UUID
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
                  props.item.item.pin,
                  props.item.item.owner,
                  props.item.item.title
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
                  props.item.item.pin,
                  props.item.item.owner,
                  props.item.item.title
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
          <FacePile numFaces={3} faces={FACES} circleSize={15} />

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
    padding: 0,
    backgroundColor: "#FFF",
    width: ScreenWidth,
    height: 425,
    marginBottom: 20,
    flex: 1,
    marginTop: 0,
    alignSelf: "center",
    flexDirection: "row",
  },
  qrImageView: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
});
export default FriendListItem;
