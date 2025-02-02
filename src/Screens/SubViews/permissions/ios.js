import {
  PermissionModal,
  PermissionItem,
} from "react-native-permissions-modal";
import React, { useState, useCallback } from "react";
import { request, PERMISSIONS, check } from "react-native-permissions";
import { useFocusEffect } from "@react-navigation/native";
import * as i18n from "../../../../i18n";

const IOSPermissions = () => {
  const [camera, setCamera] = useState("");
  const [mic, setMic] = useState("");
  const [photo, setPhoto] = useState("");
  const [accuracy, setAccuracy] = useState("");

  const checkPhoto = () => {
    check(PERMISSIONS.IOS.PHOTO_LIBRARY).then((status) => {
      setPhoto(status);
    });
  };

  const checkAccuracy = () => {
    check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE).then((status) => {
      setAccuracy(status);
    });
  };

  const checkMic = () => {
    check(PERMISSIONS.IOS.MICROPHONE).then((status) => {
      setMic(status);
    });
  };

  const checkCamera = () => {
    check(PERMISSIONS.IOS.CAMERA).then((status) => {
      setCamera(status);
    });
  };

  useFocusEffect(
    useCallback(() => {
      checkPhoto();
      checkCamera();
      checkMic();
      checkAccuracy();
      if (
        camera == "granted" &&
        mic == "granted" &&
        photo == "granted" &&
        accuracy == "granted"
      ) {
        this.permModal.closeModal();
      } else {
        this.permModal.openModal();
      }
    }, [camera, mic, photo, accuracy])
  );

  return (
    <PermissionModal
      ref={(ref) => (permModal = ref)}
      panGestureEnabled={true}
      closeOnOverlayTap={true}
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
          request(PERMISSIONS.IOS.CAMERA).then((status) => {
            setCamera(status);
          });
        }}
      />

      <PermissionItem
        title={i18n.t("Location")}
        iconStatusColor={accuracy == "granted" ? "green" : "red"}
        subtitle={i18n.t("Location Status")}
        source={require("../../../../assets/location.png")}
        onPress={() => {
          request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE).then((status) => {
            setAccuracy(status);
          });
        }}
      />

      <PermissionItem
        title={i18n.t("Microphone")}
        iconStatusColor={mic == "granted" ? "green" : "red"}
        subtitle={i18n.t("To access microphone")}
        source={require("../../../../assets/mic.png")}
        onPress={() => {
          request(PERMISSIONS.IOS.MICROPHONE).then((status) => {
            setMic(status);
          });
        }}
      />

      <PermissionItem
        title={i18n.t("Photo Library")}
        iconStatusColor={photo == "granted" ? "green" : "red"}
        subtitle={i18n.t("To access photo")}
        source={require("../../../../assets/photo.png")}
        onPress={() => {
          request(PERMISSIONS.IOS.PHOTO_LIBRARY).then((status) => {
            setPhoto(status);
          });
        }}
      />
    </PermissionModal>
  );
};

export default IOSPermissions;
