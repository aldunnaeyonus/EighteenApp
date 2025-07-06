import {
  View,
  TouchableOpacity,
  Share,
  FlatList,
  StatusBar,
  Alert,
} from "react-native";
import React, { useState, useRef, useCallback } from "react";
import { Icon } from "react-native-elements";
import Animated from "react-native-reanimated";
import { useToast } from "react-native-styled-toast";
import { useFocusEffect } from "@react-navigation/native";
import * as i18n from "../../../i18n";
import ImageGalleryView from "../SubViews/gallery/imageGalleryView";
import VideoGalleryView from "../SubViews/gallery/videoGalleryView";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { SCREEN_WIDTH, SCREEN_HEIGHT } from "../../utils/constants";
import { axiosPull } from "../../utils/axiosPull";
import { getLocales } from "expo-localization";

const PhotoViewer = (props) => {
  const canMomentum = useRef(false);
  const AnimatedFlatlist = Animated.FlatList;
  const bottomPhoto = useRef();
  const newphoto = useRef();
  const { toast } = useToast();
  const [activeIndex, setActiveIndex] = useState(props.route.params.pagerIndex);
  const [galleryData, setDalleryData] = useState(props.route.params.data);

  const scrollToActiveIndex = (index) => {
    setActiveIndex(index);
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
      StatusBar.setHidden(true, "none");
      newphoto?.current.scrollToIndex({
        animate: true,
        index: props.route.params.pagerIndex,
      });
      bottomPhoto?.current.scrollToIndex({
        animate: true,
        index: props.route.params.pagerIndex,
      });
      return () => {
        StatusBar.setHidden(false, "none");
      };
    }, [])
  );


  const _deleteFeedItemIndex = (image_id) => {
    galleryData.forEach((res, index) => {
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
              user: galleryData[activeIndex].user_id,
              pin: galleryData[activeIndex].image_id,
              type: "hide",
              title: "",
              owner: props.route.params.user,
              locale: getLocales()[0].languageCode,
            };
            _deleteFeedItemIndex(galleryData[activeIndex].image_id);
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
              user: galleryData[activeIndex].user_id,
              pin: galleryData[activeIndex].image_id,
              title: galleryData[activeIndex].uri,
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
      scrollToActiveIndex(index);
      setActiveIndex(index);
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
        <FlatList
          ref={newphoto}
          extraData={galleryData}
          nestedScrollEnabled={true}
          showsHorizontalScrollIndicator={false}
          onMomentumScrollBegin={onMomentumScrollBegin}
          onMomentumScrollEnd={onMomentumScrollEnd}
          pagingEnabled
          horizontal
          getItemLayout={getItemLayout}
          style={{ backgroundColor: "black", flex: 1 }}
          data={galleryData}
          keyExtractor={(item) => item.image_id}
          renderItem={({ item, index }) => (
            <ImageGalleryView item={item} index={index} />
          )}
        />

        <AnimatedFlatlist
          ref={bottomPhoto}
          data={galleryData}
          horizontal
          getItemLayout={getItemLayoutBottom}
          keyExtractor={(item) => item.image_id}
          style={{
            position: "absolute",
            bottom: 90,
            width: SCREEN_WIDTH,
            flex: 1,
          }}
          extraData={galleryData}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 10 }}
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

        <View
          style={{
            position: "absolute",
            right: 10,
            zIndex: 2,
            top: 40,
            height:'auto',
            borderRadius: 5,
            flexDirection: "column",
            justifyContent: "flex-end",
            backgroundColor: "transparent",
          }}
        >
            <TouchableOpacity
              onPress={() => {
                _hideContent();
              }}
            >
              <Icon
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
                  marginBottom:15,
                  borderTopRightRadius: 5,
                  borderTopLeftRadius: 5,
                  backgroundColor: "rgba(0, 0, 0, 0.60)",
                }}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                _reportContent();
              }}
            >
              <Icon
                type={"material"}
                name={"report-problem"}
                size={30}
                color="white"
                containerStyle={{
                  alignSelf: "flex-end",
                  width: 40,
                  padding: 5,
                  paddingTop: 15,
                  marginTop:-15,
                  height: 50,
                  marginRight: 5,
                  backgroundColor: "rgba(0, 0, 0, 0.60)",
                }}
              />
            </TouchableOpacity>
          {props.route.params.share == "1" ||
          props.route.params.owner == props.route.params.user ? (
            <TouchableOpacity
              onPress={async () => {
                _gotoShare(galleryData[activeIndex].uri);
              }}
            >
              <Icon
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
                  marginBottom:10,
                  backgroundColor: "rgba(0, 0, 0, 0.60)",
                }}
              />
            </TouchableOpacity>
          ) : (
            <></>
          )}
          <TouchableOpacity
            onPress={() => {
              props.navigation.goBack();
            }}
          >
            <Icon 
            name={"close"} 
            size={30} 
            color="white" 
            containerStyle={{
                  alignSelf: "flex-end",
                  width: 40,
                  paddingTop: 10,
                  marginTop:props.route.params.share == "1" || props.route.params.owner == props.route.params.user ? -10 : 0,
                  height: 50,
                  marginRight: 5,
                  borderBottomRightRadius: 5,
                  borderBottomLeftRadius: 5,
                  backgroundColor: "rgba(0, 0, 0, 0.60)",
                }}
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default PhotoViewer;
