import React, { useMemo } from "react";
import { StyleSheet, View, Text } from "react-native";
import { ListItem, Icon } from "@rneui/themed";
import * as i18n from '../../../i18n';
import FastImage from "react-native-fast-image";
import { createImageProgress } from "react-native-image-progress";
import moment from "moment/min/moment-with-locales";
import { getLocales } from 'expo-localization';
import { SCREEN_WIDTH } from "../../utils/constants";

const Image = createImageProgress(FastImage);

const AboutProfile = ({ route }) => {
  const { items } = route.params;
  const localLang = useMemo(() => getLocales()[0].languageCode, []);

  return (
    <View style={componentStyles.container}>
      <View style={componentStyles.leftContainer}>
        <View style={componentStyles.imageContainer}>
          <Image
            style={componentStyles.profileImage}
            source={{ uri: items.friend_avatar }}
          />
        </View>
        {items.friend_isPro == "1" && (
          <View style={componentStyles.verifiedBadgeContainer}>
            <View style={componentStyles.verifiedBadgeInner}>
              <FastImage
                style={componentStyles.verifiedBadgeImage}
                resizeMode={FastImage.resizeMode.contain}
                source={require("../../../assets/verified.png")}
              />
            </View>
          </View>
        )}
        <Text style={componentStyles.name}>{items.friend_handle}</Text>
      </View>
      <Text style={componentStyles.tooKeepText}>{i18n.t('TooKeep')}</Text>

      <ListItem containerStyle={componentStyles.listItem}>
        <Icon
          type="material-community"
          name="map-marker-account-outline"
          size={30}
          color="#3D4849"
          containerStyle={componentStyles.listItemIconContainer}
        />
        <ListItem.Content>
          <ListItem.Title>{i18n.t('Account Created from:')}</ListItem.Title>
          <ListItem.Subtitle>{items.friend_country}</ListItem.Subtitle>
        </ListItem.Content>
      </ListItem>

      <ListItem containerStyle={componentStyles.listItem}>
        <Icon
          type="fontisto"
          name="world-o"
          size={20}
          color="#3D4849"
          containerStyle={componentStyles.listItemIconContainer}
        />
        <ListItem.Content>
          <ListItem.Title>{i18n.t('Account Time Zone:')}</ListItem.Title>
          <ListItem.Subtitle>
            {items.friend_privacy == "1" ? i18n.t("Hidden") : items.friend_tz}
          </ListItem.Subtitle>
        </ListItem.Content>
      </ListItem>

      <ListItem containerStyle={componentStyles.listItem}>
        <Icon
          type="material-community"
          name="calendar-clock-outline"
          size={25}
          color="#3D4849"
          containerStyle={componentStyles.listItemIconContainer}
        />
        <ListItem.Content>
          <ListItem.Title>{i18n.t('Account Created:')}</ListItem.Title>
          <ListItem.Subtitle>
            {moment.unix(parseInt(items.friend_joined)).locale(localLang).format('LLL')}
          </ListItem.Subtitle>
        </ListItem.Content>
      </ListItem>
    </View>
  );
};

const componentStyles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: '100%',
    backgroundColor: "#fff",
  },
  leftContainer: {
    flexDirection: 'column',
    marginTop: 30,
    alignItems: 'center',
  },
  imageContainer: {
    margin: 8,
    borderWidth: 3,
    borderRadius: 38, // Adjusted for 70x70 image + 6 padding + 3 border
    borderColor: '#ea5504',
    width: 70 + 6, // 70 (image) + 6 (padding for border)
    height: 70 + 6, // 70 (image) + 6 (padding for border)
    justifyContent: 'center', // Center the image within the container
    alignItems: 'center', // Center the image within the container
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35, // Half of 70 for perfect circle
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'white',
  },
  verifiedBadgeContainer: {
    position: "absolute",
    marginTop: 63,
    marginLeft: 50,
  },
  verifiedBadgeInner: {
    backgroundColor: "transparent",
    width: 22,
    height: 22,
    justifyContent: "center",
  },
  verifiedBadgeImage: {
    marginLeft: 4,
    marginTop: 1,
    width: 22,
    height: 22,
  },
  name: {
    fontSize: 15,
    fontWeight: '500',
    color: '#3D4849',
    marginTop: 5, // Added margin for separation from image
  },
  tooKeepText: {
    textAlign: 'center',
    margin: 30,
    fontSize: 15,
    color: 'grey',
  },
  listItem: {
    paddingHorizontal: 50,
    paddingVertical: 20,
    backgroundColor: '#fff', // Ensure background is white
  },
  listItemIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default AboutProfile;