import React from "react";
import {
    StyleSheet,
    Dimensions,
    View,
    Text,
  } from "react-native";
  import { ListItem, Icon } from "@rneui/themed";
  import * as i18n from '../../../i18n';
  import FastImage from "react-native-fast-image";
  import { createImageProgress } from "react-native-image-progress";
  const Image = createImageProgress(FastImage);
  import moment from "moment";
  import 'moment/min/moment-with-locales'
  import { storage } from "../../context/components/Storage";
  import { useMMKVObject } from "react-native-mmkv";

const Abouts = () => {
  const [user] = useMMKVObject("user.Data", storage);

  return (
                 <View style={{ width: "100%", height:'100%', backgroundColor: "#fff" }}>
                   <View style={style.leftContainer}>
                          <View style={[style.containers, {width: 70 + 6, height: 70 + 6}]}>
                            <Image
                              style={[style.image, {width: 70, height: 70, overflow:'hidden'}]}
                              source={{
                                uri:
                                  user.user_avatar,
                              }}
                            />
                          </View>
                          {user.isPro == "1" &&
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
                            <Text style={style.name}>{user.user_handle}</Text>
                          </View>
                          <Text style={{
                            textAlign:'center', margin:30, fontSize:13, color:'grey'
                          }}>{i18n.t('TooKeep')}</Text>
                <ListItem
              containerStyle={{ paddingHorizontal: 50, paddingVertical:20 }}
              key="1"
            >
              <Icon
                type="material-community"
                name="map-marker-account-outline"
                size={30}
                color="#3D4849"
                containerStyle={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              />
              <ListItem.Content>
              <ListItem.Title>{i18n.t('Account Created from:')}</ListItem.Title>
              <ListItem.Subtitle>{user.country}</ListItem.Subtitle>
              </ListItem.Content>
              </ListItem>
              <ListItem
              containerStyle={{ paddingHorizontal: 50, paddingVertical:20 }}
              key="2"
            >
              <Icon
                type="fontisto"
                name="world-o"
                size={20}
                color="#3D4849"
                containerStyle={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              />
              <ListItem.Content>
              <ListItem.Title>{i18n.t('Account Time Zone:')}</ListItem.Title>
              <ListItem.Subtitle>{ user.privacy == "1" ? "Hidden" : user.tz}</ListItem.Subtitle>
              </ListItem.Content>
              </ListItem>
              <ListItem
              containerStyle={{ paddingHorizontal: 50, paddingVertical:20 }}
              key="3"
            >
              <Icon
                type="material-community"
                name="calendar-clock-outline"
                size={25}
                color="#3D4849"
                containerStyle={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              />
              <ListItem.Content>
              <ListItem.Title>{i18n.t('Account Created:')}</ListItem.Title>
              <ListItem.Subtitle>{moment.unix(parseInt(user.user_joined)).format('LLL')}</ListItem.Subtitle>
              </ListItem.Content>
              </ListItem>
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
      marginTop:30,
      alignItems: 'center',
    },
  
    name: {
      fontSize: 15,
      fontWeight: '500',
      color: '#3D4849',
    },
  });
export default Abouts
;
