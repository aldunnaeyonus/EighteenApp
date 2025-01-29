import React, { useState, useCallback } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StyleSheet, Alert } from "react-native";
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

const JoinedMembers = (props) => {
  const AnimatedFlatlist = Animated.FlatList;
  const contentOffset = useSharedValue(0);
  const [data, setData] = useMMKVObject(
    "user.Member.Join.Feed." + props.route.params.pin,
    storage
  );
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const moreCredits = async (user, pin, UUID) => {
    const data = {
      owner: user,
      pin: pin,
    };
    await axiosPull.postData("/camera/addShots.php", data);
    await axiosPull._pullCameraFeed(user, "owner");
    await axiosPull._pullMembersFeed(pin, user, UUID)
  }

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
            _deleteFeedItemIndex(user_id, pin);
            const data = { owner: user_id, pin: pin, id: UUID };
            await axiosPull.postData("/camera/deleteMember.php", data);
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

  const _deleteFeedItemIndex = (user_id, pin) => {
    data.forEach((res, index) => {
      if (res.user_id == user_id) {
        setData((prevState) => {
          prevState.splice(index, 1);
          storage.set(
            "user.Member.Join.Feed." + pin,
            JSON.stringify(prevState)
          );
          return [...prevState];
        });
      }
    });
  };

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
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicatorr={false}
          data={data}
          extraData={data}
          scrollEventThrottle={16}
          ListEmptyComponent={
            <EmptyStateView
              imageSource={require("../../../assets/6029678.png")}
              imageStyle={style.imageStyle}
              headerText={""}
              subHeaderText={i18n.t("Members are Capturing Moments")}
              headerTextStyle={style.headerTextStyle}
              subHeaderTextStyle={style.subHeaderTextStyle}
            />
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
    fontSize: 12,
    color: "rgb(147, 147, 147)",
    paddingHorizontal: 60,
    textAlign: "center",
    marginVertical: 10,
  },
});
export default JoinedMembers;
