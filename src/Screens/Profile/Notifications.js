import {
  ScrollView,
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { ListItem, Switch, Icon } from "@rneui/themed";
import * as i18n from "../../../i18n";
import React, { useState, useCallback } from "react";
import { storage } from "../../context/components/Storage";
import { useMMKVObject } from "react-native-mmkv";
import { axiosPull } from "../../utils/axiosPull";
import { useFocusEffect } from "@react-navigation/native";

const Notifications = (props) => {
  const [user] = useMMKVObject("user.Data", storage); // Use setUser to update MMKV
    const [switch2, setSwitch2] = useState(user.email_notification == "1" ? true : false);

  const _pullUser = useCallback(async () => {
    try {
      await axiosPull._pullUser(user.user_id, "Notifications");
      // Re-fetch user data from storage after pull
    } catch (error) {
      console.error("Error pulling user data for notifications:", error);
    } finally {
    }
  }, [user.user_id]);

  const _setNotificationStatus = useCallback(
    async (value) => {
      setSwitch2(value)
      try {
        const data = {
          owner: user.user_id,
          email: value ? "1" : "0",
          mobile: value ? "1" : "0",
          showAlert: "1",
        };
        const response = await axiosPull.postData(
          "/users/notifications.php",
          data
        );
        if (response[0]?.message == "success") {
          await axiosPull._pullUser(user.user_id, "Notifications");
        } else {
        }
      } catch (error) {
        console.error("Error setting notification status:", error);
      } finally {
      }
    },
    [user?.user_id, switch2]
  );

  useFocusEffect(
    useCallback(() => {
      props.navigation.setOptions({
        headerTitle: i18n.t("Notifications"),
      });
      _pullUser(); // Fetch user data to get current notification setting
    }, [props.navigation, _pullUser])
  );


  return (
    <ScrollView style={componentStyles.scrollView}>
      <ListItem bottomDivider>
        <Icon type="material-community" name="bell-ring-outline" color="grey" />
        <ListItem.Content>
          <ListItem.Title>{i18n.t("Mobile Notifications")}</ListItem.Title>
          <ListItem.Subtitle>
            {i18n.t("MN")}
          </ListItem.Subtitle>
        </ListItem.Content>
        <Switch
          value={switch2} // Ensure value is boolean
          onValueChange={_setNotificationStatus}
        />
      </ListItem>
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
  backButtonContainer: {
    padding: 7,
    height: 40,
    backgroundColor: "rgba(0, 0, 0, 0.60)",
    borderRadius: 20,
  },
});

export default Notifications;
