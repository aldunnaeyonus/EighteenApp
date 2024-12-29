import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

interface HeadingProps {
  copy: string;
  label?: string;
}

export const Heading = ({copy, label}: HeadingProps) => (
  <View style={styles.heading}>
    <Text >{copy}</Text>
    {label && <Text >{label}</Text>}
  </View>
);

const styles = StyleSheet.create({
  heading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'grey',
    borderRadius: 8 - 2,
  },

});
