import React, { useEffect, useState } from "react";
import { View, Text, Platform, TouchableOpacity } from "react-native";
import Animated from "react-native-reanimated";
import { ActivityIndicator, MD2Colors } from "react-native-paper";
import StoreListItem from "../SubViews/store/storeList";
import {
  isIosStorekit2,
  PurchaseError,
  requestPurchase,
  useIAP,
  withIAPContext,
} from "react-native-iap";
import { constants, errorLog, SCREEN_WIDTH, SCREEN_HEIGHT } from "../../utils/constants";
import { axiosPull } from "../../utils/axiosPull";
import { useToast } from "react-native-styled-toast";
import * as i18n from "../../../i18n";

const Products = (props) => {
  const {
    connected,
    products,
    currentPurchase,
    finishTransaction,
    getProducts,
  } = useIAP();
  const [isLoading, setIsLoading] = useState(true);
  const AnimatedFlatlist = Animated.FlatList;
  const { toast } = useToast();

  useEffect(() => {
    if (!props.unsubscribe) {
      toast({
        message: i18n.t("No internet connection"),
        toastStyles: {
          bg: "#3D4849",
          borderRadius: 5,
        },
        duration: 5000,
        color: "white",
        iconColor: "white",
        iconFamily: "Entypo",
        iconName: "info-with-circle",
        closeButtonStyles: {
          px: 4,
          bg: "translucent",
        },
        closeIconColor: "white",
        hideAccent: true,
      });
    }
  }, [props.unsubscribe]);

  const handleGetProducts = async () => {
    try {
      await getProducts({
        skus:
          props.route.params.type == "owner"
            ? constants.productSkus
            : constants.productSkusUser,
      });
      setIsLoading(false);
    } catch (error) {
      errorLog({ message: "handleGetProducts", error });
    }
  };

  const handleBuyProduct = async (sku) => {
    try {
      if (Platform.OS === "ios") {
        await requestPurchase({ sku });
      } else if (Platform.OS === "android") {
        await requestPurchase({ skus: [sku] });
      }
    } catch (error) {
      if (error instanceof PurchaseError) {
        errorLog({ message: `[${error.code}]: ${error.message}`, error });
      } else {
        errorLog({ message: "handleBuyProduct", error });
      }
    }
  };

  useEffect(() => {
    handleGetProducts();
    const checkCurrentPurchase = async () => {
      try {
        if (
          (isIosStorekit2() && currentPurchase?.transactionId) ||
          currentPurchase?.transactionReceipt
        ) {
          await finishTransaction({
            purchase: currentPurchase,
            isConsumable: true,
          });
          const data = {
            owner: props.route.params.owner,
            receipt: String(currentPurchase?.transactionReceipt),
            transID: String(currentPurchase?.transactionId),
            transDate: String(currentPurchase?.transactionDate),
            token: String(currentPurchase?.purchaseToken),
            user: props.route.params.user,
            pin: props.route.params.pin,
            currentPurchase: "",
            sku: String(currentPurchase?.productId),
            eventName: props.route.params.eventName,
          };
          await axiosPull.postData("/store/index.php", data);
          await axiosPull._pullCameraFeed(
            props.route.params.owner,
            props.route.params.type
          );
        }
      } catch (error) {
        if (error instanceof PurchaseError) {
          errorLog({ message: `[${error.code}]: ${error.message}`, error });
        } else {
          errorLog({ message: "handleBuyProduct", error });
        }
      }
    };

    checkCurrentPurchase();
  }, [currentPurchase, finishTransaction, connected]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "white",
      }}
    >
      <AnimatedFlatlist
        showsHorizontalScrollIndicator={false}
        ListHeaderComponent={
      <View style={{paddingHorizontal: 24, marginBottom: 28 }}>
        <Text style={{
              fontSize: 34,
              fontWeight: 'bold',
              color: '#181818',
              marginBottom: 12,
              }}>In App Extras</Text>

        <Text style={{
              fontSize: 15,
              lineHeight: 20,
              fontWeight: '500',
              color: '#889797',
              }}> Boost your events member interactions with these in app extras!
        </Text>
      </View>
        }
        ListFooterComponent={
          <View
            style={{
              marginTop: 15,
              justifyContent: "center",
              width: SCREEN_WIDTH,
              padding: 20,
            }}
          >
            <Text
              style={{
                color: "grey",
                fontSize: 13,
                textAlign: "center",
              }}
            >
              {i18n.t("In-app purchases")}
              {`\n`}
            </Text>
          </View>
        }
        style={{ background: "white" }}
        showsVerticalScrollIndicatorr={false}
        data={products}
        numColumns={1}
        extraData={products}
        scrollEventThrottle={16}
        keyExtractor={(item) => item.productId}
        renderItem={(item, index) => (
          <StoreListItem
            item={item}
            index={index}
            cameras={props.route.params.cameras}
            handleBuyProduct={handleBuyProduct}
          />
        )}
      />
      <ActivityIndicator
        size={80}
        style={{
          position: "absolute",
          top:SCREEN_HEIGHT / 3.5,
          left: SCREEN_WIDTH / 2 - 40,
        }}
        animating={isLoading}
        hidesWhenStopped={true}
        color={MD2Colors.orange900}
      />
    </View>
  );
};

export default withIAPContext(Products);
