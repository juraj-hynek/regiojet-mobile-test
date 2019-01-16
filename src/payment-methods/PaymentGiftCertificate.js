// @flow
import { connect } from 'react-redux';
import { View } from 'react-native';
import React from 'react';

import { theme } from '../style/index';
import GiftCertificateForm from './GiftCertificateForm';
import GiftCertificatePreview from './GiftCertificatePreview';

type Props = {|
  email: string,
  modal?: boolean,
|};

type State = {
  certificateCode: ?string,
  email: string,
  showPreview: boolean,
};

class PaymentGiftCertificate extends React.Component<Props, State> {
  state = {
    certificateCode: null,
    email: this.props.email,
    showPreview: false,
  };

  handleSuccessForm = (data: State) => {
    this.setState({ ...data, showPreview: true });
  };

  handleCancelPreview = () => {
    this.setState({ showPreview: false });
  };

  render() {
    const { modal } = this.props;
    const { certificateCode, email, showPreview } = this.state;

    return (
      <View style={theme.container}>
        {showPreview ? (
          <GiftCertificatePreview email={email} modal={modal} onCancel={this.handleCancelPreview} />
        ) : (
          <GiftCertificateForm
            certificateCode={certificateCode}
            email={email}
            modal={modal}
            onSuccess={this.handleSuccessForm}
          />
        )}
      </View>
    );
  }
}

export default connect(
  ({
    user: {
      user: { email },
    },
  }) => ({
    email,
  }),
  {},
)(PaymentGiftCertificate);
