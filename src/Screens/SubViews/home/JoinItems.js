import React, { useCallback,useState } from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";
import moment from "moment/min/moment-with-locales"
import FastImage from "react-native-fast-image";
import { createImageProgress } from "react-native-image-progress";
const Image = createImageProgress(FastImage);
import Progress from "react-native-progress";
import { useFocusEffect } from "@react-navigation/native";
import * as i18n from "../../../../i18n";
import FacePile from "react-native-face-pile";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { getLocales } from 'expo-localization';
import { SCREEN_WIDTH, SCREEN_HEIGHT, durationAsString } from "../../../utils/constants";

const JoinItems = (props) => {
    let [localLang] = useState(getLocales()[0].languageCode)

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
        <Image
          style={{
            opacity:0.9,
            position:'absolute',
            width: 250,
            height: 250,
          }}
          source={require('../../../../assets/sticky.png')}
        />
        <View style={{flex:1, width:153, height:150, position:'absolute', justifyContent: 'center', alignItems: 'center', alignContent:'center'}}>
         <Text
              style={{
                textAlign:'center',
                alignSelf:'center',
                position:'absolute',
                transform: [{ rotate: '-7.5deg'}],
                top:60,
                left:51,
                color: "black",
                fontSize: 16,
                fontWeight: "600",
              }}
            >
              {i18n.t(`${props.item.item.errResponse}`)}
            </Text></View>
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
    flex: 1,
    marginTop: 0,
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
export default JoinItems;
