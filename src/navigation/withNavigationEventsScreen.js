// @flow
import { connect } from 'react-redux';
import React, { type ComponentType } from 'react';

import { getDisplayName } from '../helpers/react';
import { screenWillBlur, screenWillFocus } from '../navigation/actions';

type Props = {|
  screenWillBlur: typeof screenWillBlur,
  screenWillFocus: typeof screenWillFocus,
|};

/**
 * HOC to fire navigation events
 */
export default (Screen: ComponentType<any>) => {
  class WithNavigationEventsScreen extends React.PureComponent<Props> {
    static displayName = `WithNavigationEventsScreen(${getDisplayName(Screen)})`;

    componentWillMount() {
      this.props.screenWillFocus(getDisplayName(Screen));
    }

    componentWillUnmount() {
      this.props.screenWillBlur(getDisplayName(Screen));
    }

    render() {
      return <Screen {...this.props} />;
    }
  }

  return connect(null, { screenWillBlur, screenWillFocus })(WithNavigationEventsScreen);
};
