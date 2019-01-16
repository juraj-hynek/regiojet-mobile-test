// @flow
import type { ModalId } from '../types';
import type { ModalAction } from './actions';

export type ModalState = {
  +id: ?ModalId,
  +props: Object,
};

const INITIAL_STATE = {
  id: null,
  props: {},
};

export default (state: ModalState = INITIAL_STATE, action: ModalAction) => {
  switch (action.type) {
    case 'OPEN_MODAL': {
      const { id, props } = action.payload;
      return { id, props };
    }
    case 'CLOSE_MODAL':
      return INITIAL_STATE;
    default:
      return state;
  }
};
