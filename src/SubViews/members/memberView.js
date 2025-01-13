import React from "react";
import moment from "moment";
import FastImage from "react-native-fast-image";
import { createImageProgress } from "react-native-image-progress";
const Image = createImageProgress(FastImage);
import Progress from "react-native-progress";
import { View, Text, TouchableOpacity } from "react-native";
import styles from "../../styles/SliderEntry.style";
import { constants } from "../../utils";
import CameraLens from "../camera/cameraView";
import * as i18n from '../../../i18n';

const MemberListItem = (props) => {
  return (
    <View style={styles.slideInnerContaineMember}>
      <TouchableOpacity
              onPress={async () => {
                props.goToFriend(
                    props.item.item.user_id,
                );
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
           ri: props.item.item.user_avatar,
            priority: FastImage.priority.normal,
          }}
          resizeMode={FastImage.resizeMode.contain}
          style={{
            height: 80,
            width: 80,
            borderRadius: 40,
            borderWidth: 1,
            margin: 15,
            marginLeft: 30,
            backgroundColor: "#f2f2f2",
          }}
        />
         {props.item.item.friend_isPro == "1" &&
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
                  source={require("../../../assets/verified.png")}
                />
              </View>
            </View>
            }
        <View
          style={{
            flexDirection: "column",
            marginBottom: 0,
          }}
        >
          <Text
            style={{
              fontFamily: "HelveticaNeue-Bold",
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
            {i18n.t('Joined')}:{" "}
            {moment.unix(props.item.item.user_joined).format("LLL")}
          </Text>
        </View>
        <CameraLens
          credits={props.item.item.credits}
          tCredits={props.item.item.tCredits}
        />
      </View></TouchableOpacity>
    </View>
  );
};

export default MemberListItem;
