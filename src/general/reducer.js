// @flow
import type { CalendarAction } from '../components/form/actions';
import type { ModalAction } from '../modal/actions';

export type GeneralState = {
  +menuGesturesDisabled: boolean,
};

const INITIAL_STATE = {
  menuGesturesDisabled: false,
};

export default (state: GeneralState = INITIAL_STATE, action: CalendarAction | ModalAction) => {
  switch (action.type) {
    case 'OPEN_CALENDAR':
    case 'OPEN_MODAL':
      return { menuGesturesDisabled: true };
    case 'CLOSE_CALENDAR':
    case 'CLOSE_MODAL':
      return { menuGesturesDisabled: false };
    default:
      return state;
  }
};
