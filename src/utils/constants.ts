import { Dimensions, Platform } from 'react-native';
import "moment-duration-format";
import * as i18n from '../../i18n';

export const MIN_MS = 60000;
export const camera_time_text = ["8 Hours", "1 Day", "2 Days", "5 Days", "1 Week"];
export const camera_time_text_PRO = ["1 Day", "2 Days", "1 Week", "2 Weeks", "1 Month"];
export const camera_time_seconds = ["28800", "86400", "172800", "432000", "604800"];
export const camera_time_seconds_PRO = ["86400", "432000", "604800","1209600", "2678400"];
export const camera_amount = ["1", "2", "3", "4", "5", "10", "15", "18"];
export const media_amount = ["1", "2", "3", "4", "5", "10", "15", "18"];
export const camera_amount_PRO = ["10", "18", "25", "50", "100", "150", "250", "500", "1000"];
export const languages = ["French","German","Italian","Dutch","Danish","Polish","Portuguese","Norwegian","Swedish","Finish","English","Spanish", "Japanese", "Chinese", "Ukrainian", "Greek", "South Korean"];

export const ANDROID_DISPLAY = Object.freeze({
  default: 'default',
  spinner: 'spinner',
  clock: 'clock',
  calendar: 'calendar',
});

export const historyActionsPro = (UUID: String) => [
  {
    id: "Delete-" + UUID,
    title: i18n.t('Delete Event'),
    titleColor: "red",
    subtitle:i18n.t('Willdeleteeverything'),
    attributes: {
      destructive: true,
    },
  },
  {
    id: "Download-" + UUID,
    title: i18n.t('DownloadMediaLink'),
    titleColor: "black",
  },
  {
    id: "Save-" + UUID,
    title: i18n.t('SaveDevice'),
    titleColor: "black",
  },
];

export const historyActions = (UUID: String) => [
  {
    id: "Delete-" + UUID,
    title: i18n.t('Delete Event'),
    titleColor: "red",
    subtitle:i18n.t('Willdeleteeverything'),
    attributes: {
      destructive: true,
    },
  },
  {
    id: "Download-" + UUID,
    title: i18n.t('DownloadMediaLink'),
    titleColor: "black",
  },
];
export const endActions = (UUID: String) => [
  {
    id: "Delete-" + UUID,
    title: i18n.t('DeleteEvent'),
    titleColor: "red",
    subtitle:i18n.t('Willdeleteeverything'),
    attributes: {
      destructive: true,
    },
  },
  {
    id: "End-" + UUID,
    title: i18n.t('CloseEvent'),
    titleColor: "black",
  }
];

export const actions = (UUID: String) => [
  {
    id: "Delete-" + UUID,
    title: i18n.t('DeleteEvent'),
    titleColor: "red",
    subtitle:i18n.t('Willdeleteeverything'),
    attributes: {
      destructive: true,
    },
  },
  {
    id: "End-" + UUID,
    title: i18n.t('CloseEvent'),
    titleColor: "black",
  },
  {
    id: "Edit-" + UUID,
    title: i18n.t('EditEvent'),
    titleColor: "black",
  },
];

export const EVENT_TYPE_SET = 'set';
export const EVENT_TYPE_DISMISSED = 'dismissed';
export const ANDROID_EVT_TYPE = Object.freeze({
  set: EVENT_TYPE_SET,
  dismissed: EVENT_TYPE_DISMISSED,
  neutralButtonPressed: 'neutralButtonPressed',
});

export const IOS_DISPLAY = Object.freeze({
  default: 'default',
  spinner: 'spinner',
  compact: 'compact',
  inline: 'inline',
});

const COMMON_MODES = Object.freeze({
  date: 'date',
  time: 'time',
});

export const ANDROID_MODE = COMMON_MODES;

export const WINDOWS_MODE = COMMON_MODES;
 
export const IOS_MODE = Object.freeze({
  ...COMMON_MODES,
  datetime: 'datetime',
  countdown: 'countdown',
});

export const mimes = (ext: any) => {
switch (ext.toLowerCase()){
        case 'jpg':
    return 'image/jpeg'
        case 'jpeg':
    return 'image/jpeg'
        case 'png':
    return 'image/png'
        case 'mp4':
    return 'video/mp4'
        case 'mpeg':
    return 'video/mpeg'   
        case 'mov':
    return 'video/quicktime'
        case 'avi':
    return 'video/avi'   
}
}

