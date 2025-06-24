import { View, Text, TextInput, Platform, Alert } from "react-native";
import { TouchableOpacity } from "react-native";
import React, { useState, useCallback } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import styles from "../../styles/index.style";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { axiosPull } from "../../utils/axiosPull";
import { ActivityIndicator } from "react-native-paper";
import * as i18n from "../../../i18n";
import * as RNLocalize from "react-native-localize";
import { getLocales } from "expo-localization";
import { SCREEN_WIDTH, constants } from "../../utils/constants";
import ProFooter from "../SubViews/store/ProFooter";
import * as AppleAuthentication from "expo-apple-authentication";
import { jwtDecode } from "jwt-decode";
import { Icon } from "react-native-elements";
import "core-js/stable/atob";
import NotifService from "../../../NotifService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { storage } from "../../context/components/Storage";
import {
  GoogleSignin,
  GoogleSigninButton,
} from "@react-native-google-signin/google-signin";

const Handle = (props) => {
  const [handleStatus, setHandleStatus] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [disable, setDisable] = useState(true);
  let deviceLanguage = getLocales()[0].languageCode;

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
    const execute = async () => {
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
    };
    execute();
  }, [email]);
  const openSubscriptions = async () => {};

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

  const login = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      const decodedToken = jwtDecode(credential.identityToken);
      const data = {
        email: decodedToken.email,
        device: Platform.OS,
        location: RNLocalize.getCountry(),
        tz: RNLocalize.getTimeZone(),
        locale: deviceLanguage,
      };
      const response = await axiosPull.postData(
        "/register/appleLogin.php",
        data
      );
      if (decodedToken.email_verified) {
        Alert.alert(
          i18n.t("Hidden Email"),
          i18n.t("HIddenEmail"),
          [
            {
              text: i18n.t("Continue"),
              onPress: () => {
                {
                  setTimeout(async () => {
                    storage.set("user.Data", JSON.stringify(response[0]));
                    await AsyncStorage.setItem("current", "0");
                    await AsyncStorage.setItem("logedIn", "1");
                    await AsyncStorage.setItem("user_id", response[0].user_id);
                    new NotifService();
                    props.navigation.navigate("Home");
                  }, 500);
                }
              },
              style: "default",
            },
          ],
          { cancelable: false }
        );
      }
    } catch (error) {
      console.log("Error decoding JWT:", error);
    }
  };

  const signInWithGoogle = async () => {
    try {
      await GoogleSignin.hasPlayServices(); //executes normally

      const userInfo = await GoogleSignin.signIn();
      const userEmail = userInfo.user.email;
      console.log(userEmail)
      
      const data = {
        email: userEmail,
        device: Platform.OS,
        location: RNLocalize.getCountry(),
        tz: RNLocalize.getTimeZone(),
        locale: deviceLanguage,
      };
      const response = await axiosPull.postData(
        "/register/appleLogin.php",
        data
      );
      if (response[0].errorResponse == "Member") {
      setTimeout(async () => {
        storage.set("user.Data", JSON.stringify(response[0]));
        await AsyncStorage.setItem("current", "0");
        await AsyncStorage.setItem("logedIn", "1");
        await AsyncStorage.setItem("user_id", response[0].user_id);
        new NotifService();
        props.navigation.navigate("Home");
      }, 500);
    }
      
    } catch (error) {
      console.log(error);
      console.error("Google Sign-In Error", error);
    }
  };

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
            <Icon
              type="material-community"
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
                fontWeight: "bold",
                color: "#fff",
              }}
            >
              {isLoading ? i18n.t("Loading") : i18n.t("Continue")}
            </Text>
          </TouchableOpacity>
          <Text style={[styles.smalltitleText, { marginTop: -5 }]}>
            {i18n.t("Log in easily")}
          </Text>
          <Text
            style={[
              styles.smalltitleText,
              { marginBottom: 40, marginBottom: 20, fontWeight: "bold" },
            ]}
          >
            {i18n.t("or")}
          </Text>
          {Platform.OS == "android" ? (
            <View
              style={{
                width: "auto",
                height: "auto",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <GoogleSigninButton
                label="Contimue with Google"
                size={GoogleSigninButton.Size.Wide}
                color={GoogleSigninButton.Color.Dark}
                onPress={async () => {
                  signInWithGoogle();
                }}
              />
            </View>
          ) : (
            <></>
          )}

          {Platform.OS == "ios" ? (
            <View
              style={{
                width: "auto",
                height: "auto",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AppleAuthentication.AppleAuthenticationButton
                buttonType={
                  AppleAuthentication.AppleAuthenticationButtonType.CONTINUE
                }
                buttonStyle={
                  AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
                }
                cornerRadius={5}
                style={{ width: 250, height: 50 }}
                onPress={login}
              />
            </View>
          ) : (
            <></>
          )}
          <Text
            style={[styles.smalltitleText, { marginTop: 25, marginBottom: 25 }]}
          >
            {i18n.t("agree")}
          </Text>
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
