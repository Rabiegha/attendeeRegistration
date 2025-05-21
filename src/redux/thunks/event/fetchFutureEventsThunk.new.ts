import { createAsyncThunk } from '@reduxjs/toolkit';
import { fetchEventList } from '../../../services/eventsListService';
import { Event } from '../../../types/event.types';

interface FetchEventsParams {
  userId: string;
}

export const fetchFutureEvents = createAsyncThunk<
  { events: Event[], timeStamp: number },
  FetchEventsParams,
  { rejectValue: string }
>(
  'fetchFutureEvents',
  async ({ userId }, { rejectWithValue }) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, 30000); // 30 second timeout

    try {
      // Initialize arrays
      let todayEvents: Event[] = [];
      let futureEvents: Event[] = [];
      let failedCount = 0;
      
      // First, fetch today's events (is_event_from=1)
      try {
        const todayResponse = await fetchEventList(userId, '1', {
          signal: controller.signal,
        });

        if (todayResponse.status && todayResponse.event_details) {
          // Mark these events as today's events and map fields for compatibility
          todayEvents = todayResponse.event_details.map((event: any) => ({
            ...event,
            isToday: true,
            // Map API fields to our component's expected fields
            id: event.event_id.toString(),
            title: event.event_name,
            start_date: event.nice_start_datetime,
            end_date: event.nice_end_datetime,
            location: event.event_type_name,
            organizer: event.event_team_members
          }));
        } else {
          failedCount++;
        }
      } catch (innerError: any) {
        if (innerError.name === 'AbortError') {
          clearTimeout(timeout);
          return rejectWithValue('Request timed out. Please check your connection and try again.');
        }
        console.warn('Failed to fetch today events', innerError);
        failedCount++;
      }
      
      // Then, fetch future events (is_event_from=2)
      try {
        const futureResponse = await fetchEventList(userId, '2', {
          signal: controller.signal,
        });

        if (futureResponse.status && futureResponse.event_details) {
          // Map fields for compatibility
          futureEvents = futureResponse.event_details.map((event: any) => ({
            ...event,
            isToday: false,
            // Map API fields to our component's expected fields
            id: event.event_id.toString(),
            title: event.event_name,
            start_date: event.nice_start_datetime,
            end_date: event.nice_end_datetime,
            location: event.event_type_name,
            organizer: event.event_team_members
          }));
        } else {
          failedCount++;
        }
      } catch (innerError: any) {
        if (innerError.name === 'AbortError') {
          clearTimeout(timeout);
          return rejectWithValue('Request timed out. Please check your connection and try again.');
        }
        console.warn('Failed to fetch future events', innerError);
        failedCount++;
      }
      
      clearTimeout(timeout);
      
      // Combine today's events and future events, with today's events first
      const combinedEvents: Event[] = [...todayEvents, ...futureEvents];
      
      if (failedCount === 2) { // We tried 2 requests (today and future)
        return rejectWithValue('Failed to fetch any events. Please try again.');
      }

      return { events: combinedEvents, timeStamp: Date.now() };
    } catch (error: any) {
      clearTimeout(timeout);
      if (error.name === 'AbortError') {
        return rejectWithValue('Request timed out. Please check your connection and try again.');
      }
      return rejectWithValue(error.message || 'Failed to fetch future events. Please try again.');
    }
  }
);