export const formatMobileNumber = (text: String) => {
  var cleaned = ("" + text).replace(/\D/g, "");
  var match = cleaned.match(/^(1|)?(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    var intlCode = match[1] ? "+1 " : "",
      number = [intlCode, "(", match[2], ") ", match[3], "-", match[4]].join(
        ""
      );
    return number;
  }
  return text;
}

export const DAY_OF_WEEK = Object.freeze({
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
});

export const DATE_SET_ACTION = 'dateSetAction';
export const TIME_SET_ACTION = 'timeSetAction';
export const DISMISS_ACTION = 'dismissedAction';

export const NEUTRAL_BUTTON_ACTION = 'neutralButtonAction';

export const CONTENT_SPACING = 15;
export const url = "https://snapeighteen.com";
export const updateJSON = "https://snapeighteen.com/update.json";
export const urldata = "https://snapeighteen.com/dataFiles";
export const verification_number = "+1 682.259.3773";
export const verification_email = 'support@snapeighteen.com';
const SAFE_BOTTOM = 0;
const SAFE_left = 0;
const SAFE_right = 0;
  //Platform.select({
    //ios: StaticSafeAreaInsets.safeAreaInsetsBottom,
  //}) ?? 0;

export const SAFE_AREA_PADDING = {
  paddingLeft: SAFE_left+ CONTENT_SPACING,
  paddingTop: 0,
  paddingRight: SAFE_right + CONTENT_SPACING,
  paddingBottom: SAFE_BOTTOM + CONTENT_SPACING,
};

// The maximum zoom _factor_ you should be able to zoom in
export const MAX_ZOOM_FACTOR = 20;

export const SCREEN_WIDTH = Dimensions.get('window').width;
export const SCREEN_HEIGHT = Platform.select<number>({
  android: Dimensions.get('screen').height - SAFE_BOTTOM,
  ios: Dimensions.get('window').height,
}) as number;

// Capture Button
export const CAPTURE_BUTTON_SIZE = 78;

export const productSkusUser = Platform.select({
  ios: [
    '00099',
  ],

  android: [
    'com.dunn_carabali.eighteen.99',
  ],

  default:[],
}) as string[];

export const productSkusSubscriptions = Platform.select({
  ios: [
    '0000000002'
  ],

  android: [
    'com.dunn_carabali.eighteen.pro',
  ],

  default:[],
}) as string[];

export const productSkus = Platform.select({
  ios: [
    '000200',
    '000100', 
    '000999',
    '000499'
  ],

  android: [
    'com.dunn_carabali.eighteen.200',
    'com.dunn_carabali.eighteen.100',
    'com.dunn_carabali.eighteen.50',
    'com.dunn_carabali.eighteen.18'
  ],

  default:[],
}) as string[];

export const remove_duplicates = (a: { camera_id: any; }[], b: any[]) => {
  a.map((firstObj: { camera_id: any; }) => {
    b.map((compareObj: { camera_id: any; }, i: any) => {
      if (firstObj.camera_id === compareObj.camera_id) {
        b.splice(i, 1);
  }
})
})
  return b;
}

export const covertNumber = (num:String)=>{
  let arr = Object.values(num);
  return  arr.splice(0, arr.length-4).fill('*').join('') + arr.splice(-4).join('');
}

export const mask = (email: String)=>{
  let chunks = String(email).split("@")
  return `${chunks[0].slice(0,3)}***@${chunks[1]}`;
}

export const constants = {
  productSkus,
  mask,
  covertNumber,
  remove_duplicates,
  historyActions,
  url, 
  actions,
  endActions,
  camera_time_seconds,
  productSkusUser,
  CAPTURE_BUTTON_SIZE,
  SCREEN_HEIGHT, 
  SCREEN_WIDTH, 
  SAFE_AREA_PADDING, 
  SAFE_BOTTOM,
  verification_number,
  verification_email,  
  CONTENT_SPACING,
  NEUTRAL_BUTTON_ACTION,
  DISMISS_ACTION,
  TIME_SET_ACTION,
  DATE_SET_ACTION,
  DAY_OF_WEEK,
  IOS_MODE,
  WINDOWS_MODE,
  ANDROID_MODE,
  COMMON_MODES,
  IOS_DISPLAY,
  ANDROID_EVT_TYPE,
  EVENT_TYPE_DISMISSED,
  EVENT_TYPE_SET,
  ANDROID_DISPLAY,
  MIN_MS,
  camera_time_text,
  camera_amount,
  formatMobileNumber,
  languages,
  productSkusSubscriptions,
  camera_time_text_PRO,
  camera_time_seconds_PRO,
  camera_amount_PRO,
  media_amount,
  urldata,
  updateJSON,
  mimes,
  historyActionsPro
};
