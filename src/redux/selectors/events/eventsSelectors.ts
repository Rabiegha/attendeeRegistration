import { RootState } from '../../store';

// Events selectors
export const selectFutureEvents = (state: RootState) => state.events.futureEvents.data;
export const selectFutureEventsLoading = (state: RootState) => state.events.futureEvents.isLoading;
export const selectFutureEventsError = (state: RootState) => state.events.futureEvents.error;

export const selectPastEvents = (state: RootState) => state.events.pastEvents.data;
export const selectPastEventsLoading = (state: RootState) => state.events.pastEvents.isLoading;
export const selectPastEventsError = (state: RootState) => state.events.pastEvents.error;

export const selectSelectedEvent = (state: RootState) => state.events.selectedEvent;
