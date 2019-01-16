// @flow
import React, { type Node } from 'react';
import { RadialGradient as RNSRadialGradient, Stop } from 'react-native-svg';

import { colors } from '../style';

type Props = {
  children: Node,
  cx: string,
  cy: string,
  disabled?: boolean,
  fx: string,
  fy: string,
  id: string,
  r: string,
};

const RadialGradient = ({ children, cx, cy, disabled, fx, fy, id, r }: Props) => (
  <RNSRadialGradient cx={cx} cy={cy} fx={fx} fy={fy} id={id} rx={r} ry={r}>
    {disabled
      ? [
          // Cannot use colors.greyShadow coz it’s transparent,
          // so it doesn’t cover the default black fill
          <Stop key={0} offset="0%" stopColor={colors.greyShadowHexa} />,
          <Stop key={100} offset="100%" stopColor={colors.grey} />,
        ]
      : children}
  </RNSRadialGradient>
);

export default RadialGradient;
