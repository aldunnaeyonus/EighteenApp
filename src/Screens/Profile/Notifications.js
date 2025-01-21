import { ScrollView, View, Text, TouchableOpacity } from "react-native";
import { ListItem, Switch } from "@rneui/themed";
import * as i18n from "../../../i18n";
import styles from "../../styles/SliderEntry.style";
import React, { useState, useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Icon } from "react-native-elements";
import { storage } from "../../context/components/Storage";
import { useMMKVObject } from "react-native-mmkv";
import { axiosPull } from "../../utils/axiosPull";
import { useIsFocused } from "@react-navigation/native";
import { ActivityIndicator } from "react-native-paper";

const Notifications = (props) => {
  const [user] = useMMKVObject("user.Data", storage);
  const [switch2, setSwitch2] = useState(user.email_notification == "1" ? true : false);
  const [switch4, setSwitch4] = useState(user.mobile_notification == "1" ? true : false);

  const toggleSwitch2 = () => {
    setSwitch2(!switch2);
  };

  const toggleSwitch4 = () => {
    setSwitch4(!switch4);
  };
  const isFocused = useIsFocused();


  const _saveUserData = async () => {
        props.navigation.setOptions({
          headerRight: () => (
            <ActivityIndicator color="black" size={"small"} animating={true} />
          ),
        });
    const data = {
      owner: user.user_id,
      email: switch2 ? "1" : "0",
      mobile: switch4 ? "1" : "0",
      showAlert: "1",
    };
   await axiosPull.postData("/users/notifications.php", data);
   await axiosPull._pullUser(user.user_id, "Notifications");
   props.navigation.goBack();
  };

  useEffect(() => {
    props.navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
        onPress={() => {
          _saveUserData();
        }}
      >
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
        </Text></TouchableOpacity>
      ),
    });
  }, [isFocused, switch2, switch3, switch4]);

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
              onValueChange={(value) => {toggleSwitch2(value)}}
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
              onValueChange={(value) => {toggleSwitch4(value)}}
            />
          </ListItem.Content>
        </ListItem>
        <View style={[styles.dividerStyle]} />
      </ScrollView>
    </SafeAreaProvider>
  );
};
export default Notifications;
