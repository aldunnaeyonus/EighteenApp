import React from 'react';
import {Button as RNButton, StyleSheet, View} from 'react-native';

interface ButtonProps {
  title: string;

  onPress(): void;
}

export const Button = ({title, onPress}: ButtonProps) => (
  <View style={[styles.button]}>
    <RNButton title={title} onPress={onPress} />
  </View>
);

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'grey',
    borderRadius: 8 - 2,
  },
});
