// @flow
import { connect } from 'react-redux';
import { Modal, StyleSheet, WebView } from 'react-native';
import get from 'lodash/get';
import React, { Fragment } from 'react';

import { closeModal } from './actions';
import { scrollToElement } from '../components/scrollToElement';
import { ScrollViewContext } from '../components/ScrollViewContext';
import { statusBarHeight } from '../style';
import AddonInfoModal from '../reservation/AddonInfoModal';
import AddonsEditModal from '../ticket/AddonsEditModal';
import BasketSurchargeModal from '../basket/SurchargeModal';
import BasketTariffModal from '../basket/TariffModal';
import CancelModal from '../ticket/CancelModal';
import ContactFormModal from '../contact/ContactFormModal';
import ForgottenPasswordModal from '../password-reset/ForgottenPasswordModal';
import GlobalMessages from '../messages/GlobalMessages';
import LayoutScrollable from '../components/LayoutScrollable';
import LineDetailModal from '../connections/LineDetailModal';
import ModalHeader from './Header';
import PassengerCancelModal from '../ticket/PassengerCancelModal';
import PassengerEditModal from '../ticket/PassengerEditModal';
import PassengerEditConfirmationModal from '../ticket/PassengerEditConfirmationModal';
import PaymentModal from '../payment-methods/PaymentModal';
import PriceCollapseModal from '../reservation/PriceCollapseModal';
import Registration from '../registration/Registration';
import SendByEmailModal from '../ticket/SendByEmailModal';
import SpecialSeatsModal from '../reservation/SpecialSeatsModal';
import TransferInfoModal from '../connections/TransferInfoModal';
import type { ModalState } from './reducer';

type Props = {
  closeModal: typeof closeModal,
  modal: ModalState,
};

const componentsMap = {
  ADDON_INFO: AddonInfoModal,
  ADDONS_EDIT: AddonsEditModal,
  BASKET_SURCHARGE: BasketSurchargeModal,
  BASKET_TARIFF: BasketTariffModal,
  CANCEL: CancelModal,
  CONTACT_FORM: ContactFormModal,
  FORGOTTEN_PASSWORD: ForgottenPasswordModal,
  LINE_DETAIL: LineDetailModal,
  PASSENGER_CANCEL: PassengerCancelModal,
  PASSENGER_EDIT: PassengerEditModal,
  PASSENGER_EDIT_CONFIRMATION: PassengerEditConfirmationModal,
  PAYMENT: PaymentModal,
  PRICE_COLLAPSE: PriceCollapseModal,
  SEND_TICKET_BY_EMAIL: SendByEmailModal,
  SIMPLE_REGISTRATION: Registration,
  SPECIAL_SEATS: SpecialSeatsModal,
  TRANSFER_INFO: TransferInfoModal,
};

class ModalContainer extends React.Component<Props> {
  refScroll = null;

  handleCancel = () => {
    const { closeModal, modal } = this.props;
    closeModal();
    modal.props.onCancel();
  };

  handleDone = () => {
    const { closeModal, modal } = this.props;
    closeModal();
    if (modal.props.onDone) {
      modal.props.onDone();
    }
  };

  isVisible = (): boolean => !!this.props.modal.id;

  composeComponent(modal: ModalState) {
    const Component = get(componentsMap, modal.id);
    if (!Component) return null;

    const props = {
      ...modal.props,
      onCancel: this.handleCancel,
      onDone: this.handleDone,
      modal: true,
    };

    return <Component {...props} />;
  }

  updateRef = ref => {
    this.refScroll = ref;
    this.forceUpdate();
  };

  renderContent = (content, modal) => (
    <LayoutScrollable
      scrollViewStyle={styles.topModalOffset}
      isModal
      scrollViewRef={this.updateRef}
    >
      {/* $FlowFixMe */}
      <ModalHeader
        closeModal={this.handleCancel}
        title={modal.props.title}
        titleId={modal.props.titleId}
      />
      <ScrollViewContext.Provider
        value={{
          scrollToElement: scrollToElement(this.refScroll, {
            isModal: true,
          }),
        }}
      >
        {content}
      </ScrollViewContext.Provider>
    </LayoutScrollable>
  );

  /* TODO
   * Remove this method after React-native Fix
   * Bad autoresize of webview, which is rendered under another View or ScrollView.
   * Manual sizing isnt good idea.
   * https://github.com/facebook/react-native/issues/4773
  */
  renderWebViewContent = modal => (
    <Fragment>
      {/* $FlowFixMe */}
      <ModalHeader
        closeModal={this.handleCancel}
        style={styles.topModalOffset}
        title={modal.props.title}
        titleId={modal.props.titleId}
      />
      <WebView
        domStorageEnabled
        javaScriptEnabled
        startInLoading
        source={{ uri: modal.props.webViewUrl }}
      />
    </Fragment>
  );

  render() {
    const { modal } = this.props;
    const content = this.composeComponent(modal);

    if (!content && !modal.props.webViewUrl) return null;

    return (
      <Modal animationType="slide" onRequestClose={this.handleCancel} visible={this.isVisible()}>
        {modal.props.webViewUrl
          ? this.renderWebViewContent(modal)
          : this.renderContent(content, modal)}
        {/* $FlowFixMe */}
        <GlobalMessages />
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  topModalOffset: {
    marginTop: statusBarHeight,
  },
});

export default connect(({ modal }) => ({ modal }), { closeModal })(ModalContainer);
