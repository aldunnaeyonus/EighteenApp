import React, { useCallback, useEffect } from "react";
import { StyleSheet, View, Text, ScrollView } from "react-native";
import { ListItem, Icon } from "@rneui/themed";
import * as i18n from '../../../i18n';
import FastImage from "react-native-fast-image";
import { createImageProgress } from "react-native-image-progress";
const Image = createImageProgress(FastImage);
import { getLocales } from "expo-localization";
import { constants, SCREEN_WIDTH } from "../../utils/constants";
import moment from "moment/min/moment-with-locales";
import DeviceInfo from "react-native-device-info";
import { useFocusEffect } from "@react-navigation/native";

const About = (props) => {
  const deviceLanguage = getLocales()[0].languageCode;

  // Set moment locale once when the component mounts or language changes
  useEffect(() => {
    moment.locale(deviceLanguage);
  }, [deviceLanguage]);

  useFocusEffect(
    useCallback(() => {
      props.navigation.setOptions({
        headerTitle: i18n.t("About"),
      });
    }, [props.navigation]) // Dependency on props.navigation
  );

  const _gotoTerms = useCallback(() => {
    props.navigation.navigate("WebView", {
      url: constants.url + "/termsUsePolicy.html",
      name: i18n.t("Terms & Use"),
    });
  }, [props.navigation]);

  const _gotoPrivacy = useCallback(() => {
    props.navigation.navigate("WebView", {
      url: constants.url + "/privacyPolicy.html",
      name: i18n.t("Privacy Policy"),
    });
  }, [props.navigation]);

  const _gotoEULA = useCallback(() => {
    props.navigation.navigate("WebView", {
      url: constants.url + "/EULA.html",
      name: "EULA",
    });
  }, [props.navigation]);

  return (
    <ScrollView style={componentStyles.scrollView}>
      <View style={componentStyles.container}>
        <Image
          source={require("../../../assets/adaptive-icon.png")}
          style={componentStyles.logo}
          resizeMode={FastImage.resizeMode.contain}
        />
        <Text style={componentStyles.versionText}>
          {i18n.t("Version")}: {DeviceInfo.getVersion()}
        </Text>
      </View>

      <ListItem bottomDivider onPress={_gotoTerms}>
        <Icon type="material-community" name="book-open" color="grey" />
        <ListItem.Content>
          <ListItem.Title>{i18n.t("Terms & Use")}</ListItem.Title>
        </ListItem.Content>
        <ListItem.Chevron />
      </ListItem>

      <ListItem bottomDivider onPress={_gotoPrivacy}>
        <Icon type="material-community" name="shield-check" color="grey" />
        <ListItem.Content>
          <ListItem.Title>{i18n.t("Privacy Policy")}</ListItem.Title>
        </ListItem.Content>
        <ListItem.Chevron />
      </ListItem>

      <ListItem onPress={_gotoEULA}>
        <Icon type="material-community" name="file-document" color="grey" />
        <ListItem.Content>
          <ListItem.Title>{i18n.t("EULA")}</ListItem.Title>
        </ListItem.Content>
        <ListItem.Chevron />
      </ListItem>

      <View style={componentStyles.footer}>
        <Text style={componentStyles.footerText}>
          {i18n.t("All Rights Reserved")} &copy; {moment().format("YYYY")}{" "}
          {constants.companyName}
        </Text>
      </View>
    </ScrollView>
  );
};

const componentStyles = StyleSheet.create({
  scrollView: {
    backgroundColor: '#fff',
    flex: 1,
  },
  container: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: SCREEN_WIDTH * 0.5,
    height: 150,
    marginBottom: 10,
  },
  versionText: {
    fontSize: 16,
    color: 'grey',
    marginBottom: 20,
  },
  footer: {
    marginTop: 30,
    marginBottom: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: 'grey',
  },
  backButtonContainer: {
    padding: 7,
    height: 40,
    backgroundColor: "rgba(0, 0, 0, 0.60)",
    borderRadius: 20,
  },
});

export default About;