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
    }, 30000); // 30 second timeout

    try {
      // Fetch past events (is_event_from=0)
      try {
        const pastResponse = await fetchEventList(userId, '0', {
          signal: controller.signal,
        });

        if (pastResponse.status && pastResponse.event_details) {
          // Map fields for compatibility
          const pastEvents = pastResponse.event_details.map((event: any) => ({
            ...event,
            // Map API fields to our component's expected fields
            id: event.event_id.toString(),
            title: event.event_name,
            start_date: event.nice_start_datetime,
            end_date: event.nice_end_datetime,
            location: event.event_type_name,
            organizer: event.event_team_members
          }));
          
          clearTimeout(timeout);
          return { events: pastEvents, timeStamp: Date.now() };
        } else {
          clearTimeout(timeout);
          return rejectWithValue('No past events found or invalid response format');
        }
      } catch (innerError: any) {
        clearTimeout(timeout);
        if (innerError.name === 'AbortError') {
          return rejectWithValue('Request timed out. Please check your connection and try again.');
        }
        console.warn('Failed to fetch past events', innerError);
        return rejectWithValue(innerError.message || 'Failed to fetch past events. Please try again.');
      }
    } catch (error: any) {
      clearTimeout(timeout);
      if (error.name === 'AbortError') {
        return rejectWithValue('Request timed out. Please check your connection and try again.');
      }
      return rejectWithValue(error.message || 'Failed to fetch past events. Please try again.');
    }
  }
);
