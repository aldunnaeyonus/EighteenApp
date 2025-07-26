import React, { useState, useCallback } from "react"; // Added useEffect
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StyleSheet, Alert, View, Text } from "react-native"; // Added Text for loading/empty states
import EmptyStateView from "@tttstudios/react-native-empty-state";
import { storage } from "../../context/components/Storage";
import { useMMKVObject } from "react-native-mmkv";
import Animated from "react-native-reanimated";
import MemberListItem from "../SubViews/members/memberView";
import { axiosPull } from "../../utils/axiosPull";
import { useToast } from "react-native-styled-toast";
import { useFocusEffect } from "@react-navigation/native";
import * as i18n from "../../../i18n";
import { SearchBar } from "react-native-elements";

const JoinedMembers = (props) => {
  const AnimatedFlatList = Animated.createAnimatedComponent(Animated.FlatList);
  // Renamed data to membersData to avoid confusion with friendDataTemp
  const [membersData, setMembersData] = useMMKVObject(
    "user.Member.Join.Feed." + props.route.params.pin,
    storage
  );
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();
  const [friendDataTemp, setFriendDataTemp] = useMMKVObject(
    "user.Friend.Feed_Temp",
    storage
  );
  const [search, setSearch] = useState("");

  const moreCredits = useCallback(async (user_id_param, pin_param, UUID_param) => { // Renamed params for clarity
    try {
      const data = {
        owner: user_id_param,
        pin: pin_param,
      };
      await axiosPull.postData("/camera/addShots.php", data);
      await axiosPull._pullMembersFeed(pin_param, user_id_param, UUID_param);
      await axiosPull._pullCameraFeed(props.route.params.owner, "owner");
    } catch (error) {
      console.error("Error adding credits:", error);
      toast({ message: i18n.t("Failed to add credits.") });
    }
  }, [props.route.params.owner, toast]);

  const searchFunction = useCallback(
    (text) => {
      setSearch(text);
      if (text.length <= 0) {
        // No need to clear MMKV object, just use the original data
        setFriendDataTemp([]); // Clear temp data to show original membersData
      } else {
        const updatedData = membersData?.filter((item) => { // Use optional chaining
          const item_data = `${item.user_handle?.toLowerCase()}`; // Use optional chaining
          return item_data.includes(text.toLowerCase()); // Use .includes for substring matching
        }) || []; // Provide an empty array if filter results in undefined
        setFriendDataTemp(updatedData);
      }
    },
    [membersData, setFriendDataTemp]
  );

  const _clear = useCallback(async () => {
    setSearch("");
    setFriendDataTemp([]); // Clear temp data to show original membersData
    await axiosPull._pullMembersFeed(
      props.route.params.pin, // Assuming pin is correct here
      props.route.params.owner,
      props.route.params.UUID
    );
  }, [props.route.params.pin, props.route.params.owner, props.route.params.UUID, setFriendDataTemp]);

  const _removeUser = useCallback(async (user_id, pin, UUID, name, title) => {
    Alert.alert(
      i18n.t("Remove Member"),
      i18n.t("Are you sure you want to remove") +
        name +
        i18n.t("from") +
        title +
        " .\n\n " +
        i18n.t("Removing this member will not free up a camera."),
      [
        {
          text: i18n.t("Cancel"),
          onPress: () => console.log("Cancel Pressed"),
          style: "default",
        },
        {
          text: i18n.t("Remove"),
          onPress: async () => {
            try {
              const data = { owner: user_id, pin: pin, id: UUID }; // Corrected owner to user_id
              await axiosPull.postData("/camera/deleteMember.php", data);
              // Re-fetch members after deletion
              await axiosPull._pullMembersFeed(user_id, pin, UUID); // Assuming user_id is correct here
              toast({ message: i18n.t("Member removed successfully.") });
            } catch (error) {
              console.error("Error removing user:", error);
              toast({ message: i18n.t("Failed to remove member.") });
            }
          },
          style: "destructive",
        },
      ],
      { cancelable: false }
    );
  }, [toast]);

  const goToFriend = useCallback(async (friendID) => {
    props.navigation.navigate("Friends", {
      userID: friendID,
    });
  }, [props.navigation]);

  const _refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await axiosPull._pullMembersFeed(
        props.route.params.pin,
        props.route.params.owner,
        props.route.params.UUID
      );
    } catch (error) {
      console.error("Error refreshing members feed:", error);
      toast({ message: i18n.t("Failed to refresh members.") });
    } finally {
      setTimeout(() => {
        setRefreshing(false);
      }, 1500);
    }
  }, [props.route.params.pin, props.route.params.owner, props.route.params.UUID, toast]);

  useFocusEffect(
    useCallback(() => {
      props.navigation.setOptions({
        title: String(props.route.params.title || "").toUpperCase(),
      });

      const intervalId = setInterval(async () => {
        await axiosPull._pullMembersFeed(
          props.route.params.pin,
          props.route.params.owner,
          props.route.params.UUID
        );
      }, 30000); // 30 seconds

      const fetchDataOnFocus = async () => {
        await axiosPull._pullMembersFeed(
          props.route.params.pin,
          props.route.params.owner,
          props.route.params.UUID
        );
      };
      fetchDataOnFocus(); // Initial fetch when screen comes into focus

      return () => {
        clearInterval(intervalId);
        storage.delete("user.Friend.Feed_Temp"); // Clear temp data on blur/unmount
        setMembersData([]); // Clear membersData on unmount/blur for consistency if desired
      };
    }, [
      props.navigation,
      props.route.params.pin,
      props.route.params.owner,
      props.route.params.UUID,
      setMembersData
    ])
  );

  return (
    <SafeAreaProvider style={componentStyles.safeArea}>
      <AnimatedFlatList
        refreshing={refreshing}
        onRefresh={_refresh}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
        bounces={true}
        style={componentStyles.flatList}
        data={search.length > 0 ? friendDataTemp : membersData} // Use membersData for original
        extraData={search.length > 0 ? friendDataTemp : membersData}
        stickyHeaderIndices={[0]}
        scrollEventThrottle={16}
        ListHeaderComponent={
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
        }
        ListEmptyComponent={
          <View style={componentStyles.empty}>
            <View style={componentStyles.fake}>
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
              subHeaderText={i18n.t("Members are Capturing Moments")}
              headerTextStyle={componentStyles.headerTextStyle}
              subHeaderTextStyle={componentStyles.subHeaderTextStyle}
            />
          </View>
        }
        keyExtractor={(item) => item.user_id || Math.random().toString()} // Fallback for keyExtractor
        renderItem={({ item, index }) => ( // Correctly destructure item and index
          <MemberListItem
            item={item}
            index={index}
            _removeUser={_removeUser}
            goToFriend={goToFriend}
            moreCredits={moreCredits}
            pin={props.route.params.pin}
            UUID={props.route.params.UUID}
            title={String(props.route.params.title || "").toUpperCase()}
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
  headerTextStyle: {
    color: "rgb(76, 76, 76)",
    fontSize: 18,
    marginVertical: 10,
  },
  imageStyle: {
    marginTop: 10,
    height: 200,
    width: 200,
    borderRadius: 100,
    overflow: "hidden",
    resizeMode: "contain",
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
  empty: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 50,
  },
  searchBarInputContainer: {
    backgroundColor: "white",
  },
  searchBarContainer: {
    backgroundColor: "white",
  },
});
export default JoinedMembers;