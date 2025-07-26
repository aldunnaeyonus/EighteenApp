import React, { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";
import EmptyStateView from "@tttstudios/react-native-empty-state";
import "moment-duration-format";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { storage } from "../../context/components/Storage";
import Animated from "react-native-reanimated";
import { useMMKVObject } from "react-native-mmkv";
import { axiosPull } from "../../utils/axiosPull";
import * as i18n from "../../../i18n";
import { useFocusEffect } from "@react-navigation/native";
import BlockedItem from "../SubViews/friends/blockedItems"; // Assuming this is your ListItem component
import { SCREEN_WIDTH } from "../../utils/constants";
import { getLocales } from "expo-localization";

const Blocked = (props) => {
  const AnimatedFlatList = Animated.createAnimatedComponent(Animated.FlatList);
  const [blockedUsers] = useMMKVObject("user.Friend.Blocked", storage);
  const [user] = useMMKVObject("user.Data", storage);
  const [refreshing, setRefreshing] = useState(true); // Set to true to show loading initially

  const _unBlock = useCallback(async (friendID) => {
          const data = {
                      user: friendID,
                      owner: user.user_id,
                      locale: getLocales()[0].languageCode,
                    };
    await axiosPull.postData("/users/unblocked.php", data);
    await axiosPull._pullBlockedFriendsFeedABC(user.user_id);
          },
    [user.user_id]
  );

  const _refresh = useCallback(async () => {
    setRefreshing(true);
      await axiosPull._pullBlockedFriendsFeedABC(user.user_id);
          setRefreshing(false);
  }, [user.user_id]);

  useFocusEffect(
    useCallback(() => {
      _refresh(); // Initial fetch when screen comes into focus
    }, [props.navigation, _refresh])
  );

  return (
    <SafeAreaProvider style={componentStyles.safeArea}>
      <AnimatedFlatList
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
        bounces={true}
        style={componentStyles.flatList}
        data={blockedUsers}
        extraData={blockedUsers}
        onRefresh={_refresh}
        refreshing={refreshing}
        keyExtractor={(item) => item.user_id || Math.random().toString()} // Robust keyExtractor
        ListEmptyComponent={
          <View style={componentStyles.emptyStateContainer}>
            <View style={componentStyles.fakeContent}>
              <View style={componentStyles.fakeCircle} />
              <View
                style={[
                  componentStyles.fakeLine,
                  { width: 150, height: 20, marginRight: 25, opacity: 0.7 },
                ]}
              />
              <View style={[componentStyles.fakeSquare, { opacity: 0.4 }]} />
            </View>
            <EmptyStateView
              headerText={""}
              subHeaderText={i18n.t("Blocked")}
              headerTextStyle={componentStyles.headerTextStyle}
              subHeaderTextStyle={componentStyles.subHeaderTextStyle}
            />
          </View>
        }
        renderItem={({ item, index }) => (
          <BlockedItem
            item={item}
            index={index}
            _unBlock={_unBlock}
          />
        )}
      />
    </SafeAreaProvider>
  );
};

const componentStyles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#fff",
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    color: "#333",
  },
  flatList: {
    flex: 1,
    width: SCREEN_WIDTH,
  },
  emptyStateContainer: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 50,
  },
  fakeContent: {
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
  fakeSquare: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: "#e8e9ed",
  },
  fakeLine: {
    width: 200,
    height: 10,
    borderRadius: 4,
    backgroundColor: "#e8e9ed",
    marginBottom: 8,
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
  backButtonContainer: {
    padding: 7,
    height: 40,
    backgroundColor: "rgba(0, 0, 0, 0.60)",
    borderRadius: 20,
  },
});

export default Blocked;
