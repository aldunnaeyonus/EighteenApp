import React, { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";
import EmptyStateView from "@tttstudios/react-native-empty-state";
import "moment-duration-format";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { storage } from "../../context/components/Storage";
import Animated, { useSharedValue } from "react-native-reanimated";
import { useMMKVObject } from "react-native-mmkv";
import { useToast } from "react-native-styled-toast";
import AllFriendsListItem from "../SubViews/friends/allfriends";
import { useFocusEffect } from "@react-navigation/native";
import * as i18n from "../../../i18n";
import { axiosPull } from "../../utils/axiosPull";
import RefreshableWrapper from "react-native-fresh-refresh";
import RefreshView from "../../utils/refreshView";
import { SearchBar } from "react-native-elements";

const AllFriends = (props) => {
  const [friendData] = useMMKVObject("user.AllFriend.Feed", storage);
  const AnimatedFlatlist = Animated.FlatList;
  const { toast } = useToast();
  const [user] = useMMKVObject("user.Data", storage);
  const contentOffset = useSharedValue(0);
  const [refreshing, serRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [friendDataTemp, setFriendDataTemp] = useMMKVObject(
    "user.Friend.Feed_Temp",
    storage
  );

  const _refresh = async () => {
    serRefreshing(true);
    await axiosPull._pullFriendsFeedABC(user.user_id);
    setTimeout(() => {
      serRefreshing(false);
    }, 1500);
  };

  const _clear = async () => {
    await _pullFriendsFeedABC(user.user_id);
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
        await axiosPull._pullFriendsFeedABC(user.user_id);
      };
      fetchData();
    }, [props, user, refreshing])
  );

  const goToFriend = async (friendID) => {
    props.navigation.navigate("Friends", {
      userID: friendID,
    });
  };

  const searchFunction = (text) => {
    if (text.length <= 0) {
      _clear();
      setSearch("");
    } else {
      const updatedData = friendData.filter((item) => {
        const item_data = `${item.friend_handle.toLowerCase()}`;
        return item_data.indexOf(text.toLowerCase()) > -1;
      });
      setFriendDataTemp(updatedData);
      setSearch(text);
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
          stickyHeaderIndices={[0]}
          ListHeaderComponent={
            <SearchBar
              inputContainerStyle={{ backgroundColor: "white" }}
              containerStyle={{ backgroundColor: "white" }}
              placeholder={i18n.t("Enter Member Username")}
              lightTheme
              value={search}
              onClear={_clear}
              onChangeText={(text) => searchFunction(text)}
              autoCorrect={false}
            />
          }
          ListEmptyComponent={
            <View style={style.empty}>
            <View style={style.fake}>
              <View style={style.fakeCircle} />
              <View
              style={[
                style.fakeLine,
                { width: 150, height:20, marginBottom: 0, bottom:0, },
              ]} />
              
          </View>
            <EmptyStateView
              headerText={i18n.t("Friends List")}
              subHeaderText={search.length > 0 ? i18n.t("SeachEmpty") : i18n.t("Snap Eighteen Friends")}
              headerTextStyle={style.headerTextStyle}
              subHeaderTextStyle={style.subHeaderTextStyle}
            />
            </View>
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
    fontSize: 15,
    color: "rgb(147, 147, 147)",
    paddingHorizontal: 15,
    textAlign: "center",
    marginVertical: 10,
  },
    /** Fake */
    fake: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 24,
      opacity:0.4
    },
    fakeCircle: {
      width: 44,
      height: 44,
      borderRadius: 9999,
      backgroundColor: '#e8e9ed',
      marginRight: 16,
    },
    fakeLine: {
      width: 200,
      height: 10,
      borderRadius: 4,
      backgroundColor: '#e8e9ed',
      marginBottom: 8,
    },
    empty: {
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: 0,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 50,
    },
});

export default AllFriends;
