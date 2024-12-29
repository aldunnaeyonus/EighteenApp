import BackgroundService from "react-native-background-actions";
import axios from "axios";
import { axiosPull } from "../../utils/axiosPull";
import * as i18n from "../../../i18n";
import NotifService from "../../../NotifService";
import { Alert } from "react-native";
import { useMMKVObject } from "react-native-mmkv";
import { storage } from "../../context/components/Storage";

export const handleUpload = async (url, data, user, action, pin, name) => {
  const notif = new NotifService();
  const [users] = useMMKVObject("user.Data", storage);

  const options = {
    taskName: i18n.t("CraftingMemories"),
    taskTitle: i18n.t("Creating"),
    taskDesc: i18n.t("CreatingEvent"),
    linkingURI: "snapseighteenapp://home",
    taskIcon: {
      name: "ic_launcher",
      type: "mipmap",
    },
    color: "#ff00ff",
  };

  await BackgroundService.start(async () => {
    if (users.showAlert == "1"){
      Alert.alert(
        i18n.t("Read Me!"),
        i18n.t("alertReading")
      );
    }

    await axios({
      method: "POST",
      url: url,
      data: data,
      headers: {
        Accept: "application/json",
        "Content-Type": "multipart/form-data",
      },
    })
      .then(async function (response) {
        switch (action) {
          case "create":
            axiosPull._pullCameraFeed(user, "owner");
            await BackgroundService.stop();
            notif.localNotif("", i18n.t("Your event has been successfully created."));
            break;
          case "gallery":
            axiosPull._pullGalleryFeed(pin);
            axiosPull._pullFriendCameraFeed(name, "user", user);
            await BackgroundService.stop();
            notif.localNotif(
              "",
              i18n.t("Your media file(s) has been successfully uploaded.")
            );
            break;
          case "save":
            axiosPull._pullCameraFeed(user, "owner");
            notif.localNotif("", i18n.t("Your event has been successfully saved."));
            await BackgroundService.stop();
            break;
          case "camera":
            axiosPull._pullGalleryFeed(pin);
            axiosPull._pullFriendCameraFeed(name, "user", user);
            await BackgroundService.stop();
            notif.localNotif(
              "",
              i18n.t("Your media file(s) has been successfully uploaded.")
            );
            break;
          case "avatar":
            axiosPull._pullUser(user);
            await BackgroundService.stop();
            notif.localNotif(
              "",
              i18n.t("Your profile picture has been successfully updated.")
            );
            break;
          default:
            await BackgroundService.stop();
            break;
        }
      })
      .catch(async (error) => {
        notif.localNotif(
          "",
          error.message
        );
        await BackgroundService.stop();
      });
  }, options);
};

export const index = {
  handleUpload,
};
