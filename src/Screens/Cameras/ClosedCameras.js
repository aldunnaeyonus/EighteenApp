import { StyleSheet, Text, View, Alert, Linking, Platform } from "react-native";
import React, { useState, useCallback } from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome"; // Icon library
import EmptyStateView from "@tttstudios/react-native-empty-state"; // Component for displaying empty states
import moment from "moment/min/moment-with-locales"; // Date and time formatting
import FastImage from "react-native-fast-image"; // Optimized image loading
import { createImageProgress } from "react-native-image-progress"; // Image loading with progress indicator
const Image = createImageProgress(FastImage); // Combined FastImage with progress
import Progress from "react-native-progress"; // Progress bar component
import { Icon } from "@rneui/themed"; // Icon component from @rneui/themed
import { storage } from "../../context/components/Storage"; // Custom MMKV storage instance
import { useMMKVObject } from "react-native-mmkv"; // Hook for MMKV (fast key-value storage)
import { axiosPull } from "../../utils/axiosPull"; // Utility for API calls
import { useFocusEffect } from "@react-navigation/native"; // Hook to run effects when screen is focused
import * as i18n from "../../../i18n"; // Internationalization utilities
import { ActivityIndicator } from "react-native-paper"; // Loading indicator
import { MenuView } from "@react-native-menu/menu"; // Context menu for iOS and Android
import { constants, SCREEN_WIDTH, SCREEN_HEIGHT } from "../../utils/constants"; // Application constants
import { CameraRoll } from "@react-native-camera-roll/camera-roll"; // Access device's camera roll/gallery
import * as FileSystem from "expo-file-system"; // File system utilities from Expo
import Animated from "react-native-reanimated"; // Reanimated for animations (used with FlatList)
import { getLocales } from "expo-localization"; // Get device locales
import * as ImagePicker from "expo-image-picker"; // Image/media picker for permissions

/**
 * ClosedCameras Component
 * Displays a list of historical (closed) camera events, allowing users to
 * view media, download event files, or delete events.
 */
