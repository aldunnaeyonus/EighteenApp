import React, { useCallback, useState } from "react";
import { WebView } from "react-native-webview";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useToast } from "react-native-styled-toast";
import { useFocusEffect } from '@react-navigation/native';
import * as i18n from '../../../i18n';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from "../../utils/constants";
import { ActivityIndicator } from "react-native-paper";

const WebViewer = (props) => {
  const { toast } = useToast();
  const [disable, setdisable] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!props.unsubscribe){
        toast({
          message: i18n.t("No internet connection"),
          toastStyles: {
            bg: '#3D4849',
            borderRadius: 5
          },
          duration: 5000,
          color: 'white',
          iconColor: 'white',
          iconFamily: 'Entypo',
          iconName: 'info-with-circle',
          closeButtonStyles: {
            px: 4,
            bg: 'translucent',
          },
          closeIconColor: 'white',
          hideAccent: true
        });
      }
      props.navigation.setOptions({
        headerTitle: props.route.params.name,
        headerRight: () => (
          <ActivityIndicator
            color="black"
            size={"small"}
            animating={disable}
            hidesWhenStopped={true}
          />
        ),
      });
    }, [props, disable])
  );

  return (
    <SafeAreaProvider>
      <WebView
              onLoad={() => {
                setdisable(false);
              }}
            style={{
              width:SCREEN_WIDTH,
              height:SCREEN_HEIGHT,
              backgroundColor:'white'
            }}
        source={{ 
          uri: props.route.params.url 
        }}
      />
    </SafeAreaProvider>
  );
}

export default WebViewer;
