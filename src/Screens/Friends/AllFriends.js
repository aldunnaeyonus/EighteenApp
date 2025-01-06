import React, { useCallback, useState } from "react";
import { StyleSheet} from "react-native";
import EmptyStateView from "@tttstudios/react-native-empty-state";
import "moment-duration-format";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { storage } from "../../context/components/Storage";
import Animated, { useSharedValue } from "react-native-reanimated";
import { useMMKVObject } from "react-native-mmkv";
import { useToast } from "react-native-styled-toast";
import AllFriendsListItem from "../../SubViews/friends/allfriends";
import { useFocusEffect } from "@react-navigation/native";
import * as i18n from "../../../i18n";
import { axiosPull } from "../../utils/axiosPull";
import RefreshableWrapper from "react-native-fresh-refresh";
import RefreshView from "../../utils/refreshView";
import { SearchBar } from 'react-native-elements'

const AllFriends = (props) => {
  const [friendData] = useMMKVObject("user.Friend.Feed", storage);
  const AnimatedFlatlist = Animated.FlatList;
  const { toast } = useToast();
  const [user] = useMMKVObject("user.Data", storage);
  const contentOffset = useSharedValue(0);
  const [refreshing, serRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [friendDataTemp, setFriendDataTemp] = useMMKVObject("user.Friend.Feed_Temp", storage);

  const _refresh = async () => {
    serRefreshing(true);
    await axiosPull._pullFriendsFeed(user.user_id);
    setTimeout(() => {
      serRefreshing(false);
    }, 1500);
  };

  const _clear = async () => {
    await _pullFriendsFeed(user.user_id);
  };

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
      const fetchData = async () => {
        await axiosPull._pullFriendsFeed(user.user_id);
      };
      fetchData();
    }, [props, user, refreshing])
  );

  const goToFriend = async (
    friendID,
    handle,
    avatar,
    motto,
    type,
    created,
    upload,
    join,
    joined,
    tz,
    location,
    privacy,
    isPro
  ) => {
    props.navigation.navigate("Friends", {
      userID: friendID,
      userName: handle,
      userAvatar: avatar,
      motto: motto,
      type: type,
      upload: upload,
      join: join,
      create: created,
      tz: tz,
      location: location,
      joined: joined,
      privacy: privacy,
      isPro: isPro
    });
  };

  const searchFunction = (text) => {
    if (text.length <= 0){
      _clear();
      setSearch('');
    }else{
    const updatedData = friendData.filter((item) => {
      const item_data = `${item.friend_handle.toLowerCase()}`;
      return item_data.indexOf(text.toLowerCase()) > -1;
    });
    setFriendDataTemp(updatedData);
    setSearch(text)
  }
  };

  return (
    <SafeAreaProvider style={{ backgroundColor: "#fff" }}>
      <RefreshableWrapper
        contentOffset={contentOffset}
        managedLoading={true}
        bounces={true}
        defaultAnimationEnabled={true}
        Loader={() => <RefreshView refreshing={refreshing} />}
        isLoading={refreshing}
        onRefresh={() => {
          _refresh();
        }}
      >
        <AnimatedFlatlist
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicatorr={false}
          data={search.length > 0 ? friendDataTemp : friendData}
          extraData={search.length > 0 ? friendDataTemp : friendData}
          scrollEventThrottle={16}
          EmptyStateView={<></>}
          ListHeaderComponent={
            <SearchBar
            inputContainerStyle={{backgroundColor: 'white'}}
            containerStyle={{backgroundColor: 'white'}}
            placeholder={i18n.t("Enter Member Username")}
            lightTheme
            value={search}
            onClear={_clear}
            onChangeText={(text) => searchFunction(text)}
            autoCorrect={false}
          />
          }
          ListEmptyComponent={
            <EmptyStateView
              imageSource={require("../../../assets/6960670.png")}
              imageStyle={{ width: 300, height: 200 }}
              headerText={i18n.t("Friends List")}
              subHeaderText={i18n.t("Snap Eighteen Friends")}
              headerTextStyle={style.headerTextStyle}
              subHeaderTextStyle={style.subHeaderTextStyle}
            />
          }
          keyExtractor={(item) => item.UUID}
          renderItem={(item, index) => (
            <AllFriendsListItem
              index={index}
              item={item}
              goToFriend={goToFriend}
            />
          )}
        />
      </RefreshableWrapper>
    </SafeAreaProvider>
  );
};
const style = StyleSheet.create({
  headerTextStyle: {
    color: "rgb(76, 76, 76)",
    fontSize: 18,
    marginVertical: 10,
  },
  subHeaderTextStyle: {
    fontSize: 12,
    color: "rgb(147, 147, 147)",
    paddingHorizontal: 60,
    textAlign: "center",
    marginVertical: 10,
  },
});

export default AllFriends;
