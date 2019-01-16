// @flow
import { connect } from 'react-redux';
import { View } from 'react-native';
import get from 'lodash/get';
import React from 'react';

import { openForgottenPasswordModal } from '../modal/actions';
import { scrollToElement } from '../components/scrollToElement';
import { ScrollViewContext } from '../components/ScrollViewContext';
import { theme } from '../style';
import { validatePasswordResetToken } from './actions';
import FormattedMessage from '../components/FormattedMessage';
import Heading from '../components/Heading';
import LayoutScrollable from '../components/LayoutScrollable';
import LoaderSmall from '../components/LoaderSmall';
import PasswordResetForm from './PasswordResetForm';
import TextLink from '../components/TextLink';
import type { ErrorResponse } from '../types';
import Warning from '../components/Warning';

type Props = {
  error: ?ErrorResponse,
  isFetching: boolean,
  navigation: { state: { params: { token: string } } },
  openForgottenPasswordModal: typeof openForgottenPasswordModal,
  validatePasswordResetToken: typeof validatePasswordResetToken,
};

class PasswordResetScreen extends React.PureComponent<Props> {
  componentDidMount() {
    const token = get(this.props.navigation, 'state.params.token');
    this.props.validatePasswordResetToken(token);
  }

  refScroll = null;

  handlePress = () => this.props.openForgottenPasswordModal();

  render() {
    const { error, isFetching } = this.props;

    return (
      <LayoutScrollable
        scrollViewRef={ref => {
          this.refScroll = ref;
        }}
      >
        <Heading messageId="header.title.passwordReset" />
        <View style={theme.container}>
          {isFetching && <LoaderSmall />}
          {error && (
            <Warning type="warning">
              <FormattedMessage
                id="passwordReset.tokenNotVerified"
                values={{
                  link: (
                    <TextLink onPress={this.handlePress}>
                      <FormattedMessage id="passwordReset.tokenNotVerified.linkText" />
                    </TextLink>
                  ),
                }}
              />
            </Warning>
          )}
          {!isFetching &&
            !error && (
              <ScrollViewContext.Provider
                value={{ scrollToElement: scrollToElement(this.refScroll) }}
              >
                <PasswordResetForm />
              </ScrollViewContext.Provider>
            )}
        </View>
      </LayoutScrollable>
    );
  }
}

export default connect(
  ({
    passwordReset: {
      validateToken: { error, isFetching },
    },
  }) => ({
    error,
    isFetching,
  }),
  { openForgottenPasswordModal, validatePasswordResetToken },
)(PasswordResetScreen);
