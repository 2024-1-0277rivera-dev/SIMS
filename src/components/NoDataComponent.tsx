import React from 'react';
import Card from './Card.tsx';
import Button from './Button.tsx';
import { useEventContext } from '../hooks/useEventContext.ts';
import { VALID_EVENT } from '../contexts/EventContext.tsx';


const NoDataComponent: React.FC = () => {
    const { selectedEvent, setSelectedEvent } = useEventContext();
    return (
        <Card className="p-8 text-center mt-6">
            <div className="flex flex-col items-center">
                <i className="bi bi-info-circle-fill text-4xl text-slate-400 dark:text-slate-500 mb-4"></i>
                <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-1">No Data Available</h2>
                <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
                    Information for "{selectedEvent}" has not been registered yet. Please select "i3 Day | Clash of Cards" to view current event data.
                </p>
                <Button onClick={() => setSelectedEvent(VALID_EVENT)}>
                    Switch to i3 Day Event
                </Button>
            </div>
        </Card>
    );
};

export default NoDataComponent;