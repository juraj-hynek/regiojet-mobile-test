import './ReactotronConfig';
// eslint-disable-next-line import/first
import { AppRegistry, YellowBox } from 'react-native';
import App from './App';

// TODO remove when it's not needed
YellowBox.ignoreWarnings([
  // https://github.com/facebook/react-native/issues/18868
  'Warning: isMounted(...) is deprecated in plain JavaScript React classes.',
]);

AppRegistry.registerComponent('RegioJet', () => App);
