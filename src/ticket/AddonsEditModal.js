// @flow
import { connect } from 'react-redux';
import { StyleSheet, View } from 'react-native';
import React from 'react';

import { computeAddonsPrice } from '../basket/helpers';
import { getTicketAddons, saveTicketAddons, updateTicketAddon } from './actions';
import { openAddonsEditModal } from '../modal/actions';
import { theme } from '../style';
import Addons from '../reservation/Addons';
import Button from '../components/Button';
import FormattedMessage from '../components/FormattedMessage';
import LoaderSmall from '../components/LoaderSmall';
import Price from '../components/Price';
import type { RouteAddon, Ticket } from '../types';
import Warning from '../components/Warning';

type Props = {
  addons: Array<RouteAddon>,
  getTicketAddons: typeof getTicketAddons,
  isFetching: boolean,
  isFetchingEdit: boolean,
  onDone: Function,
  openAddonsEditModal: typeof openAddonsEditModal,
  reload?: boolean,
  saveTicketAddons: typeof saveTicketAddons,
  ticket: Ticket,
  updateTicketAddon: typeof updateTicketAddon,
};

class AddonsEditModal extends React.PureComponent<Props> {
  componentDidMount() {
    const { getTicketAddons, reload, ticket } = this.props;
    if (reload) {
      getTicketAddons(ticket);
    }
  }

  computeRemainingAmount() {
    const addedAddons = this.props.addons.map(addon => ({
      ...addon,
      count: addon.count - addon.originalCount,
    }));
    return computeAddonsPrice(addedAddons);
  }

  handleAboutClose = () => this.props.openAddonsEditModal(false);

  handleAddonChange = (addonId, count, checked) => {
    const { addons, ticket, updateTicketAddon } = this.props;
    updateTicketAddon(ticket, addons, addonId, count, checked);
  };

  handleSubmit = () => {
    const { addons, onDone, ticket, saveTicketAddons } = this.props;
    saveTicketAddons(ticket.id, addons, onDone);
  };

  render() {
    const { addons, isFetching, isFetchingEdit } = this.props;

    if (isFetching) {
      return (
        <View style={theme.containerModal}>
          <LoaderSmall />
        </View>
      );
    }

    if (addons.length === 0) {
      return (
        <View style={theme.containerModal}>
          <Warning type="warning">
            <FormattedMessage id="additionalServices.empty" />
          </Warning>
        </View>
      );
    }

    const remainingAmount = this.computeRemainingAmount();

    return (
      <View style={theme.containerModal}>
        <Addons
          disabled={isFetchingEdit}
          onAboutClose={this.handleAboutClose}
          onAddonChange={this.handleAddonChange}
          routeAddons={addons}
          style={styles.addons}
        />

        {remainingAmount > 0 && (
          <FormattedMessage
            id="ticket.addonsModal.remainingAmount"
            style={[theme.paragraph, styles.remainingAmount]}
            values={{
              amount: <Price style={theme.bold} value={remainingAmount} />,
            }}
          />
        )}
        <Button loading={isFetchingEdit} onPress={this.handleSubmit} style={styles.marginTop}>
          <FormattedMessage id="ticket.addonsModal.save" />
        </Button>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  addons: {
    marginBottom: 30,
    marginTop: 0,
    paddingHorizontal: 0,
  },

  remainingAmount: {
    textAlign: 'center',
  },

  marginTop: {
    marginTop: 10,
  },
});

export default connect(
  ({ ticket: { addons, addonsEdit, ticket } }) => ({
    addons: addons.data,
    isFetching: addons.isFetching,
    isFetchingEdit: addonsEdit.isFetching,
    ticket: ticket.data,
  }),
  { getTicketAddons, openAddonsEditModal, saveTicketAddons, updateTicketAddon },
)(AddonsEditModal);
