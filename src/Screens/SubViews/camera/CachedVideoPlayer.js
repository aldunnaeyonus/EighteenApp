import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, StyleSheet } from 'react-native';
import Video  from 'react-native-video';
import RNFS from 'react-native-fs';
import { ActivityIndicator, MD2Colors } from "react-native-paper";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../../../utils/constants';

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
        }
        setVideoPath(path);
      } catch (err) {
        await RNFS.downloadFile({ fromUrl: url, toFile: path }).promise;
      } finally {
        setLoading(false);
      }
    };
    fetchVideo();
  }, [url, fileName]);

   if (loading) {
    return (
      <View style={[
        StyleSheet.absoluteFill, {
          marginTop: SCREEN_HEIGHT / 2
          }]}>
       <ActivityIndicator
      size={40}
      animating={loading}
      hidesWhenStopped={true}
      color={MD2Colors.orange900}
    />
      </View>
    );
  }


  return (
            <Video
              fullscreen={false}
              fullscreenAutorotate={true}
              fullscreenOrientation={"all"}
              ignoreSilentSwitch="obey"
              playWhenInactive={false}
              playInBackground={false}
              ref={video}
              repeat={false}
              muted={videoPlayMute}
              controls={true}
              paused={videoPlayPause}
              style={{width:SCREEN_WIDTH, height:SCREEN_HEIGHT}}
              source={{ uri:videoPath }}
            />
  );
};

export default CachedVideoPlayer;
