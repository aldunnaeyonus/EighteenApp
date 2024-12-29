import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import PropTypes from 'prop-types'

const styles = StyleSheet.create({
  container: {
    paddingTop: 0,
    paddingBottom: 0,
    marginTop: 15,
  },
  infoText: {
    fontSize: 17,
    marginLeft: 20,
    color:"#5A5A5A",
    fontWeight: '700',
  },
})
const InfoText = ({ text }) => (
  <View style={styles.container}>
    <Text style={styles.infoText}>{text}</Text>
  </View>
)

InfoText.propTypes = {
  text: PropTypes.string.isRequired,
}

export default InfoText