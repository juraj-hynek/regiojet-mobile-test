// @flow
import React from 'react';
import Svg, { Polygon } from 'react-native-svg';

import type { Style } from '../types';

type TriangleType = 'leftTop';

type Props = {
  color: string,
  height: number,
  style?: Style,
  type: TriangleType,
  width: number,
};

const composePoints = (width: number, height: number, type: TriangleType) => {
  switch (type) {
    case 'leftTop':
      return `0,0 ${width},0 0,${height}`;
    default:
      throw new Error(`Unsupported triange type "${type}"`);
  }
};

const Triangle = ({ color, height, style, type, width }: Props) => (
  <Svg height={height} style={style} width={width}>
    <Polygon points={composePoints(width, height, type)} fill={color} />
  </Svg>
);

export default Triangle;
