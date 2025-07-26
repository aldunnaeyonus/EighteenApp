import React, { useEffect, useState, useCallback, useMemo } from "react";
import { View, Text, Platform, StyleSheet, TouchableWithoutFeedback, TouchableOpacity, ScrollView, Alert} from "react-native";
import { ActivityIndicator, MD2Colors } from "react-native-paper";
import {
  isIosStorekit2,
  PurchaseError,
  requestPurchase,
  useIAP,
  withIAPContext,
} from "react-native-iap";
import { constants, errorLog, SCREEN_WIDTH, SCREEN_HEIGHT} from "../../utils/constants";
import { axiosPull } from "../../utils/axiosPull";
import { useToast } from "react-native-styled-toast";
import * as i18n from "../../../i18n";
import FeatherIcon from 'react-native-vector-icons/Feather';
import { Icon } from "react-native-elements";
import { SafeAreaView } from "react-native-safe-area-context";

const Products = (props) => {
  const {
    connected,
    products,
    currentPurchase,
    finishTransaction,
    getProducts,
  } = useIAP();
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [selected, setSelected] = useState(0);

  useEffect(() => {    
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
  }, [props.navigation]); // Depend on props.navigation

  const handleGetProducts = useCallback(async () => {
    try {
      await getProducts({
        skus:
          props.route.params.type == "owner" // Use strict equality
            ? constants.productSkus
            : constants.productSkusUser,
      });
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      // errorLog({ message: "handleGetProducts", error }); // Assuming errorLog is a custom utility
      toast({ message: i18n.t("Failed to load products.") });
      setIsLoading(false); // Ensure loading is stopped even on error
    }
  }, [getProducts, props.route.params.type, toast]); // Add getProducts and props.route.params.type to dependencies

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

  // Effect to handle purchases after they are made
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
              currentPurchase: currentPurchase?.localizedPrice,
              sku: String(currentPurchase?.productId),
              eventName: props.route.params.eventName,
            };
            await axiosPull.postData("/store/index.php", data);
            await axiosPull._pullCameraFeed(
              props.route.params.owner,
              props.route.params.type
            );
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
  }, [currentPurchase, finishTransaction, connected, props.route.params, toast]); // Add currentPurchase and relevant props to dependencies

  // Effect to fetch products on component mount/focus
  useEffect(() => {
    handleGetProducts();
  }, [handleGetProducts]); // Depend on handleGetProducts callback

  return (
    <SafeAreaView
      style={componentStyles.safeArea}
      edges={["left", "right"]}
    >
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        nestedScrollEnabled={true} 
        style={componentStyles.scrollViewContent}
      >
        <View style={componentStyles.header}>
          <Text style={componentStyles.title}>{i18n.t("In App Extras")}</Text>
          <Text style={componentStyles.subtitle}>{i18n.t("storeslogan")}</Text>
        </View>
        <View style={componentStyles.form}>
          <View>
            {products.map((item, index) => {
              const isActive = selected == index;
              return (
                <TouchableWithoutFeedback
                  key={item.productId} // Use a unique ID for the key
                  onPress={() => setSelected(index)}>
                  <View
                    style={[
                      componentStyles.radio,
                      isActive
                        ? { borderColor: '#F82E08', backgroundColor: '#feeae6' }
                        : {},
                    ]}>
                    <FeatherIcon
                      color={isActive ? '#F82E08' : '#363636'}
                      name={isActive ? 'check-circle' : 'circle'}
                      size={24} />
                    <View style={componentStyles.radioBody}>
                      <View>
                        <Text style={componentStyles.radioLabel}>{item.title}</Text>
                        <Text style={componentStyles.radioText}>{item.description}</Text>
                      </View>
                      <Text
                        style={[
                          componentStyles.radioPrice,
                          isActive && componentStyles.radioPriceActive,
                        ]}>
                        {item.localizedPrice}
                      </Text>
                    </View>
                  </View>
                </TouchableWithoutFeedback>
              );
            })}
          </View>
          <TouchableOpacity
              onPress={() => {
                // Ensure products[selected] exists before calling handleBuyProduct
                if (products.length > selected) {
                  handleBuyProduct(products[selected].productId);
                } else {
                  Alert.alert(i18n.t("Error"), i18n.t("No product selected or available."));
                }
              }}
              disabled={isLoading || products.length == 0} // Disable if loading or no products
          >
              <View style={componentStyles.btn}>
                <Text style={componentStyles.btnText}>{isLoading ? i18n.t("Loading") : i18n.t("Purchase")}</Text>
              </View>
            </TouchableOpacity>

          <View >
            <Text style={componentStyles.formFooterText}>{i18n.t("In-app purchases")} </Text>
          </View>
        </View>
        <ActivityIndicator
          size={80}
          style={componentStyles.activityIndicator}
          animating={isLoading}
          hidesWhenStopped={true}
          color={MD2Colors.orange900}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const componentStyles = StyleSheet.create({
  safeArea: {
    backgroundColor: "transparent",
    height: SCREEN_HEIGHT,
    width: SCREEN_WIDTH,
  },
  scrollViewContent: {
    backgroundColor: 'white',
    paddingTop: 130,
    height: '100%',
    width: SCREEN_WIDTH,
    flex: 1
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#181818',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    color: '#889797',
  },
  /** Header */
  header: {
    paddingHorizontal: 24,
    marginBottom: 28,
  },
  headerAction: {
    width: 40,
    height: 40,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffdada',
    marginBottom: 16,
  },
  /** Form */
  form: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    paddingBottom: 24,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  formFooterText: {
    marginTop: 12,
    marginBottom:125,
    fontSize: 14,
    fontWeight: '500',
    color: '#929292',
    textAlign: 'center',
  },
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
    color: '#889797',
  },
  radioPrice: {
    fontSize: 16,
    marginLeft:-35,
    fontWeight: '600',
    color: '#1d1d1d',
  },
  radioPriceActive: {
  },
  /** Button */
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderWidth: 1,
    backgroundColor: 'rgba(234, 85, 4, 1)"',
    borderColor: 'rgba(234, 85, 4, 1)"',
  },
  btnText: {
    fontSize: 20,
    lineHeight: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  btnEmpty: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderWidth: 1.5,
    backgroundColor: 'transparent',
    borderColor: '#F82E08',
    marginTop: 12,
  },
  btnEmptyText: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: 'bold',
    color: '#F82E08',
  },
  activityIndicator: {
    position: "absolute",
    top:SCREEN_HEIGHT / 3.5,
    left: SCREEN_WIDTH / 2 - 40,
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
export default withIAPContext(Products);