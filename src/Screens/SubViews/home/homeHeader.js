import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import FastImage from "react-native-fast-image";
import { createImageProgress } from "react-native-image-progress";
import Progress from "react-native-progress";
const Image = createImageProgress(FastImage);
import * as i18n from "../../../../i18n";
import { storage } from "../../../context/components/Storage";
import { useMMKVObject } from "react-native-mmkv";

const FriendHeader = (props) => {
    const [friendData] = useMMKVObject("user.Friend.Feed", storage);
    const [user] = useMMKVObject("user.Data", storage);
  

  return (
    <>
      <View
        style={{
          width: "95%",
          height: 25,
          flexDirection: "row",
          justifyContent: "space-between",
          alignContent: "center",
          margin: 10,
          marginBottom: 10,
        }}
      >
        <Text
          style={{
            fontSize: 17,
            paddingTop: 5,
            fontWeight: "500",
          }}
        >
          {" "}
          {i18n.t("Friends")}
        </Text>
        <TouchableOpacity onPress={() => props._gotoAllFriends()}>
          <Text
            style={{
              fontSize: 15,
              fontWeight: "300",
            }}
          >
            {i18n.t("ViewAll")}
          </Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        style={{ height: 100 }}
        horizontal
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicatorr={false}
      >
        <View
          key={"A0"}
          style={{
            padding: 7,
            width: 100,
            alignContent: "space-between",
            alignItems: "center",
          }}
        >
          <TouchableOpacity
            onPress={() => props._createCamera(user.user_id)}
          >
            <Image
              indicator={Progress}
              key={user.user_avatar}
              style={{
                height: 70,
                width: 70,
                marginLeft: 14,
                marginRight: 16,
                borderRadius: 35,
                backgroundColor: "#f2f2f2",
                overflow: "hidden",
                borderWidth: 1,
                backgroundColor: "white",
              }}
              resizeMode={FastImage.resizeMode.contain}
              source={{
                priority: FastImage.priority.high,
                cache: FastImage.cacheControl.immutable,
                uri: user.user_avatar,
              }}
            />
            <Text
              ellipsizeMode="tail"
              numberOfLines={1}
              style={{
                alignItems: "center",
                justifyContent: "space-around",
                textAlign: "center",
                width: 100,
                marginTop: 2,
                fontWeight: "300",
                fontSize: 13,
              }}
            >
              {i18n.t("AddCamera")}
            </Text>
            {user.isPro == "1" && (
              <View style={{ position: "absolute" }}>
                <View
                  style={{
                    marginTop: 50,
                    marginLeft: 60,
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
          </TouchableOpacity>
        </View>

        {friendData.map((grids) => (
          <View
            key={"b" + grids.UUID}
            style={{
              padding: 7,
              width: 100,
              alignContent: "space-between",
              alignItems: "center",
            }}
          >
            <TouchableOpacity
              onPress={async () => {
                props.goToFriend(grids.friendID);
              }}
            >
              <Image
                key={"bb" + grids.UUID}
                ref={(friends) => friends + parseInt(grids.friendID)}
                indicator={Progress}
                style={{
                  height: 70,
                  width: 70,
                  marginLeft: 14,
                  marginRight: 16,
                  borderRadius: 35,
                  borderColor: "black",
                  backgroundColor: "#f2f2f2",
                  overflow: "hidden",
                  borderWidth: 1,
                }}
                resizeMode={FastImage.resizeMode.contain}
                source={{
                  cache: FastImage.cacheControl.immutable,
                  priority: FastImage.priority.high,
                  uri: grids.friend_avatar,
                }}
              />
              <Text
                ellipsizeMode="tail"
                numberOfLines={1}
                style={{
                  alignItems: "center",
                  justifyContent: "space-around",
                  textAlign: "center",
                  width: 100,
                  marginTop: 2,
                  fontSize: 13,
                  textTransform: "lowercase",
                }}
              >
                {grids.friend_handle}
              </Text>
              {grids.friend_events > 0 ? (
                <View style={{ position: "absolute" }}>
                  <View
                    style={{
                      marginTop: -5,
                      marginLeft: 65,
                      backgroundColor: "#ea5504",
                      width: 22,
                      height: 22,
                      borderRadius: 11,
                      borderWidth: 1,
                      borderColor: "#ea5504",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: "#fff",
                        textAlignVertical: "center",
                        textAlign: "center",
                        fontSize: 13,
                        fontWeight: "bold",
                      }}
                    >
                      {grids.friend_events > 9 ? "+9" : grids.friend_events}
                    </Text>
                  </View>
                </View>
              ) : (
                <></>
              )}
              {grids.friend_isPro == "1" && (
                <View style={{ position: "absolute" }}>
                  <View
                    style={{
                      marginTop: 50,
                      marginLeft: 60,
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
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </>
  );
};

export default FriendHeader;
