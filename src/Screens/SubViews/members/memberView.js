import React from "react";
import moment from "moment";
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

const MemberListItem = (props) => {
  const [user] = useMMKVObject("user.Data", storage);

  return (
    <View style={styles.slideInnerContaineMember}>
      <TouchableOpacity
        onPress={async () => {
          props.goToFriend(props.item.item.user_id);
        }}
      >
        <View style={styles.shadow2} />
        <View
          style={{
            alignItems: "center",
            flexDirection: "row",
          }}
        >
          <Image
            indicator={Progress}
            source={{
              uri: props.item.item.user_avatar,
              priority: FastImage.priority.high,
              cache: FastImage.cacheControl.immutable,
            }}
            resizeMode={FastImage.resizeMode.contain}
            style={{
              overflow:'hidden',
              height: 60,
              width: 60,
              borderRadius: 40,
              borderWidth: 1,
              margin: 15,
              marginLeft: 10,
              backgroundColor: "#f2f2f2",
            }}
          />
          
          {props.item.item.isPro == "1" && (
            <View style={{ position: "absolute" }}>
              <View
                style={{
                  marginTop: 50,
                  marginLeft: 55,
                  backgroundColor: "transparent",
                  width: 50,
                  height: 50,
                  justifyContent: "center",
                }}
              >
                <FastImage
                  style={{
                    marginLeft: -5,
                    marginTop: -5,
                    width: 20,
                    height: 20,
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
              flexDirection: "column",
              marginBottom: 0,
            }}
          >
            <Text
              style={{
                fontFamily: "HelveticaNeue",
                fontWeight:'bold',
                fontSize: 20,
                color: "#3D4849",
                textAlign: "left",
              }}
              numberOfLines={1}
            >
              {props.item.item.user_handle.toUpperCase()}
            </Text>
            <Text
              style={{
                fontFamily: "HelveticaNeue",
                fontSize: 15,
                marginTop: 5,
                color: "grey",
                textAlign: "left",
              }}
              numberOfLines={1}
            >
              {i18n.t("Joined")}:{" "}
              {moment.unix(parseInt(props.item.item.user_joined)).format("LLL")}
            </Text>
            
          </View>
          <TouchableOpacity
             onPress={async () => {
              ((user.isPro == "1" && props.item.item.credits == 0) ? props.moreCredits(props.item.item.user_id, props.pin, props.UUID) : null)
              }}
              >
          <CameraLens
            credits={props.item.item.credits}
            tCredits={props.item.item.tCredits}
          />
                  </TouchableOpacity>

        </View>
        
        </TouchableOpacity>


    </View>
  );
};

export default MemberListItem;
         
