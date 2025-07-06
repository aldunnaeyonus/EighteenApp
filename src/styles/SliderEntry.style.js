import { StyleSheet, Platform } from 'react-native';
import { colors } from './index.style';
import { SCREEN_WIDTH } from '../utils/constants';

const IS_IOS = Platform.OS === 'ios';

function wp (percentage) {
    const value = (percentage * SCREEN_WIDTH) / 100;
    return Math.round(value);
}
const slideWidth = wp(75);
const itemHorizontalMargin = wp(2);

export const sliderWidth = SCREEN_WIDTH;
export const itemWidth = slideWidth + itemHorizontalMargin * 3;

const entryBorderRadius = 8;

export default StyleSheet.create({
    header: {
        flex: 1,
        height: 340,
        resizeMode: 'center'
      },
      subHeader: {
        backgroundColor : "#2089dc",
        color : "white",
        textAlign : "center",
        paddingVertical : 5,
        marginBottom : 10
      },
    avatar: {
        width: 30,
        overflow:'hidden',
        height: 30,
        borderRadius: 15,
        borderWidth: 1,
        alignSelf: "auto",
        margin:5,
        borderColor: "#000",
      },
      centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      },
      modalView: {
        width: "80%",
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 7,
      },
      slideInnerContainerMinus: {
        width: '100%',
        height: 200,
        paddingHorizontal: itemHorizontalMargin,
        paddingBottom: Platform.OS =='android' ?  10 : 13 // needed for shadow
    },
    slideInnerContaineMember: {
      width: '100%',
      height: 130,
      paddingBottom: Platform.OS =='android' ?  10 : 13 // needed for shadow
  },
    slideInnerContainer: {
        width: '100%',
        height: 450,
        paddingHorizontal: itemHorizontalMargin,
        paddingBottom: 18 // needed for shadow
    },
    dividerStyle: {
        height: 0.5,
        borderRadius: 16,
        width: SCREEN_WIDTH * 1.0,
        alignSelf: "center",
        backgroundColor: "#ccc",
        
      },
    dividerTableStyle: {
      height: 0.5,
      marginTop: 10,
      marginBottom: 10,
      width: SCREEN_WIDTH * 1,
      alignSelf: "center",
      backgroundColor: "#ccc",
    },
    animatedQrCode: {
      backgroundColor:'#fff', 
      borderTopRightRadius:10, 
      borderTopLeftRadius:10, 
      position: 'absolute', 
      width:SCREEN_WIDTH,  
      height:'100%', 
      opacity:0.0
    },
    animatedQrCodeImage: {
      width:200,  
      height:200, 
      justifyContent: 'center',
      alignItems: 'center',
    },
    shadow: {
        position: 'absolute',
        top: 0,
        backgroundColor: 'white',
        left: itemHorizontalMargin,
        right: itemHorizontalMargin,
        bottom: 18,
        shadowColor: colors.black,
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: 10 },
        shadowRadius: 10,
        elevation: 7,
        borderRadius: entryBorderRadius
    },
    shadow2: {
      top: 0,
      backgroundColor: 'white',
      borderBottomColor: "rgba(0, 0, 0, 0.02)",
      borderBottomWidth:0.5
  },
    imageUserNameContainer: {
        position: 'absolute',
        overflow:'hidden',
        flexDirection: "column",
        justifyContent: 'flex-end',
        backgroundColor: 'transparent',
        width: SCREEN_WIDTH,
    },
    imageUserNameSmallContainers: {
      position: 'absolute',
      overflow:'hidden',
      right:5,
      top:20,
      flexDirection: "column",
      justifyContent: 'flex-end',
      backgroundColor: 'transparent',
      width: 80,
  },
      imageUserNameSmallContainersLeft: {
      position: 'absolute',
      overflow:'hidden',
      left:-25,
      top:20,
      flexDirection: "column",
      justifyContent: 'flex-end',
      backgroundColor: 'transparent',
      width: 80,
  },
    imageUserNameContainers: {
      position: 'absolute',
      overflow:'hidden',
      right:5,
      top:175,
      flexDirection: "column",
      justifyContent: 'flex-end',
      backgroundColor: 'transparent',
      width: 80,
  },
      imageUserNameContainersLeft: {
      position: 'absolute',
      overflow:'hidden',
      left:-25,
      top:175,
      flexDirection: "column",
      justifyContent: 'flex-end',
      backgroundColor: 'transparent',
      width: 80,
  },
    imageUserNameTitleBlack: {
        fontFamily: 'HelveticaNeue-Medium',
        fontSize: 18,
        color: '#000',
      },
    imageUserNameTitle: {
        marginRight: 'auto',
        alignSelf: "center",
        fontFamily: 'HelveticaNeue',
        fontWeight:'bold',
        fontSize: 18,
        marginLeft: 5,
        marginBottom:0,
        color: '#3D4849',
      },
      imagTimeTitle: {
        alignSelf: "auto",
        fontStyle:'600',
        fontSize: 14,
        marginTop: 0,
        color: '#3D4849',
        flexDirection: "row",
      },
      appButtonContainer: {
        flexDirection: "row",
          marginTop: 20,
          height:50,
          width: 200,
          backgroundColor: "#ea5504",
          borderRadius: 10,
          alignItems: 'center',
          justifyContent: 'center',
        },
        appButtonContainerSave: {
          flex: 1,
          flexDirection: "row",
            margin: 20,
            height:65,
            backgroundColor: "#ea5504",
            borderRadius: 10,
            paddingHorizontal: 62,
            alignItems: 'center',
            justifyContent: 'center',
          },
    imageContainer: {
        flex: 1,
        marginBottom: IS_IOS ? 0 : -1, // Prevent a random Android rendering issue
        backgroundColor: 'grey',
        borderTopLeftRadius: entryBorderRadius,
        borderTopRightRadius: entryBorderRadius,
        shadowColor: colors.black,
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: 10 },
        shadowRadius: 10,
    },
    imageContainerEven: {
        backgroundColor: colors.black,
        shadowColor: colors.black,
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: 10 },
        shadowRadius: 10,
    },
    image: {
        ...StyleSheet.absoluteFillObject,
        resizeMode: 'cover',
        overflow:'hidden',
        backgroundColor: 'grey',
        borderRadius: IS_IOS ? entryBorderRadius : 0,
        borderTopLeftRadius: entryBorderRadius,
        borderTopRightRadius: entryBorderRadius,
        shadowColor: colors.black,
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: 10 },
        shadowRadius: 10,
    },
    // image's border radius is buggy on iOS; let's hack it!
    radiusMask: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'grey',
        height: entryBorderRadius,
        shadowColor: colors.black,
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: 10 },
        shadowRadius: 10,
    },
    radiusMaskEven: {
        backgroundColor: colors.black,
        shadowColor: colors.black,
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: 10 },
        shadowRadius: 10,
    },
    textContainer: {
        justifyContent: 'center',
        paddingTop: 20 - entryBorderRadius,
        paddingBottom: 20,
        marginTop: -5,
        paddingHorizontal: 16,
        backgroundColor: '#ffffff',
        borderBottomLeftRadius: entryBorderRadius,
        borderBottomRightRadius: entryBorderRadius
    },
    bottomContainer: {
        justifyContent: 'center',
        paddingTop: 20 - entryBorderRadius,
        paddingBottom: 20,
        backgroundColor:'#000',
        paddingHorizontal: 16,
        backgroundColor: '#ea5504',
        borderBottomLeftRadius: entryBorderRadius,
        borderBottomRightRadius: entryBorderRadius
    },
    textContainerEven: {
        backgroundColor: '#3D4849'
    },
    appButtonText: {
      fontSize: 25,
      width: SCREEN_WIDTH,
      color: "#fff",
      fontWeight: "bold",
      alignSelf: "center",
      textAlign: 'center',
      textTransform: "uppercase"
    },
    titleText: {
        fontFamily: 'HelveticaNeue-Bold',
        fontSize: 17,
        color: '#3D4849',
        textAlign:'flex-start',
        fontWeight: 'bold',
      },
      titleTextTimeLeft: {
        fontFamily: 'HelveticaNeue',
        fontSize: 15,
        textAlign: 'center',
        marginTop: 10,
        color: '#fff',
      },
    titleEven: {
        fontFamily: 'HelveticaNeue-Bold',
        fontSize: 17,
        color: '#fff',
        fontWeight: 'bold',
    },
    subtitle: {
        marginTop: 6,
        color: colors.gray,
        fontSize: 15,
        fontStyle: 'italic'
    },
    subtitleEven: {
        color: 'rgba(255, 255, 255, 0.7)'
    },
    QrCodecontainer: {
      flex: 1,
      marginTop: 10,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor:'#fff'
    },
    container: {
        flex: 1,
        backgroundColor: '#fff'
      },
      buttonStyle: {
        flex:1,
        marginRight:25,
        height: 35,
        marginTop:15,
      },
});