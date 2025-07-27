import React, { useState } from "react";
import moment from "moment/min/moment-with-locales";
import FastImage from "react-native-fast-image";
import { createImageProgress } from "react-native-image-progress";
const Image = createImageProgress(FastImage);
import Progress from "react-native-progress";
import { View, Text, TouchableOpacity } from "react-native";
import styles from "../../../styles/SliderEntry.style";
import CameraLens from "../camera/cameraView";
import * as i18n from "../../../../i18n";
import { useMMKVObject } from "react-native-mmkv";
import { storage } from "../../../context/components/Storage";
import { getLocales } from "expo-localization";
import { SCREEN_WIDTH } from "../../../utils/constants";

const MemberListItem = (props) => {
  let [localLang] = useState(getLocales()[0].languageCode);

  const [user] = useMMKVObject("user.Data", storage);

  return (
    <View style={styles.slideInnerContaineMember}>
      <TouchableOpacity
        onPress={async () => {
          props.goToFriend(props.item.user_id);
        }}
      >
        <View style={styles.shadow2} />
        <View
          style={{
            alignItems: "center",
            flexDirection: "row",
          }}
        >
          <View
            style={{
              borderWidth: 1.5,
              borderRadius: 17,
              borderBottomColor:
                props.item.isPro == "1" ? "rgba(116, 198, 190, 1)" : "#ea5504",
              borderTopColor: props.item.isPro == "1" ? "#ea5504" : "#ea5504",
              borderRightColor:
                props.item.isPro == "1" ? "rgba(250, 190, 0, 1)" : "#ea5504",
              borderLeftColor: props.item.isPro == "1" ? "#3D4849" : "#ea5504",
              width: 35,
              height: 35,
              alignContent: "center",
              alignItems: "center",
              justifyContent: "center",
              marginTop: 5,
              marginLeft: 5,
            }}
          >
            <Image
              indicator={Progress}
              source={{
                uri: props.item.user_avatar,
                priority: FastImage.priority.high,
                cache: FastImage.cacheControl.immutable,
              }}
              resizeMode={FastImage.resizeMode.cover}
              style={{
                width: 30,
                borderWidth: 0.7,
                borderColor: "white",
                height: 30,
                borderRadius: 15,
                overflow: "hidden",
              }}
            />
          </View>
          <View
            style={{
              flexDirection: "column",
              marginBottom: 0,
              width: SCREEN_WIDTH - 200,
            }}
          >
            <Text
              style={{
                fontFamily: "HelveticaNeue",
                fontWeight: "bold",
                fontSize: 20,
                color: "#3D4849",
                textAlign: "left",
              }}
              numberOfLines={1}
            >
              {props.item.user_handle.toUpperCase()}
            </Text>
            <Text
              style={{
                fontFamily: "HelveticaNeue",
                fontSize: 15,
                marginTop: 5,
                color: "grey",
                textAlign: "left",
              }}
              numberOfLines={2}
            >
              {i18n.t("Joined")}:{" "}
              {moment
                .unix(parseInt(props.item.user_joined))
                .locale(localLang)
                .format("LLL")}
            </Text>
          </View>
          <TouchableOpacity
            onPress={async () => {
              user.isPro == "1" && props.item.credits == 0
                ? props.moreCredits(props.item.user_id, props.pin, props.UUID)
                : null;
            }}
          >
            <CameraLens
              credits={props.item.credits}
              tCredits={props.item.tCredits}
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default MemberListItem;
