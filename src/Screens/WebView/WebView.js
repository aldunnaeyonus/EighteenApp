import React, { useCallback, useState } from "react";
import { WebView } from "react-native-webview";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useToast } from "react-native-styled-toast";
import { useFocusEffect } from '@react-navigation/native';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from "../../utils/constants";
import { ActivityIndicator } from "react-native-paper";

const WebViewer = (props) => {
  const { toast } = useToast();
  // Renamed to isLoading for clarity, but kept original 'disable' for consistency with your code
  const [disable, setDisable] = useState(true); 

  useFocusEffect(
    useCallback(() => {
      props.navigation.setOptions({
        headerTitle: props.route.params.name,
        headerRight: () => (
          <ActivityIndicator
            color="black"
            size={"small"}
            animating={disable} // `animating` prop controls visibility
            hidesWhenStopped={true} // Hides the indicator when animating is false
          />
        ),
      });
    }, [props.navigation, props.route.params.name, disable]) // Add disable as a dependency because headerRight depends on it.
  );

  // Use useCallback to memoize the onLoadEnd function
  const handleLoadEnd = useCallback(() => {
    setDisable(false); // Set to false when loading ends
  }, []);

  return (
    <SafeAreaProvider>
      <WebView
        onLoadEnd={handleLoadEnd} // Use onLoadEnd for better indication of content loaded
        style={{
          width: SCREEN_WIDTH,
          height: SCREEN_HEIGHT,
          backgroundColor: 'white'
        }}
        source={{ 
          uri: props.route.params.url 
        }}
        onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error('WebView error:', nativeEvent);
            toast({ message: `Failed to load: ${nativeEvent.description}` });
            setDisable(false); // Ensure indicator is hidden even on error
        }}
      />
    </SafeAreaProvider>
  );
}

export default WebViewer;