import React, {useState} from "react";
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
      <Image
        indicator={Progress}
        resizeMode={FastImage.resizeMode.contain}
        style={{
          height: 32,
          width: 32,
          marginRight: 10,
          marginLeft: 10,
          borderRadius: 16,
          borderColor: "#e35504",
          borderWidth: 1,
          overflow: "hidden",
          borderRadius: 16,
        }}
        source={{
          priority: FastImage.priority.high,
          cache: FastImage.cacheControl.immutable,
          uri: props.item.item.photoURL,
        }}
      />

      <View style={{ marginHorizontal: 5 }}>
        <Text style={{ color: "#3D4849", fontSize: 13 }}>
          {props.item.item.displayName} - {" "}
          <Text style={{ color: "grey", fontSize: 10 }}>
            {moment.unix(props.item.item.time_date).locale(localLang).format("LLL")}
          </Text>
        </Text>
        <Text>{props.item.item.comment}</Text>
      </View>
    </View>
  );
};
export default CommentsView;
