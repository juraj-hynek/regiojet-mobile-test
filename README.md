# RegioJet Mobile App

Mobile app for [RegioJet](https://jizdenky.regiojet.cz).

## Included libraries

- [Axios](https://github.com/axios/axios) - HTTP requests
- [Native Base](https://github.com/GeekyAnts/NativeBase) - UI components **Use this one only in case there is no alternative, it’s quite unpredictable**
- [React Intl](https://github.com/yahoo/react-intl) - translations
- [React Navigation](https://github.com/react-community/react-navigation)
- [React Redux](https://github.com/reactjs/react-redux)
- [Redux Persist](https://github.com/rt2zz/redux-persist) - persisting Redux state to AsyncStorage
- [Redux Thunk](https://github.com/gaearon/redux-thunk) - chaining async actions

## <a name="prerequisites"></a>Pre-requisites
- [NodeJS v8.7.0](https://nodejs.org)
  > Use [nvm](https://github.com/creationix/nvm) to switch between NodeJS versions
- [Yarn v1.2.1](https://yarnpkg.com)
- [React Native dependencies](https://facebook.github.io/react-native/docs/getting-started.html) - see "Building Projects with Native Code"

## Development
- `yarn` - install npm packages
- `react-native run-ios` – build application and run it in iOS simulator
- `react-native run-android` – build application and run it in Android simulator (you need to start the simulator manually)
- `yarn start` - run React Native bundler (use this one if you don’t need to rebuild)
- `yarn test` - run jest
- `yarn eslint` - run eslint
- `yarn prettier` - format your code. Run this command after commit or use the integration to your [favorite editor](https://github.com/prettier/prettier#editor-integration).

### xCode
Open the project with `/ios/RegioJet.xcworkspace`. Do not use `/ios/RegioJet.xcodeproj`. This is required by [CocoaPods](https://cocoapods.org) that we use to bundle some native modules.

### Debugging
#### Inspect redux store, component tree and JS console
Use [React Native Debugger](https://github.com/jhen0409/react-native-debugger). Connect to the debugger using *Debug JS Remotely* in Simulator options (CMD/CTRL+D iOS, CMD/CTRL+M Android). Do not use *networking* feature of the React Native Debugger. It’s unreliable.

#### Networking
Inspect API calls using [Reactotron](https://github.com/infinitered/reactotron).

### Linking Native Modules
Do not use `react-native link` to link all the modules at once. It might break [react-native-maps installation](https://github.com/react-community/react-native-maps/blob/master/docs/installation.md).

Link modules one by one using `react link <module-name>`.

## <a name="env"></a>Environment variables
Copy contents of `.env-sample` into `.env` and configure proper secret values. Do not add this file to the version control as it may contain credentials etc.

There may be issues with reading environment variables from `.env` file. If that’s your case, add them to your system profile.

Create `ios/Config.xcconfig` and place FABRIC_API_KEY=xxxx inside.

To the `~/.gradle/gradle.properties`, add
```
REGIOJET_RELEASE_STORE_FILE=keystore_filename
REGIOJET_RELEASE_KEY_ALIAS=keystore_alias
REGIOJET_RELEASE_STORE_PASSWORD=xxxx
REGIOJET_RELEASE_KEY_PASSWORD=xxxx
```
See [Code signing – Android](#codesigning-android) for more information.

Fastlane workflow contains its own environment variables. Refer to `android/fastlane/.env-sample` or `ios/fastlane/.env-sample` and create `.env` files with proper secrets in the same folders.

### Example (UNIX/bash)
```bash
# add this to your ~/.bash_profile
export API_BASE_URL='https://dpl-qa-ybus-restapi.sa.cz/v2/restapi'
```

### Changing build environment variables
You can add or remove build environment variables in [CircleCI project settings](https://circleci.com/gh/actum/regiojet-mobile/edit#env-vars).

## Branches and deployment
- `master` - development branch, make pull requests to this branch, do not push directly

### Automatic builds
Every pull request to `master` is automatically tested and built using [CircleCI](https://circleci.com). After successful build, apps are uploaded to [Fabric Beta](https://fabric.io/). After app upload, developers send invitations for testing.

#### Fabric credentials
If you need access, ask colleagues.

## Releases

### 1. Environment
Setup the build environment according to the [Pre-requisities](#prerequisites) and [environment variables](#env).

### 2. Code signing
Obtain iOS signing certificate and provisioning profile (under the right development team) and Android keystore to be able to build and sign the apps.

#### 2.1. iOS
- Open `ios/RegioJet.xcworkspace` in xCode
- Go to **Preferences → Accounts** and add your Apple ID you want to use to publish the app.
- Signing certificates and provisioning profiles will be downloaded from the Apple Developer Portal. Just make sure you use the correct Apple ID / Team.
- In the **main window**, select **RegioJet** target and go to **General** tab
- In the **Signing (Release)** section, select the correct Provisioning Profile. It should be of type *AppStore*. Make sure correct **Team** is displayed and **Signing Certificate** selected (it should be of type Distribution).

#### <a name="codesigning-android"></a>2.2. Android
- In case you update existing app or just release a new version, make sure to use a **keystore** that was used to sign the previous versions of the app. Otherwise [generate new one](https://facebook.github.io/react-native/docs/signed-apk-android.html#generating-a-signing-key).
- Place the keystore to `android/app/`
- To the `~/.gradle/gradle.properties`, add
  ```
  REGIOJET_RELEASE_STORE_FILE=keystore_filename
  REGIOJET_RELEASE_KEY_ALIAS=keystore_alias
  REGIOJET_RELEASE_STORE_PASSWORD=xxxx
  REGIOJET_RELEASE_KEY_PASSWORD=xxxx
  ```
  With proper values.

### 3. Create release archives
#### 3.1. iOS
- Open `ios/RegioJet.xcworkspace` in xCode.
- In the **main window**, select **RegioJet** target and go to **General** tab. Under the **Identity** section, update the version and increment the build number.
- Choose **RegioJet Release → Generic iOS Device** scheme.
- From the menu bar, select **Product → Archive** and wait until the archive is built.
- Select the latest archive, click **Validate…** and follow the process (leave the checkboxes as they are and make sure to select correct certificates).
- After successful validation, click **Upload to App Store**

#### 3.2. Android
- Look for `android { defaultConfig { …` in `android/app/build.gradle`. Increment the versionCode and update the versionName.
- In the `android` folder run `./gradlew assembleRelease`. The generated APK can be found under `android/app/build/outputs/apk/release/app-release.apk`
- Go to the [Google Play Console](https://play.google.com/apps/publish/) under the correct account/organization. Select your app and go to **Release management → App releases**. Create a new internal, alpha or beta release and upload the recently built `android/app/build/outputs/apk/release/app-release.apk` there and submit the release.

### 4. Testing
#### 4.1. iOS
Go to your app in the [App Store Connect](https://appstoreconnect.apple.com/) and click the **TestFlight** tab. After your fresh build appears there make sure to provide the compliance information if needed. Then you can test the build using the **TestFlight** iOS app (available in the App Store).

#### 4.2. Android
Go to the [Google Play Console](https://play.google.com/apps/publish/) under the correct account/organization. Look up your release in the **App releases** section. Add testers if needed.

### 5. Production
#### 5.1. iOS
After the testing, go to the [App Store Connect](https://appstoreconnect.apple.com/) and click the **App Store** tab. Select the **Prepare for Submission** item in the **iOS App** section in the left menu and follow the process.

#### 5.2. Android
After the testing, look up your release in the [Google Play Console](https://play.google.com/apps/publish/). Click **Release to production** and follow the process.
