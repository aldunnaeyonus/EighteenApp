import { View, Text, TextInput, Platform, Alert, StyleSheet } from "react-native";
import { TouchableOpacity } from "react-native";
import { storage } from "../../context/components/Storage";
import React, { useState, useCallback, useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import styles from "../../styles/index.style"; // Assuming this contains common styles
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { axiosPull } from "../../utils/axiosPull";
import { Icon } from "react-native-elements";
import { useToast } from "react-native-styled-toast";
import { useFocusEffect } from "@react-navigation/native";
import { ActivityIndicator } from "react-native-paper";
import * as i18n from "../../../i18n";
import { SCREEN_WIDTH } from "../../utils/constants";
import NotifService from "../../../NotifService";

const Verification = (props) => {
  const [handleStatus, setHandleStatus] = useState("");
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const [timer, setTimer] = useState(180); // Renamed from resendTimer
  const [canResendCode, setCanResendCode] = useState(false); // Renamed from canResend
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let timerId;
    if (timer > 0) {
      timerId = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else {
      setCanResendCode(true);
      clearInterval(timerId); // Clear interval when timer reaches 0
    }

    return () => clearInterval(timerId); // Cleanup on component unmount or timer change
  }, [timer]);

  const checkHandle = useCallback(async (value) => {
    setIsLoading(true);
    setHandleStatus(""); // Clear previous status
    try {
      const data = {
        code: value.toUpperCase(),
        email: props.route.params.email,
      };

      const response = await axiosPull.postData("/register/checkCode.php", data);

      if (response && response[0]) {
        if (response[0].isActive == "0") {
          setHandleStatus(i18n.t("Inactive"));
        } else if (response[0].errorResponse == "Member") {
          storage.set("user.Data", JSON.stringify(response[0]));
          await AsyncStorage.setItem("current", "0");
          await AsyncStorage.setItem("logedIn", "1");
          await AsyncStorage.setItem("user_id", response[0].user_id);
          new NotifService();

          setTimeout(() => {
            props.navigation.navigate("Home");
          }, 1500);
        } else {
          setHandleStatus(i18n.t("The verification code"));
        }
      } else {
        setHandleStatus(i18n.t("An unexpected error occurred."));
      }
    } catch (error) {
      console.error("Verification error:", error);
      setHandleStatus(i18n.t("An error occurred during verification."));
      toast({ message: i18n.t("Verification failed. Please try again.") });
    } finally {
      setIsLoading(false);
    }
  }, [props.route.params.email, props.navigation, toast]);

  const changeHandler = useCallback(
    (value) => {
      setCode(value);
      if (value.length == 8) {
        checkHandle(value);
      }
    },
    [checkHandle]
  );

  const resendCode = useCallback(async () => {
    setCanResendCode(false);
    setTimer(180); // Reset timer
    setIsLoading(true); // Show loading while resending
    try {
      const data = {
        email: props.route.params.email,
        device: Platform.OS,
      };
      await axiosPull.postData("/register/checkUsername.php", data);
      Alert.alert(i18n.t("Resend Code"), i18n.t("Anewverificationcode"));
    } catch (error) {
      console.error("Resend code error:", error);
      toast({ message: i18n.t("Failed to resend code. Please try again.") });
    } finally {
      setIsLoading(false);
    }
  }, [props.route.params.email, toast]);

  useFocusEffect(
    useCallback(() => {
      props.navigation.setOptions({
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => {
              props.navigation.goBack();
            }}
          >
            <Icon
              type="material"
              size={25}
              name="arrow-back-ios-new"
              color="#000"
            />
          </TouchableOpacity>
        ),
      });
    }, [props.navigation]) // Only navigation is a dependency here
  );

  return (
    <KeyboardAwareScrollView style={componentStyles.scrollView}>
      <SafeAreaProvider>
        <Text style={componentStyles.title}>{i18n.t("Verification!")}</Text>
        <View style={componentStyles.container}>
          <Text style={styles.smalltitleTextError}>{handleStatus}</Text>
          <View style={componentStyles.textInputContainer}>
            <FontAwesome
              name="shield"
              size={35}
              color="#3D4849"
              style={componentStyles.shieldIcon}
            />
            <TextInput
              clearButtonMode="while-editing"
              autoComplete="one-time-code"
              keyboardType="default"
              placeholder="SNAP18AP"
              autoCapitalize="characters"
              maxLength={8}
              onChangeText={changeHandler}
              style={componentStyles.textInput}
            />
          </View>

          <TouchableOpacity
            style={componentStyles.verifyButton}
            onPress={() => checkHandle(code)} // Pass the current code state
            disabled={isLoading} // Disable button while loading
          >
            {isLoading && (
              <ActivityIndicator
                size="small"
                color="white"
                style={componentStyles.activityIndicator}
              />
            )}
            <Text style={componentStyles.verifyButtonText}>
              {isLoading ? i18n.t("Loading") : i18n.t("Verify")}
            </Text>
          </TouchableOpacity>
          <Text style={styles.titleText2}>
            {i18n.t("Anewverificationcode")}
            {"\n"}
            <Text style={componentStyles.emailText}>
              {props.route.params.email == null
                ? ""
                : props.route.params.email.toLowerCase()}
            </Text>
          </Text>

          <TouchableOpacity
            style={componentStyles.resendButton}
            disabled={!canResendCode || isLoading} // Disable if timer is running or loading
            onPress={resendCode}
          >
            <View style={componentStyles.resendButtonContent}>
              <Icon
                type="material-community"
                name="email-send-outline"
                size={20}
                color="#3D4849"
              />
              <Text>
                {canResendCode
                  ? i18n.t("Resend Code")
                  : `${i18n.t("Resendcodein")} ${timer} ${i18n.t("Seconds")}`}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaProvider>
    </KeyboardAwareScrollView>
  );
};

const componentStyles = StyleSheet.create({
  scrollView: {
    backgroundColor: "#fff",
  },
  title: {
    marginTop: 150,
    marginLeft: 20,
    marginRight: 20,
    fontSize: 25,
    fontWeight: "600",
  },
  container: {
    paddingHorizontal: 10,
    width: SCREEN_WIDTH,
    alignItems: "center",
  },
  textInputContainer: {
    borderWidth: 2,
    height: 65,
    width: "80%",
    borderColor: "#3D4849",
    flexDirection: "row",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginTop: 20,
  },
  shieldIcon: {
    marginRight: 5,
    marginTop: 12,
  },
  textInput: {
    fontWeight: "bold",
    marginLeft: 5,
    color: "#3D4849",
    fontSize: 25,
    width: "85%",
    fontFamily: "HelveticaNeue-Bold",
  },
  verifyButton: {
    flexDirection: "row",
    marginTop: 20,
    width: 250,
    backgroundColor: "#e35504",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
    borderColor: "#e35504",
    marginBottom: 20,
  },
  activityIndicator: {
    marginRight: 10,
  },
  verifyButtonText: {
    textTransform: "uppercase",
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  emailText: {
    fontWeight: "bold",
  },
  resendButton: {
    width: "90%",
    height: 40,
    margin: 20,
  },
  resendButtonContent: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonContainer: {
    padding: 7,
    height: 40,
    backgroundColor: "rgba(0, 0, 0, 0.60)",
    borderRadius: 20,
  },
});

export default Verification;