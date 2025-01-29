import {
  View,
  TouchableOpacity,
  Share,
  Dimensions
} from "react-native";
import React, { useState, useRef, useCallback } from "react";
import { Icon } from "react-native-elements";
import { storage } from "../../context/components/Storage";
import FastImage from "react-native-fast-image";
import Progress from "react-native-progress";
import Animated from "react-native-reanimated";
import { axiosPull } from "../../utils/axiosPull";
import { useToast } from "react-native-styled-toast";
import { useMMKVObject } from "react-native-mmkv";
import { useFocusEffect } from "@react-navigation/native";
import * as i18n from "../../../i18n";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ImageGalleryView from "../SubViews/gallery/imageGalleryView";

const PhotoViewer = (props) => {
  const [filteredDataSource] = useMMKVObject(
    `user.Gallery.Friend.Feed.${props.route.params.pin}`,
    storage
  );
  const { width } = Dimensions.get("screen");
  const canMomentum = useRef(false);
  const AnimatedFlatlist = Animated.FlatList;
  const bottomPhoto = useRef();
  const newphoto = useRef();
  const { toast } = useToast();
  const [activeIndex, setActiveIndex] = useState(props.route.params.pagerIndex);

  const scrollToActiveIndex = (index) => {
    setActiveIndex(index)
    newphoto?.current?.scrollToOffset({
      offset: index * width,
      animated: true
    })
    if (index * (80 + 10) - 80 / 2 > width / 2){
        bottomPhoto?.current.scrollToOffset({
          offset: index * (80 + 10) - width / 2 + 80 / 2,
          animated: true
        })
    }else {
      bottomPhoto?.current.scrollToOffset({
        offset: 0,
        animated: true
      })
  }
}
  
  const _gotoShare = async (image) => {
    const shareOptions = {
      title: "Snap Eighteen",
      url: image,
      message: props.route.params.title,
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
      props.navigation.setOptions({
        headerLeft: () => (
            <TouchableOpacity
              onPress={() => {
                props.navigation.goBack();
              }}
            >
              <Icon
                type="material"
                size={30}
                name="arrow-back-ios-new"
                color="#fff"
                containerStyle={{
                  padding: 7,
                  height: "100%",
                  backgroundColor: "rgba(0, 0, 0, 0.60)",
                  borderRadius: 22,
                }}
              />
            </TouchableOpacity>
          ),
        headerRight: () => (
          <>
          {filteredDataSource[0].share == "1" || props.route.params.owner == props.route.params.user ? (
            <TouchableOpacity
              onPress={async () => {
                _gotoShare(
                  filteredDataSource[
                    parseInt(await AsyncStorage.getItem("current"))
                  ].uri
                );
              }}
            >
              <Icon
                type="material-community"
                size={30}
                name="share"
                color="#fff"
                containerStyle={{
                  padding: 7,
                  height: "100%",
                  backgroundColor: "rgba(0, 0, 0, 0.60)",
                  borderRadius: 22,
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
                  type="material-community"
                  size={30}
                  name="close-circle-outline"
                  color="#fff"
                  containerStyle={{
                    padding: 7,
                    height: "100%",
                    backgroundColor: "rgba(0, 0, 0, 0.60)",
                    borderRadius: 22,
                  }}
                />
              </TouchableOpacity>
              </>
          ),
      });
    }, [props.route.params.owner])
  );

const onMomentumScrollBegin = () => {
  canMomentum.current = true;
};

const onMomentumScrollEnd = useCallback((ev) => {
    if (canMomentum.current) {
        const index = Math.floor(
            Math.floor(ev.nativeEvent.contentOffset.x) / width
        );
        scrollToActiveIndex(index)
        setActiveIndex(index)
    }
    canMomentum.current = false;
   }, []);

const getItemLayout = (data, index) => (
    {length: width, offset: width * index, index}
  );

  const getItemLayoutBottom = (data, index) => (
    {length: 80, offset: index * (80 + 10) - width / 2 + 80 / 2, index}
  );

  return  (
        <View style={{width:'100%', height:'100%'}}>
     <AnimatedFlatlist
      ref={newphoto}
      getItemLayout={getItemLayout}
      extraData={filteredDataSource}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      initialScrollIndex={props.route.params.pagerIndex}
      onMomentumScrollBegin={onMomentumScrollBegin}
      onMomentumScrollEnd={onMomentumScrollEnd}
      pagingEnabled={true}
      horizontal={true}
      style={{ backgroundColor: "black" }}
      numColumns={1}
      data={filteredDataSource}
      keyExtractor={(item) => item.image_id}
      renderItem={(item, index) => (
        <ImageGalleryView
          item={item}
          index={index}/>
      )} />
      
      <AnimatedFlatlist
        ref={bottomPhoto}
        data={filteredDataSource} 
        getItemLayout={getItemLayoutBottom}
        horizontal={true}
        initialScrollIndex={props.route.params.pagerIndex}
        keyExtractor={(item) => item.image_id}
        style={{position:'absolute', bottom:40}}
        extraData={filteredDataSource}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingHorizontal:10}}
        renderItem={({item, index}) => {
          return (
          <TouchableOpacity
          onPress={()=> {
            scrollToActiveIndex(index)
          }}
          >
             <FastImage 
        progress={Progress}
        resizeMode={FastImage.resizeMode.cover}
        source={{
          cache: FastImage.cacheControl.immutable,
          priority: FastImage.priority.high,
          uri:
            item.type == "video"
              ? item.videoThumbnail
              : item.thumbnail,
        }}
        style={{ width: 80, height: 80, borderRadius:12, marginRight:10, borderWidth:2, borderColor: activeIndex === index ? 'white' : 'transparent'}}
        >
           {item.type === "video" && (
                    <Icon
                      type="material-community"
                      name="play-box-outline"
                      size={30}
                      containerStyle={{
                        width: 50,
                        height: 50,
                        top: 25,
                        left: 12.5,
                      }}
                      color="white"
                    />
                  )}
                  </FastImage> 
        </TouchableOpacity>
   ) }}
        />
        </View>
  )
};


export default PhotoViewer;
