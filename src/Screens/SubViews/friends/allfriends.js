import React from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import FastImage from "react-native-fast-image";
import { createImageProgress } from "react-native-image-progress";
const Image = createImageProgress(FastImage);
import Progress from "react-native-progress";
import { constants } from "../../../utils";
import { ListItem } from "@rneui/themed";

const AllFriendsListItem = (props) => {
  return (
    <>
      <TouchableOpacity
        onPress={async () => {
          props.goToFriend(props.item.item.friendID);
        }}
      >
        <View key={props.item.item.UUID} style={style.listItem}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              padding: 10,
            }}
          >
            <Image
              indicator={Progress}
              source={{
                uri: props.item.item.friend_avatar,
                priority: FastImage.priority.high,
                cache: FastImage.cacheControl.immutable,
              }}
              resizeMode={FastImage.resizeMode.contain}
              style={{
                height: 60,
                width: 60,
                borderRadius: 30,
                overflow: "hidden",
                backgroundColor: "#f2f2f2",
              }}
            />
          </View>
          {props.item.item.friend_isPro == "1" && (
            <View style={{ position: "absolute" }}>
              <View
                style={{
                  marginTop: 50,
                  marginLeft: 50,
                  backgroundColor: "transparent",
                  width: 20,
                  height: 20,
                  justifyContent: "center",
                }}
              >
                <FastImage
                  style={{
                    marginLeft: 4,
                    marginTop: 1,
                    width: 17,
                    height: 17,
                    textAlignVertical: "center",
                    textAlignVertical: "center",
                  }}
                  resizeMode={FastImage.resizeMode.contain}
                  source={require("../../../../assets/verified.png")}
                />
              </View>
            </View>
          )}
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "left",
              paddingLeft: 10,
            }}
          >
            <Text style={style.titleText}>{props.item.item.friend_handle}</Text>
          </View>
          <ListItem.Chevron style={{ marginRight: 10 }} />
        </View>
      </TouchableOpacity>
    </>
  );
};

const style = StyleSheet.create({
  titleText: {
    fontFamily: "HelveticaNeue-Bold",
    fontSize: 20,
    textAlign: "left",
    color: "#3D4849",
    fontWeight: "bold",
  },
  listItem: {
    backgroundColor: "#FFF",
    width: "100%",
    flex: 1,
    alignSelf: "center",
    flexDirection: "row",
  },
});

export default AllFriendsListItem;
