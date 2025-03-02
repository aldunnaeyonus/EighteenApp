import React, { useState  } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import * as i18n from "../../../../i18n";
import { ListItem } from "@rneui/themed";
import { Icon } from "react-native-elements";
import { SCREEN_WIDTH } from "../../../utils/constants";
import FeatherIcon from 'react-native-vector-icons/Feather';
import { useMMKVObject } from "react-native-mmkv";
import { storage } from "../../../context/components/Storage";
import moment from "moment/min/moment-with-locales";
import { getLocales } from "expo-localization";


const ProMain = (props) => {
  const [user] = useMMKVObject("user.Data", storage);
  let [localLang] = useState(getLocales()[0].languageCode);

  return (
    <View
      style={{
        width: SCREEN_WIDTH,
        marginTop: 30,

      }}
    >

       <View
            style={{
              justifyContent: "center",
              alignContent: "center",
              alignItems: "center",
            }}
          >
        <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={() => {
              user.isPro != "1" ? props.handleBuyProduct(props.item.item.productId) : null;
            }}
          >
            <View
                              style={[
                                styles.radio,
                                  { borderColor: '#F82E08', backgroundColor: '#feeae6', width:'80%' }
                              ]}>
                              <FeatherIcon
                                color={'#F82E08'}
                                name={user.isPro == "1" ? 'check-circle' : 'circle'}
                                size={24} />
                              <View style={styles.radioBody}>
                                <View>
                                  <Text style={styles.radioLabel}>{props.item.item.title}</Text>
                                   <Text style={styles.radioText}>{user.isPro == "1" ? i18n.t("Expires") + " "+moment.unix(user.proExire).locale(localLang).format("LLL") : i18n.t("Monthly")}</Text>
                                </View>
                                <Text
                                  style={[
                                    styles.radioPrice,
                                    styles.radioPriceActive,
                                  ]}>
                                 {props.item.item.localizedPrice}
                                </Text>
                              </View>
                            </View>
                            </TouchableOpacity>
      </View>
      <View
            
          >
      <Text style={{  textAlign: "left", color:'black', fontSize:17, marginTop:20, marginLeft:10, marginBottom:10, fontWeight:'bold' }}>{i18n.t("Pro1")}</Text>

                <ListItem>
                <Image
                  style={{
                    width: 25,
                    height: 25,
                  }}
                  source={require("../../../../assets/verified.png")}
                />
                <ListItem.Content>
                  <ListItem.Title style={{fontFamily: 'HelveticaNeue-Medium',fontSize: 18,color: '#000', marginBottom:10}}>{i18n.t("Pro2")}</ListItem.Title>
                  <ListItem.Subtitle>{i18n.t("Pro3")}</ListItem.Subtitle>
                </ListItem.Content>
              </ListItem>
      
              <ListItem>
                <Icon
                  type="material-community"
                  name="chip"
                  size={25}
                  color="#3D4849"
                  containerStyle={{
                    width: 28,
                    height: 28,
                  }}
                />
                <ListItem.Content>
                  <ListItem.Title style={{fontFamily: 'HelveticaNeue-Medium',fontSize: 18,color: '#000', marginBottom:10}}>{i18n.t("Pro4")}</ListItem.Title>
                  <ListItem.Subtitle>{i18n.t("Pro5")}</ListItem.Subtitle>
                </ListItem.Content>
              </ListItem>
              <ListItem>
                <Icon
                  type="material"
                  name="edit"
                  size={25}
                  color="#3D4849"
                  containerStyle={{
                    width: 28,
                    height: 28,
                  }}
                />
                <ListItem.Content>
                  <ListItem.Title style={{fontFamily: 'HelveticaNeue-Medium',fontSize: 18,color: '#000', marginBottom:10}}>{i18n.t("Pro6")}</ListItem.Title>
                  <ListItem.Subtitle>{i18n.t("Pro7")}</ListItem.Subtitle>
                </ListItem.Content>
              </ListItem>
              <ListItem>
                <Icon
                  type="material"
                  name="display-settings"
                  size={25}
                  color="#3D4849"
                  containerStyle={{
                    width: 28,
                    height: 28,
                  }}
                />
                <ListItem.Content>
                  <ListItem.Title style={{fontFamily: 'HelveticaNeue-Medium',fontSize: 18,color: '#000', marginBottom:10}}>{i18n.t("Pro8")}</ListItem.Title>
                  <ListItem.Subtitle>{i18n.t("Pro9")}</ListItem.Subtitle>
                </ListItem.Content>
              </ListItem>
              <ListItem>
                <Icon
                  type="material-community"
                  name="download-box-outline"
                  size={25}
                  color="#3D4849"
                  containerStyle={{
                    width: 28,
                    height: 28,
                  }}
                />
                <ListItem.Content>
                  <ListItem.Title style={{fontFamily: 'HelveticaNeue-Medium',fontSize: 18,color: '#000', marginBottom:10}}>{i18n.t("Pro10")}</ListItem.Title>
                  <ListItem.Subtitle>{i18n.t("Pro11")}</ListItem.Subtitle>
                </ListItem.Content>
              </ListItem>
              <ListItem>
                <Icon
                  type="material"
                  name="history"
                  size={25}
                  color="#3D4849"
                  containerStyle={{
                    width: 28,
                    height: 28,
                  }}
                />
                <ListItem.Content>
                  <ListItem.Title style={{fontFamily: 'HelveticaNeue-Medium',fontSize: 18,color: '#000', marginBottom:10}}>{i18n.t("Pro12")}</ListItem.Title>
                  <ListItem.Subtitle>{i18n.t("Pro13")}</ListItem.Subtitle>
                </ListItem.Content>
              </ListItem>
              <ListItem>
                <Icon
                  type="material"
                  name="generating-tokens"
                  size={25}
                  color="#3D4849"
                  containerStyle={{
                    width: 28,
                    height: 28,
                  }}
                />
                <ListItem.Content>
                  <ListItem.Title style={{fontFamily: 'HelveticaNeue-Medium',fontSize: 18,color: '#000', marginBottom:10}}>{i18n.t("Pro14")}</ListItem.Title>
                  <ListItem.Subtitle>{i18n.t("Pro15")}</ListItem.Subtitle>
                </ListItem.Content>
              </ListItem>
              <ListItem>
                <Icon
                  type="material-community"
                  name="view-gallery-outline"
                  size={25}
                  color="#3D4849"
                  containerStyle={{
                    width: 28,
                    height: 28,
                  }}
                />
                <ListItem.Content>
                  <ListItem.Title style={{fontFamily: 'HelveticaNeue-Medium',fontSize: 18,color: '#000', marginBottom:10}}>{i18n.t("Pro17")}</ListItem.Title>
                  <ListItem.Subtitle>{i18n.t("Pro18")}</ListItem.Subtitle>
                </ListItem.Content>
              </ListItem>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  /** Radio */
  radio: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    borderWidth: 2,
    borderColor: 'transparent',
    borderStyle: 'solid',
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  radioBody: {
    paddingLeft: 10,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  radioLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1d1d1d',
  },
  radioText: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  radioPrice: {
    fontSize: 16,
    marginLeft:-35,
    fontWeight: '600',
    color: '#1d1d1d',
  },
  radioPriceActive: {
  },

});
export default ProMain;
