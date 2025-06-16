import React, { useState, useCallback, useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Animated from "react-native-reanimated";
import { useToast } from "react-native-styled-toast";
import { storage } from "../../context/components/Storage";
import { useMMKVObject } from "react-native-mmkv";
import { useFocusEffect } from "@react-navigation/native";
import { axiosPull } from "../../utils/axiosPull";
import * as i18n from "../../../i18n";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ListItem from "../SubViews/home/JoinItems";
import { SCREEN_WIDTH, SCREEN_HEIGHT } from "../../utils/constants";
import {TouchableOpacity} from "react-native";
import { Icon } from "react-native-elements";


const Join = (props) => {
  const AnimatedFlatlist = Animated.FlatList;
  const [title, setTitle] = useState("Join Event");
  const [refreshing, setRefreshing] = useState(true);
  const { toast } = useToast();
  const [user] = useMMKVObject("user.Data", storage);
  const [data, setData] = useState([]);



  useEffect(() => {
    const fetchData = async () => {
      setTitle("Loading...");
      props.navigation.setOptions({
        title: title,
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => { props.navigation.navigate("Home") }}  >
            <Icon
              type="material"
              size={25}
              name="arrow-back-ios-new"
              color="#3D4849"
              containerStyle={{
                padding: 0,
                height: 44,
              }}
            />
          </TouchableOpacity>
        ),
      });
      if ((await AsyncStorage.getItem("logedIn")) == "1") {
        checkHandle();
      } else {
        props.navigation.navigate("Begin");
      }
    };
    fetchData();
    
  }, []);



  useFocusEffect(
    useCallback(() => {
      if (!props.unsubscribe) {
        toast({
          message: i18n.t("No internet connection"),
          toastStyles: {
            bg: "#3D4849",
            borderRadius: 5,
          },
          duration: 5000,
          color: "white",
          iconColor: "white",
          iconFamily: "Entypo",
          iconName: "info-with-circle",
          closeButtonStyles: {
            px: 4,
            bg: "translucent",
          },
          closeIconColor: "white",
          hideAccent: true,
        });
      }

    }, [props.unsubscribe])
  );

  const checkHandle = async () => {
    setRefreshing(true);
    const data = {
      pin: props.route.params.pin,
      time: props.route.params.time,
      owner: props.route.params.owner,
      user: user.user_id,
    };
    const reponse = await axiosPull.postData("/join.php", data);
    setData(reponse)
    if (reponse[0].title == undefined) {
      props.navigation.goBack();
    } else {
      props.navigation.setOptions({
        title: reponse[0].userName,
      });
    }
    setRefreshing(false);
  };

  if (refreshing){
    return null;
  }

  return (
    <SafeAreaProvider
      style={{ backgroundColor: "#fff", width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}
    >
      <AnimatedFlatlist
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicatorr={false}
        data={data}
        extraData={data}
        scrollEventThrottle={16}
        renderItem={(item, index) => (
          <ListItem
              item={item}
              index={index}
              isPro={""}
              _gotoStore={()=>{}}
              _deleteFeedItem={()=>{}}
              _joinFeedItem={()=>{}}
              _deleteFeedItemIndex={()=>{}}
              _editEvent={()=>{}}
              _gotoMedia={()=>{}}
              _gotoCamera={()=>{}}
              setQrCodeURL={()=>{}}
              _gotoQRCode={()=>{}}
              _gotoShare={()=>{}}
              _editItem={()=>{}}
              _addMax={()=>{}}
            />
  )}
      />
    </SafeAreaProvider>
  );
};

export default Join;
