import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import * as i18n from "../../../../i18n";
import { SCREEN_WIDTH } from "../../../utils/constants";

const ProFooter = (props) => {
  return (
    <View
      style={{
        width: SCREEN_WIDTH,
        marginTop: 10,
        marginBottom: 30,
        justifyContent: "space-between",
        alignContent: "space-between",
        alignItems: "center",
      }}
    >
      <Text style={{ textAlign: "center", color: "grey" }}>
        <TouchableOpacity
          onPress={() => {
            props.terms();
          }}
        >
          <Text style={{ textAlign: "center", color: "grey" }}>
            {i18n.t("Terms & Use")}
          </Text>
        </TouchableOpacity>
        {"           "}
        <TouchableOpacity
          onPress={() => {
            props.eula();
          }}
        >
          <Text style={{ textAlign: "center", color: "grey" }}>
            EULA
          </Text>
        </TouchableOpacity>
        {"           "}
        <TouchableOpacity
          onPress={() => {
            props.privacy();
          }}
        >
          <Text style={{ textAlign: "center", color: "grey" }}>
            {i18n.t("Privacy Policy")}
          </Text>
        </TouchableOpacity>
      </Text>
    </View>
  );
};

export default ProFooter;
