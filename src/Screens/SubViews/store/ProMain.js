import React from "react";
import { Dimensions, View, Text, TouchableOpacity, Platform } from "react-native";
import FastImage from "react-native-fast-image";
const { width } = Dimensions.get("window");
import { Icon } from "react-native-elements";
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
      <View style={{ flex: 1 }}>
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            width: width,
            marginLeft: 25,
            marginRight: 25,
            marginBottom: 25,
            justifyContent: "center",
            alignContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              borderWidth: 1,
              borderColor: "lightgrey",
              borderRadius: 5,
              height: 30,
              width: width / 3,
              marginRight: 25,
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
              <Icon
                type="material"
                name={"settings-applications"}
                size={20}
                color="green"
              />
              <Text
                style={{
                  fontFamily: "HelveticaNeue-Light",
                  fontSize: 13,
                  fontWeight: 500,
                  textAlign: "center",
                }}
              >
                {" "}
                {i18n.t("More Controls")}
              </Text>
            </View>
          </View>
          <View
            style={{
              borderWidth: 1,
              borderColor: "lightgrey",
              borderRadius: 5,
              height: 30,
              width: width / 3,
              marginRight: 25,
              justifyContent: "center",
              alignContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignContent: "space-between",
                alignItems: "center",
              }}
            >
              <FastImage
                style={{
                  marginLeft: 4,
                  marginTop: 1,
                  width: 20,
                  height: 20,
                  textAlignVertical: "center",
                  textAlignVertical: "center",
                }}
                resizeMode={FastImage.resizeMode.contain}
                source={require("../../../../assets/verified.png")}
              />
              <Text
                style={{
                  fontFamily: "HelveticaNeue-Light",
                  fontSize: 13,
                  fontWeight: 500,
                  textAlign: "center",
                }}
              >
                {" "}
                {i18n.t("Verified Badge")}
              </Text>
            </View>
          </View>
        </View>
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            width: width,
            marginLeft: 25,
            marginRight: 25,
            marginBottom: 25,
            justifyContent: "center",
            alignContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              borderWidth: 1,
              borderColor: "lightgrey",
              borderRadius: 5,
              height: 30,
              width: width / 3,
              marginRight: 25,
              justifyContent: "center",
              alignContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignContent: "space-between",
                alignItems: "center",
              }}
            >
              <Icon
                type="material"
                name={"edit-note"}
                size={20}
                color="purple"
              />
              <Text
                style={{
                  fontFamily: "HelveticaNeue-Light",
                  fontSize: 13,
                  fontWeight: 500,
                  textAlign: "center",
                }}
              >
                {" "}
                {i18n.t("Edit Controls")}
              </Text>
            </View>
          </View>
          <View
            style={{
              borderWidth: 1,
              borderColor: "lightgrey",
              borderRadius: 5,
              height: 30,
              width: width / 3,
              marginRight: 25,
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
              <Icon
                type="material-community"
                name={"chip"}
                size={20}
                color="blue"
              />
              <Text
                style={{
                  fontFamily: "HelveticaNeue-Light",
                  fontSize: 13,
                  fontWeight: 500,
                  textAlign: "center",
                }}
              >
                {" "}
                {i18n.t("AI Descriptive Text")}
              </Text>
            </View>
          </View>
        </View>
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            width: width,
            marginLeft: 25,
            marginRight: 25,
            marginBottom: 25,
            justifyContent: "center",
            alignContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              borderWidth: 1,
              borderColor: "lightgrey",
              borderRadius: 5,
              height: 30,
              width: width / 3,
              marginRight: 25,
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
              <Icon
                type="font-awesome-5"
                name={"camera-retro"}
                size={20}
                color="#e35504"
              />
              <Text
                style={{
                  fontFamily: "HelveticaNeue-Light",
                  fontSize: 13,
                  fontWeight: 500,
                  textAlign: "center",
                }}
              >
                {" "}
                {i18n.t("More Cameras")}
              </Text>
            </View>
          </View>
          <View
            style={{
              borderWidth: 1,
              borderColor: "lightgrey",
              borderRadius: 5,
              height: 30,
              width: width / 3,
              marginRight: 25,
              justifyContent: "center",
              alignContent: "space-between",
              alignItems: "center",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignContent: "space-between",
                alignItems: "center",
              }}
            >
              <Icon type="material" name={"image"} size={20} color="green" />
              <Text
                style={{
                  fontFamily: "HelveticaNeue-Light",
                  fontSize: 13,
                  fontWeight: 500,
                  textAlign: "center",
                }}
              >
                {" "}
                {i18n.t("Gallery Controls")}
              </Text>
            </View>
          </View>
        </View>
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            width: width,
            marginLeft: 25,
            marginRight: 25,
            marginBottom: 25,
            justifyContent: "center",
            alignContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              borderWidth: 1,
              borderColor: "lightgrey",
              borderRadius: 5,
              height: 30,
              width: width / 2,
              marginRight: 25,
              justifyContent: "center",
              alignContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignContent: "space-between",
                alignItems: "center",
              }}
            >
              <Icon type="material" name={"more"} size={20} color="grey" />
              <Text
                style={{
                  fontFamily: "HelveticaNeue-Light",
                  fontSize: 13,
                  fontWeight: 500,
                  textAlign: "center",
                }}
              >
                {" "}
                {i18n.t("Much More")}
              </Text>
            </View>
          </View>
        </View>
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
              }}
            >
              {Platform.OS == "ios" ? props.item.item.localizedPrice : props.item.item.subscriptionOfferDetails[1].pricingPhases.pricingPhaseList[0].formattedPrice}{" "}
            </Text>
            <Text
              style={{
                fontFamily: "HelveticaNeue",
                fontSize: 17,
                fontWeight: "500",
                textAlign: "center",
              }}
            >
              {i18n.t("monthly")}
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
