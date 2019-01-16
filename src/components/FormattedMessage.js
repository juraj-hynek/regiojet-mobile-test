// @flow

/**
 * This is a replacement of FormattedMessage from react-intl
 * It allows passing custom styling to the Text component
 */
import React, { type Node, Fragment } from 'react';
import { Platform, Text } from 'react-native';
import { FormattedMessage as RIFormattedMessage } from 'react-intl';

import type { Style } from '../types';

type Props = {
  id: string,
  style?: Style,
  textAfter?: string,
  textBefore?: string,
  uppercase?: boolean,
  values?: Object,
};

class FormattedMessage extends React.PureComponent<Props> {
  getInnerTextStyle = () =>
    Platform.select({
      ios: { style: this.props.style },
    });

  render() {
    const { id, style, textAfter, textBefore, uppercase, values, ...otherProps } = this.props;

    return (
      <RIFormattedMessage id={id} values={values} {...otherProps}>
        {(...chunks: Array<Node>) => (
          <Text style={style}>
            {textBefore && <Text>{textBefore}</Text>}
            {chunks.map((chunk, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <Fragment key={index}>
                {typeof chunk === 'string' ? (
                  // Passing style again to fix unknown iOS bug
                  // (lineHeight is not passed properly from parent Text’s style)
                  <Text {...this.getInnerTextStyle()}>
                    {uppercase ? chunk.toUpperCase() : chunk}
                  </Text>
                ) : (
                  chunk
                )}
              </Fragment>
            ))}
            {textAfter && <Text>{textAfter}</Text>}
          </Text>
        )}
      </RIFormattedMessage>
    );
  }
}

export default FormattedMessage;
