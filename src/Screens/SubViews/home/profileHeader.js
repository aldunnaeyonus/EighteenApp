import React from "react";
import { StyleSheet, View, Text } from "react-native";
import * as i18n from "../../../../i18n";
import FastImage from "react-native-fast-image";
import { createImageProgress } from "react-native-image-progress";
import { SCREEN_WIDTH } from "../../../utils/constants";
const Image = createImageProgress(FastImage);

const ProfileHeader = (props) => {
  return (
    <View style={style.container}>
      <View style={style.upperContainer}>
        <View style={style.leftContainer}>
          <View style={[style.containers, { width: 70 + 6, height: 70 + 6 }]}>
            <Image
              style={[
                style.image,
                { width: 70, height: 70, overflow: "hidden" },
              ]}
              resizeMode={FastImage.resizeMode.contain}
              source={{
                cache: FastImage.cacheControl.immutable,
                priority: FastImage.priority.high,
                uri: props.avatar,
              }}
            />
          </View>
          {props.isPro == "1" && (
            <View style={{ position: "absolute" }}>
              <View
                style={{
                  marginTop: 63,
                  marginLeft: 50,
                  backgroundColor: "transparent",
                  width: 22,
                  height: 22,
                  justifyContent: "center",
                }}
              >
                <FastImage
                  style={{
                    marginLeft: 4,
                    marginTop: 1,
                    width: 22,
                    height: 22,
                    textAlignVertical: "center",
                    textAlignVertical: "center",
                  }}
                  resizeMode={FastImage.resizeMode.contain}
                  source={require("../../../../assets/verified.png")}
                />
              </View>
            </View>
          )}
          <Text style={style.name}>
          {((props.name.toUpperCase()).length > 10) ? (((props.name.toUpperCase()).substring(0,7)) + '...') : props.name == null ? i18n.t("Profile Page") : props.name.toUpperCase()}
          </Text>
        </View>
        <View style={style.container1}>
          <View style={style.singleContainer}>
            <Text style={style.number}>{props.join}</Text>
            <Text style={style.text}>{i18n.t("Joined")}</Text>
          </View>

          <View style={style.singleContainer}>
            <Text style={style.number}>{props.create}</Text>
            <Text style={style.text}>{i18n.t("Created")}</Text>
          </View>

          <View style={style.singleContainer}>
            <Text style={style.number}>{props.upload}</Text>
            <Text style={style.text}>{i18n.t("Uploaded")}</Text>
          </View>
        </View>
      </View>
      <View style={style.container4}>
        <Text style={style.subHeaderTextStyle}>{props.motto}</Text>
      </View>
    </View>
  );
};

const style = StyleSheet.create({
  container4: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    justifyContent: "space-between",
  },
  container1: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 0,
    marginTop: 25,
  },
  subHeaderTextStyle: {
    fontSize: 15,
    color: "rgb(147, 147, 147)",
    textAlign: "center",
  },
  singleContainer: {
    alignItems: "center",
    paddingHorizontal: 15,
  },

  number: {
    color: "#3D4849",
    fontSize: 17,
    fontWeight: "700",
  },

  text: {
    color: "#3D4849",
  },
  containers: {
    margin: 8,
    borderWidth: 3,
    borderRadius: 42,
    borderColor: "#ea5504",
  },
  container: {
    backgroundColor: "white",
    padding: 10,
    flex: 1,
  },
  image: {
    borderWidth: 2,
    borderRadius: 40,
    borderColor: "white",
  },
  upperContainer: {
    flexDirection: "row",
    width: SCREEN_WIDTH,
  },

  leftContainer: {
    flexDirection: "column",
    alignItems: "center",
  },

  name: {
    fontSize: 15,
    fontWeight: "500",
    color: "#3D4849",
  },
});

export default ProfileHeader;
