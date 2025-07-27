import React, { useState } from "react";
import { View, Text } from "react-native";
import FastImage from "react-native-fast-image";
import { createImageProgress } from "react-native-image-progress";
const Image = createImageProgress(FastImage);
import Progress from "react-native-progress";
import moment from "moment/min/moment-with-locales";
import { getLocales } from "expo-localization";

const CommentsView = (props) => {
  let [localLang] = useState(getLocales()[0].languageCode);

  return (
    <View style={{ padding: 20, flexDirection: "row", flex: 1 }}>
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
          resizeMode={FastImage.resizeMode.cover}
          style={{
            height: 32,
            width: 32,
            marginRight: 10,
            marginLeft: 10,
            borderRadius: 16,
            borderColor: "#fff",
            borderWidth: 1,
            overflow: "hidden",
            borderRadius: 16,
          }}
          source={{
            priority: FastImage.priority.high,
            cache: FastImage.cacheControl.immutable,
            uri: props.item.photoURL,
          }}
        />
      </View>
      <View style={{ marginHorizontal: 5 }}>
        <Text style={{ color: "#3D4849", fontSize: 13 }}>
          {props.item.displayName} -{" "}
          <Text style={{ color: "grey", fontSize: 10 }}>
            {moment.unix(props.item.time_date).locale(localLang).format("LLL")}
          </Text>
        </Text>
        <Text>{props.item.comment}</Text>
      </View>
    </View>
  );
};
export default CommentsView;
