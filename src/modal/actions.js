// @flow
import get from 'lodash/get';

import { getCancelModalType } from '../ticket/helpers';
import type { ActionDeps } from '../redux';
import type {
  ModalId,
  Passenger,
  PersonalDataType,
  RouteAddon,
  Seat,
  Section,
  Surcharge,
  TariffNotifications,
  Ticket,
  Transfer,
} from '../types';

export type ModalAction =
  | { type: 'OPEN_MODAL', payload: { id: ModalId, props?: Object } }
  | { type: 'CLOSE_MODAL' };

export const openModal = (id: ModalId, props?: Object): ModalAction => ({
  type: 'OPEN_MODAL',
  payload: { id, props: { onCancel: () => {}, onDone: () => {}, ...props } },
});

export const closeModal = (): ModalAction => ({
  type: 'CLOSE_MODAL',
});

export const openAddonInfoModal = (
  addon: RouteAddon,
  onAboutClose: Function = () => {},
  showBackButton: boolean = false,
) =>
  openModal('ADDON_INFO', {
    addon,
    onCancel: onAboutClose,
    onDone: onAboutClose,
    showBackButton,
    title: addon.name,
  });

export const openAddonsEditModal = (reload: boolean = true) =>
  openModal('ADDONS_EDIT', { reload, titleId: 'ticket.addonsModal.header' });

export const openBasketSurchargeModal = (surcharge: Surcharge, onDone: Function) =>
  openModal('BASKET_SURCHARGE', {
    onDone,
    surcharge,
    titleId: 'basket.confirmationModal.titleSurcharge',
  });

export const openBasketTariffModal = (
  tariffNotifications: TariffNotifications,
  onCancel: Function,
) =>
  openModal('BASKET_TARIFF', { onCancel, tariffNotifications, title: tariffNotifications.title });

export const openCancelModal = (ticket: Ticket) =>
  openModal('CANCEL', {
    ticket,
    titleId: `ticket.stornoModal.${getCancelModalType(ticket)}.title`,
  });

export const openContactFormModal = () =>
  openModal('CONTACT_FORM', { titleId: 'contactForm.header' });

export const openForgottenPasswordModal = () =>
  openModal('FORGOTTEN_PASSWORD', { titleId: 'passwordReset.forgottenPassword.title' });

export const openLineDetailModal = (routeSection: Section) =>
  openModal('LINE_DETAIL', { routeSection, titleId: 'connections.detailModal.header' });

export const openPassengerCancelModal = (ticket: Ticket, passenger: Passenger) =>
  openModal('PASSENGER_CANCEL', {
    passenger,
    ticket,
    titleId: `ticket.passengerCancelModal.${getCancelModalType(ticket)}.title`,
  });

export const openPassengerEditModal = (
  ticketId: number,
  passenger: Passenger,
  requiredFields: Array<PersonalDataType>,
) =>
  openModal('PASSENGER_EDIT', {
    passenger,
    requiredFields,
    ticketId,
    titleId: 'ticket.passengerModal.header',
  });

export const openPassengerEditConfirmationModal = (amount: number, onCancel: Function) =>
  openModal('PASSENGER_EDIT_CONFIRMATION', {
    amount,
    onCancel,
    titleId: 'ticket.passengerConfirmationModal.header',
  });

export const openPaymentModal = (tickets: Array<Ticket>) => ({
  getState,
}: ActionDeps): ModalAction => {
  const user = get(getState(), 'user.user');
  return openModal('PAYMENT', {
    titleId: user.credit > 0 ? 'payments.modal.payCreditHeader' : 'payments.modal.payHeader',
    tickets,
  });
};

export const openWebViewModal = (webViewUrl: string, titleId: string) =>
  openModal('WEBVIEW', { titleId, webViewUrl });

export const openPriceCollapseModal = () =>
  openModal('PRICE_COLLAPSE', { titleId: 'reservation.priceCollapseModal.header' });

export const openSendTicketByEmailModal = (ticketId: number) =>
  openModal('SEND_TICKET_BY_EMAIL', { ticketId, titleId: 'ticket.sendModal.title' });

export const openSimpleRegistrationModal = (shouldRedirect: boolean = true) =>
  openModal('SIMPLE_REGISTRATION', { shouldRedirect, titleId: 'registration.modal.header' });

export const openSpecialSeatsModal = (
  seats: Array<Seat>,
  vehicleNumber?: number,
  onCancel: Function,
) =>
  openModal('SPECIAL_SEATS', {
    onCancel,
    seats,
    titleId: 'reservation.specialSeatsModal.header',
    vehicleNumber,
  });

export const openTransferInfoModal = (
  transfer: Transfer,
  info: ?string,
  previousSection: Section,
  nextSection: Section,
) =>
  openModal('TRANSFER_INFO', {
    info,
    nextSection,
    previousSection,
    titleId: 'connections.transferInfoModal.header',
    transfer,
  });
