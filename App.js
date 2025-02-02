import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { Text, LogBox, Platform } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";
import Handle from "./src/Screens/LoginReg/Handle";
import Verification from "./src/Screens/LoginReg/Verification";
import Begin from "./src/Screens/LoginReg";
import Home from "./src/Screens/Home";
import CreateCamera from "./src/Screens/Cameras/CreateCamera";
import EditCamera from "./src/Screens/Cameras/EditCamera";
import Join from "./src/Screens/Home/Join";
import Friends from "./src/Screens/Friends/Friends";
import AllFriends from "./src/Screens/Friends/AllFriends";
import { MenuProvider } from "react-native-popup-menu";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AlertProvider } from "./src/context/alerts/AuthContext";
import MediaGallery from "./src/Screens/Cameras/PhotoGallery";
import MediaViewer from "./src/Screens/Cameras/PhotoViewer";
import Profile from "./src/Screens/Profile";
import ChangeAvatar from "./src/Screens/Profile/ChangeAvatar";
import WebView from "./src/Screens/WebView/WebView";
import ClosedCameras from "./src/Screens/Cameras/ClosedCameras";
import AccountDetails from "./src/Screens/Profile/AccountDetails";
import Purchase from "./src/Screens/Store";
import { setup } from "react-native-iap";
import NetInfo from "@react-native-community/netinfo";
import JoinedMembers from "./src/Screens/Members";
import VisionCamera from "./src/Screens/VisionCamera";
import MediaPage from "./src/Screens/VisionCamera/MediaPage";
import FastImage from "react-native-fast-image";
import * as i18n from "./i18n";
import { setI18nConfig } from "./i18n";
import AboutProfile from "./src/Screens/Friends/AboutProfile";
import Languages from "./src/Screens/Profile/Languages";
import Notifications from "./src/Screens/Profile/Notifications";
import Abouts from "./src/Screens/Profile/About";
import GetPro from "./src/Screens/Store/GetPro";
import { axiosPull } from "./src/utils/axiosPull";
import hotUpdate  from 'react-native-ota-hot-update/src/index';
import { constants } from "./src/utils/constants";
import ReactNativeBlobUtil from 'react-native-blob-util';
import NotifService from "./NotifService";
import TempCamera from "./src/Screens/Cameras/TempCamera";
import { getLocales } from 'expo-localization';
import { StyleSheet } from "react-native";

