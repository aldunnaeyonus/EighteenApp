import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet,Easing } from 'react-native';
const CombinedAnimation = () => {
  const rotateValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Rotate animation
       Animated.loop(
         Animated.sequence([
            Animated.timing(rotateValue, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
            easing: Easing.linear
          }),
            Animated.timing(rotateValue, {
            toValue: 2,
            duration: 1500,
            useNativeDriver: true,
            easing: Easing.linear
          }),
         ])
        ).start();
  }, [rotateValue]);

  const combinedStyle = {
    transform: [
      // {
      //   translateX: rotateValue.interpolate({
      //     inputRange: [0, 1],
      //     outputRange: [0, 50],
      //   }),
      // },
      // {
      //   translateY: rotateValue.interpolate({
      //     inputRange: [0, 1],
      //     outputRange: [0, 50],
      //   }),
      // },
      {
        rotate: rotateValue.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '360deg'],
        }),
      },
      {
        scale: pulseValue,
      },
    ],
  };


  return (
    <View style={styles.container}>
      <Animated.View style={[styles.box, combinedStyle]}>
        <Animated.Image
          source={require("../../../assets/favicon.png")}
          style={styles.box}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding:5
  },
  box: {
    width: 50,
    height: 50,
  },
});

export default CombinedAnimation;
