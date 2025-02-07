import React from "react";
import { View, Text, TouchableOpacity, Platform, Image, Linking } from "react-native";
import * as i18n from "../../../../i18n";
import { ListItem } from "@rneui/themed";
import { Icon } from "react-native-elements";
import { SCREEN_WIDTH } from "../../../utils/constants";


const ProMain = (props) => {
  const Owned = props.owned.find((item) => item === props.item.item.productId);
  const isOwned = Owned === props.item.item.productId;

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
      <Text style={{ fontFamily: 'HelveticaNeue-Medium', textAlign: "center", color:'grey' }}> {Platform.OS == "ios" ? props.item.item.localizedPrice : props.item.item.subscriptionOfferDetails[1].pricingPhases.pricingPhaseList[0].formattedPrice} {i18n.t("monthly")} - {" "}
              <Text
                style={{
                  fontFamily: 'HelveticaNeue-Medium',
                  color: "#ea5504",
                  fontWeight: "600",
                }}
                onPress={() => {
                  if (Platform.OS == "ios") {
                    Linking.openURL('https://apps.apple.com/account/subscriptions');
                  }else  if (Platform.OS == "android") {
                  Linking.openURL('https://play.google.com/store/account/subscriptions');
                  }
                }}
              >
                {i18n.t("Cancel anytime")}
              </Text>
            </Text>
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

     {!isOwned ? (
        <>

          <TouchableOpacity
            style={{
              width: '90%',
              backgroundColor: "#e35504",
              borderRadius: 12,
              padding: 10,
              margin: 20,
              alignItems: "center",
              justifyContent: "center",
            }}
            onPress={() => {
              Platform.OS == "ios" ? props.handleBuySubscription(props.item.item.productId) : props.handleBuySubscription(props.item.item.productId,props.item.item.subscriptionOfferDetails[1].offerToken );
            }}
          >
            <Text
              style={{
                textTransform: "uppercase",
                fontSize: 17,
                fontFamily: "HelveticaNeue-Light",
                fontWeight: 600,
                color: "#fff",
              }}
            >
              {i18n.t("subscribe")}
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text
          style={{
            
            fontFamily: "HelveticaNeue",
            fontSize: 22,
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
        {i18n.t("Subscribed")}
        </Text>
      )}
    </View>
  );
};

export default ProMain;
