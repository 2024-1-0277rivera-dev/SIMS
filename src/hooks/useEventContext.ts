import { useContext } from 'react';
import { EventContext } from '../contexts/EventContext.tsx';

export const useEventContext = () => {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error('useEventContext must be used within an EventProvider');
  }
  return context;
};