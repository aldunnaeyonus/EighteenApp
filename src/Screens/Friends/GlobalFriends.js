import React, { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";
import EmptyStateView from "@tttstudios/react-native-empty-state";
import "moment-duration-format";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { storage } from "../../context/components/Storage";
import Animated from "react-native-reanimated";
import { useMMKVObject } from "react-native-mmkv";
import AllFriendsListItem from "../SubViews/friends/allfriends";
import { useFocusEffect } from "@react-navigation/native";
import * as i18n from "../../../i18n";
import { axiosPull } from "../../utils/axiosPull";
import { SCREEN_WIDTH, SCREEN_HEIGHT } from "../../utils/constants";
import { SearchBar } from "react-native-elements";

const GlobalFriends = (props) => {
  const [friendData] = useMMKVObject("user.All.Global.Friend.Feed", storage);
  const AnimatedFlatList = Animated.createAnimatedComponent(Animated.FlatList);
  const [user] = useMMKVObject("user.Data", storage);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState(""); // Renamed and initialized to empty string

  const _searchDB = useCallback(
    async (searchText) => {
      setSearch(searchText);
      // Keep Keyboard open after type by not calling external actions here that might close it.
      await axiosPull._pullFriendsAllFeedABC(user.user_id, searchText);
    },
    [user.user_id]
  );

  const _clear = useCallback(async () => {
    setSearch("");
    // Clear the stored data for global friends to ensure a fresh fetch
    storage.set("user.All.Global.Friend.Feed", JSON.stringify([]));
    await axiosPull._pullFriendsAllFeedABC(user.user_id, "");
  }, [user.user_id]);

  const _refresh = useCallback(async () => {
    setRefreshing(true);
    await _clear(); // Clear and re-fetch for refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, [_clear]);

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        // Clear search text and data when screen is focused
        setSearch("");
        storage.set("user.All.Global.Friend.Feed", JSON.stringify([]));
        await axiosPull._pullFriendsAllFeedABC(user.user_id, "");
      };
      fetchData();
    }, [user.user_id]) // Dependencies for fetchData
  );

  const goToFriend = useCallback(
    (friendID) => {
      props.navigation.navigate("Friends", {
        userID: friendID,
      });
    },
    [props.navigation]
  );

  const searchFunction = useCallback(
    (text) => {
      if (text.length <= 0) {
        _clear();
      } else {
        _searchDB(text);
      }
    },
    [_clear, _searchDB]
  );

  return (
    <SafeAreaProvider style={componentStyles.safeArea}>
      <SearchBar
        blurOnSubmit={false}
        inputContainerStyle={componentStyles.searchBarInputContainer}
        containerStyle={componentStyles.searchBarContainer}
        placeholder={i18n.t("SearchGlobalFriends")}
        lightTheme
        value={search}
        onClear={_clear}
        onChangeText={searchFunction}
        autoCorrect={false}
      />
      <AnimatedFlatList
        refreshing={refreshing}
        onRefresh={_refresh}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="always"
        bounces={true}
        style={componentStyles.flatList}
        data={friendData}
        extraData={friendData}
        scrollEventThrottle={16}
        ListEmptyComponent={
          <View style={componentStyles.empty}>
            <View style={componentStyles.fake}>
              <View style={componentStyles.fakeCircle} />
              <View
                style={[
                  componentStyles.fakeLine,
                  componentStyles.fakeLineCustom,
                ]}
              />
            </View>
            <EmptyStateView
              headerText={i18n.t("Friends List")}
              subHeaderText={
                search.length > 0
                  ? i18n.t("SeachEmpty")
                  : i18n.t("Snap Eighteen Friends")
              }
              headerTextStyle={componentStyles.headerTextStyle}
              subHeaderTextStyle={componentStyles.subHeaderTextStyle}
            />
          </View>
        }
        keyExtractor={(item) => item.UUID}
        renderItem={({ item, index }) => (
          <AllFriendsListItem
            index={index}
            item={item}
            goToFriend={goToFriend}
          />
        )}
      />
    </SafeAreaProvider>
  );
};

const componentStyles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#fff",
  },
  searchBarInputContainer: {
    backgroundColor: "white",
  },
  searchBarContainer: {
    backgroundColor: "white",
  },
  flatList: {
    flex: 1,
    height: SCREEN_HEIGHT,
    width: SCREEN_WIDTH,
  },
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
  fake: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    opacity: 0.4,
  },
  fakeCircle: {
    width: 44,
    height: 44,
    borderRadius: 9999,
    backgroundColor: "#e8e9ed",
    marginRight: 16,
  },
  fakeLine: {
    width: 200,
    height: 10,
    borderRadius: 4,
    backgroundColor: "#e8e9ed",
    marginBottom: 8,
  },
  fakeLineCustom: {
    width: 150,
    height: 20,
    marginBottom: 0,
    bottom: 0,
  },
  empty: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 50,
  },
});

export default GlobalFriends;