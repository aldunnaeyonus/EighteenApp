import { TouchableOpacity, StyleSheet, View } from "react-native";
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
import React, { useEffect, useState, useCallback, useMemo } from "react";
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
  // Memoize AnimatedFlatlist to prevent recreation on every render
  const AnimatedFlatlist = useMemo(() => Animated.FlatList, []);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {      
      props.navigation.setOptions({
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => {
              props.navigation.goBack();
            }}
            style={componentStyles.backButtonTouchable}
          >
            <Icon
              type="material"
              size={25}
              name="arrow-back-ios-new"
              color="#fff"
              containerStyle={componentStyles.backButtonContainer}
            />
          </TouchableOpacity>
        ),
      });
    }, [props.navigation]) // Only navigation is a dependency here
  );

  const eula = useCallback(() => {
    props.navigation.navigate("WebView", {
      url: constants.url + "/EULA.html",
      name: "EULA",
    });
  }, [props.navigation]); // Add props.navigation to dependencies

  const privacy = useCallback(() => {
    props.navigation.navigate("WebView", {
      url: constants.url + "/privacyPolicy.html",
      name: i18n.t("Privacy Policy"),
    });
  }, [props.navigation]); // Add props.navigation to dependencies

  const terms = useCallback(() => {
    props.navigation.navigate("WebView", {
      url: constants.url + "/termsUsePolicy.html",
      name: i18n.t("Terms & Use"),
    });
  }, [props.navigation]); // Add props.navigation to dependencies

  const handleGetProducts = useCallback(async () => {
    try {
      await getProducts({
        skus: constants.productSkusPro,
      });
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error); // Use console.error for errors
      // errorLog({ message: "handleGetProducts", error }); // Assuming errorLog is a custom utility
      toast({ message: i18n.t("Failed to load products.") }); // Provide user feedback
      setIsLoading(false); // Ensure loading is stopped even on error
    }
  }, [getProducts, toast]); // Add getProducts and toast to dependencies

  const handleBuyProduct = useCallback(async (sku) => {
    try {
      if (Platform.OS == "ios") {
        await requestPurchase({ sku });
      } else if (Platform.OS == "android") {
        await requestPurchase({ skus: [sku] });
      }
    } catch (error) {
      if (error instanceof PurchaseError) {
        console.error(`[${error.code}]: ${error.message}`);
        toast({ message: `[${error.code}]: ${error.message}` });
      } else {
        console.error("Error buying product:", error);
        // errorLog({ message: "handleBuyProduct", error });
        toast({ message: i18n.t("Failed to complete purchase.") });
      }
    }
  }, [requestPurchase, toast]); // Add requestPurchase and toast to dependencies

  // Effect to handle current purchases
  useEffect(() => {
    const checkAndFinishPurchase = async () => {
      try {
        if (connected && currentPurchase) {
          if (
            (isIosStorekit2() && currentPurchase?.transactionId) ||
            currentPurchase?.transactionReceipt
          ) {
            await finishTransaction({
              purchase: currentPurchase,
              isConsumable: true, // Assuming these are consumable products
            });
            const data = {
              owner: user?.user_id, // Use optional chaining
              receipt: String(currentPurchase?.transactionReceipt),
              transID: String(currentPurchase.transactionId),
              transDate: String(currentPurchase.transactionDate),
              token: String(currentPurchase.purchaseToken),
              user: user?.user_id, // Use optional chaining
              pin: String(currentPurchase.purchaseToken), // Is this correct? `pin` usually is a different type of ID.
              currentPurchase: currentPurchase?.localizedPrice,
              sku: String(currentPurchase?.productId),
              eventName: "Snap Eighteen Pro",
            };
            await axiosPull.postData("/store/index.php", data);
            await axiosPull._pullUser(user?.user_id, "GetPro"); // Use optional chaining
            toast({ message: i18n.t("Purchase successful!") }); // User feedback
          }
        }
      } catch (error) {
        if (error instanceof PurchaseError) {
          console.error(`[${error.code}]: ${error.message}`);
          toast({ message: `[${error.code}]: ${error.message}` });
        } else {
          console.error("Error finishing transaction:", error);
          toast({ message: i18n.t("Failed to finalize purchase.") });
        }
      }
    };

    checkAndFinishPurchase();
  }, [currentPurchase, finishTransaction, connected, user?.user_id, toast]); // Add user?.user_id and toast to dependencies

  // Effect to get products when screen is focused
  useEffect(() => {
    if (isFocused) {
      handleGetProducts();
    }
  }, [isFocused, handleGetProducts]); // Add handleGetProducts to dependencies

  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={componentStyles.safeArea}
        edges={["left", "right"]}
      >
        <AnimatedFlatlist
          extraData={products}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
          scrollEventThrottle={16}
          ListHeaderComponent={<ProHeader />}
          ListFooterComponent={
            <ProFooter
              privacy={privacy}
              terms={terms}
              eula={eula}
            />
          }
          style={componentStyles.flatList}
          numColumns={1}
          data={products}
          keyExtractor={(item) => item.productId} // Use productId as key
          renderItem={({ item }) => ( // Correctly destructure item
            <ProMain
              item={item}
              handleBuyProduct={handleBuyProduct}
              products={products} // This prop might be redundant if item is passed
              isPlay={isPlay}
              isIos={isIos}
            />
          )}
        />
      </SafeAreaView>
      <ActivityIndicator
        size={80}
        style={componentStyles.activityIndicator}
        animating={isLoading}
        color={MD2Colors.orange900}
      />
    </SafeAreaProvider>
  );
};

const componentStyles = StyleSheet.create({
  safeArea: {
    backgroundColor: "transparent",
    height: '100%',
    width: SCREEN_WIDTH,
    marginBottom: 20
  },
  flatList: {
    backgroundColor: "white",
    marginTop: -3,
    flex: 1
  },
  activityIndicator: {
    position: "absolute",
    top: SCREEN_HEIGHT / 2.0,
    left: SCREEN_WIDTH / 2 - 50,
  },
  backButtonTouchable: {
    // Add styles if needed for the TouchableOpacity itself
  },
  backButtonContainer: {
    padding: 7,
    height: 40,
    backgroundColor: "rgba(0, 0, 0, 0.60)",
    borderRadius: 20,
  },
});

export default withIAPContext(GetPro);