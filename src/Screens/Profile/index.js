import {
  StyleSheet,
  Dimensions,
  View,
  Alert,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
} from "react-native";
const { width: ScreenWidth } = Dimensions.get("window");
import React, { useEffect, useState, useCallback } from "react";
import { ListItem, Icon } from "@rneui/themed";
import InfoText from "../../utils/InfoText";
import * as Application from "expo-application";
import axios from "axios";
import { constants } from "../../utils/constants";
import FastImage from "react-native-fast-image";
import { createImageProgress } from "react-native-image-progress";
const Image = createImageProgress(FastImage);
import Progress from "react-native-progress";
import { storage } from "../../context/components/Storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMMKVObject } from "react-native-mmkv";
import { openSettings } from "react-native-permissions";
import { axiosPull } from "../../utils/axiosPull";
import * as i18n from "../../../i18n";
import ProfileHeader from "../SubViews/home/profileHeader";
import { useIsFocused } from "@react-navigation/native";
import Loading from "../SubViews/home/Loading";
import hotUpdate from "react-native-ota-hot-update/src/index";
import email from "react-native-email";
import DeviceInfo from "react-native-device-info";
import { getLocales } from "expo-localization";
import RNFS from "react-native-fs";
import RNImageToPdf from "react-native-image-to-pdf";
import RNPrint from "react-native-print";

