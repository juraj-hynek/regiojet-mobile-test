// @flow
import type { ComponentType } from 'react';

export const getDisplayName = (Component: ComponentType<any>) =>
  Component.displayName || Component.name || 'Component';
