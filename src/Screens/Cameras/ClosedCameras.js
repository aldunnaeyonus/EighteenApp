import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Dimensions,
  Alert,
} from "react-native";
import React, { useState, useCallback } from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import EmptyStateView from "@tttstudios/react-native-empty-state";
import moment from "moment";
const { width: ScreenWidth } = Dimensions.get("window");
import FastImage from "react-native-fast-image";
import { createImageProgress } from "react-native-image-progress";
const Image = createImageProgress(FastImage);
import Progress from "react-native-progress";
import { Icon } from "@rneui/themed";
import { storage } from "../../context/components/Storage";
import { useMMKVObject } from "react-native-mmkv";
import { axiosPull } from "../../utils/axiosPull";
import { useFocusEffect } from "@react-navigation/native";
import * as i18n from "../../../i18n";
import { ActivityIndicator, ProgressBar  } from "react-native-paper";
import { MenuView } from "@react-native-menu/menu";
import { constants } from "../../utils";
import * as FileSystem from "expo-file-system";
import { CameraRoll } from "@react-native-camera-roll/camera-roll";


const ClosedCameras = (props) => {
  const [filteredDataSource] = useMMKVObject("user.Media.Feed", storage);
  const [refreshing, serRefreshing] = useState(false);
  const [disable, setdisable] = useState(false);
  const [startDownload, setStartDownload] = useState(false);
  const [count, setCount] = useState(0);
  const [user] = useMMKVObject("user.Data", storage);
  const [progress, setProgress] = useState(0);

  const _refresh = async () => {
    serRefreshing(true);
    await axiosPull._pullHistoryFeed(user.user_id);
    setTimeout(() => {
      serRefreshing(false);
    }, 1500);
  };

   const handleDownloadAction = async (fileUris) => {
    let totalSize = 0;
    let savedSize = 0;
    setStartDownload(true)
    Alert.alert(i18n.t('DownloadingEventFiles'),i18n.t('Theventfiles'));
    // Calculate total size of files
    for (const uri of fileUris) {
      const statResult = await RNFS.stat(uri);
      totalSize += statResult.size;
    }

    for (const uri of fileUris) {
      await CameraRoll.saveAsset(uri);

      // Update progress
      const statResult = await RNFS.stat(uri);
      savedSize += statResult.size;
      setProgress((savedSize / totalSize) * 100);
    }
      if (progress >= 100){
        setProgress(0)
        setStartDownload(false)
      }
  };

  const _deleteFeedItemIndex = (UUID) => {
    filteredDataSource.forEach((res, index) => {
      if (res.UUID == UUID) {
        setcameraData((prevState) => {
          prevState.splice(index, 1);
          storage.set("user.Media.Feed", JSON.stringify(prevState));
          return [...prevState];
        });
      }
    });
  };

  const _deleteFeedItem = (UUID, owner, pin) => {
    Alert.alert(
      i18n.t("Delete Event"),
      i18n.t("All data will be lost"),
      [
        {
          text: i18n.t("Cancel"),
          onPress: () => console.log("Cancel Pressed"),
          style: "default",
        },
        {
          text: i18n.t("Delete Event"),
          onPress: () => {
            setTimeout(() => {
              _deleteFeedItemSource(UUID, owner, pin);
            }, 1000);
          },
          style: "destructive",
        },
      ],
      { cancelable: false }
    );
  };

  const _deleteFeedItemSource = async (UUID, owner, pin) => {
    //_deleteFeedItemIndex(UUID);
    setdisable(true);
    const data = {
      owner: owner,
      pin: pin,
      id: UUID,
    };
    await axiosPull.postData("/camera/delete.php", data);
    await axiosPull._pullHistoryFeed(user.user_id);
    setdisable(false);
    props.navigation.setOptions({
      headerRight: () => (
        <ActivityIndicator
          color="black"
          size={"small"}
          animating={disable}
          hidesWhenStopped={true}
        />
      ),
    });
  };

  useFocusEffect(
    useCallback(() => {
      var timeout = setInterval(async () => {
        await axiosPull._pullHistoryFeed(user.user_id);
      }, 60000);

      const fetchData = async () => {
        await axiosPull._pullHistoryFeed(user.user_id);
      };
      fetchData();
      return () => {
        clearInterval(timeout);
      };
    }, [filteredDataSource, refreshing, disable, count])
  );

  const actionFeed = async (pin, UUID, title) => {
    setdisable(true);
    const data = {
      owner: user.user_id,
      pin: pin,
      id: UUID,
      name: title,
    };
    Alert.alert("",i18n.t("j11"));
    await axiosPull.postData("/camera/compress.php", data);
    await axiosPull._pullHistoryFeed(user.user_id);
    setdisable(false);
  };

  const Item = ({ item }) => {
    if (moment().unix() - item.end >= 2592000) {
      _deleteFeedItemIndex(item.UUID);
    }
    storage.delete(`user.Gallery.Friend.Feed.${item.pin}`);
    storage.delete(`user.Member.Join.Feed.${item.pin}`);

    return (
      <View key={item.UUID} style={styles.listItem}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View style={styles.imageUserNameContainer}></View>
          <Image
            key={item.illustration}
            source={{
              uri: item.illustration,
              priority: FastImage.priority.normal,
            }}
            indicator={Progress}
            resizeMode={FastImage.resizeMode.cover}
            style={{
              height: 70,
              width: 100,
              backgroundColor: "#f2f2f2",
              overflow: "hidden",
              borderRadius: 6,
            }}
          />
        </View>
        <View
          style={{
            alignItems: "flex-start",
            marginStart: 15,
            flex: 1,
            marginTop: 0,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-start",
              width: ScreenWidth,
            }}
          >
            <FontAwesome
              name="camera-retro"
              size={12}
              style={styles.whiteIcon2}
            />
            <Text
              style={{
                fontWeight: "bold",
                marginTop: 5,
              }}
            >
              {item.title.toUpperCase()}
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-start",
              width: ScreenWidth,
            }}
          >
            <FontAwesome
              name="calendar-times-o"
              size={12}
              style={styles.whiteIcon2}
            />
            <Text style={{ marginTop: 5 }}>
              Ended: {moment.unix(item.end).format("LLL")}
            </Text>
          </View>

          <View
            style={{
              height: 27,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-start",
              width: ScreenWidth,
            }}
          >
            <Text
              style={{
                color: "#3D4849",
                fontSize: 13,
              }}
            >
              {i18n.t("Media:")} {item.media_count} | {i18n.t("Claim by")}
              {moment.unix(item.end).add(1, "M").format("LLL")}
            </Text>
          </View>
        </View>
        {
        startDownload ?
        <ActivityIndicator
        color="black"
        size={"small"}
        style={{marginTop:-50}}
        animating={startDownload}
        hidesWhenStopped={true}
      />  <ProgressBar progress={progress} color="#0000ff" />: 
        <MenuView
          key={item.UUID}
          title={item.title.toUpperCase()}
          isAnchoredToRight={true}
          onPressAction={async ({ nativeEvent }) => {
            if (nativeEvent.event == "Delete-" + item.UUID) {
              _deleteFeedItem(item.UUID, item.owner, item.pin);
            } else if (nativeEvent.event == "Download-" + item.UUID) {
              actionFeed(item.pin, item.UUID, item.title);
            } else if (nativeEvent.event == "Save-" + item.UUID) {
              const array = await axiosPull._pullGalleryArray(item.pin);
              setCount(parseInt(JSON.parse(array).length));
              handleDownloadAction(array);
            }
          }}
          actions={constants.historyActions(item.UUID)}
          shouldOpenOnLongPress={false}
          themeVariant="light"
        >
          <Icon
            containerStyle={{
              alignSelf: "center",
              marginRight: 0,
              marginTop: 0,
              color: "#3D4849",
            }}
            type="material-community"
            size={25}
            name="menu"
            color="#3D4849"
          />
        </MenuView>
  }
      </View>
    );
  };
  return (
    <View style={styles.container}>
        <RefreshableWrapper
        defaultAnimationEnabled={true}
        Loader={() => <RefreshView />}
        isLoading={refreshing}
        onRefresh={() => {
          _refresh();
        }}
      >
      <FlatList
        extraData={filteredDataSource}

        ListEmptyComponent={
          <EmptyStateView
            imageSource={require("../../../assets/4320872.png")}
            imageStyle={styles.imageStyle}
            headerText={i18n.t("Download Media")}
            subHeaderText={i18n.t("Ended")}
            headerTextStyle={styles.headerTextStyle}
            subHeaderTextStyle={styles.subHeaderTextStyle}
          />
        }
        style={{ flex: 1 }}
        data={filteredDataSource}
        keyExtractor={(item) => item.UUID}
        renderItem={Item}
        ListFooterComponent={
          <View
            style={{
              flex: 1,
              marginTop: 0,
              width: "100%",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                padding: 20,
                fontSize: 15,
                textAlign: "center",
                color: "grey",
              }}
            >
              {i18n.t("After 30 days")}
            </Text>
          </View>
        }
      />
      </RefreshableWrapper>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  headerTextStyle: {
    color: "rgb(76, 76, 76)",
    fontSize: 18,
    marginVertical: 10,
  },
  imageStyle: {
    marginTop: 0,
    height: 300,
    width: 300,
    resizeMode: "contain",
  },
  subHeaderTextStyle: {
    fontSize: 12,
    color: "rgb(147, 147, 147)",
    paddingHorizontal: 60,
    textAlign: "center",
    marginVertical: 10,
  },
  textInputStyle: {
    height: 50,
    borderWidth: 1,
    paddingLeft: 20,
    width: "90%",
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 30,
    borderColor: "#dedede",
    borderRadius: 45,
    backgroundColor: "#FFFFFF",
    fontSize: 24,
  },
  whiteIcon2: {
    marginTop: 3,
    paddingRight: 5,
    color: "#000",
    justifyContent: "center",
  },
  whiteIcon: {
    paddingRight: 5,
    color: "#fff",
    justifyContent: "center",
  },
  listItem: {
    margin: 1,
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#FFF",
    borderBottomWidth: 0.5,
    borderColor: "#D3D3D3",
    width: "100%",
    flex: 1,
    alignSelf: "center",
    flexDirection: "row",
  },
  moreIcon: {
    marginLeft: -5,
    justifyContent: "center",
  },
});
export default ClosedCameras;
