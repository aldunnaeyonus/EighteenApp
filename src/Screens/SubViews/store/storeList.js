import React from "react";
import { Text, View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as i18n from "../../../../i18n";
import FeatherIcon from 'react-native-vector-icons/Feather';

const StoreListItem = (props) => {
const isActive = selected === props.index;
  return (
              <TouchableOpacity 
                key={index}
                onPress={() => {
                  props.handleBuyProduct(props.item.item.productId)
                  }}>
                <View
                  style={[
                    styles.radio,
                    isActive
                      ? { borderColor: '#F82E08', backgroundColor: '#feeae6' }
                      : {},
                  ]}>
                  <FeatherIcon
                    color={isActive ? '#F82E08' : '#363636'}
                    name={isActive ? 'check-circle' : 'circle'}
                    size={24} />

                  <View style={styles.radioBody}>
                    <View>
                      <Text style={styles.radioLabel}>{props.item.item.title}</Text>

                      <Text style={styles.radioText}>{props.item.item.description}</Text>
                    </View>

                    <Text
                      style={[
                        styles.radioPrice,
                        isActive && styles.radioPriceActive,
                      ]}>
                      {props.item.item.localizedPrice}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
};

const styles = StyleSheet.create({
  /** Radio */
  radio: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    borderWidth: 2,
    borderColor: 'transparent',
    borderStyle: 'solid',
    borderRadius: 24,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  radioBody: {
    paddingLeft: 10,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  radioLabel: {
    fontSize: 19,
    fontWeight: '700',
    color: '#1d1d1d',
  },
  radioText: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: '500',
    color: '#889797',
  },
  radioPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1d1d1d',
  },
  radioPriceActive: {
    transform: [
      {
        scale: 1.2,
      },
    ],
  },
});

export default StoreListItem;
