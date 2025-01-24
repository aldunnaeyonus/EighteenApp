import React from "react";
import { Dimensions, View, Text, TouchableOpacity, Platform, Image } from "react-native";
const { width } = Dimensions.get("window");
import * as i18n from "../../../../i18n";

const ProMain = (props) => {
  const Owned = props.owned.find((item) => item === props.item.item.productId);
  const isOwned = Owned === props.item.item.productId;

  return (
    <View
      style={{
        width: width,
        marginTop: 30,
        justifyContent: "center",
        alignContent: "center",
        alignItems: "center",
      }}
    >
       <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignContent: "center",
              alignItems: "center",
            }}
          >
       <Image
                    style={{
                      width: 450,
                      height: 250,
                    }}
                    resizeMode="contain"
                    source={require('../../../../assets/compare.png')}
                  />
      </View>
      {!isOwned ? (
        <>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontFamily: "HelveticaNeue",
                fontSize: 22,
                fontWeight: "bold",
                textAlign: "center",
                marginTop:30
              }}
            >
              {Platform.OS == "ios" ? props.item.item.localizedPrice : props.item.item.subscriptionOfferDetails[1].pricingPhases.pricingPhaseList[0].formattedPrice}{"\n"}{i18n.t("monthly")}
            </Text>
          </View>
          <TouchableOpacity
            style={{
              flexDirection: "row",
              marginTop: 20,
              width: 300,
              backgroundColor: "#e35504",
              borderRadius: 12,
              padding: 10,
              marginBottom: 20,
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
          Subscribed
        </Text>
      )}
    </View>
  );
};

export default ProMain;
