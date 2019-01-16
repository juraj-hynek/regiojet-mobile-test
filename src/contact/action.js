// @flow
import { addGlobalError, addGlobalMessage } from '../messages/actions';
import { getErrorResponse } from '../error/helpers';
import type { ActionDeps } from '../redux';
import type { ContactForm, ErrorResponse } from '../types';

export type ContactFormAction =
  | { type: 'SEND_CONTACT_FORM_REJECTED', payload: ErrorResponse }
  | { type: 'SEND_CONTACT_FORM_PENDING' }
  | { type: 'SEND_CONTACT_FORM_FULFILLED' };

export const sendContactForm = (data: ContactForm, successCallback: Function = () => {}) => async ({
  dispatch,
  apiClient,
}: ActionDeps): Promise<ContactFormAction> => {
  try {
    dispatch({ type: 'SEND_CONTACT_FORM_PENDING' });
    await apiClient.post('/support/sendContactForm', data);
    successCallback();
    dispatch(addGlobalMessage({ messageId: 'contactForm.message.success', type: 'success' }));

    return { type: 'SEND_CONTACT_FORM_FULFILLED' };
  } catch (err) {
    const errorResponse = getErrorResponse(err);
    dispatch(addGlobalError(errorResponse));
    return { type: 'SEND_CONTACT_FORM_REJECTED', payload: errorResponse };
  }
};
