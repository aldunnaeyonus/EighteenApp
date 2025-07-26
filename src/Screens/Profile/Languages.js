import React, { useCallback, useState } from "react";
import { ScrollView, View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import { ListItem, Icon } from "@rneui/themed";
import * as i18n from "../../../i18n";
import { storage } from "../../context/components/Storage";
import { useMMKVObject } from "react-native-mmkv";
import { axiosPull } from "../../utils/axiosPull";
import { useFocusEffect } from "@react-navigation/native";
import { useToast } from "react-native-styled-toast";

const Languages = (props) => {
  const [user, setUser] = useMMKVObject("user.Data", storage); // Use setUser to update MMKV
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const languages = [
    { name: "English", code: "en", icon: "gb" },
    { name: "German", code: "de", icon: "de" },
    { name: "Spanish", code: "es", icon: "es" },
    { name: "French", code: "fr", icon: "fr" },
    { name: "Italian", code: "it", icon: "it" },
    { name: "Portuguese", code: "pt", icon: "pt" },
    { name: "Japanese", code: "ja", icon: "jp" },
    { name: "Korean", code: "ko", icon: "kr" },
    { name: "Chinese (Simplified)", code: "zh", icon: "cn" },
    { name: "Arabic", code: "ar", icon: "sa" },
    { name: "Russian", code: "ru", icon: "ru" },
    { name: "Hindi", code: "hi", icon: "in" },
    { name: "Bengali", code: "bn", icon: "bd" },
    { name: "Turkish", code: "tr", icon: "tr" },
    { name: "Vietnamese", code: "vi", icon: "vn" },
  ];

  const _pullUser = useCallback(async () => {
    setIsLoading(true);
    try {
      await axiosPull._pullUser(user?.user_id);
      // Re-fetch user data from storage after pull
      const updatedUser = storage.getString("user.Data");
      if (updatedUser) {
        setUser(JSON.parse(updatedUser));
      }
    } catch (error) {
      console.error("Error pulling user data for languages:", error);
      toast({ message: i18n.t("Failed to load language settings.") });
    } finally {
      setIsLoading(false);
    }
  }, [user?.user_id, setUser, toast]);

  const _setLang = useCallback(async (code) => {
    setIsLoading(true);
    try {
      const data = {
        owner: user?.user_id,
        lang: code,
      };
      const response = await axiosPull.postData("/user/setLang.php", data);
      if (response && response[0]?.message == "success") {
        await axiosPull._pullUser(user?.user_id); // Refresh user data to get updated language
        toast({ message: i18n.t("Language updated successfully.") });
      } else {
        toast({ message: i18n.t("Failed to update language.") });
      }
    } catch (error) {
      console.error("Error setting language:", error);
      toast({ message: i18n.t("Failed to update language.") });
    } finally {
      setIsLoading(false);
    }
  }, [user?.user_id, toast]);

  useFocusEffect(
    useCallback(() => {
      props.navigation.setOptions({
        headerTitle: i18n.t("Languages"),
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => {
              props.navigation.goBack();
            }}
            style={componentStyles.backButtonContainer}
          >
            <Icon
              type="material"
              size={25}
              name="arrow-back-ios-new"
              color="#fff"
            />
          </TouchableOpacity>
        ),
      });
      _pullUser(); // Fetch user data to get current language setting
    }, [props.navigation, _pullUser])
  );

  if (isLoading) {
    return (
      <View style={componentStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#e35504" />
        <Text style={componentStyles.loadingText}>{i18n.t("Loading...")}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={componentStyles.scrollView}>
      {languages.map((l, i) => (
        <ListItem key={i} bottomDivider onPress={() => _setLang(l.code)}>
          <Icon name="flag" type="material-community" color="grey" />
          <ListItem.Content>
            <ListItem.Title>{l.name}</ListItem.Title>
          </ListItem.Content>
          {user?.user_language == l.code && (
            <Icon name="check" type="material" color="green" />
          )}
        </ListItem>
      ))}
    </ScrollView>
  );
};

const componentStyles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    color: '#333',
  },
  backButtonContainer: {
    padding: 7,
    height: 40,
    backgroundColor: "rgba(0, 0, 0, 0.60)",
    borderRadius: 20,
  },
});

export default Languages;