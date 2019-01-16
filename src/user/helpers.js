// @flow
import type { User } from '../types';

export const composeFullName = (firstName: ?string, surname: ?string): string => {
  if (firstName && surname) return `${firstName} ${surname}`;
  return firstName || surname || '';
};

export const composeUserName = (user: User) =>
  user.creditPrice ? composeFullName(user.firstName, user.surname) : user.accountCode;
