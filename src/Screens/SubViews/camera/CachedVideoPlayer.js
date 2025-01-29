import React, { useEffect, useState, useRef } from 'react';
import { View, Dimensions } from 'react-native';
import Video from 'react-native-video';
import RNFS from 'react-native-fs';
import { ActivityIndicator, MD2Colors } from "react-native-paper";
const { width, height } = Dimensions.get("window");

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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', height: height, width: width }}>
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
     <View
              style={{
                flex: 1,
                height: height,
                width: width,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "transparent",
              }}
            >
            <Video
              fullscreen={true}
              fullscreenAutorotate={true}
              fullscreenOrientation={"all"}
              ignoreSilentSwitch="obey"
              showNotificationControls={true}
              playWhenInactive={false}
              playInBackground={false}
              ref={video}
              controls={true}
              repeat={false}
              muted={videoPlayMute}
              resizeMode={"contain"}
              paused={videoPlayPause}
              style={{
                backgroundColor: "black",
                height: height, 
                width: width,
              }}
              source={{ 
                uri:videoPath }}
            /></View>
  );
};

export default CachedVideoPlayer;
