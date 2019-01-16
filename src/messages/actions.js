// @flow
import shortid from 'shortid';

import type { ErrorResponse, GlobalMessage } from '../types';

type AddGlobalMessageAction = {
  type: 'ADD_GLOBAL_MESSAGE',
  message: GlobalMessage,
};

type RemoveGlobalMessageAction = {
  type: 'REMOVE_GLOBAL_MESSAGE',
  id: string,
};

export type GlobalMessageAction = AddGlobalMessageAction | RemoveGlobalMessageAction;

export const addGlobalMessage = (
  message: $Diff<GlobalMessage, { createdTimestamp: number, id: string }>,
): AddGlobalMessageAction => ({
  type: 'ADD_GLOBAL_MESSAGE',
  message: {
    ...message,
    createdTimestamp: Date.now(),
    id: shortid.generate(),
  },
});

export const removeGlobalMessage = (id: string): RemoveGlobalMessageAction => ({
  type: 'REMOVE_GLOBAL_MESSAGE',
  id,
});

export const addGlobalError = (errorResponse: ErrorResponse): AddGlobalMessageAction =>
  addGlobalMessage({ text: errorResponse.message, type: 'error' });
