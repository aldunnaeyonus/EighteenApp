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
  useEffect(() => {
    const fetchVideo = async () => {
      setLoading(true);
      try {
        const path = `${RNFS.CachesDirectoryPath}/${fileName}`;
        const fileExists = await RNFS.exists(path);

        if (!fileExists) {
          await RNFS.downloadFile({ fromUrl: url, toFile: path }).promise;
          if (await RNFS.isResumable(fileName)) {
            RNFS.resumeDownload(fileName).promise;
        }
        }
        setVideoPath(path);
      } catch (err) {
        await RNFS.downloadFile({ fromUrl: url, toFile: path }).promise;
        if (await RNFS.isResumable(fileName)) {
          RNFS.resumeDownload(fileName).promise;
      }
      } finally {
        setLoading(false);
      }
      
    };

    fetchVideo();
  }, [url, fileName]);

  if (loading) {
    return (
      <View style={StyleSheet.absoluteFill}>
       <ActivityIndicator
      size={40}
      style={StyleSheet.absoluteFill}
      animating={loading}
      hidesWhenStopped={true}
      color={MD2Colors.orange900}
    />
      </View>
    );
  }

  return (
     <View
     style={{flex:1, width:width, height:height}}

            >
            <Video
              fullscreen={true}
              fullscreenAutorotate={true}
              fullscreenOrientation={"all"}
              ignoreSilentSwitch="obey"
              playWhenInactive={false}
              playInBackground={false}
              ref={video}
              repeat={false}
              muted={videoPlayMute}
              resizeMode={"contain"}
              poster="contain"
              controls={true}
              paused={videoPlayPause}
              style={{flex:1, width:width, height:height}}
              source={{ uri:videoPath }}
            /></View>
  );
};

export default CachedVideoPlayer;
