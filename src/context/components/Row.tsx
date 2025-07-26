import React, {ReactNode} from 'react';
import {StyleSheet, Text, View, ViewStyle} from 'react-native';
interface RowField {
  label: string;
  value: string;
}

interface RowProps {
  children?: ReactNode;
  fields: RowField[];
  flexDirection?: ViewStyle['flexDirection'];
  isLast?: boolean;
}

export const Row = ({
  children,
  fields,
  flexDirection = 'row',
  isLast,
}: RowProps) => (
  <View style={{flexDirection}}>
    <View>
      {fields.map((field, index) => (
        <View
          style={[styles.row, fields.length - 1 == index && styles.rowLast]}
          key={field.label}>
          <Text style={{}}>{field.label}</Text>
          <Text style={{}}>{field.value}</Text>
        </View>
      ))}
    </View>

    {children}
  </View>
);

const styles = StyleSheet.create({
  row: {
    marginBottom: 10,
  },

  rowLast: {
    marginBottom: 0,
  },
});
