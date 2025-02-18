import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import FastImage from "react-native-fast-image";
import { createImageProgress } from "react-native-image-progress";
import Progress from "react-native-progress";
const Image = createImageProgress(FastImage);
import * as i18n from "../../../../i18n";
import { storage } from "../../../context/components/Storage";
import { useMMKVObject } from "react-native-mmkv";
import { SCREEN_WIDTH } from "../../../utils/constants";

const FriendHeader = (props) => {
    const [friendData] = useMMKVObject("user.Friend.Feed", storage);
    const [user] = useMMKVObject("user.Data", storage);

  return (
    <>
      <View
        style={{
          width: '95%' ,
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
        style={{ height: 100, marginBottom:15, width:SCREEN_WIDTH }}
        horizontal
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicatorr={false}
      >
         <View
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
          <View style={{borderWidth: 3, borderRadius: 38, borderBottomColor: "rgba(116, 198, 190, 1)", borderTopColor: "#ea5504", borderRightColor: 'rgba(250, 190, 0, 1)', width: 76, height: 76, alignContent: "center", alignItems: "center", justifyContent:'center'}}>
            <Image
              indicator={Progress}
              style={{      
                borderWidth: 2,
                borderRadius: 35,
                borderColor: "white", width: 70, height: 70, overflow: "hidden"
                }}
              source={{
                cache: FastImage.cacheControl.immutable,
                priority: FastImage.priority.high,
                uri: user.user_avatar,
              }}
            />
            
          </View>
          {user.isPro == "1" && (
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
                    marginLeft: 5,
                    marginTop: -17,
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
                    
            <Text
              ellipsizeMode="tail"
              numberOfLines={1}
              style={{
                alignItems: "center",
                justifyContent: "space-around",
                textAlign: "center",
                width: 100,
                marginTop: 2,
                fontWeight: "500",
                fontSize: 13,
              }}
            >
              {i18n.t("AddCamera")}
            </Text>
          </View>

           
        {friendData.map((grids) => (


          <View
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
          <View style={{borderWidth: 3, borderRadius: 38, borderColor: "#ea5504", width: 76, height: 76, alignContent: "center", alignItems: "center", justifyContent:'center'}}>
            <Image
              indicator={Progress}
              style={{      
                borderWidth: 2,
                borderRadius: 35,
                borderColor: "white", width: 70, height: 70, overflow: "hidden"
                }}
              source={{
                cache: FastImage.cacheControl.immutable,
                priority: FastImage.priority.high,
                uri: grids.friend_avatar,
              }}
            />
            
          </View>
          {grids.friend_events > 0 ? (
                <View style={{ position: "absolute" }}>
                  <View
                    style={{
                      marginTop: -5,
                      marginLeft: 55,
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
                        fontSize: 14,
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
                    marginLeft: 5,
                    marginTop: -17,
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
                    
            <Text
              ellipsizeMode="tail"
              numberOfLines={1}
              style={{
                alignItems: "center",
                justifyContent: "space-around",
                textAlign: "center",
                width: 100,
                marginTop: 2,
                fontWeight: "400",
                fontSize: 13,
              }}
            >
                {grids.friend_handle}
                </Text>
          </View>

        ))}
      </ScrollView>
    </>
  );
};

export default FriendHeader;
