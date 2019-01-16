// @flow
import { GoogleTagManager, GoogleAnalyticsSettings } from 'react-native-google-analytics-bridge';

import { getConfig } from '../services/config';

let initialized = false;

const gtmPush = async (payload: Object): Promise<boolean> => {
  const init = async () => {
    if (initialized) {
      return;
    }

    // eslint-disable-next-line no-undef
    if (__DEV__) {
      GoogleAnalyticsSettings.setDryRun(true);
      GoogleTagManager.setVerboseLoggingEnabled(true);
    }

    // Testing iOS container
    // const GTM_ID = 'GTM-WCNFW52';

    const GTM_ID = getConfig('GTM_ID');
    await GoogleTagManager.openContainerWithId(GTM_ID);
    initialized = true;

    // eslint-disable-next-line no-undef
    if (__DEV__) {
      console.log('container opened (should call just once)');
    }
  };

  const push = async (): Promise<boolean> => {
    await init();

    // eslint-disable-next-line no-undef
    if (__DEV__) {
      console.log('about to push', payload);
    }
    return GoogleTagManager.pushDataLayerEvent(payload);
  };

  return push();
};

export default gtmPush;
