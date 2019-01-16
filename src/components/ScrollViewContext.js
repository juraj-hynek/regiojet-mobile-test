// @flow
// $FlowFixMe
import { createContext } from 'react';

const defaultContext: { scrollToElement: Function } = { scrollToElement: () => {} };

export const ScrollViewContext = createContext(defaultContext);
