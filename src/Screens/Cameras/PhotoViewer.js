import {
  View,
  TouchableOpacity,
  Share,
  Dimensions,
  FlatList
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


const PhotoViewer = (props) => {
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
    if ( index * (80 + 10) - 80 / 2 >  width / 2){
        bottomPhoto?.current.scrollToOffset({
          offset:  index * (80 + 10) - width / 2 + 80 / 2,
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
    }, [props.unsubscribe])
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
    {
      length: width, 
      offset:  width * index, 
      index}
  );

  const getItemLayoutBottom = (data, index) => (
    {
      length: 80, 
      offset:  index * 80 + 10, 
      index
    }
  );

  return  (
    <SafeAreaProvider>
      <SafeAreaView
        style={{
          backgroundColor: "transparent",
          height: "100%",
          width: "100%",
        }}
        edges={["left", "right"]}
      >
     <FlatList
      ref={newphoto}
      getItemLayout={getItemLayout}
      extraData={props.route.params.data}
      showsHorizontalScrollIndicator={false}
      initialScrollIndex={props.route.params.pagerIndex}
      onMomentumScrollBegin={onMomentumScrollBegin}
      onMomentumScrollEnd={onMomentumScrollEnd}
      pagingEnabled
      horizontal
      style={{ backgroundColor: "black"}}
      data={props.route.params.data}
      keyExtractor={(item) => item.image_id}
      renderItem={({item, index}) => <ImageGalleryView item={item} index={index}/>} 
      />
      
      <AnimatedFlatlist
        ref={bottomPhoto}
        data={props.route.params.data} 
        getItemLayout={getItemLayoutBottom}
        horizontal
        initialScrollIndex={props.route.params.pagerIndex}
        keyExtractor={(item) => item.image_id}
        style={{position:'absolute', bottom:90, width:width}}
        extraData={props.route.params.data}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{paddingHorizontal:10}}
        renderItem={({item, index}) => { return (<VideoGalleryView item={item} index={index} scrollToActiveIndex={scrollToActiveIndex} activeIndex={activeIndex}/>)}}
        />


        <View
        style={{
          position: "absolute",
          right: 10,
          zIndex:2,
          top: 40,
          padding: 10,
          borderRadius: 5,
          backgroundColor: "rgba(0, 0, 0, 0.40)",
          gap: 20,
        }}
      >
         <TouchableOpacity
              onPress={() => {
                props.navigation.goBack();
              }}
            >
        <Icon
          name={"close"}
          size={30}
          onPress={props.navigation.goBack}
          color="white"
        />
       </TouchableOpacity>
       { props.route.params.share == "0" || props.route.params.owner == props.route.params.user && (
       
       <TouchableOpacity
              onPress={async () => {
                _gotoShare(props.route.params.data[activeIndex].uri );
              }}
            >
              <Icon
                type="material-community"
                size={30}
                name="share"
                color="#fff"
              />
            </TouchableOpacity>
       )}

      </View>
      </SafeAreaView>
    </SafeAreaProvider>
  )
};


export default PhotoViewer;
