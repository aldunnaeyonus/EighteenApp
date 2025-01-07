import { View, Text, TextInput, Platform } from "react-native";
import { TouchableOpacity } from "react-native";
import { storage } from "../../context/components/Storage";
import React, { useState, useCallback } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import styles from "../../styles/index.style";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { axiosPull } from "../../utils/axiosPull";
import { Icon } from "react-native-elements";
import { useToast } from "react-native-styled-toast";
import { useFocusEffect } from "@react-navigation/native";
import { ActivityIndicator } from "react-native-paper";
import * as i18n from "../../../i18n";

const Verification = (props) => {
  const [handleStatus, setHandleStatus] = useState("");
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const [resendTimer, setResendTimer] = useState(90);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let timerId;
    if (resendTimer > 0) {
      timerId = setInterval(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }

    return () => clearInterval(timerId);
  }, [resendTimer]);

  const changeHandler = useCallback(
    (value) => {
      setCode(value);
      value.length == 8 ? checkHandle(value) : null;
    },
    [code]
  );

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
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => {
              props.navigation.goBack();
            }}
          >
            <Icon
              type="material"
              size={30}
              name="arrow-back-ios-new"
              color="#fff"
              containerStyle={{
                padding: 7,
                height: "100%",
                backgroundColor: "rgba(0, 0, 0, 0.60)",
                borderRadius: 22,
              }}
              textStyle={{ color: "white" }}
            />
          </TouchableOpacity>
        ),
      });
    }, [code, props, handleStatus, canResend])
  );

  const [isLoading, setIsLoading] = useState(false);

  const checkHandle = useCallback(
    async (value) => {
      setHandleStatus("");
      const data = {
        code: value.toUpperCase(),
        email: props.route.params.email,
      };

      const response = await axiosPull.postData(
        "/register/checkCode.php",
        data
      );
      if (response[0].errorResponse == "Member") {
        storage.set("user.Data", JSON.stringify(response[0]));
        storage.set("user.Join.Feed", JSON.stringify([]));
        storage.set("user.Friend.Feed", JSON.stringify([]));
        storage.set(
          "uploadData",
          JSON.stringify({ message: "", display: "none", image: "" })
        );
        storage.set("user.Camera.Feed", JSON.stringify([]));
        storage.set("user.Camera.Friend.Feed", JSON.stringify([]));
        storage.set("user.Member.Join.Feed", JSON.stringify([]));
        await AsyncStorage.setItem("current", "0");
        await AsyncStorage.setItem("logedIn", "1");
        await AsyncStorage.setItem("user_id", response[0].user_id);
        setTimeout(() => {
          setIsLoading(false);
          props.navigation.navigate("Home");
        }, 1000);
      } else {
        setIsLoading(false);
        setHandleStatus(i18n.t("The verification code"));
      }
    },
    [props.route.params.email]
  );

  const resendCode = useCallback(async () => {
    setCanResend(false);
    setResendTimer(90);
    const data = {
      email: props.route.params.email,
      device: Platform.OS,
    };
    await axiosPull.postData("/register/checkUsername.php", data);
    alert(
      "",
      i18n.t("A new verification code") + " " + props.route.params.email
    );
  }, [props.route.params.email]);

  return (
    <KeyboardAwareScrollView style={{ backgroundColor: "#fff" }}>
      <SafeAreaProvider>
        <Text
          style={{
            marginTop: 150,
            marginLeft: 20,
            marginRight: 20,
            fontSize: 25,
            fontWeight: "600",
          }}
        >
          {i18n.t("Verification!")}
        </Text>
        <View
          style={{
            paddingHorizontal: 10,
            width: "100%",
            alignItems: "center",
          }}
        >
          <View
            style={{
              marginBottom: 15,
              alignItems: "center",
              justifyContent: "center",
            }}
          ></View>
          <Text style={styles.smalltitleTextError}>{handleStatus}</Text>
          <View
            style={{
              borderWidth: 2,
              height: 65,
              width: "80%",
              borderColor: "#3D4849",
              flexDirection: "row",
              borderRadius: 10,
              paddingHorizontal: 10,
              marginTop: 20,
            }}
          >
            <FontAwesome
              name="shield"
              size={35}
              color="#3D4849"
              style={{ marginRight: 5, marginTop: 12 }}
            />
            <TextInput
              clearButtonMode="while-editing"
              autoComplete={"one-time-code"}
              keyboardType="default"
              placeholder="SNAP18AP"
              autoCapitalize="characters"
              maxLength={8}
              onChangeText={changeHandler}
              style={{
                fontWeight: "bold",
                marginLeft: 5,
                color: "#3D4849",
                fontSize: 25,
                width: "85%",
                fontFamily: "HelveticaNeue-Bold",
              }}
            />
          </View>

          <TouchableOpacity
            style={{
              flexDirection: "row",
              marginTop: 20,
              width: 250,
              backgroundColor: "#e35504",
              borderRadius: 24,
              padding: 15,
              alignItems: "center",
              justifyContent: "center",
              borderColor: "#e35504",
              marginbottom: 20,
            }}
            onPress={() => checkHandle()}
          >
            {isLoading && (
              <ActivityIndicator
                size="small"
                color="white"
                style={{ marginRight: 10 }}
              />
            )}
            <Text
              style={{
                textTransform: "uppercase",
                fontSize: 20,
                fontWeight: 600,
                color: "#fff",
              }}
            >
              {isLoading ? i18n.t("Loading") : i18n.t("Verify")}
            </Text>
          </TouchableOpacity>
          <Text style={styles.titleText2}>
            {i18n.t("A new verification code")}
            {"\n"}{" "}
            <Text style={{ fontWeight: "bold" }}>
              {props.route.params.email == null
                ? ""
                : props.route.params.email.toLowerCase()}
            </Text>{" "}
          </Text>

          <TouchableOpacity
            style={{
              width: "50%",
              height: 40,
              margin: 20,
            }}
            disabled={!canResend}
            onPress={() => resendCode()}
          >
            <View
              style={{
                flexDirection: "row",
                gap: 10,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon
                type="material-community"
                name="email-send-outline"
                size={20}
                color="#3D4849"
              />

              <Text>{canResend ? i18n.t("Resend Code") : i18n.t("Resendcodein") + resendTimer + i18n.t("Seconds")}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaProvider>
    </KeyboardAwareScrollView>
  );
};

export default Verification;
