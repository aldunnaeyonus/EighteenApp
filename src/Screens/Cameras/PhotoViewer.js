import { Share, Alert, Text, View, StyleSheet } from "react-native";
import React, { useState, useRef, useCallback, useMemo } from "react";
import { Icon } from "react-native-elements";
import Animated from "react-native-reanimated";
import { useFocusEffect } from "@react-navigation/native";
import * as i18n from "../../../i18n";
import ImageGalleryView from "../SubViews/gallery/imageGalleryView";
import VideoGalleryView from "../SubViews/gallery/videoGalleryView";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { SCREEN_WIDTH, SCREEN_HEIGHT, url } from "../../utils/constants";
import { axiosPull } from "../../utils/axiosPull";
import { getLocales } from "expo-localization";
import styles from "../../styles/SliderEntry.style";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import { useMMKVObject } from "react-native-mmkv";
import { storage } from "../../context/components/Storage";
import FastImage from "react-native-fast-image";
import { createImageProgress } from "react-native-image-progress";
const Image = createImageProgress(FastImage);
import Progress from "react-native-progress";
import FormData from "form-data";
import axios from "axios";
import moment from "moment/min/moment-with-locales";
import CommentsView from "../SubViews/camera/commentsView";

const PhotoViewer = (props) => {
  const canMomentum = useRef(false);
  const bottomPhoto = useRef();
  const input = useRef();
  const newphoto = useRef();
  const [activeIndex, setActiveIndex] = useState(props.route.params.pagerIndex);
  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ["50%"], []);
  const [comment, setComment] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [user] = useMMKVObject("user.Data", storage);
  const [filteredDataSource] = useMMKVObject(
    `user.Gallery.Comment.Feed.${props.route.params.pin}`,
    storage
  );
  const [filteredComments, setFilteredComments] = useState([]);
  const [filteredDataSourceGallery, setDalleryData] = useMMKVObject(
    `user.Gallery.Friend.Feed.${props.route.params.pin}`,
    storage
  );

  const handleSearch = (index) => {
    const filtered = filteredDataSource.filter((media) => {
      return media.media_id.includes(filteredDataSourceGallery[index].image_id);
    });
    const myData = []
      .concat(filtered)
      .sort((a, b) => String(b.time_date).localeCompare(String(a.time_date)));
    setFilteredComments(myData);
  };

  const createEvent = async () => {
    var formData = new FormData();
    formData.append(
      "media_id",
      filteredDataSourceGallery[activeIndex].image_id
    );
    formData.append("comment", comment);
    formData.append("time_date", moment().unix());
    formData.append("comment_owner", user.user_id);
    formData.append("media_pin", props.route.params.pin);

    const preLoading = async () => {
      await axios({
        method: "POST",
        url: url + "/camera/addComment.php",
        data: formData,
        headers: {
          Accept: "application/json",
          "content-Type": "multipart/form-data",
        },
      }).then(async () => {
        setComment("");
        input.current.clear();
        await axiosPull._requestComments(props.route.params.pin);
        await axiosPull._pullGalleryFeed(props.route.params.pin, user.user_id);
        setTimeout(() => {
          handleSearch(activeIndex);
        }, 500);
      });
    };
    preLoading();
  };

  const _refresh = async () => {
    setRefreshing(true);
    await axiosPull._requestComments(props.route.params.pin);
    await axiosPull._pullGalleryFeed(props.route.params.pin, user.user_id);
    handleSearch(activeIndex);

    setTimeout(async () => {
      setRefreshing(false);
    }, 1000);
  };

  const addComment = useCallback(
    (value) => {
      setComment(value);
    },
    [comment]
  );

  const scrollToActiveIndex = (index) => {
    setActiveIndex(index);
    handleSearch(index);
    newphoto?.current?.scrollToOffset({
      offset: index * SCREEN_WIDTH,
      animated: true,
    });
    if (index * 90 - 80 / 2 > SCREEN_WIDTH / 2) {
      bottomPhoto?.current.scrollToOffset({
        offset: index * 90 - SCREEN_WIDTH / 2 + 80 / 2,
        animated: true,
      });
    } else {
      bottomPhoto?.current.scrollToOffset({
        offset: 0,
        animated: true,
      });
    }
  };

  const _gotoShare = async (image) => {
    const shareOptions = {
      url: image,
      title: "",
    };
    try {
      const ShareResponse = await Share.share(shareOptions);
      console.log("Result =>", ShareResponse);
    } catch (error) {
      console.log("Error =>", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      newphoto?.current.scrollToIndex({
        animate: true,
        index: props.route.params.pagerIndex,
      });
      bottomPhoto?.current.scrollToIndex({
        animate: true,
        index: props.route.params.pagerIndex,
      });
      handleSearch(activeIndex);
    }, [])
  );

  const _deleteFeedItemIndex = (image_id) => {
    filteredDataSourceGallery.forEach((res, index) => {
      if (res.image_id == image_id) {
        setDalleryData((prevState) => {
          prevState.splice(index, 1);
          return [...prevState];
        });
      }
    });
  };

  const _hideContent = async () => {
    Alert.alert(
      i18n.t("HideContent"),
      i18n.t("AreyousureyouHide"),
      [
        {
          text: i18n.t("Cancel"),
          onPress: () => console.log("Cancel Pressed"),
          style: "destructive",
        },
        {
          text: i18n.t("HideContent"),
          onPress: async () => {
            props.route.params.data;

            const data = {
              user: filteredDataSourceGallery[activeIndex].user_id,
              pin: filteredDataSourceGallery[activeIndex].image_id,
              type: "hide",
              title: "",
              owner: props.route.params.user,
              locale: getLocales()[0].languageCode,
            };
            _deleteFeedItemIndex(
              filteredDataSourceGallery[activeIndex].image_id
            );
            await axiosPull.postData("/camera/report.php", data);
            await axiosPull._pullGalleryFeed(
              props.route.params.pin,
              props.route.params.user
            );
            Alert.alert("", i18n.t("HideContentComplete"));
          },
          style: "default",
        },
      ],
      { cancelable: false }
    );
  };
  // callbacks
  const handlePresentModalPress = useCallback(() => {
    bottomSheetRef.current?.present();
  }, []);

  const _reportContent = async () => {
    Alert.alert(
      i18n.t("ReportContent"),
      i18n.t("Areyousureyou"),
      [
        {
          text: i18n.t("Cancel"),
          onPress: () => console.log("Cancel Pressed"),
          style: "destructive",
        },
        {
          text: i18n.t("ReportContent"),
          onPress: async () => {
            const data = {
              user: filteredDataSourceGallery[activeIndex].user_id,
              pin: filteredDataSourceGallery[activeIndex].image_id,
              title: filteredDataSourceGallery[activeIndex].uri,
              type: "content",
              owner: props.route.params.user,
              locale: getLocales()[0].languageCode,
            };
            await axiosPull.postData("/camera/report.php", data);
            Alert.alert("", i18n.t("AreportContent"));
          },
          style: "default",
        },
      ],
      { cancelable: false }
    );
  };

  const onMomentumScrollBegin = () => {
    canMomentum.current = true;
  };

  const onMomentumScrollEnd = useCallback((ev) => {
    if (canMomentum.current) {
      const index = Math.floor(
        Math.floor(ev.nativeEvent.contentOffset.x) / SCREEN_WIDTH
      );
      setActiveIndex(index);
      scrollToActiveIndex(index);
      handleSearch(index);
    }
    canMomentum.current = false;
  }, []);

  const getItemLayout = (_, index) => ({
    length: SCREEN_WIDTH,
    offset: SCREEN_WIDTH * index,
    index,
  });

  const getItemLayoutBottom = (_, index) => {
    return {
      length: 80,
      offset: index * 90 - SCREEN_WIDTH / 2 + 90 / 2,
      index,
    };
  };
  const handleDismissPress = useCallback(() => {
    bottomSheetRef.current?.close();
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={{
          backgroundColor: "transparent",
          height: SCREEN_HEIGHT,
          width: SCREEN_WIDTH,
        }}
        edges={["left", "right"]}
      >
        <Animated.FlatList
          ref={newphoto}
          extraData={filteredDataSourceGallery}
          nestedScrollEnabled={true}
          showsHorizontalScrollIndicator={false}
          onMomentumScrollBegin={onMomentumScrollBegin}
          onMomentumScrollEnd={onMomentumScrollEnd}
          pagingEnabled
          onScroll={() => {
            bottomSheetRef.current?.close();
          }}
          horizontal
          getItemLayout={getItemLayout}
          style={{ backgroundColor: "black", flex: 1 }}
          data={filteredDataSourceGallery}
          keyExtractor={(item) => item.image_id}
          renderItem={({ item, index }) => (
            <ImageGalleryView
              item={item}
              index={index}
              handleDismissPress={handleDismissPress}
            />
          )}
        />

        <Animated.FlatList
          ref={bottomPhoto}
          data={filteredDataSourceGallery}
          horizontal
          getItemLayout={getItemLayoutBottom}
          keyExtractor={(item) => item.image_id}
          style={{
            position: "absolute",
            bottom: 90,
            width: SCREEN_WIDTH,
            flex: 1,
          }}
          extraData={filteredDataSourceGallery}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 10 }}
          onScroll={() => {
            bottomSheetRef.current?.close();
          }}
          renderItem={({ item, index }) => {
            return (
              <VideoGalleryView
                item={item}
                index={index}
                scrollToActiveIndex={scrollToActiveIndex}
                activeIndex={activeIndex}
              />
            );
          }}
        />
        <Animated.View
          style={
            props.lefthanded == "1"
              ? styles.imageUserNameContainersGalleryLeft
              : styles.imageUserNameContainersGallery
          }
        >
          <Icon
            onPress={() => {
              _hideContent();
              handleDismissPress();
            }}
            type={"material"}
            name={"hide-image"}
            size={30}
            color="white"
            containerStyle={{
              alignSelf: "flex-end",
              width: 40,
              padding: 5,
              paddingTop: 15,
              height: 50,
              marginRight: 5,
              marginBottom: 15,
              borderTopRightRadius: 5,
              borderTopLeftRadius: 5,
              backgroundColor: "rgba(0, 0, 0, 0.60)",
            }}
          />
          <Icon
            onPress={() => {
              _reportContent();
              handleDismissPress();
            }}
            type={"octicons"}
            name={"report"}
            size={30}
            color="white"
            containerStyle={{
              alignSelf: "flex-end",
              width: 40,
              padding: 5,
              paddingTop: 15,
              marginTop: -15,
              height: 50,
              marginRight: 5,
              backgroundColor: "rgba(0, 0, 0, 0.60)",
            }}
          />
          {props.route.params.share == "1" ||
          props.route.params.owner == props.route.params.user ? (
            <Icon
              onPress={async () => {
                _gotoShare(filteredDataSourceGallery[activeIndex].uri);
              }}
              type="material-community"
              size={30}
              name="share"
              color="#fff"
              containerStyle={{
                alignSelf: "flex-end",
                width: 40,
                paddingTop: 10,
                height: 50,
                marginRight: 5,
                marginBottom: 0,
                backgroundColor: "rgba(0, 0, 0, 0.60)",
              }}
            />
          ) : (
            <></>
          )}
          <Icon
            onPress={() => {
              handlePresentModalPress();
            }}
            name={"comment-outline"}
            type="material-community"
            size={30}
            color="white"
            containerStyle={{
              alignSelf: "flex-end",
              width: 40,
              paddingTop: 10,
              height: 50,
              marginRight: 5,
              marginBottom: 10,
              backgroundColor: "rgba(0, 0, 0, 0.60)",
            }}
          />
          <Icon
            onPress={() => {
              props.navigation.goBack();
            }}
            name={"close"}
            size={30}
            color="white"
            containerStyle={{
              alignSelf: "flex-end",
              width: 40,
              paddingTop: 10,
              marginTop:
                props.route.params.share == "1" ||
                props.route.params.owner == props.route.params.user
                  ? -10
                  : 0,
              height: 50,
              marginRight: 5,
              borderBottomRightRadius: 5,
              borderBottomLeftRadius: 5,
              backgroundColor: "rgba(0, 0, 0, 0.60)",
            }}
          />
          <BottomSheetModal
            ref={bottomSheetRef}
            snapPoints={snapPoints}
            enablePanDownToClose
            keyboardBlurBehavior={"restore"}
            android_keyboardInputMode={"adjustPan"}
            enableDismissOnClose
            enableDynamicSizing
            nestedScrollEnabled={true}
            style={{
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 7,
              },
              shadowOpacity: 0.43,
              shadowRadius: 9.51,

              elevation: 15,
            }}
          >
            <BottomSheetView
              style={[StyleSheet.absoluteFill, { alignItems: "center" }]}
            >
              <Text>
                {filteredComments.length} {i18n.t("Comments")}
              </Text>
              <Animated.View
                style={{
                  justifyContent: "flex-end",
                  flex: 1,
                }}
              >
                <Animated.FlatList
                  data={filteredComments}
                  refreshing={refreshing} // Added pull to refesh state
                  onRefresh={_refresh} // Added pull to refresh control
                  extraData={filteredDataSourceGallery}
                  style={{ flex: 1 }}
                  scrollEventThrottle={16}
                  renderItem={(item) => <CommentsView item={item} />}
                  keyExtractor={(item) => item.id}
                />
                <View
                  style={{
                    padding: 10,
                    flexDirection: "row",
                    margin: 20,
                  }}
                >
                  <Image
                    indicator={Progress}
                    resizeMode={FastImage.resizeMode.contain}
                    style={{
                      height: 32,
                      width: 32,
                      marginRight: 10,
                      marginLeft: 10,
                      borderRadius: 16,
                      borderColor: "#e35504",
                      borderWidth: 1,
                      overflow: "hidden",
                      borderRadius: 16,
                    }}
                    source={{
                      priority: FastImage.priority.high,
                      cache: FastImage.cacheControl.immutable,
                      uri: user.user_avatar,
                    }}
                  />
                  <BottomSheetTextInput
                    multiline
