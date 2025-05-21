import { createAsyncThunk } from '@reduxjs/toolkit';
import { fetchEventList } from '../../../services/eventsListService';
import { Event } from '../../../types/event.types';

interface FetchEventsParams {
  userId: string;
}

export const fetchPastEvents = createAsyncThunk<
  { events: Event[], timeStamp: number },
  FetchEventsParams,
  { rejectValue: string }
>(
  'fetchPastEvents',
  async ({ userId }, { rejectWithValue }) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
      return rejectWithValue('Fetch events timeout exceeded');
    }, 10000);

    try {
      const pastEvents: Event[] = [];
      
      // Fetch past events (is_event_from=0)
      try {
        const pastResponse = await fetchEventList(userId, '0', {
          signal: controller.signal,
        });

        if (pastResponse.status && pastResponse.event_details) {
          // Map fields for compatibility
          pastEvents.push(...pastResponse.event_details.map((event: any) => ({
            ...event,
            // Map API fields to our component's expected fields
            id: event.event_id.toString(),
            title: event.event_name,
            start_date: event.nice_start_datetime,
            end_date: event.nice_end_datetime,
            location: event.event_type_name,
            organizer: event.event_team_members
          })));
        }
      } catch (innerError: any) {
        if (innerError.name === 'AbortError') {
          return rejectWithValue('Request was cancelled due to timeout');
        }
        console.warn('Failed to fetch past events', innerError);
        return rejectWithValue('Failed to fetch past events');
      }
      
      clearTimeout(timeout);

      return { events: pastEvents, timeStamp: Date.now() };
    } catch (error: any) {
      clearTimeout(timeout);
      return rejectWithValue(error.message || 'Failed to fetch past events');
    }
  }
);
