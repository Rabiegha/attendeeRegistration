import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { selectEvent } from '../../redux/slices/eventsSlice';
import { Event } from '../../types/event.types';

export const useEventSelector = () => {
  const dispatch = useDispatch();
  
  const selectEventHandler = useCallback((event: Event) => {
    dispatch(selectEvent(event));
  }, [dispatch]);
  
  return selectEventHandler;
};
