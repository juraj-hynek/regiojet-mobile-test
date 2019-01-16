// @flow
import React, { type Node } from 'react';
import { Animated, Keyboard } from 'react-native';

import { getRedWithAlpha, touchableActiveOpacity } from '../style';
import type { Style } from '../types';

type Props = {
  children: Node,
  onPress: Function,
  style?: Style,
};

type State = {
  alpha: Object,
};

type AnimationState = {
  alpha: number,
  duration: number,
};

type AnimationStates = {
  press: AnimationState,
  release: AnimationState,
};

const animationStates: AnimationStates = {
  press: {
    alpha: touchableActiveOpacity,
    duration: 10,
  },
  release: {
    alpha: 1,
    duration: 200,
  },
};

class TextLink extends React.Component<Props, State> {
  state = {
    alpha: new Animated.Value(animationStates.release.alpha),
  };

  createAnimation = (state: $Keys<AnimationStates>) => {
    const { alpha, duration } = animationStates[state];

    return Animated.timing(this.state.alpha, {
      toValue: alpha,
      duration,
    });
  };

  interpolateStyle() {
    const { press, release } = animationStates;
    const color = this.state.alpha.interpolate({
      inputRange: [press.alpha, release.alpha],
      outputRange: [getRedWithAlpha(press.alpha), getRedWithAlpha(release.alpha)],
    });

    return { color };
  }

  animatePress() {
    const animation = this.createAnimation('press');
    animation.start();
  }

  animateRelease() {
    const animation = this.createAnimation('release');
    animation.start();
  }

  handleStartShouldSetResponder = () => true;

  handleResponderGrant = () => this.animatePress();

  handleResponderTerminate = () => this.animateRelease();

  handleResponderRelease = () => {
    this.animateRelease();
    Keyboard.dismiss();
    this.props.onPress();
  };

  render() {
    const { children, style } = this.props;

    return (
      <Animated.Text
        onResponderGrant={this.handleResponderGrant}
        onResponderRelease={this.handleResponderRelease}
        onResponderTerminate={this.handleResponderTerminate}
        onStartShouldSetResponder={this.handleStartShouldSetResponder}
        style={[style, this.interpolateStyle()]}
      >
        {children}
      </Animated.Text>
    );
  }
}

export default TextLink;
