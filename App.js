import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { Text, LogBox, Platform, useColorScheme, Alert } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { MenuProvider } from "react-native-popup-menu";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { setup } from "react-native-iap"; // In-App Purchases setup
import NetInfo from "@react-native-community/netinfo"; // Network connectivity
import FastImage from "react-native-fast-image"; // Optimized image loading
import * as i18n from "./i18n"; // Internationalization
import { setI18nConfig } from "./i18n";
import { getLocales } from "expo-localization"; // Get device locales for i18n
import { ToastProvider } from "react-native-styled-toast"; // Toast notifications
import { storage } from "./src/context/components/Storage"; // Custom storage utility
import {
  COLORS,
  stringToBoolean,
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  constants,
} from "./src/utils/constants"; // App constants and utilities
import { GoogleSignin } from "@react-native-google-signin/google-signin"; // Google Sign-In
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet"; // Bottom sheet component
import { checkVersion } from "react-native-check-version"; // App version checking
import AppLink from "react-native-app-link"; // Opening external app links (e.g., app store)
import DeviceInfo from "react-native-device-info"; // Device information
import hotUpdate from "react-native-ota-hot-update"; // Over-the-air updates
import ReactNativeBlobUtil from "react-native-blob-util"; // File system and network operations
import NotifService from "./NotifService"; // Notification service

// Import all application screens
import Handle from "./src/Screens/LoginReg/Handle";
import Verification from "./src/Screens/LoginReg/Verification";
import Begin from "./src/Screens/LoginReg";
import Home from "./src/Screens/Home";
import CreateCamera from "./src/Screens/Cameras/CreateCamera";
import EditCamera from "./src/Screens/Cameras/EditCamera";
import Join from "./src/Screens/Home/Join";
import Friends from "./src/Screens/Friends/Friends";
import AllFriends from "./src/Screens/Friends/AllFriends";
import MediaGallery from "./src/Screens/Cameras/PhotoGallery";
import MediaViewer from "./src/Screens/Cameras/PhotoViewer";
import Profile from "./src/Screens/Profile";
import ChangeAvatar from "./src/Screens/Profile/ChangeAvatar";
import WebView from "./src/Screens/WebView/WebView";
import ClosedCameras from "./src/Screens/Cameras/ClosedCameras";
import AccountDetails from "./src/Screens/Profile/AccountDetails";
import Purchase from "./src/Screens/Store";
import JoinedMembers from "./src/Screens/Members";
import VisionCamera from "./src/Screens/VisionCamera";
import MediaPage from "./src/Screens/VisionCamera/MediaPage";
import AboutProfile from "./src/Screens/Friends/AboutProfile";
import GlobalFriends from "./src/Screens/Friends/GlobalFriends";
import Languages from "./src/Screens/Profile/Languages";
import Notifications from "./src/Screens/Profile/Notifications";
import Abouts from "./src/Screens/Profile/About";
import GetPro from "./src/Screens/Store/GetPro";
import { axiosPull } from "./src/utils/axiosPull"; // Axios utility for API calls
import TempCamera from "./src/Screens/Cameras/TempCamera";
import Blocked from "./src/Screens/Profile/Blocked";

