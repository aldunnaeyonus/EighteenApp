import React from 'react';
import { View, Text } from 'react-native';
import { ActivityIndicator, MD2Colors } from "react-native-paper";
import * as i18n from '../../i18n';

const ProgressBar = (props) => {

  return (
<View
      style={{
        zIndex:5000,
        elevation:5000,
        height: props.animating ? "100%" : "0%",
        backgroundColor: "#fff",
        opacity: 0.9,
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
        <ActivityIndicator
          size={80}
          animating={props.animating}
          hidesWhenStopped={true}
          color={MD2Colors.orange900} />
        <Text
          style={{
            color:'grey',
            fontSize:20, 
            fontWeight:400,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 20,
            marginTop: 20,
          }}>
          {props.progress}% {i18n.t('Completed')}
        </Text>
        <Text style={{ 
            alignItems: "center",
            justifyContent: "center", 
            fontSize:20, 
            fontWeight:500 
            }}>
          {props.message}
        </Text>
      </View>
  );
};
export default ProgressBar;
