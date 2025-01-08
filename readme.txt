Build Web 
    npx expo export:web
    export NODE_OPTIONS=--openssl-legacy-provider  
    expo start --web   
     
Build Run iOS
    npx expo run:ios --Builds on Machine
    eas build -p ios -- Sends to Server
    npx react-native bundle --entry-file='index.js' --bundle-output='./ios/SnapEighteen/main.jsbundle' --dev=false --platform='ios' --assets-dest='./ios/SnapEighteen/' 

   Build Run Android
    npx expo run:android --Builds on Machine
    eas build -p android -- Sends to Server
    npx react-native bundle --platform='android' --entry-file='index.js' --bundle-output='./android/app/src/main/assets/index.android.bundle' --dev=false --assets-dest='./android/app/src/main/res'
    sudo npx react-native start

PODs
    pod deintegrate  
    pod install
    pod update

Start expo 
    npx expo start --clear  

NPM Installs
    npx expo-doctor
    npx npm-check-updates -u 
    npm install -g npm-check-updates

react-devtools


Watchman
    watchman watch-del '/Users/andrewdunn/Documents/GitHubDunn/Eighteen' ; watchman watch-project '/Users/andrewdunn/Documents/GitHubDunn/Eighteen'

Launch Packager
    /Users/andrewdunn/Documents/GitHubDunn/SnapEighteen/node_modules/expo/scripts/launchPackager.command ; exit;    

Patch Packager
    npx patch-package react-native-background-timer --use-yarn

open -a /Applications/Android\ Studio.app

        $myfile = fopen("file.txt", "w") or die("Unable to open file!");
        $result = mysqli_error($link);
        fwrite($myfile, $result);
        fwrite($myfile, "\n\n");
        fwrite($myfile, $response);
        fwrite($myfile, "\n\n");
        fwrite($myfile, $zillowJson);
        fclose($myfile);  
        
#TODO
 - When a friend or self gallery is expired find means to remove `user.Gallery.Friend.Feed.${props.route.params.pin}` and `user.Member.Join.Feed.${pin}`, 
 - SERVER NOTIFICATIONS on start and end.
 - on 30th day send media to email and archive.
 
 - Save media to device and languages
{
    "SaveDevice":"Save to Device",
    "DownloadingEventFiles":"Downloading Event Files",
    "Theventfiles":"The event files are being downloaded, please do not navigate away while download is in progress."
}




const resize = async () => {
    if (!imageUri) return;

    setResizedImage(null);

    try {
      let result = await ImageResizer.createResizedImage(
        imageUri,
        80,
        80,
        'JPEG',
        80,
        0,
        undefined,
        false,
        {
          mode: 'contain',
          true,
        }
      );

      setResizedImage(result);
    } catch (error) {
      Alert.alert('Unable to resize the photo');
    }
  };