const Profile = (props) => {
  const [user] = useMMKVObject("user.Data", storage);
  const [modalVisable, setmodalVisable] = useState(false);
  const [qrCodeURL] = useState(
    constants.url + "/friendQRCode.php?owner=" + user.user_id
  );
  const isFocused = useIsFocused();
  const [upload] = useMMKVObject("uploadData", storage);
  const [version, setVersion] = useState("0");

  const clearCache = useCallback(() => {
    const cacheDir = RNFS.CachesDirectoryPath;
    Alert.alert(
      i18n.t("Delete Account"),
      i18n.t("Are you sure"),
      [
        {
          text: i18n.t("Cancel"),
          onPress: () => console.log("Cancel Pressed"),
          style: "default",
        },
        {
          text: i18n.t("Clear"),
          onPress: async () => {
            try {
              await RNFS.unlink(cacheDir);
              console.log("Cache cleared successfully.");
            } catch (error) {
              console.error("Error clearing cache:", error);
            }
            FastImage.clearMemoryCache();
            FastImage.clearDiskCache();
          },
          style: "destructive",
        },
      ],
      { cancelable: false }
    );
  }, []);

  const logout = useCallback(() => {
    const execute = async () => {
      await AsyncStorage.removeItem("UUID");
      await AsyncStorage.removeItem("logedIn");
      await AsyncStorage.removeItem("user_id");
    };
    execute();
    props.navigation.navigate("Begin");
  });

  useEffect(() => {
    props.navigation.setOptions({
      title:
        user.user_id == null
          ? i18n.t("Profile Page")
          : user.user_handle.toUpperCase(),
    });
    const pullData = async () => {
      const currentVersion = await hotUpdate.getCurrentVersion();
      setVersion(currentVersion);
      await axiosPull._pullUser(user.user_id, "Profile");
    };
    pullData();
  }, [isFocused, version, user, props, upload]);

  const pro = useCallback(() => {
    props.navigation.navigate("GetPro");
  });

  const notifications = useCallback(() => {
    props.navigation.navigate("Notifications");
  });

  const about = useCallback(() => {
    props.navigation.navigate("Abouts");
  });

  const privacy = useCallback(() => {
    props.navigation.navigate("WebView", {
      url: constants.url + "/privacyPolicy.html",
      name: i18n.t("Privacy Policy"),
    });
  });

  const terms = useCallback(() => {
    props.navigation.navigate("WebView", {
      url: constants.url + "/termsUsePolicy.html",
      name: i18n.t("Terms & Use"),
    });
  });

  const closedCameras = useCallback(() => {
    props.navigation.navigate("ClosedCameras");
  });

  const accountDetails = useCallback(() => {
    props.navigation.navigate("AccountDetails");
  });

  const changeAvatar = async () => {
    props.navigation.navigate("ChangeAvatar");
  };
  const handleEmail = () => {
    const to = [`${constants.verification_email}`]; // string or array of email addresses
    email(to, {
      subject: `${i18n.t("Email2")}`,
      body: `${i18n.t("Email1")}

                  --------------------------
                  //App
                  App: ${DeviceInfo.getApplicationName()}
                  Build: ${version}
                  Version: ${Application.nativeApplicationVersion}

                  //Device
                  OS: ${DeviceInfo.getSystemName()}
                  Brand: ${DeviceInfo.getBrand()}
                  Device: ${DeviceInfo.getDeviceId()}
                  Version: ${DeviceInfo.getSystemVersion()}

                  //User
                  User: ${user.user_handle}-${user.user_id}
                  Email: ${user.user_email}
                  Language Code: ${getLocales()[0].languageCode}
                  --------------------------
                  `,
      checkCanOpen: true, // Call Linking.canOpenURL prior to Linking.openURL
    }).catch(console.error);
  };

  const preview = useCallback(() => {
    Alert.alert(
      i18n.t("Delete Account"),
      i18n.t("Are you sure"),
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
  }, []);

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
  });

  const deleteAccount = useCallback(() => {
    preview();
  }, []);

  const fetchImage = async (qrCodeURL) => {
    try {
      const flyer = constants.flyerdataPersonal
      const path = `${RNFS.CachesDirectoryPath}/qrcode.png`;
      const fileExists = await RNFS.exists(path);
      if (!fileExists) {
        await RNFS.downloadFile({ fromUrl: flyer+qrCodeURL, toFile: path }).promise;
      }else{
        await RNFS.unlink(path);
        await RNFS.downloadFile({ fromUrl: flyer+qrCodeURL, toFile: path }).promise;
      }
      myAsyncPDFFunction(path);
    } catch (err) {
      fetchImage(qrCodeURL);
    } finally {
    }
  };

  const myAsyncPDFFunction = async (url) => {
    const path = `${RNFS.CachesDirectoryPath}/qrcode.pdf`;
    const fileExists = await RNFS.exists(path);
    const options = {
      imagePaths: [url],
      name: "qrcode",
      quality: 1.0, // optional compression paramter
    };
    if (!fileExists) {
      try {
        const pdf = await RNImageToPdf.createPDFbyImages(options);
        handlePrint(pdf.filePath);
        RNFS.unlink(url)
      } catch (e) {
        console.log(e);
        myAsyncPDFFunction(url);
      }
    } else {
      RNFS.unlink(url)
      try {
        const pdf = await RNImageToPdf.createPDFbyImages(options);
        handlePrint(pdf.filePath);
        RNFS.unlink(url)
      } catch (e) {
        myAsyncPDFFunction(url);
      }
    }
  };

  const handlePrint = async (url) => {
    await RNPrint.print({ filePath: url });
    RNFS.unlink(url)
  };

  return (
    <ScrollView
      style={{ width: "100%", backgroundColor: "#fff" }}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
    >
      <Modal
        visible={modalVisable}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setmodalVisable(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Image
              indicator={Progress}
              style={{
                width: ScreenWidth - 100,
                height: ScreenWidth - 100,
                backgroundColor: "white",
                alignSelf: "auto",
              }}
              resizeMode={FastImage.resizeMode.contain}
              source={{
                priority: FastImage.priority.high,
                cache: FastImage.cacheControl.immutable,
                uri: qrCodeURL,
              }}
            />
          </View>
          <View
            style={{
              flexDirection: "row",
              width: "100%",
              margin: 20,
              justifyContent: "center",
            }}
          >
            <TouchableOpacity
              style={{
                width: "40%",
                marginRight: 10,
                backgroundColor: "rgba(250, 190, 0, 1)",
                borderRadius: 24,
                padding: 15,
                alignItems: "center",
                justifyContent: "center",
              }}
              onPress={() => setmodalVisable(false)}
            >
              <Text
                style={{
                  textTransform: "uppercase",
                  fontSize: 20,
                  fontWeight: 600,
                  color: "#fff",
                }}
              >
                {i18n.t("Close")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                width: "40%",
                marginLeft: 10,
                backgroundColor: "rgba(234, 85, 4, 1)",
                borderRadius: 24,
                padding: 15,
                alignItems: "center",
                justifyContent: "center",
              }}
              onPress={() => {
                fetchImage(qrCodeURL);
              }}
            >
              <Text
                style={{
                  textTransform: "uppercase",
                  fontSize: 20,
                  fontWeight: 600,
                  color: "#fff",
                }}
              >
                {i18n.t("Print")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <View style={{ width: "100%", backgroundColor: "#fff" }}>
        <Loading
          message={upload.message}
          flex={upload.display}
          image={upload.image}
        />

        <ProfileHeader
          name={user.user_handle}
          id={user.user_id}
          motto={user.user_motto}
          avatar={user.user_avatar}
          join={user.joined}
          create={user.created}
          isPro={user.isPro}
          upload={user.uploaded}
        />

        <View>
          <View style={[styles.dividerTableStyle]} />
          <ListItem
            containerStyle={{ paddingVertical: 5 }}
            key="99"
            onPress={() => {
              pro();
            }}
          >
            <FastImage
              style={{
                width: 25,
                height: 25,
                borderRadius: 6,
                alignItems: "center",
                justifyContent: "center",
              }}
              resizeMode={FastImage.resizeMode.contain}
              source={require("../../../assets/verified.png")}
            />

            <ListItem.Content>
              <ListItem.Title>{i18n.t("GoPro")}</ListItem.Title>
            </ListItem.Content>
            <ListItem.Chevron />
          </ListItem>
          <View style={[styles.dividerTableStyle]} />
          <ListItem
            containerStyle={{ paddingVertical: 5 }}
            key="1"
            onPress={() => {
              closedCameras();
            }}
          >
            <Icon
              type="material"
              name="camera-roll"
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
              <ListItem.Title>{i18n.t("DownloadMedia")}</ListItem.Title>
            </ListItem.Content>
            <ListItem.Chevron />
          </ListItem>
          <View style={[styles.dividerTableStyle]} />
          <ListItem
            containerStyle={{ paddingVertical: 5 }}
            key="10"
            onPress={() => {
              setmodalVisable(true);
            }}
          >
            <Icon
              type="material-community"
              name="qrcode"
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
              <ListItem.Title>{i18n.t("Friend Code")}</ListItem.Title>
            </ListItem.Content>
            <ListItem.Chevron />
          </ListItem>

          <View style={[styles.dividerTableStyle]} />
          <InfoText text={i18n.t("Profile Settings")} />
          <View>
            <View style={[styles.dividerTableStyle]} />

            <ListItem
              containerStyle={{ paddingVertical: 5 }}
              key="3"
              onPress={() => {
                notifications();
              }}
            >
              <Icon
                type="material-community"
                name="message"
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
                <ListItem.Title>{i18n.t("Notifications")}</ListItem.Title>
              </ListItem.Content>
              <ListItem.Chevron />
            </ListItem>
            <View style={[styles.dividerTableStyleShort]} />
            <ListItem
              containerStyle={{ paddingVertical: 5 }}
              key="12"
              onPress={() => {
                changeAvatar();
              }}
            >
              <Icon
                type="material-community"
                name="face-man-profile"
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
                <ListItem.Title>{i18n.t("Change Avatar")}</ListItem.Title>
              </ListItem.Content>
              <ListItem.Chevron />
            </ListItem>
            <View style={[styles.dividerTableStyleShort]} />

            <ListItem
              containerStyle={{ paddingVertical: 5 }}
              key="14"
              onPress={() => {
                accountDetails();
              }}
            >
              <Icon
                type="material-community"
                name="account-edit-outline"
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
                <ListItem.Title>{i18n.t("Edit Account")}</ListItem.Title>
              </ListItem.Content>
              <ListItem.Chevron />
            </ListItem>
            <View style={[styles.dividerTableStyle]} />
            <ListItem
              containerStyle={{ paddingVertical: 5 }}
              key="4"
              onPress={() => {
                about();
              }}
            >
              <Icon
                type="material-community"
                name="shield-account-variant-outline"
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
                <ListItem.Title>{i18n.t("Account Details")}</ListItem.Title>
              </ListItem.Content>
              <ListItem.Chevron />
            </ListItem>
            <View style={[styles.dividerTableStyle]} />

            <InfoText text={i18n.t("Account Actions")} />
            <View style={[styles.dividerTableStyleShort]} />

            <ListItem
              containerStyle={{ paddingVertical: 5 }}
              key="17"
              onPress={() => {
                openSettings();
              }}
            >
              <Icon
                type="material"
                name="screen-lock-portrait"
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
                <ListItem.Title>{i18n.t("Permissions")}</ListItem.Title>
              </ListItem.Content>
              <ListItem.Chevron />
            </ListItem>
            <View style={[styles.dividerTableStyleShort]} />
            <ListItem
              containerStyle={{ paddingVertical: 5 }}
              key="22"
              onPress={() => {
                handleEmail();
              }}
            >
              <Icon
                type="material"
                name="support-agent"
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
                <ListItem.Title>{i18n.t("Support")}</ListItem.Title>
              </ListItem.Content>
              <ListItem.Chevron />
            </ListItem>
            <View style={[styles.dividerTableStyle]} />
            <ListItem
              containerStyle={{ paddingVertical: 5 }}
              key="5"
              onPress={() => {
                deleteAccount();
              }}
            >
              <Icon
                type="ionicon"
                name="close-circle-outline"
                size={20}
                color="#FF3232"
                containerStyle={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              />
              <ListItem.Content>
                <ListItem.Title>{i18n.t("Delete/Remove")}</ListItem.Title>
              </ListItem.Content>
              <ListItem.Chevron />
            </ListItem>
            <View style={[styles.dividerTableStyleShort]} />

            <ListItem
              containerStyle={{ paddingVertical: 5 }}
              key="6"
              onPress={() => {
                logout();
              }}
            >
              <Icon
                type="ionicon"
                name="power"
                size={20}
                color="#FF3232"
                containerStyle={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              />
              <ListItem.Content>
                <ListItem.Title>{i18n.t("Logout")}</ListItem.Title>
              </ListItem.Content>
              <ListItem.Chevron />
            </ListItem>
            <View style={[styles.dividerTableStyleShort]} />

            <ListItem
              containerStyle={{ paddingVertical: 5 }}
              key="25"
              onPress={() => {
                clearCache();
              }}
            >
              <Icon
                type="material"
                name="cached"
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
                <ListItem.Title>{i18n.t("ClearCache")}</ListItem.Title>
              </ListItem.Content>
              <ListItem.Chevron />
            </ListItem>
            <View style={[styles.dividerTableStyle]} />
          </View>
          <InfoText text={i18n.t("Policies")} />
          <View style={[styles.dividerTableStyle]} />
          <ListItem
            containerStyle={{ paddingVertical: 5 }}
            key="7"
            onPress={() => {
              privacy();
            }}
          >
            <Icon
              type="material"
              name="policy"
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
              <ListItem.Title>{i18n.t("Privacy Policy")}</ListItem.Title>
            </ListItem.Content>
            <ListItem.Chevron />
          </ListItem>
          <View style={[styles.dividerTableStyleShort]} />

          <ListItem
            containerStyle={{ paddingVertical: 5 }}
            key="8"
            onPress={() => {
              terms();
            }}
          >
            <Icon
              type="material"
              name="policy"
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
              <ListItem.Title>{i18n.t("Terms & Use")}</ListItem.Title>
            </ListItem.Content>
            <ListItem.Chevron />
          </ListItem>
          <View style={[styles.dividerTableStyle]} />
          <InfoText text={i18n.t("AppData")} />
          <View style={[styles.dividerTableStyle]} />
          <ListItem
            containerStyle={{ paddingVertical: 5 }}
            key="24"
            onPress={() => {}}
          >
            <Icon
              type="octicon"
              name="versions"
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
              <ListItem.Title>{i18n.t("Version")}</ListItem.Title>
            </ListItem.Content>
            <View
              style={{
                marginLeft: 65,
                width: 75,
                height: 22,
                borderRadius: 11,
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  color: "#3D4849",
                  textAlignVertical: "center",
                  textAlign: "center",
                  fontSize: 13,
                  fontWeight: "bold",
                }}
              >
                {Application.nativeApplicationVersion} ({version})
              </Text>
            </View>
          </ListItem>
        </View>
        <View style={{ marginBottom: 25 }} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  listItemContainer: {
    height: 55,
    borderWidth: 0.5,
    borderColor: "#ECECEC",
  },
  dividerStyle: {
    height: 0,
    marginTop: 0,
    marginBottom: -20,
    borderRadius: 16,
    width: ScreenWidth * 0.9,
    alignSelf: "center",
    backgroundColor: "#ccc",
  },
  dividerTableStyle: {
    height: 0,
    marginTop: 10,
    marginBottom: 10,
    width: ScreenWidth * 1,
    alignSelf: "center",
    backgroundColor: "#ccc",
  },
  dividerTableStyleShort: {
    height: 0,
    marginTop: 10,
    marginLeft: 65,
    marginBottom: 10,
    width: ScreenWidth,
    alignSelf: "center",
    backgroundColor: "#ccc",
  },
  header: {
    backgroundColor: "#00BFFF",
    flex: 1,
    height: 240,
    resizeMode: "center",
  },
  drawerIc: {
    width: 35,
    height: 35,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalView: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 7,
  },
  avatar: {
    width: 130,
    height: 130,
    borderRadius: 63,
    borderWidth: 4,
    borderColor: "white",
    backgroundColor: "#b9d9ff",
    marginBottom: 10,
    alignSelf: "auto",
    position: "absolute",
    marginTop: 170,
    marginLeft: 10,
  },
  name: {
    fontSize: 20,
    position: "absolute",
    color: "#5A5A5A",
    fontWeight: "600",
    paddingLeft: 0,
    marginTop: -35,
  },
  body: {
    marginTop: 60,
  },
  bodyContent: {
    flex: 1,
    alignItems: "center",
    padding: 30,
  },
  names: {
    fontSize: 28,
    color: "#696969",
    fontWeight: "600",
  },
  info: {
    fontSize: 14,
    position: "absolute",
    alignSelf: "auto",
    color: "#b3b3b3",
    paddingLeft: 60,
    fontWeight: "600",
    marginTop: -10,
  },
});
export default Profile;
