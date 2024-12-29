import React  from 'react';
import {Text, View,TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as i18n from '../../../i18n';

const StoreListItem = (props) => {
    return (
<View
        key={props.index}
        style={{
          marginLeft: 10,
          marginRight: 10,
          padding: 10,
          marginTop:10,
          borderRadius: 5,
          shadowColor: "rgba(0, 0, 0, 1)",
          shadowOpacity: 0.4,
          shadowRadius: 3,
          shadowOffset: {
          height: 1,
          width: 1,
          },
          backgroundColor: "#FFF",
          height:300,
          elevation: 7,
          flex: 1,
          alignSelf: "center",
          alignItems:'center',
        }}>
          <Text style={{
            color: '#4DAAEE',
            fontFamily: 'HelveticaNeue-Medium',
            fontSize: 16,
            textAlign:'center',
          }}>{`${i18n.t('Upgradeto')} \n${props.item.item.description}`.toLocaleUpperCase()}</Text>
          
           <View style={{
            backgroundColor: '#62cff4',
            borderRadius: 30,
            marginTop:15,
            justifyContent: "center",
            height:35,
            width: 100,
          }}>
           <Text style={{
            color: 'black',
            fontFamily: 'HelveticaNeue-Medium',
            fontSize: 20,
            textAlign:'center',
          }}>{props.item.item.localizedPrice}</Text></View>
          <Text style={{
            marginTop:15,
            marginBottom:10,
            color: 'black',
            fontFamily: 'HelveticaNeue-Bold',
            fontSize: 13,
          }}>{i18n.t('Advantages of Purchase')}</Text>

              <View style={{
              alignSelf: "center",
              alignItems:'center',
              }}>
            <View style={{
              flexDirection: 'row',
              alignSelf: "left",
              alignItems:'left',
              }}>
            <Ionicons
              name={'checkmark-outline'}
              size={20}
              color="green"
            />
            <Text style={{
              backgroundColor: 'white',
              margin:3,
              fontSize: 13,
              fontFamily: 'HelveticaNeue-Light',
              textAlign: 'center',
            }}>{props.item.item.localizedPrice == "$19.99" ? i18n.t('Most Popular') : props.item.item.localizedPrice == "$29.99" ? i18n.t('Wedding Value') : props.item.item.localizedPrice == "$9.99" ? i18n.t('Party Value') : i18n.t('Cheapest Value')}</Text>
            </View>

            <View style={{
              flexDirection: 'row',
              alignSelf: "left",
              alignItems:'left',
              }}>
            <Ionicons
              name={'checkmark-outline'}
              size={20}
              color="green"
            />
             <Text style={{
              backgroundColor: 'white',
              fontFamily: 'HelveticaNeue-Light',
              margin: 5,
              fontSize: 13,
              textAlign: 'center',
            }}>{ i18n.t('One Time Purchase')}</Text>
                        </View>


             <View style={{
              flexDirection: 'row',
              alignSelf: "left",
              alignItems:'left',
              }}>
            <Ionicons
              name={'checkmark-outline'}
              size={20}
              color="green"
            />
                         <Text style={{
              backgroundColor: 'white',
              margin: 5,
              fontFamily: 'HelveticaNeue-Light',
              fontSize: 13,
              textAlign: 'center',
            }}>{props.item.item.localizedPrice == "$0.99" ? i18n.t("18  More Shots") : props.item.item.localizedPrice == "$19.99" ? (100 * 18 ) + ((25 - parseInt(props.cameras)) * 18)+ " "+i18n.t("More Shots") : props.item.item.localizedPrice == "$29.99" ? (200 * 18 ) + ((25 - parseInt(props.cameras)) * 18)+ " "+i18n.t("More Shots") : props.item.item.localizedPrice == "$9.99" ? (50 * 18 ) + ((25 - parseInt(props.cameras)) * 18)+ " "+i18n.t("More Shots") : (18 * 18 ) + ((25 - parseInt(props.cameras)) * 18)+ " "+i18n.t("More Shots")}</Text>
                        </View>
            <TouchableOpacity
            style={
              {
                flexDirection: 'row',
                marginTop: 20,
                width: 150,
                backgroundColor: "#e35504",
                borderRadius: 12,
                padding:10,
                alignItems: 'center',
                justifyContent: 'center',
              }
            }
            onPress={() => { props.handleBuyProduct(props.item.item.productId); } }
            >
            <Text
              style={{
                textTransform: "uppercase",
                fontSize: 17,
                fontFamily: 'HelveticaNeue-Light',
                fontWeight: 600,
                color: "#fff",
              }}
            >
            { i18n.t('Purchase')}
            </Text>
          </TouchableOpacity>
                        </View>
      </View>
    );
}

export default StoreListItem;
