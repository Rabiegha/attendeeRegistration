import { createAsyncThunk } from '@reduxjs/toolkit';
import { fetchEventList } from '../../../services/eventsListService';
import { Event } from '../../../types/event.types';

interface FetchEventsParams {
  userId: string;
  isDemoMode?: boolean;
}

export const fetchFutureEvents = createAsyncThunk<
  { events: Event[], timeStamp: number },
  FetchEventsParams,
  { rejectValue: string }
>(
  'fetchFutureEvents',
  async ({ userId, isDemoMode = false }, { rejectWithValue }) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
      rejectWithValue('Fetch events timeout exceeded');
    }, 10000); // 10 second timeout like original app

    try {
      if (isDemoMode) {
        clearTimeout(timeout);
        return { events: [], timeStamp: Date.now() }; // We'll implement demo events later if needed
      }

      const combinedEvents = [];
      let failedCount = 0;
      const isEventFromList = ['1', '2']; // Today's and future events

      for (const isEventFrom of isEventFromList) {
        try {
          const response = await fetchEventList(userId, isEventFrom, {
            signal: controller.signal,
          });

          if (response.status && response.event_details) {
            const events = response.event_details.map((event: any) => ({
              ...event,
              isToday: isEventFrom === '1',
              id: event.event_id.toString(),
              title: event.event_name,
              start_date: event.nice_start_datetime,
              end_date: event.nice_end_datetime,
              location: event.event_type_name,
              organizer: event.event_team_members
            }));
            combinedEvents.push(...events);
          } else {
            failedCount++;
          }
        } catch (innerError: any) {
          if (innerError.name === 'AbortError') {
            clearTimeout(timeout);
            return rejectWithValue('Request was cancelled due to timeout');
          }
          console.warn(`Skipping isEventFrom=${isEventFrom}`, innerError);
          failedCount++;
        }
      }

      clearTimeout(timeout);

      if (failedCount === isEventFromList.length) {
        return rejectWithValue('Failed to fetch any events');
      }

      return {
        events: combinedEvents,
        timeStamp: Date.now(),
      };
    } catch (error: any) {
      clearTimeout(timeout);
      if (error.name === 'AbortError') {
        return rejectWithValue('Request timed out. Please check your connection and try again.');
      }
      return rejectWithValue(error.message || 'Failed to fetch future events. Please try again.');
    }
  }
);
