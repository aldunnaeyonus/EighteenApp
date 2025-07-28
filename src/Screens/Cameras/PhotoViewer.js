import { Share, Alert, Text, View, StyleSheet, Platform } from "react-native";
import React, { useState, useRef, useCallback, useMemo } from "react";
import { Icon } from "react-native-elements";
import Animated from "react-native-reanimated";
import { useFocusEffect } from "@react-navigation/native";
import * as i18n from "../../../i18n";
import ImageGalleryView from "../SubViews/gallery/imageGalleryView";
import VideoGalleryView from "../SubViews/gallery/videoGalleryView";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { SCREEN_WIDTH, url } from "../../utils/constants";
import { axiosPull } from "../../utils/axiosPull";
import { getLocales } from "expo-localization";
import styles from "../../styles/SliderEntry.style";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetTextInput,
  BottomSheetBackdrop,
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
  const snapPoints = useMemo(() => ["60%"], []); // No longer depends on `snapPoints` itself
  const [comment, setComment] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [user] = useMMKVObject("user.Data", storage);
  const [filteredDataSource] = useMMKVObject(
    `user.Gallery.Comment.Feed.${props.route.params.pin}`,
    storage
  );
  const [filteredComments, setFilteredComments] = useState([]);
  const [filteredDataSourceGallery, setGalleryData] = useMMKVObject(
    `user.Gallery.Friend.Feed.${props.route.params.pin}`,
    storage
  );

  const handleSearch = useCallback(
    (index) => {
      if (!filteredDataSourceGallery || filteredDataSourceGallery.length == 0) {
        setFilteredComments([]);
        return;
      }
      const currentMediaId = filteredDataSourceGallery[index]?.image_id;
      if (!currentMediaId || !filteredDataSource) {
        setFilteredComments([]);
        return;
      }

      const filtered = filteredDataSource.filter((media) => {
        return media.media_id == currentMediaId;
      });
      const myData = []
        .concat(filtered)
        .sort((a, b) => String(b.time_date).localeCompare(String(a.time_date)));
      setFilteredComments(myData);
    },
    [filteredDataSource, filteredDataSourceGallery]
  );

  const createEvent = useCallback(async () => {
    if (!comment.trim()) {
      return; // Prevent sending empty comments
    }

    if (!filteredDataSourceGallery || filteredDataSourceGallery.length == 0) {
      Alert.alert(i18n.t("Error"), i18n.t("No media available to comment on."));
      return;
    }

    const currentMedia = filteredDataSourceGallery[activeIndex];
    if (!currentMedia) {
      Alert.alert(i18n.t("Error"), i18n.t("Selected media not found."));
      return;
    }

    const formData = new FormData();
    formData.append("media_id", currentMedia.image_id);
    formData.append("comment", comment);
    formData.append("time_date", moment().unix());
    formData.append("comment_owner", user.user_id);
    formData.append("media_pin", props.route.params.pin);

    try {
      await axios({
        method: "POST",
        url: url + "/camera/addComment.php",
        data: formData,
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
      });
      setComment("");
      if (input.current) {
        input.current.clear();
      }
      await axiosPull._requestComments(props.route.params.pin);
      await axiosPull._pullGalleryFeed(props.route.params.pin, user.user_id);
      // Wait for MMKV to update then refresh comments
      //setTimeout(() => handleSearch(activeIndex), 500); // Small delay to ensure MMKV is updated
    } catch (error) {
      console.error("Error adding comment:", error);
      Alert.alert(i18n.t("Error"), i18n.t("Failed to add comment."));
    }
  }, [
    comment,
    activeIndex,
    filteredDataSourceGallery,
    user.user_id,
    props.route.params.pin,
    handleSearch,
  ]);

  const _refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await axiosPull._requestComments(props.route.params.pin);
      await axiosPull._pullGalleryFeed(props.route.params.pin, user.user_id);
      handleSearch(activeIndex);
    } catch (error) {
      console.error("Refresh error:", error);
    } finally {
      setRefreshing(false);
    }
  }, [activeIndex, handleSearch, props.route.params.pin, user.user_id]);

  const addComment = useCallback((value) => {
    setComment(value);
  }, []);

  const scrollToActiveIndex = useCallback(
    (index) => {
      setActiveIndex(index);
      handleSearch(index);
      newphoto.current?.scrollToOffset({
        offset: index * SCREEN_WIDTH,
        animated: true,
      });
      // Adjust scroll for bottom thumbnail carousel
      if (index * 90 - 80 / 2 > SCREEN_WIDTH / 2) {
        bottomPhoto.current?.scrollToOffset({
          offset: index * 90 - SCREEN_WIDTH / 2 + 80 / 2,
          animated: true,
        });
      } else {
        bottomPhoto.current?.scrollToOffset({
          offset: 0,
          animated: true,
        });
      }
    },
    [handleSearch]
  );

  const _gotoShare = useCallback(async (image) => {
    try {
      await Share.share({ url: image });
    } catch (error) {
      console.error("Error sharing:", error.message);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (newphoto.current) {
        newphoto.current.scrollToIndex({
          animated: false, // Set to false to prevent initial animation issues
          index: props.route.params.pagerIndex,
        });
      }
      if (bottomPhoto.current) {
        bottomPhoto.current.scrollToIndex({
          animated: false, // Set to false
          index: props.route.params.pagerIndex,
        });
      }
      setActiveIndex(props.route.params.pagerIndex); // Ensure activeIndex is set
      handleSearch(props.route.params.pagerIndex);
    }, [handleSearch, props.route.params.pagerIndex])
  );

  const _deleteFeedItemIndex = useCallback(
    (image_id) => {
      setGalleryData((currentData) =>
        currentData.filter((res) => res.image_id != image_id)
      );
    },
    [setGalleryData]
  );

  const _hideContent = useCallback(async () => {
    Alert.alert(
      i18n.t("HideContent"),
      i18n.t("AreyousureyouHide"),
      [
        {
          text: i18n.t("Cancel"),
          style: "destructive",
        },
        {
          text: i18n.t("HideContent"),
          onPress: async () => {
            if (
              !filteredDataSourceGallery ||
              filteredDataSourceGallery.length == 0
            ) {
              Alert.alert(
                i18n.t("Error"),
                i18n.t("No media available to hide.")
              );
              return;
            }
            const currentMedia = filteredDataSourceGallery[activeIndex];
            if (!currentMedia) {
              Alert.alert(i18n.t("Error"), i18n.t("Selected media not found."));
              return;
            }

            const data = {
              user: currentMedia.user_id,
              pin: currentMedia.image_id,
              type: "hide",
              title: "", // This field seems unused for 'hide'
              owner: props.route.params.user,
              locale: getLocales()[0].languageCode,
            };
            _deleteFeedItemIndex(currentMedia.image_id);
            await axiosPull.postData("/camera/report.php", data);
            await axiosPull._pullGalleryFeed(
              props.route.params.pin,
              props.route.params.user
            );
            handleDismissPress(); // Close bottom sheet
            Alert.alert("", i18n.t("HideContentComplete"));
          },
        },
      ],
      { cancelable: false }
    );
  }, [
    _deleteFeedItemIndex,
    activeIndex,
    filteredDataSourceGallery,
    handleDismissPress,
    props.route.params.pin,
    props.route.params.user,
  ]);

  const _reportContent = useCallback(async () => {
    Alert.alert(
      i18n.t("ReportContent"),
      i18n.t("Areyousureyou"),
      [
        {
          text: i18n.t("Cancel"),
          style: "destructive",
        },
        {
          text: i18n.t("ReportContent"),
          onPress: async () => {
            if (
              !filteredDataSourceGallery ||
              filteredDataSourceGallery.length == 0
            ) {
              Alert.alert(
                i18n.t("Error"),
                i18n.t("No media available to report.")
              );
              return;
            }
            const currentMedia = filteredDataSourceGallery[activeIndex];
            if (!currentMedia) {
              Alert.alert(i18n.t("Error"), i18n.t("Selected media not found."));
              return;
            }

            const data = {
              user: currentMedia.user_id,
              pin: currentMedia.image_id,
              title: currentMedia.uri,
              type: "content",
              owner: props.route.params.user,
              locale: getLocales()[0].languageCode,
            };
            await axiosPull.postData("/camera/report.php", data);
            handleDismissPress(); // Close bottom sheet
            Alert.alert("", i18n.t("AreportContent"));
          },
        },
      ],
      { cancelable: false }
    );
  }, [
    activeIndex,
    filteredDataSourceGallery,
    handleDismissPress,
    props.route.params.user,
  ]);

  const onMomentumScrollBegin = useCallback(() => {
    canMomentum.current = true;
  }, []);

  const onMomentumScrollEnd = useCallback(
    (ev) => {
      if (canMomentum.current) {
        const index = Math.floor(
          Math.floor(ev.nativeEvent.contentOffset.x + SCREEN_WIDTH / 2) /
            SCREEN_WIDTH // Added SCREEN_WIDTH / 2 for more accurate snapping
        );
        setActiveIndex(index);
        scrollToActiveIndex(index);
      }
      canMomentum.current = false;
    },
    [scrollToActiveIndex]
  );

  const getItemLayout = useCallback(
    (_, index) => ({
      length: SCREEN_WIDTH,
      offset: SCREEN_WIDTH * index,
      index,
    }),
    []
  );

  const getItemLayoutBottom = useCallback((_, index) => {
    return {
      length: 80,
      offset: index * 90 - SCREEN_WIDTH / 2 + 90 / 2,
      index,
    };
  }, []);

  const handlePresentModalPress = useCallback(() => {
    bottomSheetRef.current?.present();
  }, []);

  const handleDismissPress = useCallback(() => {
    bottomSheetRef.current?.close();
  }, []);

  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        enableTouchThrough={false}
        pressBehavior={"close"}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        {...props}
      />
    ),
    []
  );

  const isEventActive = props.route.params.end >= moment().unix();

  return (
      <View
        style={componentStyles.safeArea}
      >
        <Animated.FlatList
          ref={newphoto}
          extraData={filteredDataSourceGallery}
          nestedScrollEnabled={true}
          showsHorizontalScrollIndicator={false}
          onMomentumScrollBegin={onMomentumScrollBegin}
          onMomentumScrollEnd={onMomentumScrollEnd}
          pagingEnabled
          horizontal
          getItemLayout={getItemLayout}
          style={componentStyles.mainFlatList}
          data={filteredDataSourceGallery}
          keyExtractor={(item) => item.image_id}
          renderItem={({ item, index }) => (
            <ImageGalleryView item={item} index={index} />
          )}
        />

        <Animated.FlatList
          ref={bottomPhoto}
          data={filteredDataSourceGallery}
          horizontal
          getItemLayout={getItemLayoutBottom}
          keyExtractor={(item) => item.image_id}
          style={componentStyles.bottomFlatList}
          extraData={filteredDataSourceGallery}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={componentStyles.bottomFlatListContent}
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
            user.lefthanded == "1"
              ? styles.imageUserNameContainersGalleryLeft
              : styles.imageUserNameContainersGallery
          }
        >
          <Icon
            onPress={_hideContent}
            type={"material"}
            name={"hide-image"}
            size={30}
            color="white"
            containerStyle={componentStyles.iconContainer}
          />
          <Icon
            onPress={_reportContent}
            type={"octicons"}
            name={"report"}
            size={30}
            color="white"
            containerStyle={componentStyles.iconContainer}
          />
          {(props.route.params.share == "1" ||
            props.route.params.owner == props.route.params.user) &&
            filteredDataSourceGallery &&
            filteredDataSourceGallery.length > 0 && (
              <Icon
                onPress={() =>
                  _gotoShare(filteredDataSourceGallery[activeIndex]?.uri)
                }
                type="material-community"
                size={30}
                name="share"
                color="#fff"
                containerStyle={componentStyles.iconContainer}
              />
            )}
          <Icon
            onPress={handlePresentModalPress}
            name={"comment-outline"}
            type="material-community"
            size={30}
            color="white"
            containerStyle={componentStyles.iconContainer}
          />
          <Icon
            onPress={() => {
              props.navigation.goBack();
            }}
            name={"close"}
            size={30}
            color="white"
            containerStyle={[componentStyles.iconContainer]}
          />
          <BottomSheetModal
            ref={bottomSheetRef}
            backdropComponent={renderBackdrop}
            snapPoints={snapPoints}
            index={0}
            enablePanDownToClose
            enableDynamicSizing
            enableDismissOnClose
            keyboardBehavior={Platform.OS == "ios" ? "extend" : "interactive"}
            keyboardBlurBehavior="restore"
            android_keyboardInputMode="adjustResize"
            style={componentStyles.bottomSheetModal}
          >
            <BottomSheetView style={componentStyles.bottomSheetContent}>
              <Text style={componentStyles.commentCountText}>
                {filteredComments.length} {i18n.t("Comments")}
              </Text>
              <View style={{ flex: Platform.OS === "ios" ? 1 : 0.59, height:'auto' }}>
                <Animated.FlatList
                  showsHorizontalScrollIndicator={false}
                  showsVerticalScrollIndicator={false}
                  nestedScrollEnabled={true}
                  data={filteredComments}
                  refreshing={refreshing}
                  onRefresh={_refresh}
                  style={{height:350}}
                  extraData={filteredDataSourceGallery} // Changed to filteredComments
                  scrollEventThrottle={16}
                  renderItem={({ item }) => <CommentsView item={item} />}
                  keyExtractor={(item) => item.id}
                />
                <View
                  style={{
                    padding: 10,
                    flexDirection: "row",
                    margin: 20,
                  }}
                >
                  <View
                    style={{
                      borderWidth: 1.5,
                      borderRadius: 17,
                      borderBottomColor:
                        user.isPro == "1"
                          ? "rgba(116, 198, 190, 1)"
                          : "#ea5504",
                      borderTopColor: user.isPro == "1" ? "#ea5504" : "#ea5504",
                      borderRightColor:
                        user.isPro == "1" ? "rgba(250, 190, 0, 1)" : "#ea5504",
                      borderLeftColor:
                        user.isPro == "1" ? "#3D4849" : "#ea5504",
                      width: 30,
                      height: 30,
                      alignContent: "center",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Image
                      indicator={Progress}
                      resizeMode={FastImage.resizeMode.cover}
                      style={componentStyles.userAvatar}
                      source={{
                        priority: FastImage.priority.high,
                        cache: FastImage.cacheControl.immutable,
                        uri: user.user_avatar,
                      }}
                    />
                  </View>
                  <BottomSheetTextInput
                    multiline
                    editable={isEventActive}
                    ref={input}
                    autoCapitalize="sentences"
                    underlineColorAndroid="transparent"
                    keyboardType="default"
                    allowFontScaling
                    placeholder={i18n.t("CommentPlaceholder")}
                    placeholderTextColor="grey"
                    enablesReturnKeyAutomatically
                    maxLength={180}
                    onChangeText={addComment}
                    style={componentStyles.commentTextInput(isEventActive)}
                  />
                  <Icon
                    onPress={() => {
                      if (comment.length > 0) {
                        createEvent();
                        input.current.clear();
                      }
                    }}
                    disabledStyle={{ backgroundColor: "white" }}
                    disabled={props.route.params.end <= moment().unix()}
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
              </View>
            </BottomSheetView>
          </BottomSheetModal>
        </Animated.View>
      </View>
  );
};

