// @flow
import url from 'url';

import { authenticate, logout } from '../user/actions';
import { addGlobalMessage } from '../messages/actions';
import { closeModal } from '../modal/actions';
import { goTo, replaceAll } from './actions';
import { payTicketsByCredit, redirectAfterPayment } from '../payment-methods/actions';
import type { ActionDeps } from '../redux';

/**
 * Go to a new screen based on a URL fired by browser
 * The app catches all URLs with "regiojet" scheme
 * Example URL: regiojet://payments?res=success
 */
export const navigateByBrowser = (URL: string) => async ({ dispatch, getState }: ActionDeps) => {
  const { hostname, query } = url.parse(URL, true);
  dispatch(closeModal());

  switch (hostname) {
    case 'password-reset': {
      const {
        user: { role },
      } = getState();
      if (role !== 'ANONYMOUS') {
        await dispatch(logout());
      }

      const { token } = query;
      dispatch(replaceAll('PasswordReset', { token }));
      break;
    }
    case 'payments': {
      const message =
        query.res !== 'nok'
          ? { messageId: 'credit.add.messageSuccess', type: 'success' }
          : { messageId: 'credit.add.messageFail', type: 'error' };
      dispatch(authenticate());
      await dispatch(replaceAll('Payments'));
      dispatch(addGlobalMessage(message));
      break;
    }
    case 'ticket': {
      const { needsPayment, res, ticketId } = query;
      let success = res !== 'nok';
      const ticketIds = [parseInt(ticketId, 10)];

      if (success && needsPayment === 'true') {
        const { type } = await dispatch(payTicketsByCredit(ticketIds));
        success = type === 'PAY_TICKETS_CREDIT_FULFILLED';
      }

      dispatch(redirectAfterPayment(ticketIds, success, true));
      break;
    }
    case 'tickets': {
      const { needsPayment, res } = query;
      let success = res !== 'nok';
      let ticketIds = [];

      if (success && needsPayment === 'true') {
        const {
          tickets: {
            unpaid: { list },
          },
        } = getState();
        ticketIds = list.map(ticket => ticket.id);
        const { type } = await dispatch(payTicketsByCredit(ticketIds));
        success = type === 'PAY_TICKETS_CREDIT_FULFILLED';
      }

      dispatch(redirectAfterPayment(ticketIds, success, true));
      break;
    }
    default:
      dispatch(goTo('SearchRoutes'));
      break;
  }

  return { type: 'NAVIGATE_BY_BROWSER_FULFILLED' };
};