export default function App() {
  // Initialize Native Stack Navigator
  const Stack = createNativeStackNavigator();

  // Configure StoreKit2 mode for In-App Purchases
  setup({ storekitMode: "STOREKIT2_MODE" });

  // State to track internet connectivity
  const [isConnected, setIsConnected] = useState(true);

  // Set default prop for all Text components to disable font scaling
  Text.defaultProps = Text.defaultProps || {};
  Text.defaultProps.allowFontScaling = false;

  // Ignore all LogBox warnings in production, show in development
  LogBox.ignoreAllLogs(__DEV__ ? false : true);

  // State to determine if the user is signed in
  const [signIn, setSignIn] = useState(false);

  // Device and app-specific information for app store links
  const appName = DeviceInfo.getApplicationName();
  const appStoreId = "6463832529"; // iOS App Store ID
  const appStoreLocale = "us"; // App Store locale
  const playStoreId = "com.dunncarabali.eighteen"; // Android Play Store ID

  // State to indicate if the app is ready to render (after initial data loading)
  const [ready, setReady] = useState(false);

  // State to store the current user's ID
  const [owner, setOwner] = useState("0");

  // Get the device's primary language code for internationalization
  const [localLang] = useState(getLocales()[0].languageCode);
  setI18nConfig(localLang); // Set i18n configuration based on local language

  /**
   * Initiates an over-the-air (OTA) update.
   * @param {string} url - The URL of the update bundle.
   * @param {string} urlversion - The version of the update bundle.
   */
  const startUpdate = async (url, urlversion) => {
    await hotUpdate.downloadBundleUri(ReactNativeBlobUtil, url, urlversion, {
      updateSuccess: () => {
        console.log("OTA update successful!");
      },
      updateFail(message) {
        console.error("OTA update failed:", message);
      },
      restartAfterInstall: true, // Restart the app after successful installation
    });
  };

  // Get the user's preferred color scheme (light/dark)
  const colorScheme = useColorScheme();

  /**
   * Checks for available over-the-air (OTA) updates.
   * Fetches update information from a remote JSON and compares versions.
   */
  const onCheckVersion = () => {
    fetch(constants.updateJSON, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate", // Prevent caching
        Pragma: "no-cache",
        Expires: 0,
      },
    })
      .then(async (data) => {
        const result = await data.json();
        const currentVersion = await hotUpdate.getCurrentVersion();
        // If a newer version is available, start the update
        if (parseInt(result?.version) > parseInt(currentVersion)) {
          startUpdate(
            Platform.OS == "ios"
              ? result?.downloadIosUrl
              : result?.downloadAndroidUrl,
            result?.version
          );
        }
      })
      .catch((error) => console.error("Error checking OTA version:", error));
  };

  /**
   * Effect hook to listen for network connectivity changes.
   * Updates the `isConnected` state.
   */
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isInternetReachable);
    });
    // Cleanup the event listener on component unmount
    return () => {
      unsubscribe();
    };
  }, [isConnected]); // Re-run if isConnected changes (though typically this is not needed for the listener itself)

  // Deep linking configuration for navigation
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
          type: (type) => `${type}`,
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
    prefixes: ["snapseighteenapp://"], // Custom URL scheme for deep linking
    config,
  };

  /**
   * Opens the appropriate app store (Google Play or Apple App Store).
   */
  const openAppStore = async () => {
    try {
      await AppLink.openInStore({
        appName,
        appStoreId,
        appStoreLocale,
        playStoreId,
      });
    } catch (error) {
      console.error("Error opening in store:", error);
      Alert.alert(
        i18n.t("Error"),
        i18n.t("Could not open app store. Please try again later.")
      );
    }
  };

  /**
   * Initial setup effect hook.
   * Checks app version, configures Google Sign-In, and checks for OTA updates.
   */
  useEffect(() => {
    const fetchData = async () => {
      // Check for app store updates (only in production)
      const version = await checkVersion();
      if (version.needsUpdate && !__DEV__) {
        Alert.alert(
          i18n.t("Update Available"),
          i18n.t(
            "A new version of the app is available. Please update for the best experience."
          ),
          [
            { text: i18n.t("Cancel"), style: "cancel" },
            {
              text: i18n.t("Update Now"),
              onPress: () => {
                openAppStore();
              },
            },
          ],
          { cancelable: false }
        );
      }

      // Configure Google Sign-In for Android
      if (Platform.OS == "android") {
        GoogleSignin.configure({
          scopes: ["profile", "email"],
          // Replace with your actual web client ID for production
          webClientId:
            "433573575993-b31pdthd0u5bv1mrc0qoftvqoj7bloal.apps.googleusercontent.com",
          offlineAccess: false,
          profileImageSize: 120,
        });
        try {
          // Attempt to sign out any previous Google session for a clean start
          GoogleSignin.signOut();
        } catch (error) {
          // Ignore error if no user is signed in
          console.log(
            "Google Sign-Out error (might be no user signed in):",
            error
          );
        }
      }

      // Check for and apply OTA updates
      onCheckVersion();
    };
    fetchData();
  }, []); // Empty dependency array means this runs once on component mount

  /**
   * Data fetching and initialization effect hook.
   * Retrieves user session, sets up notifications, and initializes storage.
   */
  useEffect(() => {
    const fetchData = async () => {
      // Retrieve user ID and login status from AsyncStorage
      const storedOwner = await AsyncStorage.getItem("user_id");
      await AsyncStorage.setItem("uploadEnabled", "1"); // Ensure upload is enabled
      setOwner(storedOwner);

      const logedIn = await AsyncStorage.getItem("logedIn");
      setSignIn(stringToBoolean(logedIn)); // Convert stored string to boolean

      if (stringToBoolean(logedIn)) {
        // If logged in, initialize notification service and check pro status
        new NotifService();
        await axiosPull._getProStatus(storedOwner, Platform.OS);
      } else {
        // If not logged in, clear specific app data from storage
        storage.set(
          "uploadData",
          JSON.stringify({
            message: "",
            display: "none",
            image: "",
            progress: "",
          })
        );
        storage.set("user.Join.Feed", JSON.stringify([]));
        storage.set("user.Friend.Feed", JSON.stringify([]));
        storage.set("user.Camera.Feed", JSON.stringify([]));
        storage.set("user.Camera.Friend.Feed", JSON.stringify([]));
        storage.set("user.Member.Join.Feed", JSON.stringify([]));
        storage.set("user.AllFriend.Feed", JSON.stringify([]));
        storage.set("user.Friend.Blocked", JSON.stringify([]));
        storage.set("user.All.Global.Friend.Feed", JSON.stringify([]));
      }

      // Set ready to true after a delay to show splash screen
      setTimeout(() => {
        setReady(true);
      }, 5000); // 5-second splash screen duration
    };
    fetchData();
  }, [signIn, ready, owner]); // Re-run when signIn, ready, or owner states change

  // If the app is not ready, display the splash screen
  if (!ready) {
    return (
      <FastImage
        style={{ flex: 1, width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}
        resizeMode={FastImage.resizeMode.contain}
        source={require("./assets/splash.png")}
      />
    );
  }

  // Main application render
  return (
    // Root view for Gesture Handler
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* Provider for Bottom Sheet Modals */}
      <BottomSheetModalProvider>
        {/* Provider for Toast notifications */}
        <ToastProvider maxToasts={1} offset={65} position="TOP">
          {/* Provider for React Native Popup Menu */}
          <MenuProvider>
            {/* Main Navigation Container */}
            <NavigationContainer
              // Apply default theme based on color scheme
              theme={colorScheme == "dark" ? DefaultTheme : DefaultTheme}
              linking={linking} // Enable deep linking
              fallback={
                // Fallback splash screen in case of navigation issues
                <FastImage
                  style={{
                    flex: 1,
                    width: SCREEN_WIDTH,
                    height: SCREEN_HEIGHT,
                  }}
                  resizeMode={FastImage.resizeMode.contain}
                  source={require("./assets/splash.png")}
                />
              }
            >
              {/* Manages status bar appearance */}
              <StatusBar style="auto" />
              <Stack.Navigator
                // Set initial route based on sign-in status
                initialRouteName={signIn ? "Home" : "Begin"}
                screenOptions={{ animationEnabled: false, animation: "none" }} // Disable screen transition animations globally
              >
                {/* Screen Definitions */}

                {/* TempCameraPage Screen */}
                <Stack.Screen
                  name="TempCameraPage"
                  options={{
                    gestureEnabled: false,
                    title: "",
                    headerShown: false,
                    headerTitleAlign: "center",
                  }}
                >
                  {(props) => (
                    <TempCamera
                      {...props}
                      UUID={owner} // Pass current user ID
                      loggedIn={signIn} // Pass login status
                      unsubscribe={isConnected} // Pass network connectivity status
                    />
                  )}
                </Stack.Screen>

                {/* Begin Screen (Login/Registration entry) */}
                <Stack.Screen
                  name="Begin"
                  options={{
                    gestureEnabled: false,
                    title: "",
                    headerShown: false,
                    headerTitleAlign: "center",
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

                {/* Friends Screen */}
                <Stack.Screen
                  name="Friends"
                  options={{
                    title: "",
                    headerShown: true,
                    gestureEnabled: false,
                    headerTintColor: COLORS[colorScheme ?? "light"], // Header text color based on theme
                    headerBackTitleVisible: false,
                    headerTitleAlign: "center",
                  }}
                >
                  {(props) => <Friends {...props} unsubscribe={isConnected} />}
                </Stack.Screen>

                {/* Handle Screen (Login/Registration forms) */}
                <Stack.Screen
                  name="Handle"
                  options={{
                    gestureEnabled: false,
                    title: "",
                    headerShown: false,
                    headerTitleAlign: "center",
                  }}
                >
                  {(props) => <Handle {...props} unsubscribe={isConnected} />}
                </Stack.Screen>

                {/* AllFriends Screen */}
                <Stack.Screen
                  name="AllFriends"
                  options={{
                    title: i18n.t("allfriends"),
                    headerShown: true,
                    gestureEnabled: false,
                    headerTintColor: COLORS[colorScheme ?? "light"],
                    headerBackTitleStyle: COLORS[colorScheme ?? "light"], // Specific style for back button title
                    headerTitleStyle: COLORS[colorScheme ?? "light"], // Specific style for header title
                    headerBackTitleVisible: false,
                    headerTitleAlign: "center",
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

                {/* Abouts Screen */}
                <Stack.Screen
                  name="Abouts"
                  options={{
                    title: i18n.t("About"),
                    headerShown: true,
                    gestureEnabled: false,
                    headerTintColor: "#000", // Fixed header color
                    headerBackTitleVisible: false,
                    headerTitleAlign: "center",
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

                {/* Purchase Screen (In-App Purchases) */}
                <Stack.Screen
                  name="Purchase"
                  options={{
                    title: "",
                    headerShown: true,
                    gestureEnabled: false,
                    headerTransparent: true, // Transparent header
                    headerBackTitleVisible: false,
                    headerTitleAlign: "center",
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

                {/* Notifications Screen */}
                <Stack.Screen
                  name="Notifications"
                  options={{
                    title: i18n.t("Notifications"),
                    headerShown: true,
                    gestureEnabled: false,
                    headerTintColor: "#000",
                    headerBackTitleVisible: false,
                    headerTitleAlign: "center",
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

                {/* GetPro Screen (Upgrade to Pro) */}
                <Stack.Screen
                  name="GetPro"
                  options={{
                    title: "",
                    headerShown: true,
                    gestureEnabled: false,
                    headerTransparent: true,
                    headerBackTitleVisible: false,
                    headerTitleAlign: "center",
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

                {/* ChangeAvatar Screen */}
                <Stack.Screen
                  name="ChangeAvatar"
                  options={{
                    title: i18n.t("ChangeAvatar"),
                    headerShown: true,
                    gestureEnabled: false,
                    headerTintColor: "#000",
                    headerBackTitleVisible: false,
                    headerTitleAlign: "center",
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

                {/* WebView Screen */}
                <Stack.Screen
                  name="WebView"
                  options={{
                    title: "",
                    gestureEnabled: false,
                    headerTintColor: "#000",
                    headerBackTitleVisible: false,
                    headerTitleAlign: "center",
                  }}
                >
                  {(props) => <WebView {...props} unsubscribe={isConnected} />}
                </Stack.Screen>

                {/* Join Screen */}
                <Stack.Screen
                  name="Join"
                  options={{
                    headerShown: true,
                    gestureEnabled: false,
                    title: i18n.t("JoinEvent"),
                    headerTintColor: "#000",
                    headerBackTitleVisible: false,
                    headerTitleAlign: "center",
                  }}
                >
                  {(props) => <Join {...props} unsubscribe={isConnected} />}
                </Stack.Screen>

                {/* Verification Screen */}
                <Stack.Screen
                  name="Verification"
                  options={{
                    gestureEnabled: false,
                    title: "",
                    headerShown: true,
                    gestureEnabled: false,
                    headerTransparent: true,
                    headerBackTitleVisible: false,
                    headerTitleAlign: "center",
                  }}
                >
                  {(props) => (
                    <Verification {...props} unsubscribe={isConnected} />
                  )}
                </Stack.Screen>

                {/* Home Screen */}
                <Stack.Screen
                  name="Home"
                  options={{
                    title: i18n.t("SnapEighteen"),
                    headerShown: true,
                    gestureEnabled: false,
                    headerTintColor: COLORS[colorScheme ?? "light"],
                    headerBackTitleStyle: COLORS[colorScheme ?? "light"],
                    headerTitleStyle: COLORS[colorScheme ?? "light"],
                    headerBackTitleVisible: false,
                    headerBackVisible: false, // Hide back button on Home screen
                    headerTitleAlign: "center",
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

                {/* JoinedMembers Screen */}
                <Stack.Screen
                  name="JoinedMembers"
                  options={{
                    title: "",
                    headerShown: true,
                    gestureEnabled: false,
                    headerTintColor: "#000",
                    headerBackTitleVisible: false,
                    headerTitleAlign: "center",
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

                {/* Blocked Screen */}
                <Stack.Screen
                  name="Blocked"
                  options={{
                    title: i18n.t("Blocked"),
                    headerShown: true,
                    gestureEnabled: false,
                    headerTintColor: "#000",
                    headerBackTitleVisible: false,
                    headerTitleAlign: "center",
                  }}
                >
                  {(props) => (
                    <Blocked
                      {...props}
                      UUID={owner}
                      loggedIn={signIn}
                      unsubscribe={isConnected}
                    />
                  )}
                </Stack.Screen>

                {/* MediaGallery Screen */}
                <Stack.Screen
                  name="MediaGallery"
                  options={{
                    title: "",
                    headerShown: true,
                    gestureEnabled: false,
                    headerTransparent: false,
                    headerBackTitleVisible: false,
                    headerTitleAlign: "center",
                    headerTintColor: "#000",
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

                {/* MediaViewer Screen */}
                <Stack.Screen
                  name="MediaViewer"
                  options={{
                    title: "",
                    headerShown: false,
                    gestureEnabled: false,
                    headerTransparent: true,
                    headerBackTitleVisible: false,
                    headerTitleAlign: "center",
                    animation: "fade", // Fade animation for this screen
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

                {/* CreateCamera Screen */}
                <Stack.Screen
                  name="CreateCamera"
                  options={{
                    title: i18n.t("NewEvent"),
                    headerShown: true,
                    headerTintColor: "#000",
                    gestureEnabled: false,
                    headerBackTitleVisible: false,
                    headerTitleAlign: "center",
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

                {/* CameraPage (VisionCamera) Screen */}
                <Stack.Screen
                  name="CameraPage"
                  options={{
                    gestureEnabled: false,
                    title: i18n.t(""), // Empty title for camera screen
                    headerShown: false,
                    headerTitleAlign: "center",
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

                {/* Languages Screen */}
                <Stack.Screen
                  name="Languages"
                  options={{
                    title: i18n.t("Languages"),
                    Edit: true, // Custom option, perhaps for internal logic
                    headerTintColor: "#000",
                    gestureEnabled: false,
                    headerBackTitleVisible: false,
                    headerTitleAlign: "center",
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

                {/* AboutProfile Screen */}
                <Stack.Screen
                  name="About"
                  options={{
                    title: i18n.t("About"),
                    Edit: true,
                    headerTintColor: "#000",
                    gestureEnabled: false,
                    headerBackTitleVisible: false,
                    headerTitleAlign: "center",
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

                {/* VisionCameraMediaPage Screen */}
                <Stack.Screen
                  name="VisionCameraMediaPage"
                  options={{
                    gestureEnabled: false,
                    title: "",
                    headerShown: false,
                    headerTitleAlign: "center",
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

                {/* EditCamera Screen */}
                <Stack.Screen
                  name="EditCamera"
                  options={{
                    title: i18n.t("EditEvent"),
                    Edit: true,
                    headerTintColor: "#000",
                    gestureEnabled: false,
                    headerBackTitleVisible: false,
                    headerTitleAlign: "center",
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

                {/* Profile (Settings) Screen */}
                <Stack.Screen
                  name="Profile"
                  options={{
                    title: i18n.t("Settings"),
                    headerShown: true,
                    headerTintColor: "#000",
                    gestureEnabled: false,
                    headerBackTitleVisible: false,
                    headerTitleAlign: "center",
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

                {/* AccountDetails Screen */}
                <Stack.Screen
                  name="AccountDetails"
                  options={{
                    title: i18n.t("MyAccountDetails"),
                    headerShown: true,
                    headerTintColor: "#000",
                    gestureEnabled: false,
                    headerBackTitleVisible: false,
                    headerTitleAlign: "center",
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

                {/* ClosedCameras Screen */}
                <Stack.Screen
                  name="ClosedCameras"
                  options={{
                    title: i18n.t("DownloadMedia"),
                    headerShown: true,
                    headerTintColor: "#000",
                    gestureEnabled: false,
                    headerBackTitleVisible: false,
                    headerTitleAlign: "center",
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

                {/* GlobalFriends Screen */}
                <Stack.Screen
                  name="GlobalFriends"
                  options={{
                    title: i18n.t("GlobalFriends"),
                    headerShown: true,
                    headerTintColor: "#000",
                    gestureEnabled: false,
                    headerBackTitleVisible: false,
                    headerTitleAlign: "center",
                  }}
                >
                  {(props) => (
                    <GlobalFriends
                      {...props}
                      UUID={owner}
                      loggedIn={signIn}
                      unsubscribe={isConnected}
                    />
                  )}
                </Stack.Screen>
              </Stack.Navigator>
            </NavigationContainer>
          </MenuProvider>
        </ToastProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
