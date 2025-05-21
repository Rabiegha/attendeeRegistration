import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchFutureEvents } from '../thunks/event/fetchFutureEventsThunk';
import { fetchPastEvents } from '../thunks/event/fetchPastEventsThunk';
import { Event, EventsState } from '../../types/event.types';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Try to load the selected event from AsyncStorage
// This is an empty function initially since AsyncStorage is async
// The actual loading will happen in a useEffect in the component
const loadSelectedEvent = (): Event | null => {
  // We'll load this asynchronously in the component
  return null;
};

const initialState: EventsState = {
  futureEvents: {
    data: [],
    isLoading: false,
    error: null,
    timestamp: null,
  },
  pastEvents: {
    data: [],
    isLoading: false,
    error: null,
    timestamp: null,
  },
  selectedEvent: loadSelectedEvent(),
};

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    selectEvent: (state, action: PayloadAction<Event>) => {
      // Store the event directly in the state
      state.selectedEvent = action.payload;
      
      // Log for debugging
      console.log('Event selected:', action.payload.event_name || action.payload.title);
      
      // Store in AsyncStorage for persistence
      AsyncStorage.setItem('selectedEvent', JSON.stringify(action.payload))
        .catch(err => console.error('Failed to store selected event:', err));
    },
    clearSelectedEvent: (state) => {
      state.selectedEvent = null;
      // Clear from AsyncStorage
      AsyncStorage.removeItem('selectedEvent')
        .catch(err => console.error('Failed to clear selected event:', err));
      console.log('Selected event cleared');
    },
    // Add a new action to set the selected event from AsyncStorage
    setSelectedEventFromStorage: (state, action: PayloadAction<Event>) => {
      state.selectedEvent = action.payload;
      console.log('Event loaded from storage:', action.payload.event_name);
    },
  },
  extraReducers: (builder) => {
    // Future events thunk actions
    builder.addCase(fetchFutureEvents.pending, (state) => {
      state.futureEvents.isLoading = true;
      state.futureEvents.error = null;
    });
    builder.addCase(fetchFutureEvents.fulfilled, (state, action) => {
      const { events, timeStamp } = action.payload;
      console.log('Received events:', events); // Debug log
      state.futureEvents.isLoading = false;
      state.futureEvents.data = events;
      state.futureEvents.timestamp = timeStamp;
      state.futureEvents.error = null;
    });
    builder.addCase(fetchFutureEvents.rejected, (state, action) => {
      state.futureEvents.isLoading = false;
      state.futureEvents.error = (action.payload as string) || 'Failed to fetch future events';
    });

    // Past events thunk actions
    builder.addCase(fetchPastEvents.pending, (state) => {
      state.pastEvents.isLoading = true;
      state.pastEvents.error = null;
    });
    builder.addCase(fetchPastEvents.fulfilled, (state, action) => {
      const { events, timeStamp } = action.payload;
      state.pastEvents.isLoading = false;
      state.pastEvents.data = events;
      state.pastEvents.timestamp = timeStamp;
      state.pastEvents.error = null;
    });
    builder.addCase(fetchPastEvents.rejected, (state, action) => {
      state.pastEvents.isLoading = false;
      state.pastEvents.error = (action.payload as string) || 'Failed to fetch past events';
    });
  },
});

export const { selectEvent, clearSelectedEvent, setSelectedEventFromStorage } = eventsSlice.actions;

export default eventsSlice.reducer;
