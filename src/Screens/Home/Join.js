import React, { useState, useEffect, useCallback, useMemo } from "react"; // Added useCallback, useMemo
import { SafeAreaProvider } from "react-native-safe-area-context";
import Animated from "react-native-reanimated";
import { storage } from "../../context/components/Storage";
import { useMMKVObject } from "react-native-mmkv";
import { axiosPull } from "../../utils/axiosPull";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ListItem from "../SubViews/home/JoinItems";
import { SCREEN_WIDTH, SCREEN_HEIGHT } from "../../utils/constants";
import { TouchableOpacity, StyleSheet, View, Text } from "react-native"; // Added View, Text for loading
import { Icon } from "react-native-elements";

const Join = ({ route, navigation }) => { // Destructure route and navigation from props
  const AnimatedFlatList = useMemo( // Memoize AnimatedFlatList
    () => Animated.createAnimatedComponent(Animated.FlatList),
    []
  );
  const [title, setTitle] = useState("Join Event");
  const [refreshing, setRefreshing] = useState(true);
  const [user] = useMMKVObject("user.Data", storage);
  const [data, setData] = useState([]);

  const checkHandle = useCallback(async () => {
    setRefreshing(true);
    try {
      const payload = {
        pin: route.params.pin,
        time: route.params.time,
        owner: route.params.owner,
        user: user.user_id,
      };
      const response = await axiosPull.postData("/join.php", payload);
      setData(response);

      if (response && response[0]?.title) { // Use optional chaining
        navigation.setOptions({
          title: response[0].userName || "Join Event", // Fallback title
        });
      } else {
        navigation.goBack(); // Go back if no valid data
      }
    } catch (error) {
      console.error("Error fetching join data:", error);
      navigation.goBack(); // Go back on error
    } finally {
      setRefreshing(false);
    }
  }, [route.params.pin, route.params.time, route.params.owner, user.user_id, navigation]);

  useEffect(() => {
    const initialize = async () => {
      setTitle("Loading...");
      navigation.setOptions({
        title: "Loading...",
        headerLeft: () => (
          <TouchableOpacity onPress={() => navigation.navigate("Home")}>
            <Icon
              type="material"
              size={25}
              name="arrow-back-ios-new"
              containerStyle={componentStyles.backButtonContainer}
              textStyle={componentStyles.backButtonText}
            />
          </TouchableOpacity>
        ),
      });

      if ((await AsyncStorage.getItem("logedIn")) == "1") {
        checkHandle();
      } else {
        navigation.navigate("Begin");
      }
    };
    initialize();
  }, [navigation, checkHandle]); // Add checkHandle to dependencies

  // Memoized empty functions for props that are not used in ListItem
  const emptyFunction = useCallback(() => {}, []);

  if (refreshing) {
    return (
      <SafeAreaProvider style={componentStyles.loadingContainer}>
        <View style={componentStyles.loadingContent}>
          <Text>{title}</Text>
          {/* You can add an ActivityIndicator here if you want a visual loading cue */}
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider style={componentStyles.safeArea}>
      <AnimatedFlatList
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
        bounces={true}
        style={componentStyles.flatList}
        data={data}
        extraData={data}
        scrollEventThrottle={16}
        keyExtractor={(item) => item.id || item.UUID || Math.random().toString()} // Ensure a unique key
        renderItem={({ item, index }) => ( // Destructure item and index
          <ListItem
            item={item}
            index={index}
            isPro={""} // Assuming this prop is not dynamic for JoinItems
            _gotoStore={emptyFunction}
            _deleteFeedItem={emptyFunction}
            _joinFeedItem={emptyFunction}
            _deleteFeedItemIndex={emptyFunction}
            _editEvent={emptyFunction}
            _gotoMedia={emptyFunction}
            _gotoCamera={emptyFunction}
            setQrCodeURL={emptyFunction}
            _gotoQRCode={emptyFunction}
            _gotoShare={emptyFunction}
            _editItem={emptyFunction}
            _addMax={emptyFunction}
          />
        )}
      />
    </SafeAreaProvider>
  );
};

const componentStyles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#fff",
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  loadingContainer: {
    backgroundColor: "#fff",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContent: {
    // Style for your loading text or indicator
  },
  flatList: {
    flex: 1,
    height: SCREEN_HEIGHT,
    width: SCREEN_WIDTH,
  },
  backButtonContainer: {
    padding: 7,
    height: 40,
  },
  backButtonText: {
    color: "white",
  },
});

export default Join;