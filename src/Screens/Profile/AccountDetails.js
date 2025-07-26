import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { ListItem, Icon, Switch } from "@rneui/themed";
import React, { useState, useEffect, useCallback } from "react";
import { storage } from "../../context/components/Storage";
import { useMMKVObject } from "react-native-mmkv";
import { axiosPull } from "../../utils/axiosPull";
import { useIsFocused } from "@react-navigation/native";
import * as i18n from "../../../i18n";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AccountDetails = (props) => {
  const [user] = useMMKVObject("user.Data", storage); // Use setUser to update MMKV
  const [email, setEmail] = useState(user?.user_email || ""); // Initialize with empty string if user or user_email is null
  const [userMotto, setUserMotto] = useState(user?.user_motto || ""); // Renamed for clarity
  const [userHandle, setUserHandle] = useState(user?.user_handle || ""); // Renamed for clarity
  const isFocused = useIsFocused();
  const [switch4, setSwitch4] = useState(user.privacy == "1" ? true : false);
  const [switch5, setSwitch5] = useState(user.showActive == "1" ? true : false);
  const [switch6, setSwitch6] = useState(user.lefthanded == "1" ? true : false);

  const _pullFeed = useCallback(async () => {
    try {
      await axiosPull._pullUser(user?.user_id);
    } catch (error) {
      console.error("Error pulling user feed:", error);
    } finally {
    }
  }, [user?.user_id]);

  useEffect(() => {
    if (isFocused) {
      _pullFeed();
    }
  }, [isFocused, _pullFeed]);

  const updateMotto = useCallback(async () => {
    try {
      const data = {
          owner: user.user_id,
          email: email,
          handle: userHandle,
          motto: value,
          privacy: switch4 ? "1" : "0",
          showActive: switch5 ? "1" : "0",
          lefthanded: switch6 ? "1" : "0",
      };
      await axiosPull.postData("/users/save.php", data);
      await axiosPull._pullUser(user.user_id);
    } catch (error) {
      console.error("Error updating motto:", error);
    } finally {
    }
  }, [userMotto, user.user_id]);

  const updateEmail = useCallback(async () => {
    try {
      const data = {
          owner: user.user_id,
          email: value,
          handle: userHandle,
          motto: userMotto,
          privacy: switch4 ? "1" : "0",
          showActive: switch5 ? "1" : "0",
          lefthanded: switch6 ? "1" : "0",
      };
      await axiosPull.postData("/users/save.php", data);
      await axiosPull._pullUser(user.user_id);
    } catch (error) {
      console.error("Error updating email:", error);
    } finally {
    }
  }, [email, user.user_id]);

  const handleToggleSwitch = useCallback(
    async (value) => {
            setSwitch4(value);
      try {
        const data = {
          owner: user.user_id,
          email: email,
          handle: userHandle,
          motto: userMotto,
          privacy: value ? "1" : "0",
          showActive: switch5 ? "1" : "0",
          lefthanded: switch6 ? "1" : "0",
        };
        await axiosPull.postData("/users/save.php", data);
        await axiosPull._pullUser(user.user_id);
      } catch (error) {
        console.error("Error toggling privacy:", error);
      } finally {
      }
    },
    [user.user_id, switch4]
  );

  const handleToggleSwitch2 = useCallback(
    async (value) => {
      setSwitch5(value);
      try {
        const data = {
          owner: user.user_id,
          email: email,
          handle: userHandle,
          motto: userMotto,
          privacy: switch4 ? "1" : "0",
          showActive: value ? "1" : "0",
          lefthanded: switch6 ? "1" : "0",
        };
        await axiosPull.postData("/users/save.php", data);
        await axiosPull._pullUser(user.user_id);
      } catch (error) {
        console.error("Error toggling privacy:", error);
      } finally {
      }
    },
    [user.user_id, switch5]
  );

  const handleToggleSwitch3 = useCallback(
    async (value) => {
      setSwitch6(value);
      try {
        const data = {
          owner: user.user_id,
          email: email,
          handle: userHandle,
          motto: userMotto,
          privacy: switch4 ? "1" : "0",
          showActive: switch5 ? "1" : "0",
          lefthanded: value ? "1" : "0",
        };
        await axiosPull.postData("/users/save.php", data);
        await axiosPull._pullUser(user.user_id);
      } catch (error) {
        console.error("Error toggling privacy:", error);
      } finally {
      }
    },
    [user.user_id, switch6]
  );

  const changeHandle = useCallback(
    async (value) => {
      setUserHandle(value); // Update state immediately for responsive input
        const updateData = {
          owner: user.user_id,
          email: email,
          handle: value,
          motto: userMotto,
          privacy: switch4 ? "1" : "0",
          showActive: switch5 ? "1" : "0",
          lefthanded: value ? "1" : "0",
        };
        await axiosPull.postData("/users/save.php", updateData);
        await axiosPull._pullUser(user.user_id);
    },
    [user.user_id.userHandle]
  );

  const logout = useCallback(() => {
    const execute = async () => {
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
      await AsyncStorage.removeItem("UUID");
      await AsyncStorage.removeItem("logedIn");
      await AsyncStorage.removeItem("user_id");
    };
    execute();
    props.navigation.navigate("Begin");
  });

  const previewAction = useCallback(() => {
    const execute = async () => {
      await axios
        .post(
          constants.url + "/users/delete.php",
          {
            id: user.user_id,
          },
          { headers: { "Content-Type": "application/json;charset=utf-8" } }
        )
        .then((response) => {
          logout();
        })
        .catch((error) => {});
    };
    execute();
  }, [user.user_id, props.navigation]);

  const _deleteAccount = useCallback(() => {
    Alert.alert(
      i18n.t("Delete Account"),
      i18n.t("Are you sure you want to delete."),
      [
        {
          text: i18n.t("Cancel"),
          onPress: () => console.log("Cancel Pressed"),
          style: "default",
        },
        {
          text: i18n.t("Delete Account"),
          onPress: () => previewAction(),
          style: "destructive",
        },
      ],
      { cancelable: false }
    );
  }, [user.user_id, props.navigation]);

  return (
    <ScrollView style={componentStyles.scrollView}>
      <ListItem bottomDivider>
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
          <ListItem.Title style={componentStyles.imageUserNameTitleBlack}>
            {i18n.t("Random text under avatar")}
          </ListItem.Title>
          <ListItem.Subtitle>{i18n.t("Motto")}</ListItem.Subtitle>
        </ListItem.Content>
      </ListItem>

      <ListItem
        bottomDivider
        containerStyle={{ height: 65, backgroundColor: "#fafbfc" }}
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
            onChangeText={setUserMotto}
            defaultValue={userMotto}
            maxLength={100}
            onEndEditing={updateMotto}
            placeholder={i18n.t("I didnt get the memo")}
          ></ListItem.Input>
        </ListItem.Content>
      </ListItem>

      <ListItem bottomDivider>
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
          <ListItem.Title style={componentStyles.imageUserNameTitleBlack}>
            {i18n.t("Username/Handle")}
          </ListItem.Title>
          <ListItem.Subtitle>{i18n.t("A Username")}</ListItem.Subtitle>
        </ListItem.Content>
      </ListItem>
      <ListItem
        containerStyle={{ height: 65, backgroundColor: "#fafbfc" }}
        bottomDivider
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
            defaultValue={userHandle}
            maxLength={25}
            onChangeText={setUserHandle}
            onEndEditing={changeHandle}
            placeholder="SnapEighten"
          ></ListItem.Input>
        </ListItem.Content>
      </ListItem>
      <ListItem bottomDivider>
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
          <ListItem.Title style={componentStyles.imageUserNameTitleBlack}>
            {i18n.t("Email Address")}
          </ListItem.Title>
          <ListItem.Subtitle>
            {i18n.t("Email address is required")}
          </ListItem.Subtitle>
        </ListItem.Content>
      </ListItem>
      <ListItem
        borderColor="transparent"
        containerStyle={{ height: 65, backgroundColor: "#fafbfc" }}
        bottomDivider
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
            autoComplete="email"
            keyboardType="email-address"
            maxLength={32}
            onChangeText={setEmail}
            defaultValue={email}
            onEndEditing={updateEmail}
            placeholder="snap18@email.com"
          ></ListItem.Input>
        </ListItem.Content>
      </ListItem>

      <ListItem bottomDivider>
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
          <ListItem.Title style={componentStyles.imageUserNameTitleBlack}>
            {i18n.t("Privacy")}
          </ListItem.Title>
          <ListItem.Subtitle>{i18n.t("Hide")}</ListItem.Subtitle>
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
            onValueChange={handleToggleSwitch}
          />
        </ListItem.Content>
      </ListItem>

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
          <ListItem.Title style={componentStyles.imageUserNameTitleBlack}>
            {i18n.t("Show Active Member Events")}
          </ListItem.Title>
          <ListItem.Subtitle>
            {i18n.t("Show Active Member Events Description")}
          </ListItem.Subtitle>
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
            onValueChange={handleToggleSwitch2}
          />
        </ListItem.Content>
      </ListItem>
      <ListItem bottomDivider>
        <Icon
          type="material-community"
          name="hand-back-left-outline"
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
          <ListItem.Title style={componentStyles.imageUserNameTitleBlack}>
            {i18n.t("LeftHanded")}
          </ListItem.Title>
          <ListItem.Subtitle>{i18n.t("LeftHandedDesc")}</ListItem.Subtitle>
        </ListItem.Content>
      </ListItem>
      <ListItem
        containerStyle={{ height: 65, backgroundColor: "#fafbfc" }}
        bottomDivider
      >
        <ListItem.Content>
          <Switch
            style={{ alignSelf: "flex-end" }}
            value={switch6}
            onValueChange={handleToggleSwitch3}
          />
        </ListItem.Content>
      </ListItem>

      <TouchableOpacity onPress={_deleteAccount}>
        <ListItem bottomDivider style={{ marginBottom: 50 }}>
          <Icon type="material-community" name="delete-empty" color="red" />
          <ListItem.Content>
            <ListItem.Title style={componentStyles.deleteAccountText}>
              {i18n.t("Delete Account")}
            </ListItem.Title>
          </ListItem.Content>
          <ListItem.Chevron color="red" />
        </ListItem>
      </TouchableOpacity>
    </ScrollView>
  );
};

const componentStyles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    color: "#333",
  },
  textInput: {
    flex: 1,
    paddingVertical: 0, // Adjust as needed
    paddingLeft: 5,
    fontSize: 16,
    color: "#333",
  },
  handleStatusText: {
    fontSize: 12,
    color: "red",
    marginTop: 5,
  },
  deleteAccountText: {
    color: "red",
  },
  backButtonContainer: {
    padding: 7,
    height: 40,
    backgroundColor: "rgba(0, 0, 0, 0.60)",
    borderRadius: 20,
  },
});

export default AccountDetails;
