import {
  View,
  StyleSheet,
  ScrollView,
  Platform,
  Text,
  Alert,
  NativeModules, // Used to get native module information (e.g., locale on iOS)
  Linking, // For opening external links/app settings
  TouchableOpacity, // For creating tappable components
} from "react-native";
import styles from "../../styles/SliderEntry.style"; // Custom styles for slider entries
import { ListItem, Switch, ButtonGroup, Input } from "@rneui/themed"; // UI components from @rneui/themed
import React, { useState, useCallback, useRef, useMemo } from "react"; // React hooks
import DateTimePicker from "@react-native-community/datetimepicker"; // Date and time picker component
import {
  ANDROID_MODE,
  IOS_MODE,
  ANDROID_DISPLAY,
  IOS_DISPLAY,
  constants, // Application-wide constants
  SCREEN_WIDTH, // Screen width constant
  makeid, // Utility for generating random IDs
  getExtensionFromFilename, // Utility for extracting file extensions
} from "../../utils/constants";
import * as ImagePicker from "expo-image-picker"; // Image picker for camera and media library
import FormData from "form-data"; // For constructing multipart/form-data requests
import { storage } from "../../context/components/Storage"; // MMKV storage instance
import { useMMKVObject } from "react-native-mmkv"; // Hook for MMKV storage
import FastImage from "react-native-fast-image"; // Optimized image loading
import { createImageProgress } from "react-native-image-progress"; // Image loading with progress indicator
const Image = createImageProgress(FastImage); // Combined FastImage with progress indicator
import Progress from "react-native-progress"; // Progress bar component
import moment from "moment"; // Date and time manipulation library
import { useFocusEffect } from "@react-navigation/native"; // Hook to run effects when screen is focused
import * as i18n from "../../../i18n"; // Internationalization utilities
import { Icon } from "react-native-elements"; // Icon component from react-native-elements (might be redundant with @rneui/themed)
import * as RNLocalize from "react-native-localize"; // For getting device localization info (e.g., timezone)
import PhotoEditor from "@baronha/react-native-photo-editor"; // Photo editing library
const stickers = []; // Placeholder for stickers array, if photo editor supports them
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context"; // For handling safe area insets
import { CameraRoll } from "@react-native-camera-roll/camera-roll"; // Access device's camera roll/gallery
import NotifService from "../../../NotifService"; // Custom notification service
import AsyncStorage from "@react-native-async-storage/async-storage"; // Persistent key-value storage
import { ActivityIndicator } from "react-native-paper"; // Loading indicator from react-native-paper
import axios from "axios"; // HTTP client for making requests
import { axiosPull } from "../../utils/axiosPull"; // Custom axios utility for pull operations
import RNFS from "react-native-fs"; // File system module for React Native
import {
  BottomSheetModal, // Bottom sheet modal component
  BottomSheetView, // View within the bottom sheet
  BottomSheetBackdrop, // Backdrop for the bottom sheet
} from "@gorhom/bottom-sheet";

/**
 * CreateCamera Component
 * This component allows users to create a new "camera" event. It includes options for:
 * - Event name
 * - Cover image (from gallery or AI-generated)
 * - Event duration
 * - Number of cameras/shots allowed
 * - Various event settings (e.g., photo gallery, social media sharing, auto-join)
 * - Pro features like AI image description and advanced settings.
 */
