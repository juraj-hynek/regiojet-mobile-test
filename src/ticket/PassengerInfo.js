// @flow
import { connect } from 'react-redux';
import { injectIntl, type IntlShape } from 'react-intl';
import { StyleSheet, Text, View } from 'react-native';
import compact from 'lodash/compact';
import moment from 'moment';
import React from 'react';

import { colors, theme } from '../style';
import { composeFullName } from '../user/helpers';
import { dateFormat } from '../localization/localeData';
import { getTariffTranslation } from '../consts/helpers';
import {
  openPassengerCancelModal,
  openPassengerEditConfirmationModal,
  openPassengerEditModal,
} from '../modal/actions';
import ButtonLink from '../components/ButtonLink';
import FormattedMessage from '../components/FormattedMessage';
import Price from '../components/Price';
import type { Passenger, PersonalDataType, Style, Tariff, Ticket } from '../types';

type Props = {|
  canCancel: boolean,
  canEdit: boolean,
  canStorno: boolean,
  changeCharge: number,
  intl: IntlShape,
  openPassengerCancelModal: typeof openPassengerCancelModal,
  openPassengerEditConfirmationModal: typeof openPassengerEditConfirmationModal,
  openPassengerEditModal: typeof openPassengerEditModal,
  passenger: Passenger,
  requiredFields: Array<PersonalDataType>,
  style?: Style,
  ticket: Ticket,
  tariffs: Array<Tariff>,
|};

class PassengerInfo extends React.PureComponent<Props> {
  composePassengerInfo() {
    const { intl, passenger } = this.props;

    const attributes = [
      composeFullName(passenger.firstName, passenger.surname),
      passenger.phone,
      passenger.email,
      passenger.dateOfBirth
        ? `${intl.formatMessage({ id: 'ticket.passengers.dateOfBirth' })} ${moment(
            passenger.dateOfBirth,
          )
            .format(dateFormat)
            .replace(/ /g, '\u00a0')}`
        : '',
    ];
    return compact(attributes).join(', ');
  }

  handlePressCancel = () => {
    const { openPassengerCancelModal, passenger, ticket } = this.props;
    openPassengerCancelModal(ticket, passenger);
  };

  handlePressEdit = () => {
    const { changeCharge, openPassengerEditConfirmationModal } = this.props;
    if (changeCharge > 0) {
      openPassengerEditConfirmationModal(changeCharge, this.openPassengerEditModal);
    } else {
      this.openPassengerEditModal();
    }
  };

  openPassengerEditModal = () => {
    const { openPassengerEditModal, passenger, requiredFields, ticket } = this.props;
    openPassengerEditModal(ticket.id, passenger, requiredFields);
  };

  render() {
    const { canCancel, canEdit, canStorno, passenger, style, tariffs } = this.props;

    return (
      <View style={[styles.container, style]}>
        <Text style={[theme.paragraphBig, theme.semiBold, styles.row]}>
          {getTariffTranslation(passenger.tariff, tariffs)}
        </Text>
        <Text style={[theme.paragraph, styles.row]}>{this.composePassengerInfo()}</Text>
        <Price style={[theme.paragraphBig, theme.semiBold, styles.row]} value={passenger.amount} />
        {(canCancel || canEdit || canStorno) && (
          <View style={[styles.row, styles.buttons]}>
            {canEdit && (
              <ButtonLink
                centered={false}
                iconLeft="edit"
                onPress={this.handlePressEdit}
                style={styles.button}
              >
                <FormattedMessage id="ticket.passengers.edit" />
              </ButtonLink>
            )}
            {(canCancel || canStorno) && (
              <ButtonLink
                centered={false}
                iconLeft="cancel"
                onPress={this.handlePressCancel}
                style={styles.button}
              >
                <FormattedMessage id={`ticket.passengers.${canCancel ? 'cancel' : 'storno'}`} />
              </ButtonLink>
            )}
          </View>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  button: {
    flexShrink: 1,
    marginHorizontal: 15,
  },

  buttons: {
    flexDirection: 'row',
    marginHorizontal: -15,
  },

  container: {
    borderColor: colors.greyShadow,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  row: {
    marginVertical: 5,
  },
});

export default injectIntl(
  connect(({ consts: { tariffs } }) => ({ tariffs }), {
    openPassengerCancelModal,
    openPassengerEditConfirmationModal,
    openPassengerEditModal,
  })(PassengerInfo),
);
