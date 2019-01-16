// @flow
import React, { Fragment } from 'react';
import { StyleSheet, Text } from 'react-native';
import { connect } from 'react-redux';

import { addCreditByGiftCertificate } from './actions';
import { theme } from '../style/index';
import Button from '../components/Button';
import Date from '../components/Date';
import FormattedMessage from '../components/FormattedMessage';
import Table from '../components/Table';
import type { GiftCertificateInfo } from '../types';

type Props = {|
  addCreditByGiftCertificate: typeof addCreditByGiftCertificate,
  certificate: GiftCertificateInfo,
  email: string,
  isFetching: boolean,
  modal?: boolean,
  onCancel: Function,
|};

class GiftCardSubmitPreview extends React.Component<Props> {
  handleSubmit = async () => {
    const { addCreditByGiftCertificate, certificate, email, onCancel } = this.props;
    addCreditByGiftCertificate(certificate.certificateCode, email, onCancel);
  };

  render() {
    const { certificate, isFetching, modal, onCancel } = this.props;

    if (!certificate) {
      return null;
    }

    return (
      <Fragment>
        <FormattedMessage style={theme.h3} id="payments.gitfCard.header" />

        <Table
          headerMessageIds={[
            'payments.gitfCard.card.status',
            'payments.gitfCard.card.code',
            'payments.gitfCard.card.amount',
            'payments.gitfCard.card.currency',
            'payments.gitfCard.card.creationDate',
            'payments.gitfCard.card.expirationDate',
          ]}
        >
          <FormattedMessage id={`payments.gitfCard.status.${certificate.state}`} />
          <Text>{certificate.certificateCode}</Text>
          <Text>{certificate.amount}</Text>
          <FormattedMessage id={`currency.${certificate.currency}`} />
          <Date>{certificate.creationDate}</Date>
          <Date>{certificate.expirationDate}</Date>
        </Table>

        <Button
          iconRight={modal ? undefined : 'chevronRight'}
          loading={isFetching}
          onPress={this.handleSubmit}
          style={styles.button}
        >
          <FormattedMessage id="payments.giftCard.button.confirm" />
        </Button>
        <Button
          iconLeft={modal ? undefined : 'chevronLeft'}
          onPress={onCancel}
          secondary
          style={styles.button}
        >
          <FormattedMessage id="payments.giftCard.button.dontApply" />
        </Button>
      </Fragment>
    );
  }
}
const styles = StyleSheet.create({
  button: {
    marginTop: 20,
  },
});

export default connect(
  ({
    paymentMethods: {
      giftCertificate: { certificate, isFetching },
    },
  }) => ({
    certificate,
    isFetching,
  }),
  { addCreditByGiftCertificate },
)(GiftCardSubmitPreview);
