import React, { useState, useEffect, useCallback } from "react";
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  View,
  Alert,
  Text, // Added Text for loading indicator
} from "react-native";
import EmptyStateView from "@tttstudios/react-native-empty-state";
import { SCREEN_WIDTH } from "../../utils/constants";
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
import { useFocusEffect } from "@react-navigation/native";
import { constants } from "../../utils/constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { axiosPull } from "../../utils/axiosPull";

const ChangeAvatar = (props) => {
  const [user] = useMMKVObject("user.Data", storage);
  const [isLoading, setIsLoading] = useState(false);
  const [localImageUri, setLocalImageUri] = useState(user.user_avatar);
  const [avatars, setAvatars] = useState([]);

  useEffect(() => {
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

  useFocusEffect(
    useCallback(() => {
      props.navigation.setOptions({
        headerTitle: i18n.t("Change Avatar"),
      });
    }, [props.navigation])
  );

  useEffect(() => {
    // Request permissions when component mounts
    (async () => {
      if (Platform.OS != "web") {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status != "granted") {
          Alert.alert(
            i18n.t("Permission required"),
            i18n.t("Please enable camera roll permissions to select an image.")
          );
        }
      }
    })();
  }, []);

  const _pickImage = useCallback(async () => {
    setIsLoading(true);
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setLocalImageUri(result.assets[0].uri);
        _uploadImage(result.assets[0].uri, "1");
      }
    } catch (error) {
      console.error("Error picking image:", error);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const _uploadImage = useCallback(
    async (icon, types) => {
      if (!localImageUri) {
        return;
      }
      try {
        const formData = new FormData();
        formData.append("id", String(user.user_id));
        formData.append("type", String(types));
        formData.append("device", Platform.OS);
        if (types == "1") {
          formData.append(
            "avatar",
            String(
              "SNAP18-avatar-" + user.user_id + "-" + icon.split("/").pop()
            )
          );
          formData.append("file", {
            name: icon,
            type: constants.mimes(icon.split(".").pop()), // set MIME type
            uri: Platform.OS == "android" ? icon : icon.replace("file://", ""),
          });
        } else {
          formData.append("avatar", String(icon));
        }
        const postConclusion = async () => {
          await AsyncStorage.setItem("uploadEnabled", "0");
          await axios({
            method: "POST",
            url: constants.url + "/avatars/fetch.php",
            data: formData,
            onUploadProgress: (progressEvent) => {
              let { loaded, total } = progressEvent;
              console.log((loaded / total) * 100);
            },
            headers: {
              Accept: "application/json",
              "content-Type": "multipart/form-data",
            },
          }).then(async (_) => {
            updateStorage(
              user,
              "user_avatar",
              types == "1"
                ? String(
                    "SNAP18-avatar-" +
                      user.user_id +
                      "-" +
                      icon.split("/").pop()
                  )
                : icon,
              "user.Data"
            );
            await axiosPull._pullUser(user.user_id, "Upload");
          });
        };
        postConclusion();
      } catch (error) {
        console.error("Error uploading image:", error);
      } finally {
      }
    },
    [localImageUri, user.user_id, props.navigation]
  );

  if (isLoading) {
    return (
      <View style={componentStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#e35504" />
        <Text style={componentStyles.loadingText}>{i18n.t("Loading")}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={componentStyles.scrollView}>
      <TouchableOpacity onPress={_pickImage}>
        <EmptyStateView
          imageSource={{
            cache: FastImage.cacheControl.immutable,
            priority: FastImage.priority.high,
            uri: localImageUri,
          }}
          imageStyle={componentStyles.imageStyle}
          headerText={i18n.t("Choose an avatar")}
          headerTextStyle={componentStyles.headerTextStyle}
        />
      </TouchableOpacity>
      <View style={componentStyles.destinationsView}>
        {avatars.map((grids) => (
          <TouchableOpacity
            onPress={() => {
              _uploadImage(grids.icon + ".png", "0");
              setLocalImageUri(
                constants.url + "/avatars/" + grids.icon + ".png"
              );
            }}
            style={componentStyles.gridButtonContainer}
          >
            <View style={[componentStyles.gridButton]}>
              <Image
                indicator={Progress}
                resizeMode={FastImage.resizeMode.contain}
                style={{
                  width: 80,
                  height: 80,
                  backgroundColor: "#f2f2f2",
                  borderRadius: 40,
                  borderColor: "#e35504",
                  borderWidth: grids.icon + ".png" == user.user_avatar ? 3 : 0,
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
  );
};

const componentStyles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: "#fff",
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
  container: {
    alignItems: "center",
    paddingTop: 50,
  },
  imagePickerButton: {
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_WIDTH * 0.6,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  headerTextStyle: {
    color: "rgb(76, 76, 76)",
    fontSize: 15,
    textAlign: "center",
    marginVertical: 20,
    margin: 20,
  },
  subHeaderTextStyle: {
    fontSize: 15,
    color: "rgb(147, 147, 147)",
    paddingHorizontal: 15,
    textAlign: "center",
    marginVertical: 10,
  },
  imageStyle: {
    height: 200,
    width: 200,
    marginTop: 10,
    borderRadius: 100,
    overflow: "hidden",
    resizeMode: "cover",
  },
  uploadButton: {
    marginTop: 30,
    backgroundColor: "#e35504",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  uploadButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  backButtonContainer: {
    padding: 7,
    height: 40,
    backgroundColor: "rgba(0, 0, 0, 0.60)",
    borderRadius: 20,
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
    marginBottom: 25,
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

export default ChangeAvatar;
