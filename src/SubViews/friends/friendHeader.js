import React from "react";
import { StyleSheet, Dimensions, View, Text } from "react-native";
import DownArrow from 'react-native-vector-icons/Ionicons';
import { constants } from "../../utils";
import * as i18n from '../../../i18n';
import FastImage from "react-native-fast-image";
import { createImageProgress } from "react-native-image-progress";
const Image = createImageProgress(FastImage);

const FriendHeader = (props) => {
return (
    <View style={style.container}>
            <View style={style.upperContainer}>    
              <View style={style.leftContainer}>
              <View style={[style.containers, {width: 70 + 6, height: 70 + 6}]}>
                <Image
                  style={[style.image, {width: 70, height: 70, overflow:'hidden'}]}
                  source={{
                    uri:
                      props.avatar,
                  }}
                />
              </View>
              {props.isPro == "1" &&
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
                  source={require("../../../assets/verified.png")}
                />
              </View>
            </View>
}
                <Text style={style.name}>{ props.name == null
                            ? i18n.t("Friends")
                            : props.name.toUpperCase()}</Text>
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
            <View style={style.container3}>
      <Text style={style.text1}>{i18n.t("Active & Upcomming")}</Text>
      <DownArrow name="chevron-down-outline" size={15} color="black" />
    </View>
          </View>
)
}


const style = StyleSheet.create({
  container3: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 40,
    justifyContent: 'space-between',
  },
  container4: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    justifyContent: 'space-between',
  },
  text1: {
    fontSize: 17,
    color: '#3D4849',
    fontWeight: '600',
  },
  container1: {
    flexDirection: 'row',
    justifyContent:'space-between',
    marginHorizontal: 40,
    marginTop: 25,
  },

  singleContainer: {
    alignItems: 'center',
    paddingHorizontal: 15,
  },

  number: {
    color: '#3D4849',
    fontSize: 17,
    fontWeight: '700',
  },

  text: {
    color: '#3D4849',
  },
  containers: {
    margin: 8,
    borderWidth: 3,
    borderRadius: 42,
    borderColor: '#ea5504',
  },
  container: {
    backgroundColor: 'white',
    padding: 10,
    flex: 1,
  },
  image: {
    borderWidth: 2,
    borderRadius: 40,
    borderColor: 'white',
  },
  upperContainer: {
    flexDirection: 'row',
    width: Dimensions.get('window').width,
  },

  leftContainer: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  subHeaderTextStyle: {
    fontSize: 13,
    color: "rgb(147, 147, 147)",
    textAlign: "center",
  },
  name: {
    fontSize: 15,
    fontWeight: '500',
    color: '#3D4849',
  },
});

export default FriendHeader;
