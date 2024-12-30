import React from 'react';
import { ActivityIndicator, MD2Colors } from "react-native-paper";
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
} from 'react-native-reanimated';

const RefreshView = (props) => {


    return (
      <Animated.View>
        <ActivityIndicator
        size={55}
        animating={props.refreshing}
        hidesWhenStopped={true}
        color={MD2Colors.orange900}
      /></Animated.View>
    );
}
export default RefreshView;
