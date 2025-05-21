export interface Event {
  event_id: string;
  event_name: string;
  description: string;
  nice_start_datetime: string;
  nice_end_datetime: string;
  event_type_name: string;
  event_team_members: string;
  ems_secret_code?: string;
  relationship?: number;
  parent_id?: number;
  parent_event_name?: string;
  child_event_ids?: string;
  child_event_names?: string;
  isToday?: boolean;
  
  // Mapped fields for compatibility with existing components
  id?: string;
  title?: string;
  start_date?: string;
  end_date?: string;
  location?: string;
  organizer?: string;
}

export interface EventsState {
  futureEvents: {
    data: Event[];
    isLoading: boolean;
    error: string | null;
    timestamp: number | null;
  };
  pastEvents: {
    data: Event[];
    isLoading: boolean;
    error: string | null;
    timestamp: number | null;
  };
  selectedEvent: Event | null;
}
