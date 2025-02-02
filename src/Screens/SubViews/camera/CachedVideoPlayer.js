import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Video  from 'react-native-video';
import RNFS from 'react-native-fs';
import { ActivityIndicator, MD2Colors } from "react-native-paper";
const { width, height } = Dimensions.get("screen");

const CachedVideoPlayer = ({ url, fileName, videoPlayPause, videoPlayMute }) => {
  const [videoPath, setVideoPath] = useState(null);
  const [loading, setLoading] = useState(true);
  const video = useRef();


  return (
            <Video
              ignoreSilentSwitch="obey"
              playWhenInactive={false}
              playInBackground={false}
              ref={video}
              repeat={false}
              muted={videoPlayMute}
              controls={true}
              paused={videoPlayPause}
              style={{flex:1, width:width, height:height}}
              source={{ uri:url }}
            />
  );
};

export default CachedVideoPlayer;
