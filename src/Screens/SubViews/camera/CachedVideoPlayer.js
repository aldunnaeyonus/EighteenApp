import React, { useEffect, useState, useRef } from 'react';
import { View, Dimensions,  StyleSheet} from 'react-native';
import Video, {OnVideoErrorData} from 'react-native-video';
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
      <View style={StyleSheet.absoluteFill}>
       <ActivityIndicator
      size={40}
      animating={loading}
      hidesWhenStopped={true}
      color={MD2Colors.orange900}
    />
      </View>
    );
  }

  const onMediaLoadError = useCallback((error) => {
    console.error(`failed to load media: ${JSON.stringify(error)}`);
  }, []);

  return (
     <View
              style={{
                flex: 1,
                height: height,
                width: width,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "black",
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
              style={StyleSheet.absoluteFill}
              source={{ uri:videoPath }}
              onError={onMediaLoadError}
            /></View>
  );
};

export default CachedVideoPlayer;
