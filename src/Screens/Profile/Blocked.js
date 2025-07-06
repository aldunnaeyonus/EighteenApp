import React, { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";
import EmptyStateView from "@tttstudios/react-native-empty-state";
import "moment-duration-format";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { storage } from "../../context/components/Storage";
import Animated from "react-native-reanimated";
import { useMMKVObject } from "react-native-mmkv";
import { useToast } from "react-native-styled-toast";
import BlockedItems from "../SubViews/friends/blockedItems";
import { useFocusEffect } from "@react-navigation/native";
import * as i18n from "../../../i18n";
import { axiosPull } from "../../utils/axiosPull";
import { SearchBar } from "react-native-elements";
import { getLocales } from "expo-localization";
import { ActivityIndicator } from "react-native-paper";
import { SCREEN_WIDTH, SCREEN_HEIGHT } from "../../utils/constants";

const Blocked = (props) => {
  const [friendData] = useMMKVObject("user.Friend.Blocked", storage);
  const AnimatedFlatList = Animated.createAnimatedComponent(Animated.FlatList);
  const { toast } = useToast();
  const [user] = useMMKVObject("user.Data", storage);
  const [refreshing, serRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [friendDataTemp, setFriendDataTemp] = useMMKVObject(
    "user.Friend.Blocked_Temp",
    storage
  );
  
  const _refresh = async () => {
    serRefreshing(true);
    await axiosPull._pullBlockedFriendsFeedABC(user.user_id);
    setTimeout(() => {
      serRefreshing(false);
    }, 1500);
  };

  const _clear = async () => {
    await _pullFriendsFeedABC(user.user_id);
  };

  useFocusEffect(
    useCallback(() => {

      const fetchData = async () => {
        await axiosPull._pullBlockedFriendsFeedABC(user.user_id);
        storage.delete("user.Friend.Blocked_Temp");
      };
      fetchData();
    }, [props, user, refreshing])
  );

  const unblock = async (friendID) => {
    props.navigation.setOptions({
        headerRight: () => (
          <ActivityIndicator color="black" size={"small"} animating={true} />
        ),
      });
                    const data = {
                      user: friendID,
                      owner: user.user_id,
                      locale: getLocales()[0].languageCode,
                    };
    await axiosPull.postData("/users/unblocked.php", data);
    await axiosPull._pullBlockedFriendsFeedABC(user.user_id);
    props.navigation.setOptions({
        headerRight: () => (
          <></>
        ),
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
        <AnimatedFlatList
          refreshing={refreshing} // Added pull to refesh state
          onRefresh={_refresh} // Added pull to refresh control
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
          bounces={true}
          style={{ flex: 1, height: SCREEN_HEIGHT, width: SCREEN_WIDTH}}
          data={search.length > 0 ? friendDataTemp : friendData}
          extraData={search.length > 0 ? friendDataTemp : friendData}
          scrollEventThrottle={16}
          stickyHeaderIndices={[0]}
          ListHeaderComponent={
            <SearchBar
              inputContainerStyle={{ backgroundColor: "white" }}
              containerStyle={{ backgroundColor: "white" }}
              placeholder={i18n.t("SearchBlocked")}
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
                    { width: 150, height: 20, marginBottom: 0, bottom: 0 },
                  ]}
                />
              </View>
              <EmptyStateView
                headerText={i18n.t("Blocked")}
                headerTextStyle={style.headerTextStyle}
              />
            </View>
          }
          keyExtractor={(item) => item.UUID}
          renderItem={(item, index) => (
            <BlockedItems index={index} item={item} unblock={unblock} />
          )}
        />
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
  empty: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 50,
  },
});

export default Blocked;
