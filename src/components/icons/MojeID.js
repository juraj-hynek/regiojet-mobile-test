// @flow
import React from 'react';
import Svg, { G, Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import withViewBoxDimensions, { type Props } from './withViewBoxDimensions';

const VIEWBOX_WIDTH = 27;
const VIEWBOX_HEIGHT = 21;

const MojeID = ({ height, width }: Props) => (
  <Svg height={height} viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`} width={width}>
    <Defs>
      <LinearGradient x1="75.404%" y1="87.413%" x2="-31.57%" y2="5.271%" id="a">
        <Stop stopColor="#BFBFBD" offset="0.6%" />
        <Stop stopColor="#C7C7C5" offset="4.6%" />
        <Stop stopColor="#EFEFEF" offset="27.6%" />
        <Stop stopColor="#FFF" offset="39.3%" />
      </LinearGradient>
      <LinearGradient x1="156.345%" y1="86.416%" x2="-56.393%" y2="13.591%" id="b">
        <Stop stopColor="#DF8200" offset="0%" />
        <Stop stopColor="#F0A800" offset="39.2%" />
        <Stop stopColor="#FFCB00" offset="71.3%" />
        <Stop stopColor="#FFCB00" offset="100%" />
      </LinearGradient>
      <LinearGradient x1="0%" y1="50.035%" x2="99.999%" y2="50.035%" id="c">
        <Stop stopColor="#FCC200" offset="0%" />
        <Stop stopColor="#FFCB00" offset="100%" />
      </LinearGradient>
    </Defs>
    <G fillRule="nonzero" fill="none">
      <Path
        d="M16.416 0H8v11.933a26.548 26.548 0 0 1 4.273-2.5V4.272h4.143v.008a6.039 6.039 0 0 1 0 12.078h-4.143v-3.725c0-.107-.1-.106-.146-.07A19.691 19.691 0 0 0 8 16.423v4.215h8.416c5.699 0 10.319-4.62 10.319-10.319C26.735 4.62 22.115 0 16.416 0z"
        fill="#FFF"
      />
      <Path fill="url(#a)" d="M12.273 9.428L8 11.933V0l4.273 4.272z" />
      <Path fill="url(#b)" d="M0 6h4.098v14.267H0z" />
      <Path
        d="M20.91 7.446a.485.485 0 0 0-.122-.312.575.575 0 0 0-.506-.118A26.147 26.147 0 0 0 0 20.556h4.1a26.5 26.5 0 0 1 16.482-12.73c.254-.084.333-.24.328-.38z"
        fill="url(#c)"
      />
      <Path d="M2.451 0a2.452 2.452 0 1 1 .002 4.904A2.452 2.452 0 0 1 2.451 0z" fill="#FFCB00" />
    </G>
  </Svg>
);

export default withViewBoxDimensions(VIEWBOX_WIDTH, VIEWBOX_HEIGHT)(MojeID);
