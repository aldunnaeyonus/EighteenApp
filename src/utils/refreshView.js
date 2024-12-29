import React from 'react';
import { ActivityIndicator, MD2Colors } from "react-native-paper";


const RefreshView = (props) => {
    return (
        <ActivityIndicator
        size={55}
        animating={props.refreshing}
        hidesWhenStopped={true}
        color={MD2Colors.orange900}
      />
    );
}
export default RefreshView;
