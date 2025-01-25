import React, { useRef } from "react";
import {
    View,
    Text,
    Dimensions,
  } from "react-native";
const { width: ScreenWidth } = Dimensions.get("window");
import { ActivityIndicator, MD2Colors } from "react-native-paper";
import FastImage from "react-native-fast-image";
import { createImageProgress } from "react-native-image-progress";
const Image = createImageProgress(FastImage);
import Progress from "react-native-progress";
import Video from "react-native-video";

const Loading = (props) => {
  const video = useRef();
  const photo = useRef();
  const mime = String(props.image).split(".").pop().toLowerCase();

  return (
    <View
    style={{
      display:props.flex == "flex" ? 'flex' : 'none',
      margin:5,
      flex:1,
      height: 40,
      width: ScreenWidth,
      flexDirection:'row',
      alignContent:'center',
      alignItems:'center',
    }}
  >
    {
        (mime == "mov") || (mime == "mpeg") || (mime == "mp4") ?
  		        <Video
                    fullscreen={false}
                    fullscreenAutorotate={false}
                    ignoreSilentSwitch="obey"
                    showNotificationControls={false}
                    playWhenInactive={false}
                    playInBackground={false}
                    ref={video}
                    controls={false}
                    repeat={false}
                    muted={true}
                    resizeMode={"cover"}
                    paused={true}
                    style={{
                      borderRadius:6,
                      height: 40, 
                      width: 40,
                    }}
                    source={{ 
                      cache: FastImage.cacheControl.immutable,
                      priority: FastImage.priority.high,
                      uri: props.image 
                    
                    }}
                  />
    :
     <Image
     ref={photo}
     blurRadius={3}
      style={{
        width: 40,
        height: 40,
        borderRadius:6
      }}
      indicator={Progress}
      source={{
        cache: FastImage.cacheControl.immutable,
        priority: FastImage.priority.high,
        uri: props.image
      }}
    />
}
     <ActivityIndicator
            style={{marginLeft:15}}
            size={15}
            hidesWhenStopped={true}
            color={MD2Colors.orange900}
          />
    <Text 
     style={{
        marginLeft:15,
        fontWeight:'600',
        fontSize:15
      }}
    >{props.message}</Text>

    </View>
)
}
export default Loading;
