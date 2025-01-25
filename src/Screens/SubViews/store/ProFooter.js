import React from "react";
import { Dimensions, View, Text, TouchableOpacity } from "react-native";
const { width } = Dimensions.get("window");
import * as i18n from "../../../../i18n";

const ProFooter = (props) => {
  return (
    <View
      style={{
        width: width,
        marginTop: 10,
        marginBottom: 30,
        justifyContent: "center",
        alignContent: "center",
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
