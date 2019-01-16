import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/lib/integration/react';

import configureStore from './src/redux';
import App from './src/App';
import Loader from './src/components/Loader';

const { store, persistor } = configureStore();

const Main = () => (
  <Provider store={store}>
    <PersistGate loading={<Loader />} persistor={persistor}>
      <App />
    </PersistGate>
  </Provider>
);

export default Main;
