import { StyleSheet } from 'react-native';
import { SCREEN_WIDTH } from '../utils/constants';

export const colors = {
    black: '#1a1917',
    gray: '#888888',
    background1: '#B721FF',
    background2: '#21D4FD'
};

export default StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff'
    },
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    gradient: {
        ...StyleSheet.absoluteFillObject
    },
    scrollview: {
        flex: 1
    },
    exampleContainer: {
        paddingVertical: 30
    },
    exampleContainerDark: {
        backgroundColor: '#3D4849'
    },
    exampleContainerLight: {
        backgroundColor: 'white'
    },
    title: {
        paddingHorizontal: 30,
        backgroundColor: 'transparent',
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center'
    },
    titleDark: {
        color: '#3D4849'
    },
    subtitle: {
        marginTop: 5,
        paddingHorizontal: 30,
        backgroundColor: 'transparent',
        color: 'rgba(255, 255, 255, 0.75)',
        fontSize: 13,
        fontStyle: 'italic',
        textAlign: 'center'
    },
    slider: {
        marginTop: 0,
        overflow: 'visible' // for custom animations
    },
    sliderContentContainer: {
      paddingTop:20,
        paddingVertical: 0 // for custom animation
    },
    paginationContainer: {
        paddingVertical: 8,
    },
    paginationDot: {
        width: 30,
        height: 15,
        borderRadius: 11,
        marginHorizontal: 8
    },
    appButtonContainerButton: {
        marginBottom: 25,
        height:65,
        width: '75%',
        backgroundColor: "#ea5504",
        borderRadius: 10,
        paddingHorizontal: 12,
        alignItems: 'center',
        justifyContent: 'center',
      },
    appButtonContainer: {
      flexDirection: "row",
        marginTop: 20,
        height:65,
        width: '80%',
        backgroundColor: "#e35504",
        borderRadius: 10,
        paddingHorizontal: 62,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: "#e35504"
      },
      appButtonContainerSort: {
        flexDirection: "row",
          margin: 20,
          height:45,
          width: '45%',
          backgroundColor: "#fff",
          borderRadius: 10,
          borderWidth:1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 62,
        },
        appButtonTextSort: {
          fontSize: 20,
          width: SCREEN_WIDTH,
          color: "#3D4849",
          alignSelf: "center",
          textAlign: 'center',
          textTransform: "uppercase"
        },
      appButtonText: {
        fontSize: 27,
        width: SCREEN_WIDTH,
        color: "#fff",
        fontWeight: "bold",
        alignSelf: "center",
        textAlign: 'center',
        textTransform: "uppercase"
      },
      appButtonTextMeduim: {
        fontSize: 22,
        width: SCREEN_WIDTH,
        color: "#fff",
        fontWeight: "bold",
        alignSelf: "center",
        textAlign: 'center',
        textTransform: "uppercase"
      },
      buttonStyle: {
        flex:1,
      },
      addButton: {
        width: 40,
        height: 40,
        resizeMode: 'contain',
      },
        tinyLogo: {
            width: 220,
            height: 220,
            resizeMode: 'contain',
          },
          smalltitleTextError: {
            fontFamily: 'HelveticaNeue-Bold',
            paddingLeft: 25,
            textAlign: 'center',
            paddingRight: 25,
            marginTop: 5,
            fontSize: 15,
            color: 'red',
          },
        smalltitleText: {
            fontFamily: 'HelveticaNeue-Light',
            paddingLeft: 20,
            textAlign: 'center',
            paddingRight: 20,
            marginTop: 25,
            fontSize: 14,
            color: '#3D4849',
          },
          titleText: {
            fontFamily: 'HelveticaNeue-Bold',
            fontSize: 20,
            margin:10,
            color: '#3D4849',
            textAlign: "center",
            fontWeight: 'bold',
          },
          titleText2: {
            fontFamily: 'HelveticaNeue',
            fontSize: 15,
            margin:10,
            marginTop:20,
            color: '#3D4849',
            textAlign: "center",
          },
          searchContainerStyle: {
            backgroundColor: "#fff",
            borderColor:'#3D4849',
            borderWidth: .5,
            borderRadius: 30.0,
            height: 55.0,
            width: '90%',
            margin: 20,
            flexDirection: "row",
            alignItems: "center",
            paddingLeft: 15.0,
            },
            divider: {
              height: StyleSheet.hairlineWidth,
              backgroundColor: "#7F8487",
            },
        container: {
          flex: 1,
          flexDirection: 'column',
          width: SCREEN_WIDTH,
          backgroundColor:'#fff',
          alignItems: 'center',
          justifyContent: 'center',
        },
        bottomContainer: {
            justifyContent: 'center',
            opacity: 0.8,
            marginLeft:10,
            marginRight:10,
            height:'20%',
            backgroundColor: '#fff',
        },
        textInputStyle: {
            height: 60,
            borderWidth: 1,
            paddingLeft: 20,
            marginTop:70,
            width: "90%",
            alignSelf: "center",
            marginBottom: 30,
            borderColor: "#dedede",
            borderRadius: 45,
            backgroundColor: "#FFFFFF",
            fontSize: 24,
          },
          textContainer: {
            justifyContent: 'center',
            alignSelf: "center",
        },
});