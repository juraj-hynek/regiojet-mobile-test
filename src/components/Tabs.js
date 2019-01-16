// @flow
import { ScrollView, StyleSheet, View } from 'react-native';
import React, { Fragment, type Node } from 'react';

import { colors, composeFontStyle } from '../style';
import { scrollToElement } from './scrollToElement';
import FormattedMessage from './FormattedMessage';
import TouchableOpacity from './TouchableOpacity';
import type { Style } from '../types';

type Props = {
  children?: Array<Node>,
  errors: Array<number>,
  headers: Array<Node>,
  onPress: Function,
  raised: boolean,
  selectedIndex: number,
  updateRefTabs?: Function,
  style?: Style,
};

type State = {
  selectedIndex: number,
};

class Tab extends React.PureComponent<Props, State> {
  static defaultProps = {
    errors: [],
    onPress: () => {},
    raised: false,
    selectedIndex: 0,
  };

  state = {
    selectedIndex: this.props.selectedIndex,
  };

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.headers.length !== this.props.headers.length) {
      this.setState({ selectedIndex: 0 });
    }
  }

  getTabErrorCount = (tabIndex: number): number => this.props.errors[tabIndex] || 0;

  references = {};
  refScroll = null;

  handlePress = (selectedIndex: number) => {
    if (this.state.selectedIndex === selectedIndex) {
      return;
    }

    scrollToElement(this.refScroll, { scrollVertical: false })(this.references[selectedIndex]);
    this.setState({ selectedIndex });
    this.props.onPress(selectedIndex);
  };

  render() {
    const { children, headers, raised, updateRefTabs, style } = this.props;
    const { selectedIndex } = this.state;

    return (
      <View collapsable={false} ref={updateRefTabs} style={style}>
        <ScrollView
          contentContainerStyle={styles.headers}
          horizontal
          style={[raised && styles.raisedHeadersContainer]}
          ref={ref => {
            this.refScroll = ref;
          }}
        >
          {headers.map((header, index) => {
            const errorCount = this.getTabErrorCount(index);
            const isSelected = selectedIndex === index;

            return (
              <TouchableOpacity
                key={index} // eslint-disable-line react/no-array-index-key
                onPress={() => this.handlePress(index)}
                style={[
                  raised ? styles.raisedButtonContainer : styles.normalButtonContainer,
                  raised && isSelected && styles.raisedButtonContainerSelected,
                ]}
              >
                {!!errorCount && (
                  <FormattedMessage
                    id="validation.tabErrorsCount"
                    style={styles.warning}
                    values={{ count: errorCount }}
                  />
                )}
                <View
                  collapsable={false}
                  style={[
                    styles.button,
                    raised ? styles.raisedButton : styles.normalButton,
                    raised && errorCount && styles.raisedButtonError,
                    isSelected && styles.buttonSelected,
                    isSelected &&
                      (raised ? styles.raisedButtonSelected : styles.normalButtonSelected),
                    isSelected && raised && errorCount && styles.raisedButtonSelectedError,
                    errorCount && styles.buttonError,
                  ]}
                  ref={ref => {
                    this.references[index] = ref;
                  }}
                >
                  {header}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        {children && <Fragment key={selectedIndex}>{children[selectedIndex]}</Fragment>}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  // common
  headers: {
    alignItems: 'stretch',
    backgroundColor: colors.white,
    flexDirection: 'row',
    flexGrow: 1,
  },

  button: {
    backgroundColor: colors.yellowSoft,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    flexGrow: 1,
    justifyContent: 'center',
  },

  buttonError: {
    borderTopColor: colors.red,
    borderTopWidth: 5,
  },

  buttonSelected: {
    borderTopColor: colors.yellow,
    borderTopWidth: 5,
  },

  normalButtonContainer: {
    width: '50%',
  },

  warning: {
    ...composeFontStyle(13),
    color: colors.red,
    lineHeight: 13,
    marginBottom: 5,
    paddingHorizontal: 12.5,
  },

  // normal (non-raised)
  normalButton: {
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 15,
  },

  normalButtonSelected: {
    backgroundColor: colors.white,
    paddingTop: 10,
  },

  // raised
  raisedHeadersContainer: {
    borderBottomColor: colors.yellow,
    borderBottomWidth: 10,
    marginHorizontal: -2.5,
  },

  raisedButtonContainer: {
    marginTop: 5,
    maxWidth: 200,
    minWidth: 100,
  },

  raisedButtonContainerSelected: {
    marginTop: 0,
  },

  raisedButton: {
    marginHorizontal: 2.5,
    paddingBottom: 13,
    paddingHorizontal: 10,
    paddingTop: 13,
  },

  raisedButtonError: {
    marginTop: 0,
  },

  raisedButtonSelected: {
    backgroundColor: colors.yellow,
    borderTopWidth: 4,
    paddingBottom: 15,
    paddingTop: 11,
  },

  raisedButtonSelectedError: {
    paddingTop: 16,
  },
});

export default Tab;
