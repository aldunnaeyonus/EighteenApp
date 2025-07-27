import React from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import FastImage from "react-native-fast-image";
import { createImageProgress } from "react-native-image-progress";
const Image = createImageProgress(FastImage);
import Progress from "react-native-progress";
import { ListItem } from "@rneui/themed";
import { SCREEN_WIDTH } from "../../../utils/constants";

const AllFriendsListItem = (props) => {
  return (
    <>
      <TouchableOpacity
        onPress={async () => {
          props.goToFriend(props.item.friendID);
        }}
      >
        <View key={props.item.UUID} style={style.listItem}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              padding: 10,
            }}
          >
             <View
                                              style={{
                                                borderWidth: 1.5,
                                                borderRadius: 17,
                                                borderBottomColor:
                                                  props.item.friend_isPro == "1"
                                                    ? "rgba(116, 198, 190, 1)"
                                                    : "#ea5504",
                                                borderTopColor: props.item.isPro == "1" ? "#ea5504" : "#ea5504",
                                                borderRightColor:
                                                  props.item.friend_isPro == "1" ? "rgba(250, 190, 0, 1)" : "#ea5504",
                                                borderLeftColor:
                                                  props.item.friend_isPro == "1" ? "#3D4849" : "#ea5504",
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
                uri: props.item.friend_avatar,
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
          </View>

          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "left",
              paddingLeft: 5,
            }}
          >
            <Text style={style.titleText}>
              {props.item.friend_handle.toLowerCase()}
            </Text>
          </View>
          <ListItem.Chevron style={{ marginRight: 10 }} />
        </View>
      </TouchableOpacity>
    </>
  );
};

const style = StyleSheet.create({
  titleText: {
    fontSize: 15,
    textAlign: "left",
    color: "#3D4849",
    fontWeight: "500",
  },
  listItem: {
    backgroundColor: "#FFF",
    width: SCREEN_WIDTH,
    flex: 1,
    alignSelf: "center",
    flexDirection: "row",
  },
});

export default AllFriendsListItem;