<<<<<<< HEAD
                    editable={props.route.params.end >= moment().unix()}
=======
>>>>>>> e76d865257712e7c7332593bf7f785e49ab4cec7
                    ref={input}
                    inputContainerStyle={{ borderBottomWidth: 0 }}
                    autoCapitalize="sentences"
                    underlineColorAndroid="transparent"
                    keyboardType="default"
                    allowFontScaling
                    placeholder={i18n.t("CommentPlaceholder")}
                    placeholderTextColor="grey"
                    enablesReturnKeyAutomatically
                    maxLength={180}
                    onChangeText={addComment}
                    style={{
                      borderColor: "lightgray",
                      borderBottomWidth: 1,
                      borderStyle: "solid",
                      paddingVertical: 5,
                      width: SCREEN_WIDTH - 100,
                    }}
                  />
                  <Icon
                    onPress={() => {
                      if (comment.length > 0) {
                        createEvent();
                        input.current.clear();
                      }
                    }}
                    disabledStyle={{ backgroundColor: "white" }}
                    disabled={props.route.params.end >= moment().unix()}
                    type={"ionicon"}
                    name="arrow-up-circle"
                    size={34}
                    color={
                      props.route.params.end <= moment().unix()
                        ? "lightgrey"
                        : "#e35504"
                    }
                  />
                </View>
              </Animated.View>
            </BottomSheetView>
          </BottomSheetModal>
        </Animated.View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default PhotoViewer;
