import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import styles from "../../styles/SliderEntry.style";
import { ListItem, Icon, Switch } from "@rneui/themed";
import React, { useState, useEffect } from "react";
import { storage } from "../../context/components/Storage";
import { useMMKVObject } from "react-native-mmkv";
import { axiosPull } from "../../utils/axiosPull";
import { useIsFocused } from "@react-navigation/native";
import * as i18n from "../../../i18n";
import { ActivityIndicator } from "react-native-paper";

const AccountDetails = (props) => {
  const [user] = useMMKVObject("user.Data", storage);
  const [email, setEmail] = useState(user.user_email);
  const [motto, setMootto] = useState(user.user_motto);
  const [handle, setHandle] = useState(user.user_handle);
  const [switch4, setSwitch4] = useState((user.privacy == "1" ? true : false));
  const isFocused = useIsFocused();

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
          >
            {i18n.t("Save")}
          </Text></TouchableOpacity>
        ),
      });
    }, [
      isFocused,
      email,
      motto,
      handle,
      switch4,
    ]);

  const toggleSwitch4 = () => {
    setSwitch4(!switch4);
  };

  const _saveUserData = async () => {
    props.navigation.setOptions({
      headerRight: () => (
        <ActivityIndicator color="black" size={"small"} animating={true} />
      ),
    });
    const data = {
      owner: user.user_id,
      email: email,
      handle: handle,
      motto: motto,
      privacy: switch4 ? "1" : "0",
    };
    const response = await axiosPull.postData("/users/save.php", data);
    if (response[0].errorMessage == "logout") {
      await AsyncStorage.removeItem("UUID");
      await AsyncStorage.removeItem("logedIn");
      await AsyncStorage.removeItem("user_id");
      props.navigation.navigate("Begin");
    }
    await axiosPull._pullUser(user.user_id, "Account");
    props.navigation.goBack();
  };

  return (
    <ScrollView style={{ backgroundColor: "white" }}>
      <ListItem key="0">
        <Icon
          type="material-community"
          name="signature-text"
          size={20}
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
            {i18n.t("Random text under avatar")}
          </ListItem.Title>
          <ListItem.Subtitle>{i18n.t("Motto")}</ListItem.Subtitle>
        </ListItem.Content>
      </ListItem>
      <View style={[styles.dividerStyle]} />
      <ListItem
        containerStyle={{ height: 65, backgroundColor: "#fafbfc" }}
        key="1"
      >
        <ListItem.Content>
          <ListItem.Input
            key="21"
            style={{
              borderColor: "transparent",
              height: 55,
              fontSize: 20,
              borderWidth: 2,
              borderRadius: 10,
              paddingRight: 5,
            }}
            defaultValue={user.user_motto}
            maxLength={75}
            onChangeText={(text) => {
              setMootto(text);
            }}
            placeholder={i18n.t("I didnt get the memo")}
          ></ListItem.Input>
        </ListItem.Content>
      </ListItem>
      <View style={[styles.dividerStyle]} />

      <View style={styles.container}>
        <ListItem key="2">
          <Icon
            type="ionicon"
            name="at"
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
              {i18n.t("Username/Handle")}
            </ListItem.Title>
            <ListItem.Subtitle>{i18n.t("A Username")}</ListItem.Subtitle>
          </ListItem.Content>
        </ListItem>
        <View style={[styles.dividerStyle]} />
        <ListItem
          containerStyle={{ height: 65, backgroundColor: "#fafbfc" }}
          key="3"
        >
          <ListItem.Content>
            <ListItem.Input
              key="22"
              style={{
                borderColor: "transparent",
                height: 55,
                fontSize: 20,
                borderWidth: 2,
                borderRadius: 10,
                paddingRight: 5,
              }}
              defaultValue={user.user_handle}
              maxLength={25}
              onChangeText={(text) => {
                setHandle(text);
              }}
              placeholder="SnapEighten"
            ></ListItem.Input>
          </ListItem.Content>
        </ListItem>
        <View style={[styles.dividerStyle]} />
        <ListItem key="4">
          <Icon
            type="material-community"
            name="email-fast-outline"
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
              {i18n.t("Email Address")}
            </ListItem.Title>
            <ListItem.Subtitle>
              {i18n.t("Email address is required")}
            </ListItem.Subtitle>
          </ListItem.Content>
        </ListItem>
        <View style={[styles.dividerStyle]} />
        <ListItem
          borderColor='transparent'
          containerStyle={{ height: 65, backgroundColor: "#fafbfc" }}
          key="5"
        >
          <ListItem.Content>
            <ListItem.Input
              key="23"
              style={{
                borderColor: "transparent",
                height: 55,
                fontSize: 20,
                borderWidth: 2,
                borderRadius: 10,
                paddingRight: 5,
              }}
              defaultValue={user.user_email}
              autoComplete="email"
              keyboardType="email-address"
              maxLength={32}
              onChangeText={(text) => {
                setEmail(text);
              }}
              placeholder="snap18@email.com"
            ></ListItem.Input>
          </ListItem.Content>
        </ListItem>
        <View style={[styles.dividerStyle]} />
        <ListItem key="13">
          <Icon
            type="material"
            name="privacy-tip"
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
              {i18n.t("Privacy")}
            </ListItem.Title>
            <ListItem.Subtitle>{i18n.t("Hide")}</ListItem.Subtitle>
          </ListItem.Content>
        </ListItem>
        <View style={[styles.dividerStyle]} />
        <ListItem
          containerStyle={{ height: 65, backgroundColor: "#fafbfc" }}
          key="17"
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

        <View
          style={{
            flex: 1,
            margin: 20,
            width: "90%",
            alignItems: "center",
          }}
        >
          <Text style={{ textAlign: "center", color: "gray", fontSize:15 }}>
            {i18n.t("Email address changes")}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};
export default AccountDetails;
