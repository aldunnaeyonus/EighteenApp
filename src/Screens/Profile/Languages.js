import React from "react";
import { ScrollView, View } from "react-native";
import { ListItem } from "@rneui/themed";
import * as i18n from "../../../i18n";
import { constants, SCREEN_WIDTH } from "../../utils/constants";

const Languages = () => {
  return (
    <ScrollView style={{ backgroundColor: "white" }}>
      <View style={{ width: SCREEN_WIDTH, height: "100%", backgroundColor: "#fff" }}>
        {constants.languages
          .sort((a, b) => (b > a ? -1 : 1))
          .map((lang, index) => (
            <ListItem
              containerStyle={{
                paddingHorizontal: 25,
                paddingVertical: 5,
                marginTop: 10,
              }}
              key={lang}
            >
              <ListItem.Content>
                <ListItem.Title>
                  {index + 1}. {lang}
                </ListItem.Title>
              </ListItem.Content>
            </ListItem>
          ))}
        <ListItem.Subtitle
          style={{
            textAlign: "center",
            fontSize: 13,
            color: "grey",
            margin: 30,
          }}
        >
          {i18n.t("MoreComming")}
        </ListItem.Subtitle>
      </View>
    </ScrollView>
  );
};
export default Languages;
