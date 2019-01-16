// @flow
import React, { type Node } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { colors } from '../style';
import type { Style } from '../types';

type Props = {
  children: Node,
  innerStyle?: Style,
  overlayColor: string,
  overlayWidth: number,
  style?: Style,
};

type State = {
  innerSize: Object,
  outerSize: Object,
};

class RowEllipsis extends React.Component<Props, State> {
  static defaultProps = {
    overlayColor: colors.white,
    overlayWidth: 30,
  };

  state = {
    innerSize: {},
    outerSize: {},
  };

  measureViewWidth = (event: Object, name: string) => {
    const { width, height } = event.nativeEvent.layout;
    this.setState({ [name]: { width, height } });
  };

  renderOverlay() {
    const { overlayColor, overlayWidth } = this.props;
    const {
      innerSize: { height },
    } = this.state;

    return (
      <View style={[styles.overlay, { width: overlayWidth }]}>
        <Svg height={height} width={overlayWidth}>
          <Defs>
            <LinearGradient id="overlay" x1="0" y1="0" x2={overlayWidth} y2="0">
              <Stop offset="0" stopColor={overlayColor} stopOpacity="0" />
              <Stop offset="1" stopColor={overlayColor} stopOpacity="1" />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width={overlayWidth} height={height} fill="url(#overlay)" />
        </Svg>
      </View>
    );
  }

  render() {
    const { children, innerStyle, style } = this.props;
    const { innerSize, outerSize } = this.state;

    return (
      <View style={[style, styles.container]}>
        <View onLayout={event => this.measureViewWidth(event, 'outerSize')} style={styles.outer}>
          <View
            onLayout={event => this.measureViewWidth(event, 'innerSize')}
            style={[styles.inner, innerStyle]}
          >
            {React.Children.map(
              children,
              child =>
                child.type === Text ? React.cloneElement(child, { numberOfLines: 1 }) : child,
            )}
          </View>
          {innerSize.width > outerSize.width && this.renderOverlay()}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  outer: {
    alignItems: 'flex-start',
    overflow: 'hidden',
  },

  inner: {
    flexDirection: 'row',
  },

  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
  },
});

export default RowEllipsis;