const CreateCamera = (props) => {
  // Initialize current date for date pickers
  const newDate = new Date();

  // --- State Variables ---
  // Switches for various event settings
  const [switch2, setSwitch2] = useState(true); // Photo Gallery
  const [switch3, setSwitch3] = useState(false); // Purchases (likely allow members to purchase more shots)
  const [switch4, setSwitch4] = useState(false); // Auto Join
  const [switch5, setSwitch5] = useState(false); // Is Hidden
  const [switch1, setSwitch1] = useState(false); // Social Media

  // Event time configuration
  const [interval] = useState(1); // Not explicitly used but might be for future time intervals
  const [minimumDate] = useState(newDate); // Minimum selectable date (today)
  const [maximumDate] = useState(); // Maximum selectable date (not set, meaning no upper limit)
  const [selectedDate, setSelectedDate] = useState(newDate); // Currently selected date for the event start
  const [timeDate, setTimeDate] = useState(newDate); // Used with Android date/time picker
  const [show, setShow] = useState(false); // Controls visibility of date picker
  const [clockShow, setClockShow] = useState(false); // Controls visibility of time picker (Android specific)

  // Image and AI settings
  const [isEditing, setIsEditing] = useState(false); // True if the image is being edited
  const [isAI, setIsAI] = useState(false); // True if the image is AI-generated
  const [dname, setDName] = useState(""); // AI image description/prompt
  const [image, setImage] = useState(""); // URI of the selected/generated cover image
  const [seed, setSeed] = useState(72); // Seed for AI image generation (for reproducibility/variation)

  // User and event details
  const [user] = useMMKVObject("user.Data", storage); // Current user data
  const [cameras, setCameras] = useState(0); // Index for number of cameras allowed
  const [name, setName] = useState(""); // Event name
  const [isPro] = useState(user.isPro == "1"); // Check if user has Pro subscription
  const [selectedIndex, setSelectedIndex] = useState(0); // Index for selected event duration
  const [start, setStart] = useState(moment().unix()); // Event start timestamp (Unix)
  const [end, setEnd] = useState(moment().unix() + 28800); // Event end timestamp (Unix), defaults to 8 hours after start
  const [verified, setVerified] = useState(true); // Verification status (e.g., for event name validity)
  const [errorColor] = useState(verified ? "#fafbfc" : "#ffa3a6"); // Background color based on verification

  // Permissions and Services
  const notification = useRef(new NotifService()).current; // Notification service instance
  const [cameraStatus, requestCameraPermission] =
    ImagePicker.useCameraPermissions(); // Camera permissions
  const [libraryStatus, requestLibraryPermission] =
    ImagePicker.useMediaLibraryPermissions(); // Media library permissions

  // Bottom Sheet Modal (for image selection/options)
  const bottomSheetRef = useRef(null); // Ref for BottomSheetModal
  const [showClose, setShowClose] = useState(false); // Controls visibility of "Create" button in header
  const snapPoints = useMemo(() => ["20%"], []); // Snap points for the bottom sheet
  const handlePresentModalPress = useCallback(() => {
    bottomSheetRef.current?.present(); // Open the bottom sheet
  }, []);

  // Platform-specific date/time picker modes
  const MODE_VALUES = Platform.select({
    ios: Object.values(IOS_MODE),
    android: Object.values(ANDROID_MODE),
    windows: [],
  });
  const DISPLAY_VALUES = Platform.select({
    ios: Object.values(IOS_DISPLAY),
    android: Object.values(ANDROID_DISPLAY),
    windows: [],
  });

  // Get device language for AI image generation prompt
  const deviceLanguage =
    Platform.OS == "ios"
      ? NativeModules.SettingsManager.settings.AppleLocale // iOS specific locale
      : NativeModules.I18nManager.localeIdentifier; // Android specific locale

  /**
   * Hook to generate image URLs from Pollinations.ai based on a prompt.
   * @param {string} prompt - The text prompt for image generation.
   * @param {object} options - Configuration options for the image (width, height, model, seed, etc.).
   * @returns {function} A function that returns the generated image URL.
   */
  const usePollinationsImages = useCallback(
    (prompt, options = {}) => {
      const {
        width = 1024,
        height = 863,
        model = "flux",
        seed: imageSeed = seed, // Use component's seed state by default
        nologo = true,
        enhance = false,
      } = options;

      // Return a function that generates the URL, useful for `source` prop in Image.
      return () => {
        const params = new URLSearchParams({
          width,
          height,
          model,
          seed: imageSeed,
          nologo,
          enhance,
        });
        return `https://pollinations.ai/p/${encodeURIComponent(prompt)}?${params.toString()}`;
      };
    },
    [seed]
  ); // Recreate if seed changes

  const daysChange = (value) => {
    setSelectedIndex(value);
    setEnd(
      start +
        (isPro
          ? parseInt(constants.camera_time_seconds_PRO[value])
          : parseInt(constants.camera_time_seconds[value]))
    );
  };

  /**
   * Opens the photo editor for the given image URI.
   * After editing, updates the image state and relevant flags.
   * @param {string} imageUri - The URI of the image to edit.
   */
  const editImage = async (imageUri) => {
    try {
      await PhotoEditor.open({
        path: imageUri,
        stickers,
      }).then((image) => {
        setImage(image);
        setIsEditing(false);
        setShowClose(true);
      });
    } catch (e) {
      setImage("");
      console.log("e", e);
      setIsEditing(false);
    }
    await AsyncStorage.removeItem("media.path");
  };

  /**
   * Updates the state for the number of cameras allowed in the event.
   * @param {number} value - The selected index from the ButtonGroup.
   */
  const cameraChange = (value) => {
    setCameras(value);
  };

  /**
   * Handles date/time changes for iOS `DateTimePicker`.
   * @param {object} event - The event object from DateTimePicker.
   * @param {Date} selectDate - The newly selected Date object.
   */
  const onChangeIOS = (event, selectDate) => {
    if (event.type == "neutralButtonPressed") {
      // If "Clear" or "Neutral" button pressed, retain current date
      setSelectedDate(selectedDate);
      setStart(moment(selectedDate).unix());
      setEnd(
        moment(selectedDate).unix() +
          (isPro
            ? parseInt(constants.camera_time_seconds_PRO[selectedIndex])
            : parseInt(constants.camera_time_seconds[selectedIndex]))
      );
    } else {
      setSelectedDate(selectDate);
      setStart(moment(selectDate).unix());
      setEnd(
        moment(selectDate).unix() +
          (isPro
            ? parseInt(constants.camera_time_seconds_PRO[selectedIndex])
            : parseInt(constants.camera_time_seconds[selectedIndex]))
      );
    }
  };

  /**
   * Handles general date/time changes (likely for Android `DateTimePicker` time selection after date).
   * @param {object} event - The event object from DateTimePicker.
   * @param {Date} selectDate - The newly selected Date object.
   */
  const onChange = (event, selectDate) => {
    if (event.type == "set") {
      setClockShow(false); // Hide time picker
      setSelectedDate(selectDate);
      setStart(moment(selectDate).unix());
      setEnd(
        moment(selectDate).unix() +
          (isPro
            ? parseInt(constants.camera_time_seconds_PRO[selectedIndex])
            : parseInt(constants.camera_time_seconds[selectedIndex]))
      );
    } else {
      setClockShow(false); // Hide time picker on cancel
      setSelectedDate(selectedDate); // Revert to previous selected date
      setStart(moment(selectedDate).unix());
      setEnd(
        moment(selectedDate).unix() +
          (isPro
            ? parseInt(constants.camera_time_seconds_PRO[selectedIndex])
            : parseInt(constants.camera_time_seconds[selectedIndex]))
      );
    }
  };

  /**
   * Generates an AI image using Pollinations.ai based on event name or AI description.
   * Sets the generated image URI and initiates editing mode.
   */
  const AITexttoImage = () => {
    const prompt =
      dname.length > 5 // Use AI description if available and long enough, otherwise a default prompt
        ? dname
        : `Create a cinematic 4K photo shot on a 70mm, Ultra-Wide Angle, Depth of Field, Shutter Speed 1/1000, F/22 camera for a gathering that is titled ${name} and is in dramatic and stunning setting located in ${RNLocalize.getTimeZone()} and is also an award winning photo worthy of instagram.`;

    const userImage = usePollinationsImages(prompt, {
      width: 1024,
      height: 863,
      seed: seed,
      model: "flux",
      nologo: true,
      enhance: true,
    })(); // Call the function returned by usePollinationsImages to get the URL

    setImage(userImage);
    setIsEditing(true); // Automatically enter editing mode for AI images
    setIsAI(true); // Mark as AI-generated
  };

  /**
   * Handles date/time changes for Android `DateTimePicker`.
   * First selects date, then shows time picker.
   * @param {object} event - The event object from DateTimePicker.
   * @param {Date} selectDate - The newly selected Date object.
   */
  const onChangeAndroid = (event, selectDate) => {
    if (event.type == "set") {
      setShow(false); // Hide date picker
      setSelectedDate(selectDate);
      setTimeDate(selectDate); // Set timeDate for the time picker
      setClockShow(true); // Show time picker
    } else {
      setShow(false); // Hide date picker on cancel
      setSelectedDate(selectedDate); // Revert to previous date
      setTimeDate(selectedDate); // Revert timeDate as well
      setClockShow(false); // Hide time picker
    }
  };

  // --- Toggle Switch Functions ---
  const toggleSwitch1 = () => setSwitch1(!switch1); // Social Media
  const toggleSwitch2 = () => setSwitch2(!switch2); // Photo Gallery
  const toggleSwitch4 = () => setSwitch4(!switch4); // Auto Join
  const toggleSwitch3 = () => setSwitch3(!switch3); // Purchases
  const toggleSwitch5 = () => setSwitch5(!switch5); // Is Hidden

  /**
   * Allows picking an image from the device's media library.
   * Handles permission requests and sets the selected image.
   */
  const pickImage = async () => {
    // Check and request media library permissions
    const permissionResponse = await requestLibraryPermission();
    if (
      libraryStatus.status == ImagePicker.PermissionStatus.DENIED ||
      !permissionResponse.granted ||
      libraryStatus.status == ImagePicker.PermissionStatus.UNDETERMINED
    ) {
      Alert.alert(
        i18n.t("Permissions"),
        i18n.t("UseLibrary"),
        [
          {
            text: i18n.t("Cancel"),
            onPress: () =>
              console.log("Image picker cancelled due to permissions."),
            style: "destructive",
          },
          {
            text: i18n.t("Settings"),
            onPress: () => {
              Linking.openSettings(); // Direct user to app settings
            },
            style: "default",
          },
        ],
        { cancelable: false }
      );
      return; // Stop execution if permission is denied
    }

    // Launch image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      exif: true, // Include EXIF data
      selectionLimit: 1, // Only allow single image selection
      allowsEditing: true, // Allow basic editing (cropping)
      allowsMultipleSelection: false,
      quality: 1, // High quality
      orderedSelection: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri); // Set image URI
      setIsEditing(true); // Indicate that the image is ready for editing
      setIsAI(false); // Not an AI image
      setShowClose(true); // Show the "Create" button
    } else {
      setImage(image); // Revert to previous image if cancelled
      setIsEditing(false); // No editing needed if cancelled
      setShowClose(false); // Show the "Create" button
    }
  };

  /**
   * `useFocusEffect` hook to manage side effects when the screen is focused.
   * It checks for a pending image path from AsyncStorage (e.g., after camera capture)
   * and updates the navigation header options.
   */
  useFocusEffect(
    useCallback(() => {
      // Check for a pending image path (e.g., from `VisionCamera` or `TempCamera` after capturing)
      const checkPendingImage = async () => {
        const value = await AsyncStorage.getItem("media.path");
        if (value) {
          editImage(value); // If a path exists, open the photo editor
          await AsyncStorage.removeItem("media.path"); // Clear the path after use
        }
      };
      checkPendingImage();

      // Set navigation header options (title and right button)
      props.navigation.setOptions({
        title: isPro ? i18n.t("CreatePro") : i18n.t("Create"), // Dynamic title based on Pro status
        headerRight: () =>
          showClose ? ( // Show "Create" button if `showClose` is true
            <TouchableOpacity
              onPress={() => {
                createEvent(); // Trigger event creation
              }}
            >
              <Text
                style={{
                  color: "#3D4849",
                  marginRight: 10,
                  fontSize: 15,
                  fontWeight: "bold",
                }}
              >
                {i18n.t("Create")}
              </Text>
            </TouchableOpacity>
          ) : (
            <></> // Otherwise, render nothing
          ),
      });
      // Dependencies: Re-run effect if any of these values change
    }, [
      verified,
      props,
      name,
      showClose,
      isEditing,
      image,
      errorColor,
      selectedIndex,
      selectedDate,
      start,
      end,
      cameras,
      switch4,
      switch5,
      switch2,
      switch3,
      isAI,
      user,
      show,
      isPro, // Added isPro to dependencies as it affects header title
    ])
  );

  /**
   * Initiates the event creation process.
   * Constructs FormData, sends it to the server, handles upload progress,
   * saves the cover image to Camera Roll, and schedules notifications.
   */
  const createEvent = async () => {
    // Show a loading indicator in the navigation header
    props.navigation.setOptions({
      headerRight: () => (
        <ActivityIndicator color="black" size="small" animating={true} />
      ),
    });

    // Generate a unique PIN for the event
    const pin =
      "SNAP-" +
      makeid(4) +
      "-" +
      makeid(5) +
      "-" +
      moment().unix() +
      "-" +
      makeid(3);

    // Prepare FormData for the API request
    const formData = new FormData();
    formData.append("owner", user.user_id); // Event owner ID
    formData.append("eventName", name); // Event name
    formData.append("purchases", "0"); // Allow purchases
    formData.append(
      "length",
      isPro
        ? constants.camera_time_text_PRO[selectedIndex] // Pro duration text
        : constants.camera_time_text[selectedIndex] // Standard duration text
    );
    formData.append(
      "cameras",
      isPro
        ? constants.camera_amount_PRO[cameras] // Pro camera limit
        : constants.camera_amount[cameras] // Standard camera limit
    );
    formData.append("shots", "18");
    formData.append("start", start); // Event start timestamp
    formData.append("pin", pin); // Generated PIN
    formData.append("ai_description", isPro ? dname.trim() : ""); // AI description (only for Pro)
    formData.append("end", end); // Event end timestamp
    formData.append("photoGallery", switch2 ? "1" : "0"); // Enable photo gallery
    formData.append("socialMedia", isPro ? (switch1 ? "1" : "0") : "1"); // Social media sharing (Pro users can toggle, others default to 1)
    formData.append("autoJoin", switch4 ? "1" : "0"); // Auto-join
    formData.append("device", Platform.OS); // Device OS
    formData.append("camera", "0"); // Unclear usage, possibly legacy or placeholder
    formData.append("isHidden", switch5 ? "1" : "0"); // Hidden event

    // Prepare the cover image file for upload
    const fileName =
      "SNAP18-cover-" +
      user.user_id +
      "-" +
      moment().unix() +
      "." +
      getExtensionFromFilename(image).toLowerCase();

    formData.append("aiIMAGE", isAI ? image : ""); // If AI image, send its URL (or empty string)
    formData.append("file", {
      name: fileName,
      type: constants.mimes(getExtensionFromFilename(image).toLowerCase()), // Determine MIME type from extension
      uri: Platform.OS == "android" ? image : image.replace("file://", ""), // Adjust URI for Android/iOS
    });
    formData.append("photoName", fileName); // Name of the uploaded photo
    formData.append("isAI", isAI ? "1" : "0"); // Is this an AI-generated image

    await AsyncStorage.setItem("uploadEnabled", "1"); // Disable other uploads during this process

    // Function to handle the actual upload
    const preLoading = async () => {
      try {
        await axios({
          method: "POST",
          url: constants.url + "/camera/create.php", // API endpoint for creating camera
          data: formData,
          onUploadProgress: (progressEvent) => {
            //const { loaded, total } = progressEvent;
            //const progress = total > 0 ? loaded / total : 0;
          },
          headers: {
            Accept: "application/json",
            "content-Type": "multipart/form-data", // Important for FormData
          },
        });

        await AsyncStorage.setItem("uploadEnabled", "0"); // Re-enable other uploads

        // After successful upload, perform post-loading actions
        const postLoading = async () => {
          // Clear global upload message
          // Save the event cover image to the device's camera roll
          if (image) {
            try {
              await CameraRoll.saveAsset(image, { type: "photo" });
            } catch (saveError) {
              console.warn("Failed to save image to CameraRoll:", saveError);
              // Optionally alert user or log more details
            }
          }

          // Refresh various feeds to reflect the new event
          await axiosPull._pullGalleryFeed(pin, user.user_id);
          await axiosPull._pullFriendCameraFeed(
            user.user_id,
            "user",
            user.user_id
          );
          await axiosPull._pullCameraFeed(user.user_id, "owner");

          // Schedule notifications for event start and end
          const coverImageUrl =
            constants.urldata +
            "/" +
            user.user_id +
            "/events/" +
            pin +
            "/" +
            fileName;

          if (parseInt(start) >= moment().unix()) {
            notification.scheduleNotif(
              String(name),
              i18n.t("EvnetStart"),
              parseInt(start),
              pin + "-start",
              coverImageUrl
            );
          }
          notification.scheduleNotif(
            String(name),
            i18n.t("EvnetEnd"),
            parseInt(end),
            pin + "-end",
            coverImageUrl
          );

          // Delete the temporary local image file after upload and saving
          try {
            if (image.startsWith("file://") || image.startsWith("content://")) {
              // Ensure it's a local file before attempting to unlink
              await RNFS.unlink(image);
            }
          } catch (unlinkError) {
            console.warn("Failed to delete local image file:", unlinkError);
          }
        };
        await postLoading();
      } catch (uploadError) {
        console.error("Error creating event:", uploadError);
        Alert.alert(i18n.t("Error"), i18n.t("EventCreationFailed"));
        // Ensure upload UI is reset on error
        storage.set(
          "uploadData",
          JSON.stringify({
            message: "",
            display: "none",
            progress: 0,
          })
        );
      } finally {
        // Always navigate back regardless of success or failure
        props.navigation.goBack();
      }
    };
    await preLoading(); // Start the upload process
  };

  /**
   * Closes the bottom sheet modal.
   */
  const handleDismissPress = useCallback(() => {
    bottomSheetRef.current?.close();
  }, []);

  /**
   * Renders the backdrop for the bottom sheet modal.
   * Configured to close the modal when pressed outside.
   */
  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        enableTouchThrough={false} // Prevents interaction with content behind
        pressBehavior={"close"} // Closes modal on backdrop press
        appearsOnIndex={0} // Appears at the first snap point
        disappearsOnIndex={-1} // Disappears when fully closed
        {...props}
      />
    ),
    []
  );

  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={{
          backgroundColor: "white",
          height: "100%",
          width: SCREEN_WIDTH,
        }}
        edges={["bottom", "left", "right"]}
      >
        <ScrollView
          style={{ backgroundColor: "#fff", marginBottom: 0, flex: 1 }}
          keyboardShouldPersistTaps={"never"} // Keyboard dismisses on tap outside
          keyboardDismissMode="on-drag" // Keyboard dismisses on scroll
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            {/* Event Name Section */}
            <ListItem bottomDivider>
              <Icon
                type="material"
                name="drive-file-rename-outline"
                size={25}
                color="#3D4849"
                containerStyle={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              />
              <ListItem.Content>
                <ListItem.Title style={styles.imageUserNameTitleBlack}>
                  {i18n.t("e4")}
                </ListItem.Title>
                <ListItem.Subtitle>{i18n.t("e5")}</ListItem.Subtitle>
              </ListItem.Content>
            </ListItem>
            <ListItem
              containerStyle={{ height: "auto", backgroundColor: errorColor }}
              bottomDivider
            >
              <ListItem.Content>
                <ListItem.Input
                  style={{
                    height: "auto",
                    fontSize: 17,
                    borderWidth: 2,
                    borderColor: "transparent",
                    borderRadius: 10,
                    paddingRight: 5,
                  }}
                  underlineColorAndroid="transparent" // Remove underline on Android
                  inputContainerStyle={{ borderBottomWidth: 0 }} // Remove bottom border for Input
                  autoCapitalize="sentences"
                  keyboardType="default"
                  maxLength={32} // Max length for event name
                  onChangeText={(text) => {
                    setName(text);
                  }}
                  placeholder={i18n.t("e6")}
                ></ListItem.Input>
              </ListItem.Content>
            </ListItem>
            {/* AI Image Description (Pro Feature) */}
            {isPro && (
              <>
                <ListItem bottomDivider>
                  <Icon
                    type="material"
                    name="text-snippet"
                    size={25}
                    color="#3D4849"
                    containerStyle={{
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  />
                  <ListItem.Content>
                    <ListItem.Title style={styles.imageUserNameTitleBlack}>
                      {i18n.t("AI Image Decription")}
                    </ListItem.Title>
                    <ListItem.Subtitle>
                      {i18n.t("AIDescription")}
                    </ListItem.Subtitle>
                  </ListItem.Content>
                </ListItem>
                <ListItem
                  containerStyle={{
                    height: "auto",
                    backgroundColor: errorColor,
                  }}
                  bottomDivider
                >
                  <ListItem.Content>
                    <Input
                      underlineColorAndroid="transparent"
                      inputContainerStyle={{ borderBottomWidth: 0 }}
                      style={{
                        height: "auto",
                        lineHeight: 20,
                        fontSize: 17,
                        borderWidth: 2,
                        borderColor: "transparent",
                        borderRadius: 10,
                        paddingRight: 5,
                      }}
                      autoCapitalize="sentences"
                      keyboardType="default"
                      onChangeText={(text) => {
                        setDName(text);
                      }}
                      multiline={true} // Allow multiple lines for description
                      placeholder={i18n.t("AIPlaceholder")}
                    ></Input>
                  </ListItem.Content>
                </ListItem>
              </>
            )}

            {/* Cover Image Section */}
            <ListItem bottomDivider>
              <Icon
                type="ionicon"
                name="image-outline"
                size={25}
                color="#3D4849"
                containerStyle={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              />
              <ListItem.Content>
                <ListItem.Title style={styles.imageUserNameTitleBlack}>
                  {i18n.t("e1")}
                </ListItem.Title>
                <ListItem.Subtitle>{i18n.t("e2")}</ListItem.Subtitle>
              </ListItem.Content>
            </ListItem>
            <ListItem
              containerStyle={{ height: 250, backgroundColor: "#fafbfc" }}
            >
              <ListItem.Content
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    handlePresentModalPress(); // Open bottom sheet for image options
                  }}
                >
                  {image ? (
                    <Image
                      key={image}
                      indicator={Progress} // Show progress bar
                      style={{
                        height: 200,
                        width: 300,
                        overflow: "hidden",
                        backgroundColor: "#f2f2f2",
                        borderRadius: 16,
                      }}
                      onLoadEnd={async () => {}} // Callback when image finishes loading
                      onLoad={async () => {
                        // If `isEditing` is true (e.g., from a fresh capture), open editor
                        if (isEditing) {
                          editImage(image);
                        }
                      }}
                      fallback={{ uri: image }} // Fallback if main source fails
                      onError={() => {
                        // If it's an AI image and fails to load, try regenerating
                        if (isAI) {
                          AITexttoImage();
                        }
                      }}
                      resizeMode={FastImage.resizeMode.cover}
                      source={{
                        uri: image,
                        priority: FastImage.priority.high,
                        cacheControl: FastImage.cacheControl.immutable, // Cache immutably
                      }}
                    />
                  ) : (
                    // Placeholder image if no image is selected
                    <Image
                      key={"elementor-placeholder-image.png"}
                      source={require("../../../assets/elementor-placeholder-image.png")}
                      indicator={Progress}
                      resizeMode={FastImage.resizeMode.cover}
                      style={{
                        height: 200,
                        width: 300,
                        borderRadius: 16,
                        overflow: "hidden",
                      }}
                    />
                  )}
                </TouchableOpacity>
                <Text style={{ color: "grey", margin: 5 }}>{i18n.t("e3")}</Text>
              </ListItem.Content>
            </ListItem>

            {/* Image Actions (Edit, Flag, Delete) */}
            {image ? (
              <ListItem
                containerStyle={{ height: 45, backgroundColor: "#fafbfc" }}
                bottomDivider
              >
                <ListItem.Content>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-around",
                    }}
                  >
                    <TouchableOpacity
                      style={{
                        width: "50%",
                        height: 40,
                        marginTop: 20,
                      }}
                      onPress={() => {
                        editImage(image); // Re-open photo editor
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          gap: 10,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Icon
                          type="material-community"
                          name="image-edit-outline"
                          size={20}
                          color="#3D4849"
                        />
                        <Text>{i18n.t("Edit Image")}</Text>
                      </View>
                    </TouchableOpacity>

                    {isAI ? (
                      // Option to flag/redraw AI image
                      <TouchableOpacity
                        style={{
                          width: "50%",
                          height: 40,
                          marginTop: 20,
                        }}
                        onPress={() => {
                          Alert.alert(
                            i18n.t("ReportAI"),
                            i18n.t("RReportAIImage"),
                            [
                              {
                                text: i18n.t("Cancel"),
                                onPress: () =>
                                  console.log("AI image redraw cancelled."),
                                style: "destructive",
                              },
                              {
                                text: i18n.t("Flag&Redraw"),
                                onPress: () => {
                                  setSeed(seed - 1); // Change seed for a different AI image
                                  AITexttoImage(); // Regenerate AI image
                                },
                                style: "default",
                              },
                            ],
                            { cancelable: false }
                          );
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            gap: 10,
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Icon
                            type="material"
                            name="report-gmailerrorred"
                            size={20}
                            color="#3D4849"
                          />
                          <Text>{i18n.t("Flag")}</Text>
                        </View>
                      </TouchableOpacity>
                    ) : (
                      <></>
                    )}

                    <TouchableOpacity
                      style={{
                        width: "50%",
                        height: 40,
                        marginTop: 20,
                      }}
                      onPress={() => setImage("")} // Clear the image
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          gap: 10,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Icon
                          type="material-community"
                          name="delete-empty-outline"
                          size={20}
                          color="red"
                        />
                        <Text style={{ color: "red" }}>
                          {i18n.t("Delete Image")}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </ListItem.Content>
              </ListItem>
            ) : (
              <></>
            )}
            <ListItem bottomDivider>
              <Icon
                type="material-community"
                name="view-gallery-outline"
                size={25}
                color="#3D4849"
                containerStyle={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              />
              <ListItem.Content>
                <ListItem.Title style={styles.imageUserNameTitleBlack}>
                  {i18n.t("e15")}
                </ListItem.Title>
                <ListItem.Subtitle>{i18n.t("e16")}</ListItem.Subtitle>
              </ListItem.Content>
            </ListItem>
            <ListItem
              containerStyle={{ height: 65, backgroundColor: "#fafbfc" }}
              bottomDivider
            >
              <ListItem.Content>
                <Switch
                  style={{ alignSelf: "flex-end" }}
                  value={switch2}
                  onValueChange={(value) => toggleSwitch2(value)}
                />
              </ListItem.Content>
            </ListItem>
            {/* Auto Join Feature */}
            <ListItem bottomDivider>
              <Icon
                type="material-community"
                name="refresh-auto"
                size={25}
                color="#3D4849"
                containerStyle={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              />
              <ListItem.Content>
                <ListItem.Title style={styles.imageUserNameTitleBlack}>
                  {i18n.t("e7")}
                </ListItem.Title>
                <ListItem.Subtitle>{i18n.t("e8")}</ListItem.Subtitle>
              </ListItem.Content>
            </ListItem>
            <ListItem
              containerStyle={{ height: 65, backgroundColor: "#fafbfc" }}
              bottomDivider
            >
              <ListItem.Content>
                <Switch
                  style={{ alignSelf: "flex-end" }}
                  value={switch4}
                  onValueChange={toggleSwitch4} // Toggle auto-join switch
                />
              </ListItem.Content>
            </ListItem>
            <ListItem bottomDivider>
              <Icon
                type="material"
                name="hide-source"
                size={25}
                color="#3D4849"
                containerStyle={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              />
              <ListItem.Content>
                <ListItem.Title style={styles.imageUserNameTitleBlack}>
                  {i18n.t("HideEvent")}
                </ListItem.Title>
                <ListItem.Subtitle>{i18n.t("HideEventDesc")}</ListItem.Subtitle>
              </ListItem.Content>
            </ListItem>
            <ListItem
              containerStyle={{ height: 65, backgroundColor: "#fafbfc" }}
              bottomDivider
            >
              <ListItem.Content>
                <Switch
                  style={{ alignSelf: "flex-end" }}
                  value={switch5}
                  onValueChange={(value) => toggleSwitch5(value)}
                />
              </ListItem.Content>
            </ListItem>

            {isPro && (
              <>
                <ListItem bottomDivider>
                  <Icon
                    type="material-community"
                    name="share"
                    size={25}
                    color="#3D4849"
                    containerStyle={{
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  />
                  <ListItem.Content>
                    <ListItem.Title style={styles.imageUserNameTitleBlack}>
                      {i18n.t("e17")}
                    </ListItem.Title>
                    <ListItem.Subtitle>{i18n.t("e18")}</ListItem.Subtitle>
                  </ListItem.Content>
                </ListItem>
                <ListItem
                  containerStyle={{ height: 65, backgroundColor: "#fafbfc" }}
                  bottomDivider
                >
                  <ListItem.Content>
                    <Switch
                      style={{ alignSelf: "flex-end" }}
                      value={switch1}
                      onValueChange={(value) => toggleSwitch1(value)}
                    />
                  </ListItem.Content>
                </ListItem>
              </>
            )}

            {/* Number of Cameras Allowed */}
            <ListItem bottomDivider>
              <Icon
                type="material-community"
                name="camera-front-variant"
                size={25}
                color="#3D4849"
                containerStyle={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              />
              <ListItem.Content>
                <ListItem.Title style={styles.imageUserNameTitleBlack}>
                  {i18n.t("e9")}
                </ListItem.Title>
                <ListItem.Subtitle>{i18n.t("e10")}</ListItem.Subtitle>
              </ListItem.Content>
            </ListItem>
            <ListItem
              containerStyle={{ height: 100, backgroundColor: "#fafbfc" }}
              bottomDivider
            >
              <ListItem.Content
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  height: 65,
                }}
              >
                <ButtonGroup
                  buttons={
                    isPro // Pro users have different camera amount options
                      ? constants.camera_amount_PRO
                      : constants.camera_amount
                  }
                  selectedIndex={cameras}
                  onPress={cameraChange} // Handle camera amount selection
                  selectedButtonStyle={{ backgroundColor: "#ea5504" }}
                  containerStyle={{ marginBottom: 5 }}
                />
              </ListItem.Content>
            </ListItem>

         

            <ListItem bottomDivider>
              <Icon
                type="ionicon"
                name="today-outline"
                size={25}
                color="#3D4849"
                containerStyle={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              />
              <ListItem.Content>
                <ListItem.Title style={styles.imageUserNameTitleBlack}>
                  {i18n.t("e11")}
                </ListItem.Title>
                <ListItem.Subtitle>{i18n.t("e12")}</ListItem.Subtitle>
              </ListItem.Content>
            </ListItem>
            <ListItem
              containerStyle={{ backgroundColor: "#fafbfc" }}
              bottomDivider
            >
              <ListItem.Content style={{ height: 65, margin: 10 }}>
                <ButtonGroup
                  buttons={
                    isPro
                      ? constants.camera_time_text_PRO
                      : constants.camera_time_text
                  }
                  selectedIndex={selectedIndex}
                  onPress={(value) => {
                    daysChange(value);
                  }}
                  selectedButtonStyle={{ backgroundColor: "#ea5504" }}
                  containerStyle={{ marginBottom: 5 }}
                />
              </ListItem.Content>
            </ListItem>
            <ListItem bottomDivider>
              <Icon
                type="material-community"
                name="clock-start"
                size={25}
                color="#3D4849"
                containerStyle={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              />
              <ListItem.Content>
                <ListItem.Title style={styles.imageUserNameTitleBlack}>
                  {i18n.t("e13")}
                </ListItem.Title>
                <ListItem.Subtitle>{i18n.t("e14")}</ListItem.Subtitle>
              </ListItem.Content>
            </ListItem>
            <ListItem
              containerStyle={{
                height: Platform.OS == "ios" ? 360 : 60,
                backgroundColor: "#fafbfc",
              }}
              bottomDivider
            >
              <ListItem.Content
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  height: 65,
                  marginBottom: 20,
                }}
              >
                {Platform.OS == "android" && (
                  <TouchableOpacity onPress={() => setShow(true)}>
                    <ListItem.Title
                      style={[
                        styles.imageUserNameTitleBlack,
                        {
                          marginTop: 20,
                          color: "#ea5504",
                          fontWeight: "bold",
                        },
                      ]}
                    >
                      {String(selectedDate)}
                    </ListItem.Title>
                  </TouchableOpacity>
                )}
                {Platform.OS == "android" ? (
                  show ? (
                    <DateTimePicker
                      testID="datePicker"
                      minuteInterval={interval}
                      locale={deviceLanguage}
                      maximumDate={maximumDate}
                      is24Hour={RNLocalize.uses24HourClock()}
                      timeZoneName={RNLocalize.getTimeZone()}
                      minimumDate={minimumDate}
                      value={selectedDate}
                      mode={MODE_VALUES[2]}
                      display={DISPLAY_VALUES[0]}
                      negativeButton={{ label: "Cancel", textColor: "red" }}
                      onChange={onChangeAndroid}
                    />
                  ) : clockShow ? (
                    <DateTimePicker
                      testID="timePicker"
                      locale={deviceLanguage}
                      timeZoneName={RNLocalize.getTimeZone()}
                      minuteInterval={interval}
                      maximumDate={timeDate}
                      is24Hour={RNLocalize.uses24HourClock()}
                      minimumDate={timeDate}
                      value={timeDate}
                      mode={MODE_VALUES[1]}
                      display={DISPLAY_VALUES[0]}
                      negativeButton={{ label: "Cancel", textColor: "red" }}
                      onChange={onChange}
                    />
                  ) : (
                    <></>
                  )
                ) : (
                  <DateTimePicker
                    testID="dateTimePicker"
                    locale={deviceLanguage}
                    is24Hour={RNLocalize.uses24HourClock()}
                    timeZoneName={RNLocalize.getTimeZone()}
                    minuteInterval={interval}
                    maximumDate={maximumDate}
                    minimumDate={minimumDate}
                    value={selectedDate}
                    mode={MODE_VALUES[2]}
                    display={DISPLAY_VALUES[3]}
                    onChange={onChangeIOS}
                  />
                )}
              </ListItem.Content>
            </ListItem>
          </View>
        </ScrollView>

        {/* Bottom Sheet Modal for Image Source Selection */}
        <BottomSheetModal
          ref={bottomSheetRef}
          index={0}
          snapPoints={snapPoints}
          backdropComponent={renderBackdrop}
          enablePanDownToClose
          keyboardBlurBehavior={"restore"}
          android_keyboardInputMode={"adjustPan"}
          enableDismissOnClose={true}
        >
          <BottomSheetView
            style={[StyleSheet.absoluteFill, { alignItems: "center" }]}
          >
            <Text>{i18n.t("Make a Selection")}</Text>
            <View
              style={{
    flexDirection: "row",
    justifyContent: "center", // Changed to center for better spacing
    alignItems: "center",
    marginTop: 15,
    gap: 50, // Use gap for spacing instead of fixed margins
              }}
            >
              <View
                style={{
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
                }}
              >
                <Icon
                  type="material-community"
                  size={40}
                  name="chip"
                  color={"#000"}
                  containerStyle={{
    height: 70,
    width: 70,
    alignContent: "center",
    justifyContent: "center",
    borderRadius: 35, // Half of height/width for perfect circle
    backgroundColor: "#f0f0f0", // Added a subtle background for icons
                  }}
                  onPress={() => {
                    handleDismissPress();
                    if (name.length < 1) {
                      setIsEditing(false);
                      setVerified(false);

                      Alert.alert(
                        i18n.t("e4"),
                        i18n.t("EventName"),
                        [
                          {
                            text: i18n.t("Close"),
                            onPress: () => console.log("Cancel Pressed"),
                            style: "destructive",
                          },
                        ],
                        { cancelable: false }
                      );
                    } else {
                      setVerified(true);
                      Alert.alert(
                        i18n.t("AI Image Generator"),
                        i18n.t("Note: AI Image"),
                        [
                          {
                            text: i18n.t("Cancel"),
                            onPress: () => console.log("Cancel Pressed"),
                            style: "destructive",
                          },
                          {
                            text: i18n.t("Continue"),
                            onPress: async () => {
                              const proTitle = constants.badWords.some((word) =>
                                dname.toLowerCase().includes(word.toLowerCase())
                              );
                              const title = constants.badWords.some((word) =>
                                name.toLowerCase().includes(word.toLowerCase())
                              );
                              if (proTitle || title) {
                                Alert.alert(
                                  i18n.t("BadWords"),
                                  i18n.t("BadWordsDescription"),
                                  [
                                    {
                                      text: i18n.t("Close"),
                                      onPress: () =>
                                        console.log("Cancel Pressed"),
                                      style: "destructive",
                                    },
                                  ],
                                  { cancelable: false }
                                );
                              } else {
                                setTimeout(() => {
                                  setIsAI(true);
                                  AITexttoImage();
                                }, 500);
                              }
                            },
                            style: "default",
                          },
                        ],
                        { cancelable: false }
                      );
                    }
                  }}
                />
                <Text
                  style={{
    textAlign: "center",
    marginTop: 10,
                  }}
                >
                  {i18n.t("AI")}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "column",
                  alignContent: "center",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon
                  type="material-community"
                  size={40}
                  name="image-outline"
                  color={"#000"}
                  containerStyle={{
    height: 70,
    width: 70,
    alignContent: "center",
    justifyContent: "center",
    borderRadius: 35, // Half of height/width for perfect circle
    backgroundColor: "#f0f0f0", // Added a subtle background for icons
                  }}
                  onPress={() => {
                    setTimeout(() => {
                      setIsAI(false);
                      pickImage();
                    }, 200);
                    handleDismissPress();
                  }}
                />
                <Text
                  style={{
    textAlign: "center",
    marginTop: 10,
                  }}
                >
                  {i18n.t("Gallery")}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "column",
                  alignContent: "center",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon
                  type="material-community"
                  size={40}
                  name="camera-outline"
                  color={"#000"}
                  containerStyle={{
    height: 70,
    width: 70,
    alignContent: "center",
    justifyContent: "center",
    borderRadius: 35, // Half of height/width for perfect circle
    backgroundColor: "#f0f0f0", // Added a subtle background for icons
                  }}
                  onPress={async () => {
                    if (
                      cameraStatus.status ==
                      ImagePicker.PermissionStatus.UNDETERMINED
                    ) {
                      await ImagePicker.requestCameraPermissionsAsync();
                    } else if (
                      cameraStatus.status == ImagePicker.PermissionStatus.DENIED
                    ) {
                      Alert.alert(
                        i18n.t("Permissions"),
                        i18n.t("UseCamera"),
                        [
                          {
                            text: i18n.t("Cancel"),
                            onPress: () => console.log("Cancel Pressed"),
                            style: "destructive",
                          },
                          {
                            text: i18n.t("Settings"),
                            onPress: () => {
                              Linking.openSettings();
                            },
                            style: "default",
                          },
                        ],
                        { cancelable: false }
                      );
                    } else {
                      setTimeout(() => {
                        setIsAI(false);

                        props.navigation.navigate("TempCameraPage", {
                          title: String(name),
                        });
                      }, 200);
                    handleDismissPress();
                    }
                  }}
                />
                <Text
                  style={{
    textAlign: "center",
    marginTop: 10,
                  }}
                >
                  {i18n.t("Camera")}
                </Text>
              </View>
            </View>
          </BottomSheetView>
        </BottomSheetModal>

        {/* Date and Time Pickers */}
        {show && (
          <DateTimePicker
            value={selectedDate}
            mode={Platform.OS == "ios" ? IOS_MODE.date : ANDROID_MODE.date}
            display={
              Platform.OS == "ios"
                ? IOS_DISPLAY.inline
                : ANDROID_DISPLAY.calendar
            }
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            onChange={Platform.OS == "ios" ? onChangeIOS : onChangeAndroid}
            locale={RNLocalize.getLocales()[0].languageTag} // Use device locale for picker
            neutralButton={{
              label: i18n.t("Clear"),
              AITexttoImage: i18n.t("Clear"),
            }} // iOS clear button
          />
        )}
        {clockShow && Platform.OS == "android" && (
          <DateTimePicker
            value={timeDate}
            mode={ANDROID_MODE.time}
            display={ANDROID_DISPLAY.spinner}
            onChange={onChange}
            is24Hour={true}
            locale={RNLocalize.getLocales()[0].languageTag}
          />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

// --- Additional Styles for the Bottom Sheet Modal ---
const modalStyles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  optionButton: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    alignItems: "center",
  },
  optionText: {
    fontSize: 18,
    color: "#333",
  },
});

// --- Main Styles (imported from SliderEntry.style, assuming these are global) ---
// Note: The original code imports `styles` from `../../styles/SliderEntry.style`.
// For clarity, if these styles were defined directly in this file, they would be here.
// Assuming `styles` contains common styles like `container`, `dividerStyle`, `imageUserNameTitleBlack`.
// If `SliderEntry.style` only contains `SliderEntry.style`, it's a naming conflict.
// It's better to name imported styles specifically, e.g., `sliderStyles` and local `componentStyles`.
// For now, I'll refer to them as `styles` as per the original.

export default CreateCamera;
