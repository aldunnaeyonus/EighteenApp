import {
  PermissionModal,
  PermissionItem,
} from "react-native-permissions-modal";
import React, { useState, useCallback } from "react";
import { request, PERMISSIONS, check } from "react-native-permissions";
import { useFocusEffect } from "@react-navigation/native";
import * as i18n from "../../../../i18n";

const AndroidPermissions = (props) => {
  const [camera, setCamera] = useState("");
  const [mic, setMic] = useState("");
  const [photo, setPhoto] = useState("");
  const [accuracy, setAccuracy] = useState("");
  const [notifications, setnotifications] = useState("");

  useFocusEffect(
    useCallback(() => {
      checkPhoto();
      checkCamera();
      checkMic();
      checkAccuracy();
      checkNotifiations();
      if (props.profile != "profile"){
      if (
        camera == "granted" &&
        mic == "granted" &&
        photo == "granted" &&
        accuracy == "granted" &&
        notifications == "granted"
      ) {
        this.permModal.closeModal();
      } else {
        this.permModal.openModal();
      }
      }else{
        this.permModal.openModal();
      }
    }, [camera, mic, photo, accuracy, notifications])
  );

  const checkAccuracy = () => {
    check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION).then((status) => {
      setAccuracy(status);
    });
  };

  const checkNotifiations = () => {
    check(PERMISSIONS.ANDROID.POST_NOTIFICATIONS).then((status) => {
      setnotifications(status);
    });
  };

  const checkPhoto = () => {
    check(PERMISSIONS.ANDROID.READ_MEDIA_IMAGES).then((status) => {
      setPhoto(status);
    });
  };

  const checkMic = () => {
    check(PERMISSIONS.ANDROID.RECORD_AUDIO).then((status) => {
      setMic(status);
    });
  };

  const checkCamera = () => {
    check(PERMISSIONS.ANDROID.CAMERA).then((status) => {
      setCamera(status);
    });
  };

  return (
    <PermissionModal
      panGestureEnabled={true}
      closeOnOverlayTap={true}
      ref={(ref) => (permModal = ref)}
      title={i18n.t("Permissions")}
      subtitle={i18n.t("PermissionsText")}
    >
      <PermissionItem
        title={i18n.t("Camera")}
        iconContainerBackgroundColor={'transparent'}
        example={1}
        iconStatusColor={camera == "granted" ? "green" : "red"}
        subtitle={i18n.t("To access camera")}
        source={require("../../../../assets/camera.png")}
        onPress={() => {
          request(PERMISSIONS.ANDROID.CAMERA).then((status) => {
            setCamera(status);
          });
        }}
      />

      <PermissionItem
        title={i18n.t("Notifications")}
        iconContainerBackgroundColor={'transparent'}
        example={2}
        iconStatusColor={notifications == "granted" ? "green" : "red"}
        subtitle={i18n.t("getnotifications")}
        source={require("../../../../assets/push-notifications.png")}
        onPress={() => {
          request(PERMISSIONS.ANDROID.POST_NOTIFICATIONS).then((status) => {
            setnotifications(status);
          });
        }}
      />

      <PermissionItem
        title={i18n.t("Location")}
        iconContainerBackgroundColor={'transparent'}
        example={3}
        iconStatusColor={accuracy == "granted" ? "green" : "red"}
        subtitle={i18n.t("Location Status")}
        source={require("../../../../assets/location.png")}
        onPress={() => {
          request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION).then((status) => {
            setAccuracy(status);
          });
        }}
      />

      <PermissionItem
        title={i18n.t("Photo Library")}
        iconContainerBackgroundColor={'transparent'}
        example={4}
        iconStatusColor={photo == "granted" ? "green" : "red"}
        subtitle={i18n.t("To access photo")}
        source={require("../../../../assets/photo.png")}
        onPress={() => {
          request(PERMISSIONS.ANDROID.READ_MEDIA_IMAGES).then((status) => {
            setPhoto(status);
          });
        }}
      />

      <PermissionItem
        title={i18n.t("Microphone")}
        iconContainerBackgroundColor={'transparent'}
        example={6}
        iconStatusColor={mic == "granted" ? "green" : "red"}
        subtitle={i18n.t("To access microphone")}
        source={require("../../../../assets/mic.png")}
        onPress={() => {
          request(PERMISSIONS.ANDROID.RECORD_AUDIO).then((status) => {
            setMic(status);
          });
        }}
      />
    </PermissionModal>
  );
};

export default AndroidPermissions;
