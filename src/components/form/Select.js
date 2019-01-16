// @flow
import { StyleSheet, View } from 'react-native';
import React, { type Element, type Node } from 'react';

import { colors, getShadow } from '../../style';
import Button from '../Button';
import TouchableOpacity from '../TouchableOpacity';
import type { Style } from '../../types';

export type Option = {
  element: Node,
  value: any,
};

type Props = {|
  children: Element<any>,
  onChange: Function,
  options: Array<Option>,
  style?: Style,
|};

type State = {
  isOpen: boolean,
};

class Select extends React.Component<Props, State> {
  state = {
    isOpen: false,
  };

  handleChange = (option: Option) => {
    this.handlePress();
    this.props.onChange(option.value);
  };

  handlePress = () => {
    this.setState(prevState => ({ isOpen: !prevState.isOpen }));
  };

  render() {
    const { children, options, style } = this.props;
    const { isOpen } = this.state;

    return (
      <View style={style}>
        <Button
          iconRight={isOpen ? 'chevronUp' : 'chevronDown'}
          onPress={this.handlePress}
          secondary
          size="small"
          type="informational"
        >
          {children}
        </Button>

        {isOpen && (
          <View style={styles.list}>
            {options.map(option => (
              <TouchableOpacity
                key={option.value}
                onPress={() => this.handleChange(option)}
                style={styles.item}
              >
                {option.element}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  list: {
    ...getShadow({ elevation: 3 }),
    backgroundColor: colors.white,
    borderRadius: 5,
  },

  item: {
    paddingHorizontal: 20,
    paddingVertical: 7,
  },
});

export default Select;
