import React from "react";
import { StyleSheet, View, Text } from "react-native";
import * as i18n from "../../../../i18n";
import FastImage from "react-native-fast-image";
import { createImageProgress } from "react-native-image-progress";
const Image = createImageProgress(FastImage);

const ProfileHeader = ({ item }) => {
  // Destructure props for cleaner access
  // Assuming 'item' prop contains user details like avatar, isPro, name, motto, join, create, upload
  // If 'props' was originally passed, these would be:
  // const { avatar, isPro, name, motto, join, create, upload } = props;
  // It's better to pass specific user data directly rather than an 'item' object if not all of 'item' is used
  // For consistency with your AccountDetails/Profile.js which pass 'item', I'll keep it.
  const avatar = item?.user_avatar;
  const isPro = item?.isPro; // Assuming 'user_is_pro' is the correct field from user object
  const name = item?.user_handle;
  const motto = item?.user_motto;
  const join = item?.joined; // Placeholder, adjust to actual field names
  const create = item?.created; // Placeholder, adjust to actual field names
  const upload = item?.uploaded; // Placeholder, adjust to actual field names

  return (
    <View style={styles.container}>
      <View style={styles.upperContainer}>
        {/* Left Container: Avatar and Name */}
        <View style={styles.leftContainer}>
          <View
            style={[
              styles.avatarBorder,
              {
                borderBottomColor:
                  isPro == "1" ? "rgba(116, 198, 190, 1)" : "#ea5504",
                borderTopColor: isPro == "1" ? "#ea5504" : "#ea5504",
                borderRightColor:
                  isPro == "1" ? "rgba(250, 190, 0, 1)" : "#ea5504",
                borderLeftColor: isPro == "1" ? "#3D4849" : "#ea5504",
              },
            ]}
          >
            <Image
              style={styles.avatarImage}
              resizeMode={FastImage.resizeMode.cover}
              source={{
                cache: FastImage.cacheControl.immutable,
                priority: FastImage.priority.high,
                uri: avatar,
              }}
            />
          </View>

          {/* Removed absolute positioning for name to allow natural flow. */}
          {/* Consider truncating long names or adjusting font size based on length if needed. */}
          <Text style={styles.name}>{name ? name.toLowerCase() : ""}</Text>
        </View>

        {/* Right Container: Stats (Joined, Created, Uploaded) */}
        <View style={styles.statsContainer}>
          <View style={styles.singleStatContainer}>
            <Text style={styles.number}>{join}</Text>
            <Text style={styles.text}>{i18n.t("Joined")}</Text>
          </View>

          <View style={styles.singleStatContainer}>
            <Text style={styles.number}>{create}</Text>
            <Text style={styles.text}>{i18n.t("Created")}</Text>
          </View>

          <View style={styles.singleStatContainer}>
            <Text style={styles.number}>{upload}</Text>
            <Text style={styles.text}>{i18n.t("Uploaded")}</Text>
          </View>
        </View>
      </View>

      {/* Motto Section */}
      <View style={styles.mottoContainer}>
        <Text style={styles.mottoText}>{motto}</Text>
      </View>

      {/* Action Buttons (from Profile component, if passed as props to ProfileHeader) */}
      {/* If these buttons are meant to be part of the header, uncomment and use them */}
      {/* <View style={styles.actionButtonsContainer}>
        <TouchableOpacity onPress={_gotoStore} style={styles.actionButton}>
          <Text>{i18n.t("Go to Store")}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={_share} style={styles.actionButton}>
          <Text>{i18n.t("Share")}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={_gotoQRCode} style={styles.actionButton}>
          <Text>{i18n.t("Show QR")}</Text>
        </TouchableOpacity>
      </View> */}
    </View>
  );
};

const AVATAR_SIZE = 70;
const AVATAR_BORDER_WIDTH = 3;
const VERIFIED_BADGE_SIZE = 22;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    padding: 10,
    // flex: 1, // Removed flex: 1 as ProfileHeader is usually a fixed-height part of a larger screen
  },
  upperContainer: {
    flexDirection: "row",
    // Remove fixed width from here, let it adapt to content or use flex: 1 on children
    // width: SCREEN_WIDTH,
    alignItems: "flex-start", // Align items to the top
  },
  leftContainer: {
    flexDirection: "column",
    alignItems: "center",
    paddingRight: 10, // Add some padding to separate from stats
  },
  avatarBorder: {
    width: AVATAR_SIZE + AVATAR_BORDER_WIDTH * 2,
    height: AVATAR_SIZE + AVATAR_BORDER_WIDTH * 2,
    borderRadius: (AVATAR_SIZE + AVATAR_BORDER_WIDTH * 2) / 2,
    borderWidth: AVATAR_BORDER_WIDTH,
    justifyContent: "center",
    alignItems: "center",
    margin: 8, // Kept original margin
    overflow: "hidden", // Ensure border radius clips the image
  },
  avatarImage: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2, // Apply border radius here as well
    borderColor: "white", // Inner white border
    borderWidth: 2, // Inner white border width
    overflow: "hidden",
  },
  verifiedBadgeContainer: {
    position: "absolute",
    top: AVATAR_SIZE + AVATAR_BORDER_WIDTH * 2 - VERIFIED_BADGE_SIZE / 2 - 0, // Position relative to avatar bottom
    left: AVATAR_SIZE + AVATAR_BORDER_WIDTH * 2 - VERIFIED_BADGE_SIZE / 2 - 0, // Position relative to avatar right
    backgroundColor: "transparent",
    width: VERIFIED_BADGE_SIZE,
    height: VERIFIED_BADGE_SIZE,
    justifyContent: "center",
    alignItems: "center",
  },
  verifiedBadgeImage: {
    width: VERIFIED_BADGE_SIZE,
    height: VERIFIED_BADGE_SIZE,
    resizeMode: "contain", // Ensure image fits
  },
  name: {
    fontSize: 15,
    fontWeight: "500",
    color: "#3D4849",
    marginTop: 5, // Space below avatar
    maxWidth: AVATAR_SIZE + AVATAR_BORDER_WIDTH * 2 + 20, // Limit width, adjust as needed
    textAlign: "center", // Center name below avatar
  },
  statsContainer: {
    flex: 1, // Take remaining space
    flexDirection: "row",
    justifyContent: "space-around", // Distribute items evenly
    marginTop: 25,
    marginLeft: 10, // Add some left margin for separation
  },
  singleStatContainer: {
    alignItems: "center",
    paddingHorizontal: 5, // Reduce horizontal padding to fit more if needed
  },
  number: {
    color: "#3D4849",
    fontSize: 17,
    fontWeight: "700",
  },
  text: {
    color: "#3D4849",
    fontSize: 13, // Make text slightly smaller if needed
  },
  mottoContainer: {
    marginTop: 20, // Adjusted margin to be more dynamic
    paddingHorizontal: 10, // Add horizontal padding for text
  },
  mottoText: {
    fontSize: 15,
    color: "rgb(147, 147, 147)",
    textAlign: "left",
    lineHeight: 22, // Improve readability for longer mottos
  },
  // If you re-introduce action buttons, uncomment and style them:
  // actionButtonsContainer: {
  //   flexDirection: 'row',
  //   justifyContent: 'space-around',
  //   marginTop: 20,
  //   paddingHorizontal: 10,
  // },
  // actionButton: {
  //   paddingVertical: 8,
  //   paddingHorizontal: 15,
  //   borderRadius: 5,
  //   backgroundColor: '#eee',
  // },
});

export default ProfileHeader;