export default function App() {
  const Stack = createNativeStackNavigator();
  setup({ storekitMode: "STOREKIT2_MODE" });
  const [isConnected, setIsConnected] = useState(true);
  Text.defaultProps = Text.defaultProps || {};
  Text.defaultProps.allowFontScaling = false;
  LogBox.ignoreAllLogs(true);
  const [signIn, setSignIn] = useState(false);
  const [ready, setReady] = useState(false);
  const [owner, setOwner] = useState("0");
  let [localLang] = useState(getLocales()[0].languageCode)
  
  const startUpdate = async (url, urlversion) => {
    await hotUpdate.downloadBundleUri(ReactNativeBlobUtil, url, urlversion, {
      updateSuccess: () => {
        console.log('update success!');
      },
      updateFail(message) {
        console.log(message);
      },
      restartAfterInstall: false,
    });
  };

const onCheckVersion = () => {
    fetch(constants.updateJSON).then(async (data) => {
      const result = await data.json();
      const currentVersion = await hotUpdate.getCurrentVersion();
      if (parseInt(result?.version) > parseInt(currentVersion)) {
                startUpdate(
                  Platform.OS === 'ios'
                    ? result?.downloadIosUrl
                    : result?.downloadAndroidUrl,
                  result?.version
                );
        };
    });
  };

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isInternetReachable && state.isConnected) {
        setIsConnected(true);
      } else {
        setIsConnected(false);
      }
    });
    if (isConnected) {
      unsubscribe();
    }
  }, [isConnected]);

  const config = {
    screens: {
      Begin: {
        path: "begin",
      },
      Home: {
        path: "home",
      },
      Friends: {
        path: "friends/:userID/:type",
        parse: {
          userID: (userID) => `${userID}`,
          type: (type) => `${type}`
        },
      },
      Join: {
        path: "join/:pin/:time/:owner",
        parse: {
          pin: (pin) => `${pin}`,
          time: (time) => `${time}`,
          owner: (owner) => `${owner}`,
        },
      },
      Profile: {
        path: "settings",
      },
    },
  };
  const linking = {
    prefixes: ["snapseighteenapp://"],
    config,
  };

  const stringToBoolean = (stringValue) => {
    switch (stringValue?.toLowerCase()?.trim()) {
      case "true":
      case "yes":
      case "1":
        return true;

      case "false":
      case "no":
      case "0":
      case null:
      case undefined:
        return false;

      default:
        return JSON.parse(stringValue);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      new NotifService();
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setI18nConfig(localLang, constants.url);
      if (Platform.OS == 'ios'){
      onCheckVersion();
      }
      const owner = await AsyncStorage.getItem("user_id");
      setOwner(owner);
      const logedIn = await AsyncStorage.getItem("logedIn");
      setSignIn(stringToBoolean(logedIn));
      if (signIn) {
        await axiosPull._getProStatus(owner, Platform.OS);
      }
      setTimeout(() => {
        setReady(true);
      }, 2000);
    };
    fetchData();
  }, [signIn, ready, owner]);


  if (!ready) {
    return (
      <FastImage
      style={[StyleSheet.absoluteFill]}
      resizeMode={FastImage.resizeMode.contain}
      source={require("./assets/splash.png")}
    />
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AlertProvider>
        <NavigationContainer
          linking={linking}
          fallback={
            <FastImage
              style={{
                flex: 1,
              }}
              resizeMode={FastImage.resizeMode.contain}
              source={require("./assets/splash.png")}
            />
          }
        >
          <MenuProvider>
            <StatusBar style="auto" />
            <Stack.Navigator
              initialRouteName={signIn ? "Home" : "Begin"}
              options={{ animationEnabled: false, animation: "none" }}
            >
                <Stack.Screen
                name="TempCameraPage"
                options={{
                  gestureEnabled: false,
                  title: "",
                  headerShown: false,
                }}
              >
                {(props) => (
                  <TempCamera
                    {...props}
                    UUID={owner}
                    loggedIn={signIn}
                    unsubscribe={isConnected}
                  />
                )}
              </Stack.Screen>

              <Stack.Screen
                name="Begin"
                options={{
                  gestureEnabled: false,
                  title: "",
                  headerShown: false,
                }}
              >
                {(props) => (
                  <Begin
                    {...props}
                    UUID={owner}
                    loggedIn={signIn}
                    unsubscribe={isConnected}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen
                name="Friends"
                options={{
                  title: "",
                  headerShown: true,
                  gestureEnabled: false,
                  headerTintColor: "#000",
                  headerBackTitleVisible: false,
                }}
              >
                {(props) => <Friends {...props} unsubscribe={isConnected} />}
              </Stack.Screen>
              <Stack.Screen
                name="Handle"
                options={{
                  gestureEnabled: false,
                  title: "",
                  headerShown: false,
                }}
              >
                {(props) => <Handle {...props} unsubscribe={isConnected} />}
              </Stack.Screen>
              <Stack.Screen
                name="AllFriends"
                options={{
                  title: i18n.t("allfriends"),
                  headerShown: true,
                  gestureEnabled: false,
                  headerTintColor: "#000",
                  headerBackTitleVisible: false,
                }}
              >
                {(props) => (
                  <AllFriends
                    {...props}
                    UUID={owner}
                    loggedIn={signIn}
                    unsubscribe={isConnected}
                  />
                )}
              </Stack.Screen>

              <Stack.Screen
                name="Abouts"
                options={{
                  title: i18n.t("About"),
                  headerShown: true,
                  gestureEnabled: false,
                  headerTintColor: "#000",
                  headerBackTitleVisible: false,
                }}
              >
                {(props) => (
                  <Abouts
                    {...props}
                    UUID={owner}
                    loggedIn={signIn}
                    unsubscribe={isConnected}
                  />
                )}
              </Stack.Screen>

              <Stack.Screen
                name="Purchase"
                options={{
                  title: i18n.t("purchase"),
                  headerShown: true,
                  gestureEnabled: false,
                  headerTintColor: "#000",
                  headerBackTitleVisible: false,
                }}
              >
                {(props) => (
                  <Purchase
                    {...props}
                    UUID={owner}
                    loggedIn={signIn}
                    unsubscribe={isConnected}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen
                name="Notifications"
                options={{
                  title: i18n.t("Notifications"),
                  headerShown: true,
                  gestureEnabled: false,
                  headerTintColor: "#000",
                  headerBackTitleVisible: false,
                }}
              >
                {(props) => (
                  <Notifications
                    {...props}
                    UUID={owner}
                    loggedIn={signIn}
                    unsubscribe={isConnected}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen
                name="GetPro"
                options={{
                  title: "",
                  headerShown: true,
                  gestureEnabled: false,
                  headerTransparent: true,
                  headerBackTitleVisible: false,
                }}
              >
                {(props) => (
                  <GetPro
                    {...props}
                    UUID={owner}
                    loggedIn={signIn}
                    unsubscribe={isConnected}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen
                name="ChangeAvatar"
                options={{
                  title: i18n.t("ChangeAvatar"),
                  headerShown: true,
                  gestureEnabled: false,
                  headerTintColor: "#000",
                  headerBackTitleVisible: false,
                }}
              >
                {(props) => (
                  <ChangeAvatar
                    {...props}
                    UUID={owner}
                    loggedIn={signIn}
                    unsubscribe={isConnected}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen
                name="WebView"
                options={{
                  title: "",
                  gestureEnabled: false,
                  headerTintColor: "#000",
                  headerBackTitleVisible: false,
                }}
              >
                {(props) => <WebView {...props} unsubscribe={isConnected} />}
              </Stack.Screen>
              <Stack.Screen
                name="Join"
                options={{
                  headerShown: true,
                  gestureEnabled: false,
                  title: i18n.t("JoinEvent"),
                  headerTintColor: "#000",
                  headerBackTitleVisible: false,
                }}
              >
                {(props) => <Join {...props} unsubscribe={isConnected} />}
              </Stack.Screen>
              <Stack.Screen
                name="Verification"
                options={{
                  gestureEnabled: false,
                  title: "",
                  headerShown: true,
                  gestureEnabled: false,
                  headerTransparent: true,
                  headerBackTitleVisible: false,
                }}
              >
                {(props) => (
                  <Verification {...props} unsubscribe={isConnected} />
                )}
              </Stack.Screen>

              <Stack.Screen
                name="Home"
                options={{
                  title: i18n.t("SnapEighteen"),
                  headerShown: true,
                  gestureEnabled: false,
                  headerTintColor: "#000",
                  headerBackTitleVisible: false,
                  headerBackVisible: false,
                }}
              >
                {(props) => (
                  <Home
                    {...props}
                    UUID={owner}
                    loggedIn={signIn}
                    unsubscribe={isConnected}
                  />
                )}
              </Stack.Screen>

              <Stack.Screen
                name="JoinedMembers"
                options={{
                  title: "",
                  headerShown: true,
                  gestureEnabled: false,
                  headerTintColor: "#000",
                  headerBackTitleVisible: false,
                }}
              >
                {(props) => (
                  <JoinedMembers
                    {...props}
                    UUID={owner}
                    loggedIn={signIn}
                    unsubscribe={isConnected}
                  />
                )}
              </Stack.Screen>

              <Stack.Screen
                name="MediaGallery"
                options={{
                  title: "",
                  headerShown: true,
                  gestureEnabled: false,
                  headerTransparent: true,
                  headerBackTitleVisible: false,
                }}
              >
                {(props) => (
                  <MediaGallery
                    {...props}
                    UUID={owner}
                    loggedIn={signIn}
                    unsubscribe={isConnected}
                  />
                )}
              </Stack.Screen>

                        <Stack.Screen
                name="MediaViewer"
                options={{
                  title: "",
                  headerShown: true,
                  gestureEnabled: false,
                  headerTransparent: true,
                  headerBackTitleVisible: false,
                  headerShown: false,
                  animation: 'fade',
                  animationDuration: 500,
                }}
              >
                {(props) => (
                  <MediaViewer
                    {...props}
                    UUID={owner}
                    loggedIn={signIn}
                    unsubscribe={isConnected}
                  />
                )}
              </Stack.Screen>
                      
              <Stack.Screen
                name="CreateCamera"
                options={{
                  title: i18n.t("NewEvent"),
                  headerShown: true,
                  headerTintColor: "#000",
                  gestureEnabled: false,
                  headerBackTitleVisible: false,
                }}
              >
                {(props) => (
                  <CreateCamera
                    {...props}
                    UUID={owner}
                    loggedIn={signIn}
                    unsubscribe={isConnected}
                  />
                )}
              </Stack.Screen>

              <Stack.Screen
                name="CameraPage"
                options={{
                  gestureEnabled: false,
                  title: i18n.t(""),
                  headerShown: false,
                }}
              >
                {(props) => (
                  <VisionCamera
                    {...props}
                    UUID={owner}
                    loggedIn={signIn}
                    unsubscribe={isConnected}
                  />
                )}
              </Stack.Screen>

              <Stack.Screen
                name="Languages"
                options={{
                  title: i18n.t("Languages"),
                  Edit: true,
                  headerTintColor: "#000",
                  gestureEnabled: false,
                  headerBackTitleVisible: false,
                }}
              >
                {(props) => (
                  <Languages
                    {...props}
                    UUID={owner}
                    loggedIn={signIn}
                    unsubscribe={isConnected}
                  />
                )}
              </Stack.Screen>

              <Stack.Screen
                name="About"
                options={{
                  title: i18n.t("About"),
                  Edit: true,
                  headerTintColor: "#000",
                  gestureEnabled: false,
                  headerBackTitleVisible: false,
                }}
              >
                {(props) => (
                  <AboutProfile
                    {...props}
                    UUID={owner}
                    loggedIn={signIn}
                    unsubscribe={isConnected}
                  />
                )}
              </Stack.Screen>

              <Stack.Screen
                name="VisionCameraMediaPage"
                options={{
                  gestureEnabled: false,
                  title: "",
                  headerShown: false,
                }}
              >
                {(props) => (
                  <MediaPage
                    {...props}
                    UUID={owner}
                    loggedIn={signIn}
                    unsubscribe={isConnected}
                  />
                )}
              </Stack.Screen>

              <Stack.Screen
                name="EditCamera"
                options={{
                  title: i18n.t("EditEvent"),
                  Edit: true,
                  headerTintColor: "#000",
                  gestureEnabled: false,
                  headerBackTitleVisible: false,
                }}
              >
                {(props) => (
                  <EditCamera
                    {...props}
                    UUID={owner}
                    loggedIn={signIn}
                    unsubscribe={isConnected}
                  />
                )}
              </Stack.Screen>

              <Stack.Screen
                name="Profile"
                options={{
                  title: i18n.t("Settings"),
                  headerShown: true,
                  headerTintColor: "#000",
                  gestureEnabled: false,
                  headerBackTitleVisible: false,
                }}
              >
                {(props) => (
                  <Profile
                    {...props}
                    UUID={owner}
                    loggedIn={signIn}
                    unsubscribe={isConnected}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen
                name="AccountDetails"
                options={{
                  title: i18n.t("MyAccountDetails"),
                  headerShown: true,
                  headerTintColor: "#000",
                  gestureEnabled: false,
                  headerBackTitleVisible: false,
                }}
              >
                {(props) => (
                  <AccountDetails
                    {...props}
                    UUID={owner}
                    loggedIn={signIn}
                    unsubscribe={isConnected}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen
                name="ClosedCameras"
                options={{
                  title: i18n.t("DownloadMedia"),
                  headerShown: true,
                  headerTintColor: "#000",
                  gestureEnabled: false,
                  headerBackTitleVisible: false,
                }}
              >
                {(props) => (
                  <ClosedCameras
                    {...props}
                    UUID={owner}
                    loggedIn={signIn}
                    unsubscribe={isConnected}
                  />
                )}
              </Stack.Screen>
            </Stack.Navigator>
          </MenuProvider>
        </NavigationContainer>
      </AlertProvider>
    </GestureHandlerRootView>
  );
}
