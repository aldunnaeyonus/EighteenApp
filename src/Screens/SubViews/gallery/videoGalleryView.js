import React  from "react";
import { TouchableOpacity, View } from "react-native";
import { createImageProgress } from "react-native-image-progress";
import FastImage from "react-native-fast-image";
const Image = createImageProgress(FastImage);
import Progress from "react-native-progress";
import { Icon } from "react-native-elements";

const VideoGalleryView = (props) => {

    return (
   <View
          style={{
            height: 80,
            width: 80,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "transparent",
          }}
        >
        <TouchableOpacity
         style={{
          height: 80,
          width: 80,
        }}
          onPress={()=> {props.scrollToActiveIndex(props.index) }}
          >
        <Image 
        progress={Progress}
        resizeMode={FastImage.resizeMode.cover}
        source={{
          cache: FastImage.cacheControl.immutable,
          priority: FastImage.priority.high,
          uri:props.item.type == "video"
              ? props.item.videoThumbnail
              : props.item.thumbnail,
        }}
        style={{overflow:'hidden', width: 80, height: 80, borderRadius:12, marginRight:10, borderWidth:2, borderColor: props.activeIndex ===  props.index ? 'white' : 'transparent'}}
        >
           { props.item.type === "video" && (
                    <Icon
                      type="material-community"
                      name="play-box-outline"
                      size={20}
                      containerStyle={{
                        width: 50,
                        height: 50,
                        top: 30,
                        left: 12.5,
                      }}
                      color="white"
                    />
                  )}
                  </Image> 
        </TouchableOpacity>
        </View>
    )
};
export default VideoGalleryView;
