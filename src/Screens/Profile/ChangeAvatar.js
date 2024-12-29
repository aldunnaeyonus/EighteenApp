import React, { useState, useCallback } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  TouchableOpacity,
  Platform,
  Alert,
} from "react-native";
import EmptyStateView from "@tttstudios/react-native-empty-state";
import { constants } from "../../utils";
import { useMMKVObject } from "react-native-mmkv";
import * as ImagePicker from "expo-image-picker";
import FormData from "form-data";
import FastImage from "react-native-fast-image";
import { createImageProgress } from "react-native-image-progress";
const Image = createImageProgress(FastImage);
import Progress from "react-native-progress";
import { useToast } from "react-native-styled-toast";
import { useFocusEffect } from "@react-navigation/native";
import { storage, updateStorage } from "../../context/components/Storage";
import { handleUpload } from "../../SubViews/upload";
import { axiosPull } from "../../utils/axiosPull";
import * as i18n from "../../../i18n";

const ChangeData = (props) => {
  const [user] = useMMKVObject("user.Data", storage);
  const [avatars, setAvatars] = useState([]);
  const { toast } = useToast();

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
      axiosPull._pullUser(user.user_id);
      const fetchData = async () => {
        fetch(constants.url + "/avatars/avatars.json")
          .then((response) => response.json())
          .then((jsonData) => {
            setAvatars(jsonData);
          })
          .catch((error) => {});
      };
      fetchData();
    }, [props])
  );

  const fetchCode = useCallback(
    async (icon, types) => {
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
          uri: Platform.OS === "android" ? icon : icon.replace("file://", ""),
        });
      } else {
        formData.append("avatar", String(icon));
      }

      if (types == "1") {
        updateStorage(
          user,
          "user_avatar",
          String("SNAP18-" + user.user_id + "-" + icon.split("/").pop()),
          "user.Data"
        );
      } else {
        updateStorage(user, "user_avatar", String(icon), "user.Data");
      }
      handleUpload(
        constants.url + "/avatars/fetch.php",
        formData,
        user.user_id,
        "avatar",
        "pin",
        ""
      );
    },
    [user, avatars]
  );

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
              uri: constants.url + "/avatars/" + user.user_avatar,
            }}
            imageStyle={styles.imageStyle}
            headerText={i18n.t("Choose an avatar")}
            headerTextStyle={styles.headerTextStyle}
          />
        </TouchableOpacity>
        <View style={styles.destinationsView}>
          {avatars.map((grids) => (
            <TouchableOpacity
              key={"B" + grids.key}
              onPress={() => {
                fetchCode(grids.icon + ".png", "0");
              }}
              style={styles.gridButtonContainer}
            >
              <View key={"D" + grids.key} style={[styles.gridButton]}>
                <Image
                  key={"C" + grids.key}
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
