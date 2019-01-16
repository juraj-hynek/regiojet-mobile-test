// @flow
export type CalendarAction = { type: 'OPEN_CALENDAR' } | { type: 'CLOSE_CALENDAR' };

export const openCalendar = (): CalendarAction => ({ type: 'OPEN_CALENDAR' });
export const closeCalendar = (): CalendarAction => ({ type: 'CLOSE_CALENDAR' });
