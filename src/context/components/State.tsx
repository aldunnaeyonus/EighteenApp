import React from 'react';
import {Text, View } from 'react-native';

interface StateProps {
  connected: boolean;
  storekit2?: boolean;
}

export const State = ({connected, storekit2}: StateProps) => {
  const stateText =
    (connected ? 'Store is Online' : 'Store is Offline')
      return (
    <View style={{
        borderColor: '#36B37E', borderWidth:2, margin:5, padding:5, marginBottom:45, marginTop:15, backgroundColor:'#36B37E', borderRadius:10, opacity:0.7
      }}>
      <Text style={{
        color:'white', textAlign:'center', fontWeight:'600', fontSize:20
      }}>
        {stateText}</Text>
    </View>
  );
};
