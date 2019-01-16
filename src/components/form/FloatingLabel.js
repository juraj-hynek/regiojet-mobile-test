// @flow
import React from 'react';
import { Animated, StyleSheet } from 'react-native';
import { colors, fontFamilies, theme } from '../../style';

type Props = {
  focused: boolean,
  label: string,
  // eslint doesn't see the prop when passed as a default parameter
  // eslint-disable-next-line react/no-unused-prop-types
  value: string | Date,
  style?: Object,
};

class FloatingLabel extends React.Component<Props> {
  static defaultProps = {
    value: '',
  };

  static ANIMATION_LABEL_DOWN = {
    top: 15,
    left: 10,
    fontSize: 16,
  };

  static ANIMATION_LABEL_UP = {
    top: 7,
    left: 10,
    fontSize: 13,
  };

  static ANIMATION_LABEL_DURATION = 150;

  componentWillMount() {
    const { top, left, fontSize } =
      this.getValueLength() > 0
        ? FloatingLabel.ANIMATION_LABEL_UP
        : FloatingLabel.ANIMATION_LABEL_DOWN;
    this.animatedLabel = {
      top: new Animated.Value(top),
      left: new Animated.Value(left),
      fontSize: new Animated.Value(fontSize),
    };
  }

  componentWillReceiveProps(nextProps: Props) {
    const valueCame = !this.hasValue() && this.hasValue(nextProps);
    const focusCame = !this.props.focused && nextProps.focused;
    const floatUp = (valueCame && !this.props.focused) || (focusCame && !this.hasValue());

    const valueLost = this.hasValue() && !this.hasValue(nextProps);
    const focusLost = this.props.focused && !nextProps.focused;
    const floatDown = (valueLost && !nextProps.focused) || (focusLost && !this.hasValue(nextProps));

    if (floatUp) {
      this.floatUp(FloatingLabel.ANIMATION_LABEL_DURATION);
    } else if (floatDown) {
      this.floatDown(FloatingLabel.ANIMATION_LABEL_DURATION);
    }
  }

  getValueLength(props?: Object = this.props) {
    return props.value.toString().length;
  }

  hasValue(props?: Object = this.props) {
    return this.getValueLength(props) > 0;
  }

  animatedLabel: Object;

  floatUp = (duration: number) => this.animateLabel(FloatingLabel.ANIMATION_LABEL_UP, duration);
  floatDown = (duration: number) => this.animateLabel(FloatingLabel.ANIMATION_LABEL_DOWN, duration);

  animateLabel = (type: Object, duration: number) => {
    Animated.parallel([
      this.createAnimation(this.animatedLabel.top, type.top, duration),
      this.createAnimation(this.animatedLabel.left, type.left, duration),
      this.createAnimation(this.animatedLabel.fontSize, type.fontSize, duration),
    ]).start();
  };

  createAnimation = (value: Object, toValue: number, duration: number) =>
    Animated.timing(value, {
      toValue,
      duration,
    });

  render() {
    const { focused, label, style } = this.props;

    return (
      <Animated.Text
        style={[
          styles.label,
          (this.hasValue() || focused) && theme.semiBold,
          {
            top: this.animatedLabel.top,
            left: this.animatedLabel.left,
            fontSize: this.animatedLabel.fontSize,
          },
          style,
        ]}
      >
        {label}
      </Animated.Text>
    );
  }
}

const styles = StyleSheet.create({
  label: {
    position: 'absolute',
    fontFamily: fontFamilies.base,
    color: colors.grey,
  },
});

export default FloatingLabel;
