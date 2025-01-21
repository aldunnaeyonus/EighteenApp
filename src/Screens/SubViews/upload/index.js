import BackgroundService from "react-native-background-actions";
import axios from "axios";
import { axiosPull } from "../../../utils/axiosPull";
import * as i18n from "../../../../i18n";
import { updateStorage } from "../../../context/components/Storage";
import { Alert } from "react-native";

export const handleUpload = async (
  url,
  data,
  user,
  action,
  pin,
  name,
  message,
  umageURI,
  storageData
) => {
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
  updateStorage(storageData, "message", message, "uploadData");
  updateStorage(storageData, "display", "flex", "uploadData");
  updateStorage(storageData, "image", umageURI, "uploadData");


  await BackgroundService.start(async () => {
    await axios({
      method: "POST",
      url: url,
      data: data,
      headers: {
        Accept: "application/json",
        "content-Type": "multipart/form-data",
      },
    })
      .then(async function (response) {
        console.log(response[0]);
        switch (action) {
          case "create":
            await axiosPull._pullCameraFeed(user, "owner");
            await BackgroundService.stop();
            break;
          case "gallery":
            await axiosPull._pullGalleryFeed(pin);
            await axiosPull._pullFriendCameraFeed(name, "user", user);
            await axiosPull._pullCameraFeed(user, "owner");
            await BackgroundService.stop();
            break;
          case "save":
            await axiosPull._pullCameraFeed(user, "owner");
            await BackgroundService.stop();
            break;
          case "camera":
            await axiosPull._pullGalleryFeed(pin);
            await axiosPull._pullFriendCameraFeed(name, "user", user);
            await axiosPull._pullCameraFeed(user, "owner");
            await BackgroundService.stop();
            break;
          case "avatar":
            await axiosPull._pullUser(user, "Upload");
            await BackgroundService.stop();
            break;
          default:
            await BackgroundService.stop();
            break;
        }
        updateStorage(storageData, "message", "", "uploadData");
        updateStorage(storageData, "display", "none", "uploadData");
        updateStorage(storageData, "image", "", "uploadData");
      })
      .catch(async (error) => {

        updateStorage(storageData, "message", "", "uploadData");
        updateStorage(storageData, "display", "none", "uploadData");
        updateStorage(storageData, "image", "", "uploadData");
        await BackgroundService.stop();
        Alert.alert(
          error,
          error.message,
          [
            {
              text: i18n.t("Cancel"),
              onPress: () => console.log("Cancel Pressed"),
              style: "destructive",
            },
            {
              text: i18n.t("Retry"),
              onPress: () => {
                handleUpload(
                  url,
                  data,
                  user,
                  action,
                  pin,
                  name,
                  message,
                  umageURI,
                  storageData
                );
              },
              style: "default",
            },
          ],
          { cancelable: false }
        );
      });
  }, options);
};
