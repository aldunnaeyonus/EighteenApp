import React, {ReactNode} from 'react';
import {View} from 'react-native';


interface BoxProps {
  children: ReactNode;
}

export const Box = ({children}: BoxProps) => (
  <View>{children}</View>
);
