import React, { useEffect, useState } from "react";
import { View, Text, Platform, StyleSheet, TouchableWithoutFeedback, TouchableOpacity, ScrollView} from "react-native";
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
      const [selected, setSelected] = useState(0);

  return (
          <SafeAreaView
            style={{
              backgroundColor: "transparent",
              height: SCREEN_HEIGHT,
              width: SCREEN_WIDTH,
            }}
            edges={["left", "right"]}
          >
    <ScrollView showsVerticalScrollIndicator={false} style={{backgroundColor: 'white', paddingTop:130,height: '100%',width: SCREEN_WIDTH}}>
      <View style={styles.header}>
        <Text style={styles.title}>{i18n.t("In App Extras")}</Text>
        <Text style={styles.subtitle}>{i18n.t("storeslogan")}</Text>
      </View>
      <View style={styles.form}>
        <View>
          {products.map((item, index) => {
            const isActive = selected === index;
            return (
              <TouchableWithoutFeedback
                key={index}
                onPress={() => setSelected(index)}>
                <View
                  style={[
                    styles.radio,
                    isActive
                      ? { borderColor: '#F82E08', backgroundColor: '#feeae6' }
                      : {},
                  ]}>
                  <FeatherIcon
                    color={isActive ? '#F82E08' : '#363636'}
                    name={isActive ? 'check-circle' : 'circle'}
                    size={24} />
                  <View style={styles.radioBody}>
                    <View>
                      <Text style={styles.radioLabel}>{item.title}</Text>
                      <Text style={styles.radioText}>{item.description}</Text>
                    </View>
                    <Text
                      style={[
                        styles.radioPrice,
                        isActive && styles.radioPriceActive,
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
              handleBuyProduct(products[selected].productId)
            }}>
            <View style={styles.btn}>
              <Text style={styles.btnText}>{i18n.t("Purchase")}</Text>
            </View>
          </TouchableOpacity>

        <View >
          <Text style={styles.formFooterText}>{i18n.t("In-app purchases")} </Text>
        </View>
      </View>
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
    </ScrollView>
          </SafeAreaView>

  );
};

const styles = StyleSheet.create({
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
    borderRadius: 24,
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
    marginLeft:-15,
    fontWeight: '600',
    color: '#1d1d1d',
  },
  radioPriceActive: {
    transform: [
      {
        scale: 1.2,
      },
    ],
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
    backgroundColor: '#F82E08',
    borderColor: '#F82E08',
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
});
export default withIAPContext(Products);
