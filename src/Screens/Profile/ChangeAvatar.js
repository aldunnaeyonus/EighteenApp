import React from "react";
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import EmptyStateView from "@tttstudios/react-native-empty-state";
import { constants } from "../../utils";
import { useMMKVObject } from "react-native-mmkv";
import * as ImagePicker from "expo-image-picker";
import FormData from "form-data";
import { storage } from "../../context/components/Storage";
import { handleUpload } from "../SubViews/upload";
import * as i18n from "../../../i18n";
import { ActivityIndicator } from "react-native-paper";
import FastImage from "react-native-fast-image";

const ChangeData = (props) => {
  const [user] = useMMKVObject("user.Data", storage);

  const [uploading] = useMMKVObject("uploadData", storage);

  const fetchCode = async (icon, types) => {
    props.navigation.setOptions({
      headerRight: () => (
        <ActivityIndicator color="black" size={"small"} animating={true} />
      ),
    });
    var formData = new FormData();
    formData.append("id", String(user.user_id));
    formData.append("type", String(types));
    formData.append("device", Platform.OS);
    if (types == "1") {
      formData.append(
        "avatar",
        String("SNAP18-avatar-" + user.user_id + "-" + icon.split("/").pop())
      );
      formData.append("file", {
        name: icon,
        type: constants.mimes(icon.split(".").pop()), // set MIME type
        uri: Platform.OS === "android" ? icon : icon.replace("file://", ""),
      });
    } else {
      formData.append("avatar", String(icon));
    }

    handleUpload(
      constants.url + "/avatars/fetch.php",
      formData,
      user.user_id,
      "avatar",
      "pin",
      "",
      i18n.t("ProfilePic") + " " + i18n.t("PleaseWait"),
      icon,
      uploading
    );
    props.navigation.goBack();
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });
    if (!result.canceled) {
      fetchCode(result.assets[0].uri, "1");
    }
  };
  return (
    <>
      <ScrollView style={{ backgroundColor: "white" }}>
        <TouchableOpacity
          key={"A1"}
          onPress={() => {
            setTimeout(() => {
              pickImage();
            }, 1000);
          }}
        >
          <EmptyStateView
            imageSource={{
              cache: FastImage.cacheControl.immutable,
              priority: FastImage.priority.high,
              uri: user.user_avatar,
            }}
            imageStyle={styles.imageStyle}
            headerText={i18n.t("Choose an avatar")}
            headerTextStyle={styles.headerTextStyle}
          />
        </TouchableOpacity>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  imageStyle: {
    marginTop: 10,
    height: 250,
    width: 250,
    borderRadius: 125,
    overflow: "hidden",
    resizeMode: "contain",
  },
  headerTextStyle: {
    color: "rgb(76, 76, 76)",
    fontSize: 15,
    textAlign: "center",
    margin: 20,
  },
  subHeaderTextStyle: {
    fontSize: 12,
    color: "rgb(147, 147, 147)",
    paddingHorizontal: 60,
    textAlign: "center",
    marginVertical: 10,
  },
  destinationsView: {
    justifyContent: "center",
    backgroundColor: "#fff",
    borderTopRightRadius: 40,
    borderTopLeftRadius: 40,
    color: "#5A5A5A",
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    flex: 1,
  },
  gridContainer: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 10,
    marginBottom: 20,
    backgroundColor: "#fff",
    borderTopRightRadius: 50,
    borderTopLeftRadius: 50,
    color: "#ace5fd",
    width: "100%",
    borderWidth: 1,
    borderColor: "#d3d3d3",
    shadowColor: "#000000",
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 7,
    shadowOffset: {
      height: 5,
      width: 1,
    },
  },
  gridButtonContainer: {
    flexBasis: "25%",
    marginTop: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  gridButton: {
    width: 80,
    height: 80,
    backgroundColor: "#f2f2f2",
    borderRadius: 40,
    margin: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  gridIcon: {
    fontSize: 30,
    color: "white",
  },
  gridLabel: {
    fontSize: 14,
    paddingTop: 10,
    color: "#333",
  },
});

export default ChangeData;
