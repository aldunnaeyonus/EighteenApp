import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import Video from 'react-native-video';
import RNFS from 'react-native-fs';
import { ActivityIndicator, MD2Colors } from "react-native-paper";

const CachedVideoPlayer = ({ url, fileName }) => {
  const [videoPath, setVideoPath] = useState(null);
  const [loading, setLoading] = useState(true);

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
        console.error('Error downloading video:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [url, fileName]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
       <ActivityIndicator
      size={80}
      animating={loading}
      hidesWhenStopped={true}
      color={MD2Colors.orange900}
    />
      </View>
    );
  }

  return (
    <Video
      source={{ uri: videoPath }}
      style={{ width: '100%', height: 200 }}
      controls
      resizeMode="contain"
    />
  );
};

export default CachedVideoPlayer;
