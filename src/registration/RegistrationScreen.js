// @flow
import React from 'react';

import Heading from '../components/Heading';
import LayoutScrollable from '../components/LayoutScrollable';
import Registration from './Registration';
import { ScrollViewContext } from '../components/ScrollViewContext';
import { scrollToElement } from '../components/scrollToElement';

let refScroll = null;

const RegistrationScreen = () => (
  <LayoutScrollable
    scrollViewRef={ref => {
      refScroll = ref;
    }}
  >
    <Heading messageId="header.title.registration" />
    <ScrollViewContext.Provider value={{ scrollToElement: scrollToElement(refScroll) }}>
      <Registration />
    </ScrollViewContext.Provider>
  </LayoutScrollable>
);

export default RegistrationScreen;
