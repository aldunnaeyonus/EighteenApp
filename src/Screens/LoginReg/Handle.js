import { View, Text, TextInput, Platform } from "react-native";
import { TouchableOpacity } from "react-native";
import React, { useState, useEffect, useCallback } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import styles from "../../styles/index.style";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { axiosPull } from "../../utils/axiosPull";
import { useToast } from "react-native-styled-toast";
import { ActivityIndicator } from "react-native-paper";
import * as i18n from "../../../i18n";
import * as RNLocalize from "react-native-localize";
import { getLocales } from 'expo-localization';
import { SCREEN_WIDTH, constants } from "../../utils/constants";
import ProFooter from "../SubViews/store/ProFooter";
import * as AppleAuthentication from 'expo-apple-authentication';


const Handle = (props) => {
  const [handleStatus, setHandleStatus] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [disable, setDisable] = useState(true);
  const { toast } = useToast();
  let deviceLanguage = getLocales()[0].languageCode;
      
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

  const validate = (text) => {
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
    if (reg.test(text) === false) {
      setDisable(true);
      setEmail(text);
      return false;
    } else {
      setDisable(false);
      setEmail(text);
    }
  };

  const changeEmail = useCallback(
    (value) => {
      validate(value);
    },
    [email]
  );

  const checkHandle = useCallback(() => {
    const execute = async ()=>{
    setIsLoading(true);
    const data = {
      email: email,
      device: Platform.OS,
      location: RNLocalize.getCountry(),
      tz: RNLocalize.getTimeZone(),
      locale: deviceLanguage,
    };
    const response = await axiosPull.postData(
      "/register/checkUsername.php",
      data
    );
    switch (response[0].errorResponse) {
      case "Member":
        setTimeout(() => {
          setIsLoading(false);
          props.navigation.navigate("Verification", {
            email: email,
          });
        }, 500);
        break;
      default:
        setIsLoading(false);
        setHandleStatus(i18n.t("An issue exists"));
        break;
    }
  }
  execute();
  }, [email]);
  const openSubscriptions = async () => {

  };

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

  return (
    <KeyboardAwareScrollView style={{ backgroundColor: "#fff" }}>
      <SafeAreaProvider>
        <Text
          style={{
            marginTop: 150,
            marginLeft: 20,
            marginRight: 20,
            fontSize: 25,
            fontWeight: "600",
          }}
        >
          {i18n.t("Welcome!")}
        </Text>
        <View
          style={{
            width: SCREEN_WIDTH,
            alignItems: "center",
            paddingHorizontal: 10,
          }}
        >
          <View
            style={{
              width: 200,
              marginTop: 25,
              alignItems: "center",
              justifyContent: "center",
            }}
          ></View>
          <View
            style={{
              borderWidth: 2,
              height: 65,
              width: "95%",
              borderColor: "#3D4849",
              flexDirection: "row",
              borderRadius: 10,
              paddingHorizontal: 10,
              marginTop: 20,
              marginRight: 20,
              marginLeft: 20,
            }}
          >
            <MaterialCommunityIcons
              name="email-open-outline"
              size={30}
              color="#3D4849"
              style={{ marginRight: 5, marginTop: 18 }}
            />

            <TextInput
              clearButtonMode="while-editing"
              autoComplete={"email"}
              keyboardType="email-address"
              textContentType="emailAddress"
              placeholder="support@snapeighteen.com"
              enablesReturnKeyAutomatically
              autoCapitalize="none"
              value={email}
              onChangeText={changeEmail}
              style={{
                fontWeight: "bold",
                marginLeft: 5,
                width: "85%",
                marginRight: 50,
                color: "#3D4849",
                fontSize: 20,
                fontFamily: "HelveticaNeue-Bold",
              }}
            />
          </View>

          <Text style={styles.smalltitleTextError}>{handleStatus}</Text>

          <TouchableOpacity
            disabled={disable}
            style={{
              marginTop: 20,
              flexDirection: "row",
              width: 250,
              backgroundColor: "#e35504",
              borderRadius: 8,
              padding: 15,
              alignItems: "center",
              justifyContent: "center",
              borderColor: "#e35504",
              marginBottom: 20,
            }}
            onPress={() => { 
              checkHandle();

            }}
          >
            {isLoading && (
              <ActivityIndicator
                size="small"
                color="white"
                style={{ marginRight: 10 }}
              />
            )}
            <Text
              style={{
                textTransform: "uppercase",
                fontSize: 20,
                fontWeight: 'bold',
                color: "#fff",
              }}
            >
              {isLoading ? i18n.t("Loading") : i18n.t("Continue")}
            </Text>
          </TouchableOpacity>
{ Platform.OS == "ios" ?
            <Text style={styles.smalltitleText}>{i18n.t("or")}</Text>
       <AppleAuthentication.AppleAuthenticationButton
        buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
        buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
        cornerRadius={8}
        style={{ width: 250,  height: 44,}}
        onPress={async () => {
            try {
                const credential: AppleAuthenticationCredential = await AppleAuthentication.signInAsync({
                    requestedScopes: [
                        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                        AppleAuthentication.AppleAuthenticationScope.EMAIL,
                    ],
                });
                const cachedName: string = await Cache.getAppleLoginName(credential.user);
                const detailsArePopulated: boolean = (!!credential.fullName.givenName && !!credential.email);
                if (!detailsArePopulated && !cachedName) {
                   // await login(credential.identityToken);
                } else if (!detailsArePopulated && cachedName) {
                    //await createAccount(cachedName, credential.user, credential.identityToken);
                } else {
                    //await createAccount(
                        credential.fullName.givenName, credential.user, credential.identityToken,
                    );
                }
            } catch (error) {
                if (error.code === 'ERR_CANCELED') {
                    onError('Continue was cancelled.');
                } else {
                    onError(error.message);
                }
            }
        }}
      />
   : <></> }
          <Text style={styles.smalltitleText}>{i18n.t("Log in easily")}</Text>
          <Text style={[styles.smalltitleText,{marginTop:25, marginBottom:25}]}>{i18n.t("agree")}</Text>
          <ProFooter
              privacy={privacy}
              terms={terms}
              eula={eula}
              openSubscriptions={openSubscriptions}
            />
        </View>
      </SafeAreaProvider>
    </KeyboardAwareScrollView>
  );
};

export default Handle;