const componentStyles = StyleSheet.create({
  safeArea: {
    backgroundColor: "black",
    flex: 1,
    width: SCREEN_WIDTH,
  },
  mainFlatList: {
    backgroundColor: "black",
    flex: 1,
  },
  bottomFlatList: {
    position: "absolute",
    bottom: 90,
    width: SCREEN_WIDTH,
    flex: 1,
  },
  bottomFlatListContent: {
    paddingHorizontal: 10,
  },
  iconContainer: {
    alignSelf: "flex-end",
    width: 40,
    padding: 5,
    paddingTop: 15,
    height: 50,
    marginRight: 5,
    marginBottom: 15,
  },
  reportIcon: {
    marginTop: -15, // Adjusted margin to prevent overlap
  },
  closeIcon: (hasShareButton) => ({
    marginTop: hasShareButton ? -10 : 0,
    marginBottom: 10,
    borderBottomRightRadius: 5,
    borderBottomLeftRadius: 5,
  }),
  bottomSheetModal: {
    backgroundColor: "transparent",
    elevation: 15,
  },
  bottomSheetContent: {
    flex: 1,
    alignItems: "center",
    paddingTop: 10, // Added padding top
  },
  commentCountText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  commentsListContainer: {
    flex: 1,
    width: "100%",
  },
  commentsFlatList: {
    flex: 1,
    width: "100%", // Ensure FlatList takes full width
  },
  commentInputContainer: {
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 10,
    borderTopWidth: StyleSheet.hairlineWidth, // Subtle separator
    borderColor: "lightgray",
    paddingVertical: 10,
  },
  userAvatar: {
    height: 25,
    width: 25,
    marginRight: 10,
    marginLeft: 10,
    borderRadius: 16,
    borderColor: "#fff",
    borderWidth: 1,
    overflow: "hidden",
  },
  commentTextInput: (isEditable) => ({
    borderColor: "lightgray",
    borderBottomWidth: 1,
    borderStyle: "solid",
    marginLeft: 5,
    marginRight: 5,
    width: SCREEN_WIDTH - 100,
    color: isEditable ? "black" : "grey", // Text color based on editability
  }),
});

export default PhotoViewer;
