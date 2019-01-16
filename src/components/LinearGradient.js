// @flow
import React, { type Node } from 'react';
import { LinearGradient as RNSLinearGradient, Stop } from 'react-native-svg';

import { colors } from '../style';

type Props = {
  children: Node,
  disabled?: boolean,
  id: string,
  x1: string,
  x2: string,
  y1: string,
  y2: string,
};

const LinearGradient = ({ children, disabled, id, x1, x2, y1, y2 }: Props) => (
  <RNSLinearGradient id={id} x1={x1} x2={x2} y1={y1} y2={y2}>
    {disabled
      ? [
          // Cannot use colors.greyShadow coz it’s transparent,
          // so it doesn’t cover the default black fill
          <Stop key={0} offset="0%" stopColor={colors.greyShadowHexa} />,
          <Stop key={100} offset="100%" stopColor={colors.grey} />,
        ]
      : children}
  </RNSLinearGradient>
);

export default LinearGradient;
