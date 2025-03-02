import { TouchableOpacity } from "react-native";
import * as i18n from "../../../i18n";
import { constants, SCREEN_WIDTH, SCREEN_HEIGHT} from "../../utils/constants";
import { storage } from "../../context/components/Storage";
import { useMMKVObject } from "react-native-mmkv";
import {
  isIosStorekit2,
  PurchaseError,
  requestPurchase,
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
import { isIos, isPlay } from "react-native-iap/src/internal";
export { isIos, isPlay };
import { axiosPull } from "../../utils/axiosPull";
import { useToast } from "react-native-styled-toast";
import { ActivityIndicator, MD2Colors } from "react-native-paper";

const GetPro = (props) => {
  const [user] = useMMKVObject("user.Data", storage);
  const { toast } = useToast();
  const {
    connected,
    products,
    currentPurchase,
    finishTransaction,
    getProducts,
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
                height: 44,
                backgroundColor: "rgba(0, 0, 0, 0.60)",
                borderRadius: 22,
              }}
            />
          </TouchableOpacity>
        ),
      });
    }, [props.unsubscribe])
  );

  const eula = useCallback(() => {
    props.navigation.navigate("WebView", {
      url: constants.url + "/EULA.html",
      name: "EULA",
    });
  });

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

  const handleGetProducts = async () => {
    try {
      await getProducts({
        skus: constants.productSkusPro,
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
            owner: user.user_id,
            receipt: String(currentPurchase?.transactionReceipt),
            transID: String(currentPurchase.transactionId),
            transDate: String(currentPurchase.transactionDate),
            token: String(currentPurchase.purchaseToken),
            user: user.user_id,
            pin: String(currentPurchase.purchaseToken),
            currentPurchase: currentPurchase?.localizedPrice,
            sku: String(currentPurchase?.productId),
            eventName: "Snap Eighteen Pro",
          };
          await axiosPull.postData("/store/index.php", data);
          await axiosPull._pullUser(user.user_id, "GetPro");
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


  useEffect(() => {
    handleGetProducts();
  }, [isFocused]);

  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={{
          backgroundColor: "transparent",
          height: '100%',
          width: SCREEN_WIDTH,
          marginBottom: 20
        }}
        edges={["left", "right"]}
      >
        <AnimatedFlatlist
          extraData={products}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicatorr={false}
          scrollEventThrottle={16}
          ListHeaderComponent={<ProHeader />}
          ListFooterComponent={
            <ProFooter
              privacy={privacy}
              terms={terms}
              eula={eula}
            />
          }
          style={{ backgroundColor: "white", marginTop: -3 }}
          numColumns={1}
          data={products}
          renderItem={(item) => (
            <ProMain
              item={item}
              handleBuyProduct={handleBuyProduct}
              products={products}
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
          top: SCREEN_HEIGHT / 2.0,
          left: SCREEN_WIDTH / 2 - 50,
        }}
        animating={isLoading}
        color={MD2Colors.orange900}
      />
    </SafeAreaProvider>
  );
};
export default withIAPContext(GetPro);
