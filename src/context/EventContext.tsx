import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Event } from '../types/event.types';
import { selectEvent as selectEventAction, clearSelectedEvent } from '../redux/slices/eventsSlice';
import { selectSelectedEvent } from '../redux/selectors/events/eventsSelectors';

interface EventContextType {
  selectedEvent: Event | null;
  selectEvent: (event: Event) => void;
  clearSessionDetails: () => void;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const dispatch = useDispatch();
  const reduxSelectedEvent = useSelector(selectSelectedEvent);
  
  // Use the selected event from Redux
  const selectEvent = (event: Event) => {
    dispatch(selectEventAction(event));
  };

  const clearSessionDetails = () => {
    // Clear the selected event in Redux
    dispatch(clearSelectedEvent());
  };

  return (
    <EventContext.Provider value={{ 
      selectedEvent: reduxSelectedEvent, 
      selectEvent, 
      clearSessionDetails 
    }}>
      {children}
    </EventContext.Provider>
  );
};

export const useEvent = (): EventContextType => {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error('useEvent must be used within an EventProvider');
  }
  return context;
};
