import React, { useState, useCallback } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StyleSheet, Alert, View } from "react-native";
import RefreshableWrapper from "react-native-fresh-refresh";
import EmptyStateView from "@tttstudios/react-native-empty-state";
import { storage } from "../../context/components/Storage";
import { useMMKVObject } from "react-native-mmkv";
import Animated, { useSharedValue } from "react-native-reanimated";
import RefreshView from "../../utils/refreshView";
import MemberListItem from "../SubViews/members/memberView";
import { axiosPull } from "../../utils/axiosPull";
import { useToast } from "react-native-styled-toast";
import { useFocusEffect } from "@react-navigation/native";
import * as i18n from "../../../i18n";
import { SearchBar } from "react-native-elements";

const JoinedMembers = (props) => {
  const AnimatedFlatlist = Animated.FlatList;
  const contentOffset = useSharedValue(0);
  const [data] = useMMKVObject(
    "user.Member.Join.Feed." + props.route.params.pin,
    storage
  );
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();
  const [friendDataTemp, setFriendDataTemp] = useMMKVObject(
    "user.Friend.Feed_Temp",
    storage
  );
  const moreCredits = async (user, pin, UUID) => {
    const data = {
      owner: user,
      pin: pin,
    };
    await axiosPull.postData("/camera/addShots.php", data);
    await axiosPull._pullMembersFeed(pin, user, UUID)
    await axiosPull._pullCameraFeed(props.route.params.owner, "owner");
  }
  const [search, setSearch] = useState("");
  const searchFunction = (text) => {
    if (text.length <= 0) {
      _clear();
      setSearch("");
    } else {
      const updatedData = data.filter((item) => {
        const item_data = `${item.user_handle.toLowerCase()}`;
        return item_data.indexOf(text.toLowerCase()) > -1;
      });
      setFriendDataTemp(updatedData);
      setSearch(text);
    }
  };
  const _clear = async () => {
    await axiosPull._pullMembersFeed(props.route.params.owner, props.route.params.pin, props.route.params.UUID);
  };

  const _removeUser = (user_id, pin, UUID, name, title) => {
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
            //_deleteFeedItemIndex(user_id, pin);
            const data = { owner: user_id, pin: pin, id: UUID };
            await axiosPull.postData("/camera/deleteMember.php", data);
            await axiosPull._pullMembersFeed(user_id, pin, UUID);
          },
          style: "destructive",
        },
      ],
      { cancelable: false }
    );
  };

  const goToFriend = async (friendID) => {
    props.navigation.navigate("Friends", {
      userID: friendID,
    });
  };

  // const _deleteFeedItemIndex = (user_id, pin) => {
  //   data.forEach((res, index) => {
  //     if (res.user_id == user_id) {
  //       setData((prevState) => {
  //         prevState.splice(index, 1);
  //         storage.set(
  //           "user.Member.Join.Feed." + pin,
  //           JSON.stringify(prevState)
  //         );
  //         return [...prevState];
  //       });
  //     }
  //   });
  // };

  const _refresh = async () => {
    setRefreshing(true);
    await axiosPull._pullMembersFeed(
      props.route.params.pin,
      props.route.params.owner,
      props.route.params.UUID
    );
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
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
      props.navigation.setOptions({
        title: String(props.route.params.title).toUpperCase(),
      });
      var timeout = setInterval(async () => {
        await axiosPull._pullMembersFeed(
          props.route.params.pin,
          props.route.params.owner,
          props.route.params.UUID
        );
      }, 30000);
      const fetchData = async () => {
        await axiosPull._pullMembersFeed(
          props.route.params.pin,
          props.route.params.owner,
          props.route.params.UUID
        );
      };
      fetchData();
      return () => {
        clearInterval(timeout);
                storage.delete("user.Friend.Feed_Temp");
      };
    }, [data, props, refreshing])
  );

  return (
    <SafeAreaProvider style={{ backgroundColor: "#fff", flex: 1 }}>
      <RefreshableWrapper
        contentOffset={contentOffset}
        managedLoading={true}
        bounces={true}
        defaultAnimationEnabled={true}
        Loader={() => <RefreshView refreshing={refreshing} />}
        isLoading={refreshing}
        onRefresh={_refresh}
      >
        <AnimatedFlatlist
                    style={{ flex: 1}}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicatorr={false}
          data={search.length > 0 ? friendDataTemp : data}
          extraData={search.length > 0 ? friendDataTemp : data}
          stickyHeaderIndices={[0]}
                  nestedScrollEnabled={true}
          scrollEventThrottle={16}
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
                { width: 150, height:20, marginRight:25,  opacity:0.7},
              ]} />
              <View style={[style.fakeSquare, { opacity:0.4}]} />
          </View>
          <EmptyStateView
              headerText={""}
              subHeaderText={i18n.t("Members are Capturing Moments")}
              headerTextStyle={style.headerTextStyle}
              subHeaderTextStyle={style.subHeaderTextStyle}
            />
            </View>
          }
          keyExtractor={(item) => item.user_id}
          renderItem={(item, index) => (
            <MemberListItem
              item={item}
              index={index}
              _removeUser={_removeUser}
              goToFriend={goToFriend}
              moreCredits={moreCredits}
              pin={props.route.params.pin}
              UUID={props.route.params.UUID}
              title={String(props.route.params.title).toUpperCase()}
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
  fakeSquare: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: '#e8e9ed',
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
export default JoinedMembers;
