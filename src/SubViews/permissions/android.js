import {
    PermissionModal,
    PermissionItem
  } from "react-native-permissions-modal";
  import React, { useState, useCallback } from "react";
  import { request, PERMISSIONS, check} from "react-native-permissions";
  import { useFocusEffect } from '@react-navigation/native';
  import * as i18n from '../../../i18n';

const AndroidPermissions = () => {

    const [camera, setCamera] = useState("");
    const [mic, setMic] = useState("");
    const [photo, setPhoto] = useState("");
    const [video, setVideo] = useState("");
    const [accuracy, setAccuracy] = useState("");

  useFocusEffect(
    useCallback(() => {
      checkPhoto();
      checkCamera();
      checkMic();
      checkVideo();
      checkAccuracy();
      if ((camera == "granted") && (mic == "granted") && (photo == "granted") && (video == "granted") && (accuracy == "granted")){
          this.permModal.closeModal();
      }else{
          this.permModal.openModal();
      }
    }, [camera, mic, photo, video, accuracy])
  );

  const checkAccuracy=() => {
    check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION).then((status) => { 
      setAccuracy(status);
    })
  }

  const checkPhoto=() => {
    check(PERMISSIONS.ANDROID.READ_MEDIA_IMAGES).then((status) => { 
      setPhoto(status);
    })
  }

  const checkVideo=() => {
    check(PERMISSIONS.ANDROID.READ_MEDIA_VIDEO).then((status) => { 
      setVideo(status);
    })
  }

  const checkMic=() => {
    check(PERMISSIONS.ANDROID.RECORD_AUDIO).then((status) => { 
      setMic(status);
    })
  }

  const checkCamera=() => {
    check(PERMISSIONS.ANDROID.CAMERA).then((status) => { 
      setCamera(status);
    })
  }


    return (
          <PermissionModal
            panGestureEnabled={false}
            closeOnOverlayTap={false}
            ref={ref => (this.permModal = ref)}
            title={i18n.t('Permissions')}
            subtitle={i18n.t('PermissionsText')}
          >
          <PermissionItem
              title={i18n.t("Camera")}
              iconStatusColor={camera == "granted" ? 'green' : 'red'}
              subtitle={i18n.t('To access camera')}
              source={require("../../../assets/camera.png")}
              onPress={() => {
                request(
                  PERMISSIONS.ANDROID.CAMERA
                ).then((status) => {
                  setCamera(status);
                });
              }}
            />

            <PermissionItem
              title={i18n.t("Location")}
              iconStatusColor={accuracy == "granted" ? 'green' : 'red'}
              subtitle={i18n.t('Location Status')}
              source={require("../../../assets/location.png")}
              onPress={() => {
                request(
                  PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
                ).then((status) => {
                  setAccuracy(status);
                });
              }}
            />

          <PermissionItem
              title={i18n.t("Photo Library")}
              iconStatusColor={photo == "granted" ? 'green' : 'red'}
              subtitle={i18n.t("To access photo")}
              source={require("../../../assets/photo.png")}
              onPress={() => {
                request(
                  PERMISSIONS.ANDROID.READ_MEDIA_IMAGES,
                ).then((status) => {
                  setPhoto(status);
                });
              }}
            />

        <PermissionItem
              title={i18n.t("Video Library")}
              iconStatusColor={video == "granted" ? 'green' : 'red'}
              subtitle={i18n.t("To access video")}
              source={require("../../../assets/video.png")}
              onPress={() => {
                request(
                  PERMISSIONS.ANDROID.READ_MEDIA_VIDEO,
                ).then((status) => {
                  setVideo(status);
                });
              }}
            />

            <PermissionItem
              title={i18n.t("Microphone")}
              iconStatusColor={mic == "granted" ? 'green' : 'red'}
              subtitle={i18n.t("To access microphone")}
              source={require("../../../assets/mic.png")}
              onPress={() => {
                request(
                  PERMISSIONS.ANDROID.RECORD_AUDIO,
                ).then((status) => {
                  setMic(status);
                });
              }}
            />
          </PermissionModal>
  );
}

  export default AndroidPermissions;
