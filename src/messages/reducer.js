// @flow
import type { GlobalMessage } from '../types';
import type { GlobalMessageAction } from './actions';
import type { ModalAction } from '../modal/actions';
import type { NavigationAction } from '../navigation/actions';

export type GlobalMessagesState = Array<GlobalMessage>;

const MAX_COUNT = 3;
const INITIAL_STATE = [];

// TODO check if messageId and values are equal, if that's ever needed
const isSameMessage = (message1: GlobalMessage, message2: GlobalMessage) =>
  Math.abs(message1.createdTimestamp - message2.createdTimestamp) < 500 &&
  message1.text &&
  message2.text &&
  message1.text === message2.text;

const reducer = (
  state: GlobalMessagesState = INITIAL_STATE,
  action: GlobalMessageAction | ModalAction | NavigationAction,
) => {
  switch (action.type) {
    case 'ADD_GLOBAL_MESSAGE': {
      const { message: newMessage } = action;
      // don't display two identical messages in quick succession
      if (state.find(message => isSameMessage(message, newMessage))) {
        return state;
      }
      return [newMessage, ...state].slice(0, MAX_COUNT);
    }
    case 'REMOVE_GLOBAL_MESSAGE': {
      const { id } = action;
      const index = state.findIndex(message => message.id === id);
      return [...state.slice(0, index), ...state.slice(index + 1)];
    }

    case 'OPEN_MODAL':
    case 'CLOSE_MODAL':
    case 'NAVIGATION_SCREEN_WILL_BLUR':
    case 'NAVIGATION_SCREEN_WILL_FOCUS': {
      const currentTimestamp = Date.now();
      /*
      don't remove very recent messages
      navigation actions are sometimes fired with a delay, leading to wrong order of actions
      (Navigation/NAVIGATE, ADD_GLOBAL_MESSAGE is fired as ADD_GLOBAL_MESSAGE, Navigation/NAVIGATE)
      */
      return state.filter(message => currentTimestamp - message.createdTimestamp < 1000);
    }

    default:
      return state;
  }
};

export default reducer;
