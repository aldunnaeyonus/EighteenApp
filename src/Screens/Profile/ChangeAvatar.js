import React, {useState, useEffect} from "react";
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  View,
  Alert,
  Linking
} from "react-native";
import EmptyStateView from "@tttstudios/react-native-empty-state";
import { constants, SCREEN_WIDTH } from "../../utils/constants";
import { useMMKVObject } from "react-native-mmkv";
import * as ImagePicker from "expo-image-picker";
import FormData from "form-data";
import { storage, updateStorage } from "../../context/components/Storage";
import * as i18n from "../../../i18n";
import { ActivityIndicator } from "react-native-paper";
import FastImage from "react-native-fast-image";
import { createImageProgress } from "react-native-image-progress";
const Image = createImageProgress(FastImage);
import Progress from "react-native-progress";
import axios from "axios";
import { axiosPull } from "../../utils/axiosPull";

const ChangeData = (props) => {
  const [user] = useMMKVObject("user.Data", storage);
  const [cameraStatus] = ImagePicker.useMediaLibraryPermissions()
  const [avatars, setAvatars] = useState([]);

  const pullData=async ()=> {
    await axiosPull._pullUser(user.user_id, "Profile");

  }

  useEffect(() => {
    pullData();
      const fetchData = async () => {
        fetch(constants.url + "/avatars/avatars.json")
          .then((response) => response.json())
          .then((jsonData) => {
            setAvatars(jsonData);
          })
          .catch((error) => {});
      };
      fetchData();
    }, [avatars]);

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
    } else{
      formData.append("avatar", String(icon));
    }

  const postConclusion = async () => {
    await axios({
      method: "POST",
      url: constants.url + "/avatars/fetch.php",
      data: formData,
       onUploadProgress: progressEvent => {
        let {loaded, total} = progressEvent;
        console.log((loaded / total) * 100)
    },
      headers: {
        Accept: "application/json",
        "content-Type": "multipart/form-data",
      },
    }).then(async (res) => {
      updateStorage(user, 'user_avatar', (types == "1") ? String("SNAP18-avatar-" + user.user_id + "-" + icon.split("/").pop()) : icon, 'user.Data')
      props.navigation.setOptions({
        headerRight: () => (
         <></>
        ),
      });
      await axiosPull._pullUser(user.user_id, "Upload");
    });
  }
  postConclusion();
/*

      handleUpload(
        constants.url + "/avatars/fetch.php",
        formData,
        user.user_id,
        "avatar",
        "pin",
        "",
        i18n.t("ProfilePic") + " " + i18n.t("PleaseWait"),
        types == "1" ? icon : constants.url+"/avatars/"+icon,
        uploading
      );
    */
  };

  const pickImage = async () => {
      if (cameraStatus.status == ImagePicker.PermissionStatus.UNDETERMINED) {
          await ImagePicker.getMediaLibraryPermissionsAsync();
        }else if (cameraStatus.status == ImagePicker.PermissionStatus.DENIED) {
      Alert.alert(
      i18n.t("Permissions"),
      i18n.t("UseLibrary"),
      [
        {
          text: i18n.t("Cancel"),
          onPress: () => console.log("Cancel Pressed"),
          style: "destructive",
        },
        {
          text: i18n.t("Settings"),
          onPress: () => {
            Linking.openSettings();
          },
          style: "default",
        },
      ],
      { cancelable: false }
    )
        }else{
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });
    if (!result.canceled) {
      fetchCode(result.assets[0].uri, "1");
    }
  }
  };
  return (
    <>
      <ScrollView 
      style={{ backgroundColor: "white", flex: 1 }}
              nestedScrollEnabled={true}
      >
        <TouchableOpacity
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
        <View style={styles.destinationsView}>
          {avatars.map((grids) => (
            <TouchableOpacity
              onPress={() => {
                fetchCode(grids.icon + ".png", "0");
              }}
              style={styles.gridButtonContainer}
            >
              <View style={[styles.gridButton]}>
                <Image
                  key={"AA"+grids.key}
                  indicator={Progress}
                  resizeMode={FastImage.resizeMode.contain}
                  style={{
                    width: 80,
                    height: 80,
                    backgroundColor: "#f2f2f2",
                    borderRadius: 40,
                    borderColor: "#e35504",
                    borderWidth:
                    grids.icon + ".png" == user.user_avatar ? 3 : 0,
                    margin: 7,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  source={{
                    priority: FastImage.priority.high,
                    cache: FastImage.cacheControl.immutable,
                    uri: constants.url + "/avatars/" + grids.icon + ".png",
                  }}
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  imageStyle: {
    marginTop: 10,
    height: 250,
    width: 250,
    borderWidth: 1,
    borderColor: "black",
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
    fontSize: 15,
    color: "rgb(147, 147, 147)",
    paddingHorizontal: 15,
    textAlign: "center",
    marginVertical: 10,
  },
  destinationsView: {
    justifyContent: "center",
    backgroundColor: "#fff",
    borderTopRightRadius: 40,
    borderTopLeftRadius: 40,
    color: "#5A5A5A",
    width: SCREEN_WIDTH,
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
    width: SCREEN_WIDTH,
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
    marginBottom:25,
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
