import { TouchableOpacity } from "react-native";
import * as i18n from "../../../i18n";
import { constants } from "../../utils";
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
import ProHeader from "../../SubViews/store/ProHeader";
import { useFocusEffect } from "@react-navigation/native";
import { Icon } from "react-native-elements";
import ProFooter from "../../SubViews/store/ProFooter";
import ProMain from "../../SubViews/store/ProMain";
import { deepLinkToSubscriptions } from "react-native-iap";
import { isIos, isPlay } from "react-native-iap/src/internal";
export { isIos, isPlay };

const GetPro = (props) => {
  const [user] = useMMKVObject("user.Data", storage);
  const [ownedSubscriptions, setOwnedSubscriptions] = useState([]);
  const {
    connected,
    subscriptions,
    getSubscriptions,
    currentPurchase,
    finishTransaction,
  } = useIAP();
  const isFocused = useIsFocused();
  const AnimatedFlatlist = Animated.FlatList;

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
    }, [props])
  );

  const privacy = useCallback(async () => {
    props.navigation.navigate("WebView", {
      url: constants.url + "/privacyPolicy.html",
      name: i18n.t("Privacy Policy"),
    });
  });

  const terms = useCallback(async () => {
    props.navigation.navigate("WebView", {
      url: constants.url + "/termsUsePolicy.html",
      name: i18n.t("Terms & Use"),
    });
  });

  const openSubscriptions = async () => {
    try {
      await deepLinkToSubscriptions(
        constants.productSkusSubscriptions[0],
        false
      );
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
            receipt: currentPurchase?.transactionReceipt,
            transID: currentPurchase?.transactionId,
            transDate: currentPurchase?.transactionDate,
            token: currentPurchase?.purchaseToken,
            user: user.user_id,
            pin: "",
            currentPurchase: "9.99",
            sku: currentPurchase?.productId,
            cameras: "0",
            eventName: "Snap Eighteen Pro",
          };
          await axiosPull.postData("/store/index.php", data);
          await axiosPull._pullUser(user.user_id);
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
    </SafeAreaProvider>
  );
};
export default withIAPContext(GetPro);