const ClosedCameras = (props) => {
  // State for storing the filtered data source of media events from MMKV storage.
  // This data represents the "closed cameras" or past events.
  const [filteredDataSource, setFilteredDataSource] = useMMKVObject(
    "user.Media.Feed",
    storage
  ); // Make `setFilteredDataSource` available if needed for local updates

  // State to control the refreshing indicator for pull-to-refresh.
  const [refreshing, setRefreshing] = useState(false);

  // State to disable UI interactions during sensitive operations (e.g., deletion).
  const [disable, setDisable] = useState(false);

  // State to indicate if a download process is currently active.
  const [startDownload, setStartDownload] = useState(false);

  // State to track the number of files being downloaded.
  const [count, setCount] = useState(0);

  // User data retrieved from MMKV storage.
  const [user] = useMMKVObject("user.Data", storage);

  // Create an Animated FlatList component for performance and potential animations.
  const AnimatedFlatList = Animated.createAnimatedComponent(Animated.FlatList);

  // Get the current device's primary language code for localization.
  const [localLang] = useState(getLocales()[0].languageCode);

  // Hook to get and manage media library permissions.
  const [cameraStatus, requestPermission] =
    ImagePicker.useMediaLibraryPermissions();

  /**
   * Handles the pull-to-refresh action.
   * Fetches updated historical feed data from the server.
   */
  const _refresh = async () => {
    setRefreshing(true); // Activate refreshing indicator
    await axiosPull._pullHistoryFeed(user.user_id); // Fetch latest data
    setTimeout(() => {
      setRefreshing(false); // Deactivate refreshing indicator after a delay
    }, 1500);
  };

  /**
   * Handles the download action for a given array of media files.
   * Requests media library permissions if not granted, then downloads and saves files.
   * @param {string} array - A JSON string representing an array of file objects to download.
   */
  const handleDownloadAction = async (array) => {
    // Check and request media library permissions
    if (cameraStatus.status == ImagePicker.PermissionStatus.UNDETERMINED) {
      const permissionResponse = await requestPermission();
      if (!permissionResponse.granted) {
        Alert.alert(
          i18n.t("Permissions"),
          i18n.t("UseLibraryPermissionNeeded")
        );
        return;
      }
    } else if (cameraStatus.status == ImagePicker.PermissionStatus.DENIED) {
      Alert.alert(
        i18n.t("Permissions"),
        i18n.t("UseLibrary"),
        [
          {
            text: i18n.t("Cancel"),
            onPress: () => console.log("Download cancelled by user."),
            style: "destructive",
          },
          {
            text: i18n.t("Settings"),
            onPress: () => {
              Linking.openSettings(); // Open app settings to allow user to grant permission
            },
            style: "default",
          },
        ],
        { cancelable: false }
      );
      return; // Stop execution if permission is denied
    }

    // If permissions are granted, proceed with download
    Alert.alert(
      i18n.t("DownloadingEventFiles"),
      i18n.t("TheventfilesMessage")
    ); // Inform user about download start
    setStartDownload(true); // Show download activity indicator

    const filesToDownload = JSON.parse(array);
    setCount(filesToDownload.length); // Initialize count of pending downloads

    filesToDownload.map(async (item) => {
      try {
        const { uri } = await FileSystem.downloadAsync(
          item.file_name,
          FileSystem.documentDirectory + item.file_name.split("/").pop() // Save to app's document directory
        );
        await CameraRoll.saveAsset(uri, { type: "photo" }); // Save to device's camera roll (assuming photos)
        setCount((prevCount) => prevCount - 1); // Decrement count on success
        await FileSystem.deleteAsync(uri); // Delete temporary file from document directory
      } catch (error) {
        setStartDownload(false); // Stop download indicator on error
        console.error("Error downloading or saving file:", error.message);
        Alert.alert(i18n.t("DownloadFailed"), i18n.t("TryAgainLater"));
      }
    });

    // Reset download state once all files are processed or if count drops to zero prematurely
    // This check is slightly problematic as setCount is async, better to use a collective state
    // For now, keep it as is, but consider a more robust download manager if complexity increases.
    if (count <= 0) {
      setStartDownload(false);
    }
  };

  /**
   * Placeholder for deleting a feed item locally by UUID.
   * The commented-out code suggests this was intended to modify `filteredDataSource` directly.
   * Currently, local state manipulation for deletion is commented out and relies on API refresh.
   * @param {string} UUID - The unique ID of the item to delete.
   */
  const _deleteFeedItemIndex = (UUID) => {
    // This function is currently not used or fully implemented as per the original code.
    // It would be used to remove an item from `filteredDataSource` immediately after deletion
    // request, for a more responsive UI, before the full data refresh.
    /*
    filteredDataSource.forEach((res, index) => {
      if (res.UUID == UUID) {
        setFilteredDataSource((prevState) => {
          prevState.splice(index, 1);
          storage.set("user.Media.Feed", JSON.stringify(prevState));
          return [...prevState];
        });
      }
    });
    */
  };

  /**
   * Prompts the user with an alert before deleting an event.
   * If confirmed, it triggers the actual deletion process.
   * @param {string} UUID - The unique ID of the event to delete.
   * @param {string} owner - The owner ID of the event.
   * @param {string} pin - The PIN of the event.
   */
  const _deleteFeedItem = (UUID, owner, pin) => {
    Alert.alert(
      i18n.t("Delete Event"),
      i18n.t("All data will be lost"),
      [
        {
          text: i18n.t("Cancel"),
          onPress: () => console.log("Delete event cancelled."),
          style: "default",
        },
        {
          text: i18n.t("Delete Event"),
          onPress: () => {
            // Show a loading indicator in the navigation header
            props.navigation.setOptions({
              headerRight: () => (
                <ActivityIndicator
                  color="black"
                  size="small"
                  animating={true}
                />
              ),
            });
            // Delay the actual deletion to allow UI update
            setTimeout(() => {
              _deleteFeedItemSource(UUID, owner, pin);
            }, 500);
          },
          style: "destructive", // Emphasize that this is a destructive action
        },
      ],
      { cancelable: false } // Force user to choose an option
    );
  };

  /**
   * Performs the actual API call to delete an event from the server.
   * After successful deletion, it refreshes the history feed.
   * @param {string} UUID - The unique ID of the event to delete.
   * @param {string} owner - The owner ID of the event.
   * @param {string} pin - The PIN of the event.
   */
  const _deleteFeedItemSource = async (UUID, owner, pin) => {
    setDisable(true); // Disable UI interactions during deletion
    const data = {
      owner: owner,
      pin: pin,
      id: UUID,
    };
    try {
      await axiosPull.postData("/camera/delete.php", data); // API call to delete
      await axiosPull._pullHistoryFeed(user.user_id); // Refresh data after deletion
    } catch (error) {
      console.error("Error deleting event:", error);
      Alert.alert(i18n.t("DeleteFailed"), i18n.t("TryAgainLater"));
    } finally {
      setDisable(false); // Re-enable UI interactions
      // Remove loading indicator from navigation header
      props.navigation.setOptions({
        headerRight: () => <></>,
      });
    }
  };

  /**
   * `useFocusEffect` hook to manage data refreshing when the screen is focused.
   * It sets up an interval to periodically pull history feed data and
   * fetches data immediately on focus.
   */
  useFocusEffect(
    useCallback(() => {
      // Set up an interval to refresh the history feed every 60 seconds
      const timeout = setInterval(async () => {
        await axiosPull._pullHistoryFeed(user.user_id);
      }, 60000); // 60 seconds

      // Fetch data immediately when the screen comes into focus
      const fetchData = async () => {
        await axiosPull._pullHistoryFeed(user.user_id);
      };
      fetchData();

      // Cleanup function: Clear the interval when the screen blurs or component unmounts
      return () => {
        clearInterval(timeout);
      };
      // Dependencies: Re-run effect if these states change (though typically not needed for intervals)
    }, [filteredDataSource, refreshing, disable, count]) // Consider carefully which dependencies are truly needed
  );

  /**
   * Navigates to the MediaGallery screen to view photos of a specific event.
   * Also triggers an API call to refresh camera feed data.
   * @param {string} pin - The PIN of the event.
   * @param {string} title - The title of the event.
   * @param {string} owner - The owner ID of the event.
   * @param {string} UUID - The unique ID of the event.
   * @param {number} end - The end timestamp of the event.
   * @param {number} start - The start timestamp of the event.
   * @param {number} credits - Credits associated with the event.
   * @param {boolean} camera_add_social - Social media integration flag.
   * @param {string} illustration - URL of the event's illustration image.
   */
  const viewPhotos = async (
    pin,
    title,
    owner,
    UUID,
    end,
    start,
    credits,
    camera_add_social,
    illustration
  ) => {
    props.navigation.navigate("MediaGallery", {
      pin: pin,
      title: title,
      owner: owner,
      user: user.user_id,
      UUID: UUID,
      avatar: user.user_avatar,
      handle: user.user_handle,
      end: end,
      start: start,
      credits: credits,
      camera_add_social: camera_add_social,
      illustration: illustration,
      type: "owner", // Indicate the type of gallery view (owner's photos)
    });
    // Refresh camera feed after navigating, potentially for live updates on another screen.
    await axiosPull._pullCameraFeed(user.user_id, "owner");
  };

  /**
   * Handles the "Download" action, which initiates a server-side compression
   * of event media files before client-side download.
   * @param {string} pin - The PIN of the event.
   * @param {string} UUID - The unique ID of the event.
   * @param {string} title - The title of the event.
   */
  const actionFeed = async (pin, UUID, title) => {
    setDisable(true); // Disable UI during this operation
    const data = {
      owner: user.user_id,
      pin: pin,
      id: UUID,
      name: title,
      locale: localLang,
    };
    Alert.alert("", i18n.t("j11")); // Inform user about compression process
    try {
      await axiosPull.postData("/camera/compress.php", data); // API call to compress files
      await axiosPull._pullHistoryFeed(user.user_id); // Refresh history feed after compression request
    } catch (error) {
      console.error("Error compressing files:", error);
      Alert.alert(i18n.t("CompressionFailed"), i18n.t("TryAgainLater"));
    } finally {
      setDisable(false); // Re-enable UI
    }
  };

  /**
   * Renders a single item in the FlatList.
   * Displays event details, an image, and a context menu for actions.
   * @param {object} item - The data object for a single camera event.
   */
  const Item = ({ item }) => {
    // Clear related cached data from MMKV storage for this event's PIN
    storage.delete(`user.Gallery.Friend.Feed.${item.pin}`);
    storage.delete(`user.Member.Join.Feed.${item.pin}`);

    return (
      <View key={item.UUID} style={styles.listItem}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View style={styles.imageUserNameContainer}></View>
          <Image
            key={item.illustration}
            source={{
              uri: item.illustration,
              cache: FastImage.cacheControl.immutable, // Cache the image immutably
              priority: FastImage.priority.high, // High loading priority
            }}
            indicator={Progress} // Show progress indicator during loading
            resizeMode={FastImage.resizeMode.cover}
            style={{
              height: 70,
              width: 100,
              backgroundColor: "#f2f2f2",
              overflow: "hidden",
              borderRadius: 6,
            }}
          />
        </View>
        <View
          style={{
            alignItems: "flex-start",
            marginStart: 15,
            flex: 1,
            marginTop: 0,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-start",
              width: SCREEN_WIDTH, // Consider adjusting this width based on parent
            }}
          >
            <FontAwesome
              name="camera-retro"
              size={12}
              style={styles.whiteIcon2}
            />
            <Text
              style={{
                fontWeight: "bold",
                marginTop: 5,
              }}
            >
              {item.title.toUpperCase()}
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-start",
              width: SCREEN_WIDTH, // Consider adjusting this width based on parent
            }}
          >
            <FontAwesome
              name="calendar-times-o"
              size={12}
              style={styles.whiteIcon2}
            />
            <Text style={{ marginTop: 5 }}>
              {i18n.t("Ended:")}{" "}
              {moment.unix(item.end).locale(localLang).format("LLL")}
            </Text>
          </View>

          <View
            style={{
              height: "auto",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-start",
              width: SCREEN_WIDTH - 150, // Adjust width to prevent overflow
            }}
          >
            <Text
              style={{
                color: "#3D4849",
                // numberOfLines: 2, // This prop is for Text component directly, not style
                height: "auto",
                fontSize: 13,
              }}
              numberOfLines={2} // Apply numberOfLines here
            >
              {i18n.t("Media:")} {item.media_count} | {i18n.t("Claim by")}{" "}
              {moment
                .unix(item.end)
                .locale(localLang)
                .add(user.isPro ? 3 : 1, "M") // Pro users get 3 months, others 1 month
                .format("LLL")}
            </Text>
          </View>
        </View>
        {startDownload ? (
          // Show activity indicator if download is in progress
          <ActivityIndicator
            color="black"
            size="small"
            style={{ marginTop: -50 }} // Adjust position
            animating={startDownload}
            hidesWhenStopped={true}
          />
        ) : (
          // Display a menu icon that opens a context menu for actions
          <MenuView
            key={item.UUID}
            title={item.title.toUpperCase()}
            isAnchoredToRight={true}
            onPressAction={async ({ nativeEvent }) => {
              // Handle different menu actions based on event ID
              if (nativeEvent.event == "Delete-" + item.UUID) {
                _deleteFeedItem(item.UUID, item.owner, item.pin);
              } else if (nativeEvent.event == "Download-" + item.UUID) {
                // This 'Download' action initiates server-side compression
                actionFeed(item.pin, item.UUID, item.title);
              } else if (nativeEvent.event == "PhotoViewer-" + item.UUID) {
                viewPhotos(
                  item.pin,
                  item.title,
                  item.owner,
                  item.UUID,
                  item.end,
                  item.start,
                  item.credits,
                  item.camera_add_social,
                  item.illustration
                );
              } else if (nativeEvent.event == "Save-" + item.UUID) {
                // This 'Save' action initiates client-side download of all media
                const array = await axiosPull._pullGalleryArray(item.pin); // Fetch gallery URLs
                setCount(parseInt(JSON.parse(array).length)); // Set count for progress tracking
                handleDownloadAction(array);
              }
            }}
            // Dynamically provide actions based on user's Pro status
            actions={
              user.isPro == "1"
                ? constants.historyActionsPro(item.UUID)
                : constants.historyActions(item.UUID)
            }
            shouldOpenOnLongPress={false} // Menu opens on short press
            themeVariant="light" // Always use light theme for the menu
          >
            <Icon
              containerStyle={{
                alignSelf: "center",
                marginRight: 0,
                marginTop: 0,
                color: "#3D4849",
              }}
              type="material-community"
              size={25}
              name="menu"
              color="#3D4849"
            />
          </MenuView>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <AnimatedFlatList
        refreshing={refreshing} // Bind refreshing state
        onRefresh={_refresh} // Bind refresh handler
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
        bounces={true} // Allow bounce effect for scrolling
        style={{ flex: 1, height: SCREEN_HEIGHT, width: SCREEN_WIDTH }}
        extraData={filteredDataSource} // Essential for FlatList to re-render when data changes
        ListEmptyComponent={
          // Component to display when the list is empty
          <View style={styles.empty}>
            {/* Fake items for empty state illustration */}
            <View style={styles.fake}>
              <View style={styles.fakeSquare} />
              <View>
                <View style={styles.fakeLine} />
                <View style={styles.fakeLine} />
              </View>
            </View>
            <EmptyStateView
              headerText={i18n.t("Download Media")}
              subHeaderText={i18n.t("Ended")}
              headerTextStyle={styles.headerTextStyle}
              subHeaderTextStyle={styles.subHeaderTextStyle}
            />
          </View>
        }
        data={filteredDataSource} // The data to render in the list
        keyExtractor={(item) => item.UUID} // Unique key for each item
        renderItem={Item} // Function to render each item
        ListFooterComponent={
          // Component displayed at the end of the list
          <View
            style={{
              flex: 1,
              marginTop: 0,
              width: SCREEN_WIDTH,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                padding: 20,
                fontSize: 15,
                textAlign: "center",
                color: "grey",
              }}
            >
              {/* Display text indicating how long media is available based on Pro status */}
              {user.isPro == "1"
                ? i18n.t("After 90 days")
                : i18n.t("After 30 days")}
            </Text>
          </View>
        }
      />
    </View>
  );
};

// --- StyleSheet for component styling ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  headerTextStyle: {
    color: "rgb(76, 76, 76)",
    fontSize: 18,
    marginVertical: 10,
  },
  imageStyle: {
    marginTop: 0,
    height: 300,
    width: 300,
    resizeMode: "contain",
  },
  subHeaderTextStyle: {
    fontSize: 15,
    color: "rgb(147, 147, 147)",
    paddingHorizontal: 15,
    textAlign: "center",
    marginVertical: 10,
  },
  textInputStyle: {
    height: 50,
    borderWidth: 1,
    paddingLeft: 20,
    width: "90%",
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 30,
    borderColor: "#dedede",
    borderRadius: 45,
    backgroundColor: "#FFFFFF",
    fontSize: 24,
  },
  whiteIcon2: {
    marginTop: 3,
    paddingRight: 5,
    color: "#000",
    justifyContent: "center",
  },
  whiteIcon: {
    paddingRight: 5,
    color: "#fff",
    justifyContent: "center",
  },
  listItem: {
    margin: 1,
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#FFF",
    borderBottomWidth: 0.5,
    borderColor: "#D3D3D3",
    width: SCREEN_WIDTH,
    flex: 1,
    alignSelf: "center",
    flexDirection: "row",
  },
  moreIcon: {
    marginLeft: -5,
    justifyContent: "center",
  },
  /** Styles for the empty state illustration */
  fake: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    opacity: 0.4,
  },
  fakeSquare: {
    width: 75,
    height: 75,
    margin: 10,
    backgroundColor: "#e8e9ed",
    borderRadius: 0,
  },
  fakeLine: {
    width: 200,
    height: 15,
    borderRadius: 4,
    backgroundColor: "#e8e9ed",
    marginBottom: 8,
  },
  empty: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 50,
  },
});

export default ClosedCameras;