// eslint-disable-next-line import/no-extraneous-dependencies
import Reactotron from 'reactotron-react-native';

// __DEV__ is set automatically in RN
// eslint-disable-next-line no-undef
if (__DEV__) {
  Reactotron.configure()
    .useReactNative()
    .connect();
}
