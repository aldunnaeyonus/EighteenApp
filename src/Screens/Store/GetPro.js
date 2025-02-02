import { TouchableOpacity, Dimensions } from "react-native";
import * as i18n from "../../../i18n";
import { constants } from "../../utils/constants";
import { storage } from "../../context/components/Storage";
import { useMMKVObject } from "react-native-mmkv";
import {
  PurchaseError,
  requestSubscription,
  useIAP,
  withIAPContext,
} from "react-native-iap";
import React, { useEffect, useState, useCallback } from "react";
import { useIsFocused } from "@react-navigation/native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import Animated from "react-native-reanimated";
import ProHeader from "../SubViews/store/ProHeader";
import { useFocusEffect } from "@react-navigation/native";
import { Icon } from "react-native-elements";
import ProFooter from "../SubViews/store/ProFooter";
import ProMain from "../SubViews/store/ProMain";
import { deepLinkToSubscriptions } from "react-native-iap";
import { isIos, isPlay } from "react-native-iap/src/internal";
export { isIos, isPlay };
import { axiosPull } from "../../utils/axiosPull";
import { useToast } from "react-native-styled-toast";
import { ActivityIndicator, MD2Colors } from "react-native-paper";

const GetPro = (props) => {
  const [user] = useMMKVObject("user.Data", storage);
  const [ownedSubscriptions, setOwnedSubscriptions] = useState([]);
  const { toast } = useToast();

  const {
    connected,
    subscriptions,
    getSubscriptions,
    currentPurchase,
    finishTransaction,
  } = useIAP();

  const isFocused = useIsFocused();
  const AnimatedFlatlist = Animated.FlatList;
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
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
      props.navigation.setOptions({
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => {
              props.navigation.goBack();
            }}
          >
            <Icon
              type="material"
              size={30}
              name="arrow-back-ios-new"
              color="#fff"
              containerStyle={{
                padding: 7,
                height: "100%",
                backgroundColor: "rgba(0, 0, 0, 0.60)",
                borderRadius: 22,
              }}
            />
          </TouchableOpacity>
        ),
      });
    }, [props.unsubscribe])
  );

  const privacy = useCallback(() => {
    props.navigation.navigate("WebView", {
      url: constants.url + "/privacyPolicy.html",
      name: i18n.t("Privacy Policy"),
    });
  });

  const terms = useCallback(() => {
    props.navigation.navigate("WebView", {
      url: constants.url + "/termsUsePolicy.html",
      name: i18n.t("Terms & Use"),
    });
  });

  const openSubscriptions = async () => {
    try {
      await deepLinkToSubscriptions(constants.productSkusSubscriptions, true);
    } catch (error) {
      console.log("Error opening subscription management:", error);
    }
  };

  const handleGetSubscriptions = async () => {
    try {
      await getSubscriptions({ skus: constants.productSkusSubscriptions });
    } catch (error) {
      errorLog({ message: "handleGetSubscriptions", error });
    }
    setIsLoading(false);
  };

  const handleBuySubscription = async (productId, offerToken) => {
    if (isPlay && !offerToken) {
      console.warn(
        `There are no subscription Offers for selected product (Only requiered for Google Play purchases): ${productId}`
      );
    }
    try {
      await requestSubscription({
        sku: productId,
        ...(offerToken && {
          subscriptionOffers: [{ sku: productId, offerToken }],
        }),
      });
    } catch (error) {
      if (error instanceof PurchaseError) {
        errorLog({ message: `[${error.code}]: ${error.message}`, error });
      } else {
        errorLog({ message: "handleBuySubscription", error });
      }
    }
  };

  useEffect(() => {
    const checkCurrentPurchase = async () => {
      try {
        if (currentPurchase?.productId) {
          await finishTransaction({
            purchase: currentPurchase,
            isConsumable: true,
          });
          const data = {
            owner: user.user_id,
            receipt: String(currentPurchase?.transactionReceipt),
            transID: String(currentPurchase.transactionId),
            transDate: String(currentPurchase.transactionDate),
            token: String(currentPurchase.purchaseToken),
            user: user.user_id,
            pin: String(currentPurchase.purchaseToken),
            currentPurchase: "9.99",
            sku: String(currentPurchase?.productId),
            eventName: "Snap Eighteen Pro",
          };
          await axiosPull.postData("/store/index.php", data);
          await axiosPull._pullUser(user.user_id, "GetPro");
          setOwnedSubscriptions((prev) => [
            ...prev,
            currentPurchase?.productId,
          ]);
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
  }, [currentPurchase, finishTransaction, connected, isFocused]);

  useEffect(() => {
    handleGetSubscriptions();
  }, [isFocused]);

  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={{
          backgroundColor: "transparent",
          height: "100%",
          width: "100%",
        }}
        edges={["left", "right"]}
      >
        <AnimatedFlatlist
          extraData={subscriptions}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicatorr={false}
          scrollEventThrottle={16}
          ListHeaderComponent={<ProHeader />}
          ListFooterComponent={
            <ProFooter
              privacy={privacy}
              terms={terms}
              openSubscriptions={openSubscriptions}
            />
          }
          style={{ backgroundColor: "white", marginTop: -3 }}
          numColumns={1}
          data={subscriptions}
          renderItem={(item) => (
            <ProMain
              item={item}
              handleBuySubscription={handleBuySubscription}
              owned={ownedSubscriptions}
              isPlay={isPlay}
              isIos={isIos}
            />
          )}
        />
      </SafeAreaView>
      <ActivityIndicator
        size={80}
        style={{
          position: "absolute",
          top: Dimensions.get("window").height / 2.0,
          left: Dimensions.get("window").width / 2 - 50,
        }}
        animating={isLoading}
        color={MD2Colors.orange900}
      />
    </SafeAreaProvider>
  );
};
export default withIAPContext(GetPro);
