import { View, Text, TextInput, Platform, Alert, StyleSheet } from "react-native";
import { TouchableOpacity } from "react-native";
import React, { useState, useCallback, useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import styles from "../../styles/index.style"; // Assuming this contains common styles
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
  const deviceLanguage = getLocales()[0].languageCode;

  const validate = useCallback((text) => {
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
    if (reg.test(text) == false) {
      setDisable(true);
      setEmail(text);
      return false;
    } else {
      setDisable(false);
      setEmail(text);
      return true;
    }
  }, []);

  const changeEmail = useCallback(
    (value) => {
      validate(value);
    },
    [validate]
  );

  const checkHandle = useCallback(async () => {
    setIsLoading(true);
    setHandleStatus(""); // Clear previous status
    try {
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

      if (response && response[0]) {
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
      } else {
        setIsLoading(false);
        setHandleStatus(i18n.t("An unexpected error occurred."));
      }
    } catch (error) {
      console.error("Check handle error:", error);
      setIsLoading(false);
      setHandleStatus(i18n.t("An error occurred. Please try again."));
    }
  }, [email, deviceLanguage, props.navigation]);

  const openSubscriptions = useCallback(() => {
    // Implement subscription logic if needed
  }, []);

  const eula = useCallback(() => {
    props.navigation.navigate("WebView", {
      url: constants.url + "/EULA.html",
      name: "EULA",
    });
  }, [props.navigation]);

  const privacy = useCallback(() => {
    props.navigation.navigate("WebView", {
      url: constants.url + "/privacyPolicy.html",
      name: i18n.t("Privacy Policy"),
    });
  }, [props.navigation]);

  const terms = useCallback(() => {
    props.navigation.navigate("WebView", {
      url: constants.url + "/termsUsePolicy.html",
      name: i18n.t("Terms & Use"),
    });
  }, [props.navigation]);

  const login = useCallback(async () => {
    setIsLoading(true);
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
      const response = await axiosPull.postData("/register/appleLogin.php", data);

      if (decodedToken.email_verified) {
        Alert.alert(
          i18n.t("Hidden Email"),
          i18n.t("HIddenEmail"),
          [
            {
              text: i18n.t("Continue"),
              onPress: async () => {
                setTimeout(async () => {
                  storage.set("user.Data", JSON.stringify(response[0]));
                  await AsyncStorage.setItem("current", "0");
                  await AsyncStorage.setItem("logedIn", "1");
                  await AsyncStorage.setItem("user_id", response[0].user_id);
                  new NotifService();
                  setIsLoading(false);
                  props.navigation.navigate("Home");
                }, 500);
              },
              style: "default",
            },
          ],
          { cancelable: false }
        );
      }
    } catch (error) {
      console.error("Apple Sign-In Error:", error);
      setIsLoading(false);
      Alert.alert(i18n.t("Sign-in Failed"), i18n.t("Apple sign-in failed. Please try again."));
    } finally {
      setIsLoading(false);
    }
  }, [deviceLanguage, props.navigation]);

  const signInWithGoogle = useCallback(async () => {
    setIsLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const userEmail = userInfo.user.email; // Access email directly from userInfo.user

      const data = {
        email: userEmail,
        device: Platform.OS,
        location: RNLocalize.getCountry(),
        tz: RNLocalize.getTimeZone(),
        locale: deviceLanguage,
      };
      const response = await axiosPull.postData("/register/appleLogin.php", data);

      if (response && response[0]?.errorResponse == "Member") {
        setTimeout(async () => {
          storage.set("user.Data", JSON.stringify(response[0]));
          await AsyncStorage.setItem("current", "0");
          await AsyncStorage.setItem("logedIn", "1");
          await AsyncStorage.setItem("user_id", response[0].user_id);
          new NotifService();
          setIsLoading(false);
          props.navigation.navigate("Home");
        }, 500);
      } else {
        // Handle other response cases or errors from the server
        setIsLoading(false);
        Alert.alert(i18n.t("Sign-in Failed"), i18n.t("Google sign-in failed. Please try again."));
      }
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      setIsLoading(false);
      Alert.alert(i18n.t("Sign-in Failed"), i18n.t("Google sign-in failed. Please try again."));
      try {
        await GoogleSignin.signOut();
      } catch (signOutError) {
        console.error("Error signing out from Google:", signOutError);
      }
    } finally {
      setIsLoading(false);
    }
  }, [deviceLanguage, props.navigation]);

  return (
    <KeyboardAwareScrollView style={componentStyles.scrollView}>
      <SafeAreaProvider>
        <Text style={componentStyles.welcomeTitle}>{i18n.t("Welcome!")}</Text>
        <View style={componentStyles.container}>
          <View style={componentStyles.spacerView} />
          <View style={componentStyles.emailInputContainer}>
            <Icon
              type="material-community"
              name="email-open-outline"
              size={30}
              color="#3D4849"
              style={componentStyles.emailIcon}
            />
            <TextInput
              clearButtonMode="while-editing"
              autoComplete="email"
              keyboardType="email-address"
              textContentType="emailAddress"
              placeholder="support@snapeighteen.com"
              enablesReturnKeyAutomatically
              autoCapitalize="none"
              value={email}
              onChangeText={changeEmail}
              style={componentStyles.emailTextInput}
            />
          </View>
          <Text style={styles.smalltitleTextError}>{handleStatus}</Text>
          <TouchableOpacity
            disabled={disable || isLoading}
            style={componentStyles.continueButton}
            onPress={checkHandle}
          >
            {isLoading && (
              <ActivityIndicator
                size="small"
                color="white"
                style={componentStyles.activityIndicator}
              />
            )}
            <Text style={componentStyles.continueButtonText}>
              {isLoading ? i18n.t("Loading") : i18n.t("Continue")}
            </Text>
          </TouchableOpacity>
          <Text style={componentStyles.loginEasilyText}>
            {i18n.t("Log in easily")}
          </Text>
          <Text style={componentStyles.orText}>{i18n.t("or")}</Text>

          {Platform.OS == "android" && (
            <View style={componentStyles.socialButtonContainer}>
              <GoogleSigninButton
                size={GoogleSigninButton.Size.Wide}
                color={GoogleSigninButton.Color.Dark}
                onPress={signInWithGoogle}
                disabled={isLoading}
              />
            </View>
          )}

          {Platform.OS == "ios" && (
            <View style={componentStyles.socialButtonContainer}>
              <AppleAuthentication.AppleAuthenticationButton
                buttonType={
                  AppleAuthentication.AppleAuthenticationButtonType.CONTINUE
                }
                buttonStyle={
                  AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
                }
                cornerRadius={5}
                style={componentStyles.appleButton}
                onPress={login}
                disabled={isLoading}
              />
            </View>
          )}
          <Text style={componentStyles.agreeText}>{i18n.t("agree")}</Text>
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

const componentStyles = StyleSheet.create({
  scrollView: {
    backgroundColor: "#fff",
  },
  welcomeTitle: {
    marginTop: 150,
    marginLeft: 20,
    marginRight: 20,
    fontSize: 25,
    fontWeight: "600",
  },
  container: {
    width: SCREEN_WIDTH,
    alignItems: "center",
    paddingHorizontal: 10,
  },
  spacerView: {
    width: 200,
    marginTop: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  emailInputContainer: {
    borderWidth: 2,
    height: 65,
    width: "95%",
    borderColor: "#3D4849",
    flexDirection: "row",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginTop: 20,
    marginRight: 20, // These might be redundant if width is 95% and center aligned
    marginLeft: 20,
  },
  emailIcon: {
    marginRight: 5,
    marginTop: 18,
  },
  emailTextInput: {
    fontWeight: "bold",
    marginLeft: 5,
    width: "85%",
    marginRight: 50,
    color: "#3D4849",
    fontSize: 20,
    fontFamily: "HelveticaNeue-Bold",
  },
  continueButton: {
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
  },
  activityIndicator: {
    marginRight: 10,
  },
  continueButtonText: {
    textTransform: "uppercase",
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  loginEasilyText: {
    ...styles.smalltitleText, // Inherit from global styles
    marginTop: -5,
  },
  orText: {
    ...styles.smalltitleText, // Inherit from global styles
    marginBottom: 20,
    fontWeight: "bold",
  },
  socialButtonContainer: {
    width: "auto",
    height: "auto",
    alignItems: "center",
    justifyContent: "center",
  },
  appleButton: {
    width: 250,
    height: 50,
  },
  agreeText: {
    ...styles.smalltitleText, // Inherit from global styles
    marginTop: 25,
    marginBottom: 25,
  },
});

export default Handle;