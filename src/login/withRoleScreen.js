// @flow
import { connect } from 'react-redux';
import React, { type ComponentType } from 'react';

import { getDisplayName } from '../helpers/react';
import type { UserRole } from '../types';

type Props = {
  userRole: UserRole,
};

/**
 * HOC to hide screen if it's forbidden
 */
export default (Screen: ComponentType<any>, allowedRoles: Array<UserRole>) => {
  const WithRoleScreen = (props: Props) =>
    allowedRoles.includes(props.userRole) ? <Screen {...props} /> : null;

  WithRoleScreen.displayName = `WithRoleScreen(${getDisplayName(Screen)})`;

  return connect(({ user: { role } }) => ({ userRole: role }), {})(WithRoleScreen);
};
