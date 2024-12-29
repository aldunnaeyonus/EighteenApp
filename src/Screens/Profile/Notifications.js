import { ScrollView, View, Text } from "react-native";
import { ListItem, Switch } from "@rneui/themed";
import * as i18n from "../../../i18n";
import styles from "../../styles/SliderEntry.style";
import React, { useState, useCallback } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Icon } from "react-native-elements";
import { storage, updateStorage } from "../../context/components/Storage";
import { useMMKVObject } from "react-native-mmkv";
import { axiosPull } from "../../utils/axiosPull";
import { useFocusEffect } from "@react-navigation/native";
import NotifService from "../../../NotifService";

const Notifications = (props) => {
  const [user] = useMMKVObject("user.Data", storage);
  const [switch2, setSwitch2] = useState(
    (user.email_notification = "1" ? true : false)
  );
  const [switch4, setSwitch4] = useState(
    (user.mobile_notification = "1" ? true : false)
  );
  const notif = new NotifService();
  const [switch3, setSwitch3] = useState(
    (user.showAlert = "1" ? true : false)
  );
  const toggleSwitch2 = () => {
    setSwitch2(!switch2);
  };

  const toggleSwitch4 = () => {
    setSwitch4(!switch4);
  };

  const toggleSwitch3 = () => {
    setSwitch3(!switch3);
  };

  const _saveUserData = async () => {
    const data = {
      owner: user.user_id,
      email: switch4 ? "1" : "0",
      mobile: switch2 ? "1" : "0",
      showAlert: switch3 ? "1" : "0",
    };

    axiosPull.postData("/users/notifications.php", data);
    updateStorage(
      user,
      "mobile_notification",
      switch4 ? "1" : "0",
      "user.Data"
    );
    updateStorage(user, "email_notification", switch2 ? "1" : "0", "user.Data");
    updateStorage(user, "showAlert", switch3 ? "1" : "0", "user.Data");
    notif.localNotif("", i18n.t("AccountAvade"));
    axiosPull._pullUser(user.user_id);
  };

  useFocusEffect(
    useCallback(() => {
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
      props.navigation.setOptions({
        headerRight: () => (
          <Text
            style={{
              color: "#3D4849",
              marginRight: 10,
              fontSize: 15,
              fontWeight: "bold",
            }}
            onPress={() => {
              _saveUserData();
            }}
          >
            {i18n.t("Save")}
          </Text>
        ),
      });
    }, [props, switch2, switch4])
  );

  return (
    <SafeAreaProvider style={{ backgroundColor: "#fff" }}>
      <ScrollView
        style={{ backgroundColor: "#fff", marginBottom: 0 }}
        keyboardShouldPersistTaps={"never"}
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        <ListItem key="1">
          <Icon
            type="material-community"
            name="email-alert-outline"
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
              {i18n.t("Email Notifications")}
            </ListItem.Title>
            <ListItem.Subtitle>{i18n.t("MNE")}</ListItem.Subtitle>
          </ListItem.Content>
        </ListItem>

        <View style={[styles.dividerStyle]} />
        <ListItem
          containerStyle={{ height: 65, backgroundColor: "#fafbfc" }}
          key="2"
        >
          <ListItem.Content>
            <Switch
              style={{ alignSelf: "flex-end" }}
              value={switch2}
              onValueChange={(value) => toggleSwitch2(value)}
            />
          </ListItem.Content>
        </ListItem>
        <View style={[styles.dividerStyle]} />

        <ListItem key="3">
          <Icon
            type="entypo"
            name="notification"
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
              {i18n.t("Mobile Notifications")}
            </ListItem.Title>
            <ListItem.Subtitle>{i18n.t("MN")}</ListItem.Subtitle>
          </ListItem.Content>
        </ListItem>

        <View style={[styles.dividerStyle]} />
        <ListItem
          containerStyle={{ height: 65, backgroundColor: "#fafbfc" }}
          key="4"
        >
          <ListItem.Content>
            <Switch
              style={{ alignSelf: "flex-end" }}
              value={switch4}
              onValueChange={(value) => toggleSwitch4(value)}
            />
          </ListItem.Content>
        </ListItem>
        <View style={[styles.dividerStyle]} />
        <View style={[styles.dividerStyle]} />

<ListItem key="5">
  <Icon
    type="material-community"
    name="sticker-alert-outline"
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
      {i18n.t("UploadNotification")}
    </ListItem.Title>
    <ListItem.Subtitle>{i18n.t("UploadNotification2")}</ListItem.Subtitle>
  </ListItem.Content>
</ListItem>

<View style={[styles.dividerStyle]} />
<ListItem
  containerStyle={{ height: 65, backgroundColor: "#fafbfc" }}
  key="6"
>
  <ListItem.Content>
    <Switch
      style={{ alignSelf: "flex-end" }}
      value={switch3}
      onValueChange={(value) => toggleSwitch3(value)}
    />
  </ListItem.Content>
</ListItem>
<View style={[styles.dividerStyle]} />
      </ScrollView>
    </SafeAreaProvider>
  );
};
export default Notifications;
