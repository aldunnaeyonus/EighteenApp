import React from 'react';

import {View, Image} from 'react-native';

const ActionBarImage = () => {
  return (
    <View style={{flexDirection: 'row'}}>
      <Image
        source={require('../../../assets/long_short.png')}
        style={{
          width: 94,
          height: 35,
          marginLeft: 15,
        }}
      />
    </View>
  );
};

export default ActionBarImage;