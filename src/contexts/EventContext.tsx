import React, { createContext, useState, useMemo } from 'react';

export const VALID_EVENT = 'i3 Day | Clash of Cards';
export const availableEvents = [VALID_EVENT, 'Campus Clash', 'Intramurals'];

interface EventContextType {
  selectedEvent: string;
  setSelectedEvent: (event: string) => void;
  isDataAvailable: boolean;
}

export const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedEvent, setSelectedEvent] = useState<string>(VALID_EVENT);

  const isDataAvailable = useMemo(() => selectedEvent === VALID_EVENT, [selectedEvent]);

  const value = { selectedEvent, setSelectedEvent, isDataAvailable };

  return (
    <EventContext.Provider value={value}>
      {children}
    </EventContext.Provider>
  );
};