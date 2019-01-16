// @flow
import React from 'react';
import { ScrollViewContext } from './ScrollViewContext';

type Props = {
  children: ?Element,
};

const ScrollableContext = ({ children }: Props) => (
  <ScrollViewContext.Consumer>
    {({ scrollToElement }) =>
      React.Children.map(children, child => React.cloneElement(child, { scrollToElement }))
    }
  </ScrollViewContext.Consumer>
);

export default ScrollableContext;
