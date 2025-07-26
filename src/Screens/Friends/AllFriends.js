import React, { useCallback, useState, useEffect, memo } from "react";
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
import { SearchBar } from "react-native-elements";
import { TouchableOpacity } from "react-native";
import { Icon } from "react-native-elements";
import { SCREEN_WIDTH, SCREEN_HEIGHT } from "../../utils/constants";

const AllFriends = (props) => {
  const [friendData] = useMMKVObject("user.AllFriend.Feed", storage);
  const AnimatedFlatList = Animated.createAnimatedComponent(Animated.FlatList);
  const [user] = useMMKVObject("user.Data", storage);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [friendDataTemp, setFriendDataTemp] = useMMKVObject(
    "user.Friend.Feed_Temp",
    storage
  );

  const _refresh = useCallback(async () => {
    setRefreshing(true);
    await axiosPull._pullFriendsFeedABC(user.user_id);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, [user.user_id]); // Dependency on user.user_id

  const _clear = useCallback(async () => {
    await axiosPull._pullFriendsFeedABC(user.user_id);
    setSearch(""); // Clear search bar text
    storage.delete("user.Friend.Feed_Temp"); // Clear temporary data
  }, [user.user_id]);

  useEffect(() => {
    props.navigation.setOptions({
      headerRight: () => (
          <Icon
           onPress={() => { // Wrap with useCallback
            props.navigation.navigate("GlobalFriends");
          }}
            type="material-community"
            size={30}
            name="account-search-outline"
            color="#3D4849"
            containerStyle={{
              height: 44,
              top: 5,
            }}
          />
      ),
    });
  }, [props.navigation]); // Dependency on props.navigation

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        await axiosPull._pullFriendsFeedABC(user.user_id);
        storage.delete("user.Friend.Feed_Temp");
        setSearch(""); // Clear search on focus to show all friends
      };
      fetchData();
    }, [user.user_id]) // Dependency on user.user_id
  );

  const goToFriend = useCallback((friendID) => {
    props.navigation.navigate("Friends", {
      userID: friendID,
    });
  }, [props.navigation]); // Dependency on props.navigation

  const searchFunction = useCallback(
    (text) => {
      setSearch(text);
      if (text.length > 0 && friendData) { // Ensure friendData exists before filtering
        const updatedData = friendData.filter((item) => {
          const item_data = `${item.friend_handle.toLowerCase()}`;
          return item_data.includes(text.toLowerCase()); // Use .includes() for more robust search
        });
        setFriendDataTemp(updatedData);
      } else {
        setFriendDataTemp([]); // Clear temp data if search is empty
      }
    },
    [friendData, setFriendDataTemp] // Dependencies for searchFunction
  );

  const dataToDisplay = search.length > 0 ? friendDataTemp : friendData;

  return (
    <SafeAreaProvider style={componentStyles.safeArea}>
      <SearchBar
        inputContainerStyle={componentStyles.searchBarInputContainer}
        containerStyle={componentStyles.searchBarContainer}
        placeholder={i18n.t("Enter Member Username")}
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
        removeClippedSubviews={false}
        bounces={true}
        style={componentStyles.flatList}
        data={dataToDisplay}
        extraData={dataToDisplay}
        scrollEventThrottle={16}
        ListEmptyComponent={
          <View style={componentStyles.empty}>
            <View style={componentStyles.fake}>
              <View style={componentStyles.fakeCircle} />
              <View style={[componentStyles.fakeLine, componentStyles.fakeLineCustom]} />
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
        renderItem={({ item, index }) => ( // Destructure item and index
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

export default AllFriends;