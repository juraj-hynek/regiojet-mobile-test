// @flow
import moment from 'moment';

import type { TimePeriod } from '../types';

export const computeMinutesFromTimePeriod = (expiration: TimePeriod): number =>
  moment.duration(expiration).asMinutes();
