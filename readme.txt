Build Web 
    npx expo export:web
    export NODE_OPTIONS=--openssl-legacy-provider  
    expo start --web   
     
Build Run iOS
    npx expo run:ios --Builds on Machine
    eas build -p ios -- Sends to Server
    npx react-native bundle --entry-file='index.js' export:embed  --bundle-output='./ios/main.jsbundle' --dev=false --platform='ios' --assets-dest='./ios' && mkdir -p ios/output && npx expo export:embed --platform ios --entry-file node_modules/expo/AppEntry.js --bundle-output ios/output/main.jsbundle --dev false --assets-dest ios/output --sourcemap-output ios/sourcemap.js && cd ios && find output -type f | zip main.jsbundle.zip -@ && zip sourcemap.zip sourcemap.js && cd .. && rm -rf ios/output && rm -rf ios/sourcemap.js
   
   Build Run Android
    npx expo run:android --Builds on Machine
    eas build -p android -- Sends to Server
    npx react-native bundle --platform='android' --entry-file='index.js' --bundle-output='./android/app/src/main/assets/index.android.bundle' --dev=false --assets-dest='./android/app/src/main/res'
    sudo npx react-native start

curl 'http://localhost:8081/index.js.bundle?dev=false&minify=true' -o ios/main2.jsbundle

All Build jbundle.
   npx react-native bundle --platform='android' --entry-file='index.js' --bundle-output='./android/app/src/main/assets/index.android.bundle' --dev=false --assets-dest='./android/app/src/main/res' && npx react-native bundle --entry-file='index.js' --bundle-output='./ios/SnapEighteen/main.jsbundle' --dev=false --platform='ios' --assets-dest='./ios/SnapEighteen/'

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

npx uri-scheme open "snapseighteenapp://friends/45/user" --ios

npx uri-scheme open "snapseighteenapp://join/SNAP-UL49-PY965-1736841682-6AB/1737273600/45" --ios

Watchman
    watchman watch-del '/Users/andrewdunn/Documents/GitHubDunn/Eighteen' ; watchman watch-project '/Users/andrewdunn/Documents/GitHubDunn/Eighteen'

Launch Packager
    /Users/andrewdunn/Documents/GitHubDunn/SnapEighteen/node_modules/expo/scripts/launchPackager.command ; exit;    

Patch Packager
    npx patch-package @baronha/react-native-photo-editor --use-yarn

diskutil resetUserPermissions / `id -u`

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


Android Keystore
key0
snapeighteen
ntrboy21