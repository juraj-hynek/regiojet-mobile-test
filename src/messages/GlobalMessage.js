// @flow
import { connect } from 'react-redux';
import { StyleSheet, Text } from 'react-native';
import React from 'react';

import { getShadow } from '../style';
import { removeGlobalMessage } from './actions';
import FormattedMessage from '../components/FormattedMessage';
import TouchableOpacity from '../components/TouchableOpacity';
import type { GlobalMessage as TypeGlobalMessage } from '../types';
import Warning from '../components/Warning';

type Props = {
  duration: number,
  message: TypeGlobalMessage,
  removeGlobalMessage: typeof removeGlobalMessage,
};

class GlobalMessage extends React.PureComponent<Props> {
  static defaultProps = {
    duration: 5000,
  };

  // eslint-disable-next-line react/sort-comp
  hideTimeout = null;

  componentDidMount() {
    if (this.props.message.type !== 'error') {
      this.hideTimeout = setTimeout(this.removeMessage, this.props.duration);
    }
  }

  componentWillUnmount() {
    this.clearTimeout();
  }

  handlePress = () => {
    this.clearTimeout();
    this.removeMessage();
  };

  clearTimeout = () => {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
  };

  removeMessage = () => {
    const { message, removeGlobalMessage } = this.props;
    removeGlobalMessage(message.id);
  };

  render() {
    const { message } = this.props;

    return (
      <TouchableOpacity onPress={this.handlePress} style={styles.message}>
        <Warning closable type={message.type}>
          {message.text ? (
            <Text>{message.text}</Text>
          ) : (
            // $FlowFixMe if there's no "text", there must be "messageId"
            <FormattedMessage id={message.messageId} values={message.values} />
          )}
        </Warning>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  message: {
    ...getShadow({ elevation: 7 }),
    margin: 7,
    marginBottom: 0,
  },
});

export default connect(null, { removeGlobalMessage })(GlobalMessage);
