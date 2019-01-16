// @flow
import React, { type ComponentType } from 'react';

import { getDisplayName } from '../helpers/react';

type State = {
  key: number,
};

export default (Component: ComponentType<any>) =>
  class WithRetry extends React.PureComponent<{}, State> {
    static displayName = `WithRetry(${getDisplayName(Component)})`;

    state = {
      key: Date.now(),
    };

    handleRetry = () => {
      this.setState({ key: Date.now() });
    };

    render() {
      return <Component key={this.state.key} onRetry={this.handleRetry} {...this.props} />;
    }
  };
