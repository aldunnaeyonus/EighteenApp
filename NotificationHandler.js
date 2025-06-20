import PushNotification from 'react-native-push-notification';
import { constants } from "./src/utils/constants";
import DeviceInfo from 'react-native-device-info';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

class NotificationHandler {
  onNotification(notification) {
    //console.log('NotificationHandler:', notification);

    if (typeof this._onNotification === 'function') {
      this._onNotification(notification);
    }
  }

  async onRegister(token) {
    const userID = await AsyncStorage.getItem("user_id");
    let appName = DeviceInfo.getApplicationName();
    let deviceId = DeviceInfo.getDeviceId();
    let readableVersion = DeviceInfo.getVersion();
    let systemVersion = DeviceInfo.getSystemVersion();
    let platform = Platform.OS
    const url = constants.url + "/apns.php?task=register&appname="+appName+"&appversion="+readableVersion+"&deviceuid="+deviceId+"&devicetoken="+token.token+"&devicename="+platform+"&devicemodel="+deviceId+"&deviceversion="+systemVersion+"&pushbadge=enabled&pushalert=enabled&pushsound=enabled&user_id="+userID;
    fetch(url, {
                headers: {
                  'Cache-Control': 'no-cache, no-store, must-revalidate',
                  'Pragma': 'no-cache',
                  'Expires': 0,
          },
              });
    if (typeof this._onRegister === 'function') {
      this._onRegister(token);
    }
  }

  onAction(notification) {
    console.log ('Notification action received:');
    console.log(notification.action);
    console.log(notification);

    if(notification.action === 'Yes') {
      PushNotification.invokeApp(notification);
    }
  }

  // (optional) Called when the user fails to register for remote notifications. Typically occurs when APNS is having issues, or the device is a simulator. (iOS)
  onRegistrationError(err) {
    console.log(err);
  }
  
  attachRegister(handler) {
    this._onRegister = handler;
  }

  attachNotification(handler) {
    this._onNotification = handler;
  }
}

const handler = new NotificationHandler();

if (Platform.OS == 'ios' || Platform.OS == 'android '){
PushNotification.configure({
  // (optional) Called when Token is generated (iOS and Android)
  onRegister: handler.onRegister.bind(handler),

  // (required) Called when a remote or local notification is opened or received
  onNotification: handler.onNotification.bind(handler),

  // (optional) Called when Action is pressed (Android)
  onAction: handler.onAction.bind(handler),

  // (optional) Called when the user fails to register for remote notifications. Typically occurs when APNS is having issues, or the device is a simulator. (iOS)
  onRegistrationError: handler.onRegistrationError.bind(handler),

  // IOS ONLY (optional): default: all - Permissions to register.
  permissions: {
    alert: true,
    badge: true,
    sound: true,
  },

  // Should the initial notification be popped automatically
  // default: true
  popInitialNotification: true,

  /**
   * (optional) default: true
   * - Specified if permissions (ios) and token (android and ios) will requested or not,
   * - if not, you must call PushNotificationsHandler.requestPermissions() later
   */
  requestPermissions: true,
});
}
export default handler;