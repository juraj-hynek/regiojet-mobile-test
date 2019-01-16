// @flow
import { View } from 'react-native';
import React, { type ComponentType } from 'react';

import { composeContainerStyle, computeDimensionsFromViewbox } from '../Icon';
import { getDisplayName } from '../../helpers/react';
import type { Style } from '../../types';

export type Props = {
  disabled?: boolean,
  fitToContent?: boolean,
  height: number,
  style?: Style,
  width: number,
};

export default (viewBoxWidth: number, viewBoxHeight: number) => (
  SvgComponent: ComponentType<Props>,
): ComponentType<Props> => {
  const SvgWithViewBox = (props: Props) => {
    const { fitToContent, height, style, width } = props;
    const dimensions = fitToContent
      ? computeDimensionsFromViewbox(viewBoxWidth, viewBoxHeight, width, height)
      : { width, height };

    return (
      <View style={composeContainerStyle(dimensions.width, dimensions.height, style)}>
        <SvgComponent {...props} height={dimensions.height} width={dimensions.width} />
      </View>
    );
  };

  SvgWithViewBox.displayName = `SvgWithViewBox(${getDisplayName(SvgComponent)})`;

  return SvgWithViewBox;
};
