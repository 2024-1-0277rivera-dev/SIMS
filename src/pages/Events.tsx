import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import Card from '../components/Card.tsx';
import Button from '../components/Button.tsx';
import { getEvents, addEvent, updateEvent, deleteEvent as apiDeleteEvent, STORAGE_KEYS } from '../services/api.ts';
import { Event, EventStatus, UserRole, EventCategory, CriteriaItem } from '../types.ts';
import { useAuth } from '../hooks/useAuth.ts';
import { useToast } from '../hooks/useToast.ts';
import { useModal } from '../hooks/useModal.ts';
import { useEventContext } from '../hooks/useEventContext.ts';
import AnimatedPage from '../components/AnimatedPage.tsx';
import NoDataComponent from '../components/NoDataComponent.tsx';
import { useVisibility } from '../hooks/useVisibility.ts';
import { useSyncedData } from '../hooks/useSyncedData.ts';
import { usePageViewLogger } from '../hooks/usePageViewLogger.ts';


// Renders the criteria in a clean table format
const CriteriaTable: React.FC<{ criteria: CriteriaItem[] }> = ({ criteria }) => (
  <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
    <table className="min-w-full text-sm">
      <thead className="bg-slate-50 dark:bg-slate-900/50">
        <tr>
          <th className="p-3 text-left font-semibold text-slate-600 dark:text-slate-300">Criteria</th>
          <th className="p-3 text-left font-semibold text-slate-600 dark:text-slate-300">Description</th>
          <th className="p-3 text-right font-semibold text-slate-600 dark:text-slate-300">Points</th>
        </tr>
      </thead>
      <tbody>
        {criteria.map((item, index) => (
          <tr key={index} className="border-t border-slate-200 dark:border-slate-700">
            <td className="p-3 font-medium text-slate-700 dark:text-slate-200">{item.name}</td>
            <td className="p-3 text-slate-600 dark:text-slate-300">{item.description}</td>
            <td className="p-3 text-right font-semibold text-slate-700 dark:text-slate-200">{item.points} pts</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// Modal for displaying full event details
const EventDetailsModal: React.FC<{ event: Event; onClose: () => void }> = ({ event, onClose }) => {
  return (
    <>
      <div className="flex-shrink-0 flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
        <h2 id="modal-title" className="text-xl font-bold text-slate-800 dark:text-slate-100">{event.name}</h2>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><i className="bi bi-x-lg"></i></button>
      </div>
      <div className="flex-grow overflow-y-auto p-6">
        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-slate-600 dark:text-slate-300">
            <p><i className="bi bi-person-badge-fill mr-2"></i><strong>In-Charge:</strong> {event.officerInCharge}</p>
            <p><i className="bi bi-people-fill mr-2"></i><strong>Participants:</strong> {event.participantsInfo}</p>
            <p><i className="bi bi-calendar-week mr-2"></i><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
            <p><i className="bi bi-geo-alt-fill mr-2"></i><strong>Venue:</strong> {event.venue}</p>
            <p><i className="bi bi-trophy-fill mr-2"></i><strong>Points:</strong> {event.competitionPoints}</p>
            <p><i className="bi bi-gavel mr-2"></i><strong>Judges:</strong> {event.judges?.join(', ') || 'N/A'}</p>
          </div>
          
          <div className="space-y-3">
            <div>
              <h4 className="font-bold text-md text-slate-800 dark:text-slate-100 mb-2">Description</h4>
              <p className="whitespace-pre-wrap text-slate-600 dark:text-slate-300">{event.description}</p>
            </div>
            <div>
              <h4 className="font-bold text-md text-slate-800 dark:text-slate-100 mb-2">Mechanics</h4>
              <p className="whitespace-pre-wrap text-slate-600 dark:text-slate-300">{event.mechanics}</p>
            </div>
            <div>
              <h4 className="font-bold text-md text-slate-800 dark:text-slate-100 mb-2">Criteria for Judging</h4>
              <CriteriaTable criteria={event.criteria} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};


// Main card component for each event
const EventCard: React.FC<{ event: Event; onSelect: (action: 'view' | 'edit' | 'delete', event: Event) => void; canManage: boolean }> = ({ event, onSelect, canManage }) => {
  const getEffectiveStatus = (event: Event): EventStatus => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const eventDate = new Date(event.date);
    eventDate.setHours(0, 0, 0, 0);
    
    if (eventDate < now) return EventStatus.COMPLETED;
    if (eventDate.getTime() === now.getTime()) return EventStatus.OPEN;
    return EventStatus.UPCOMING;
  };

  const status = getEffectiveStatus(event);

  const cardStyles = {
      [EventStatus.OPEN]: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
      [EventStatus.CLOSED]: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
      [EventStatus.UPCOMING]: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
      [EventStatus.COMPLETED]: 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 opacity-80'
  };
  
  const badgeStyles = {
      [EventStatus.OPEN]: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100',
      [EventStatus.CLOSED]: 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100',
      [EventStatus.UPCOMING]: 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100',
      [EventStatus.COMPLETED]: 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
  };

  return (
    <Card className={`flex flex-col border ${cardStyles[status]} dark:shadow-soft-dark overflow-hidden`}>
      <div className="p-5 flex-grow">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-50 leading-tight">{event.name}</h3>
          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full uppercase tracking-wide ${badgeStyles[status]}`}>
            {status}
          </span>
        </div>
        <div className="space-y-2.5 mb-4 text-sm text-slate-600 dark:text-slate-300">
          <p className="flex items-center gap-2">
            <i className="bi bi-person-badge-fill text-slate-500 dark:text-slate-400"></i>
            <span className="truncate">{event.officerInCharge}</span>
          </p>
          <p className="flex items-center gap-2">
            <i className="bi bi-calendar-week text-slate-500 dark:text-slate-400"></i>
            <span>{new Date(event.date).toLocaleDateString()}</span>
          </p>
           <p className="flex items-center gap-2">
              <i className="bi bi-geo-alt-fill text-slate-500 dark:text-slate-400"></i>
              <span>{event.venue}</span>
           </p>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">{event.description}</p>
      </div>
      <div className="px-4 py-3 bg-white/50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex gap-2">
        <Button variant="secondary" className="flex-1 text-xs py-1.5" onClick={() => onSelect('view', event)}>View Details</Button>
        {canManage && (
            <>
                <Button variant="secondary" className="!p-0 h-8 w-8 text-xs flex items-center justify-center" onClick={() => onSelect('edit', event)} title="Edit Event"><i className="bi bi-pencil-fill"></i></Button>
                <Button variant="danger" className="!p-0 h-8 w-8 text-xs flex items-center justify-center" onClick={() => onSelect('delete', event)} title="Delete Event"><i className="bi bi-trash-fill"></i></Button>
            </>
        )}
      </div>
    </Card>
  );
};

// Form for adding or editing an event
const EventForm: React.FC<{ event: Partial<Event> | null; onSave: (event: Partial<Event>) => void; onClose: () => void }> = ({ event, onSave, onClose }) => {
    const [formData, setFormData] = useState<Partial<Event>>(event || { 
        name: '', 
        date: new Date().toISOString().split('T')[0], 
        venue: 'TBD',
        description: '',
        mechanics: '',
        criteria: [],
        status: EventStatus.UPCOMING, 
        category: EventCategory.JOKER_FLAG, 
        officerInCharge: '', 
        participantsInfo: '',
        judges: [],
        competitionPoints: 1000,
    });
    
    const [newJudge, setNewJudge] = useState('');
    const [newCriterion, setNewCriterion] = useState({ name: '', description: '', points: '' });
    const { addToast } = useToast();

    useEffect(() => {
        if (event) {
            setFormData({
                ...event,
                date: new Date(event.date || Date.now()).toISOString().split('T')[0]
            });
        }
    }, [event]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const isNumber = type === 'number';
        setFormData(prev => ({ ...prev, [name]: isNumber ? Number(value) : value }));
    };
    
    const handleAddJudge = () => {
        if (newJudge.trim()) {
            setFormData(prev => ({...prev, judges: [...(prev.judges || []), newJudge.trim()]}));
            setNewJudge('');
        }
    }
    const handleRemoveJudge = (index: number) => {
        setFormData(prev => ({...prev, judges: prev.judges?.filter((_, i) => i !== index)}));
    }

    const handleAddCriterion = () => {
        const { name, description, points } = newCriterion;
        const pointsNum = parseInt(points);
        if (name.trim() && description.trim() && !isNaN(pointsNum) && pointsNum > 0) {
            setFormData(prev => ({...prev, criteria: [...(prev.criteria || []), { name, description, points: pointsNum }]}));
            setNewCriterion({ name: '', description: '', points: '' });
        } else {
            addToast('Please enter a valid name, description, and point value.', 'error');
        }
    }
    const handleRemoveCriterion = (index: number) => {
        setFormData(prev => ({...prev, criteria: prev.criteria?.filter((_, i) => i !== index)}));
    }
    
    const handleCriterionChange = (index: number, field: keyof CriteriaItem, value: string) => {
        const updatedCriteria = [...(formData.criteria || [])];
        const newCrit = { ...updatedCriteria[index] };
        if (field === 'points') {
            newCrit[field] = parseInt(value, 10) || 0;
        } else {
            newCrit[field] = value;
        }
        updatedCriteria[index] = newCrit;
        setFormData(prev => ({ ...prev, criteria: updatedCriteria }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    }
    
    const inputClass = "mt-1 block w-full text-sm px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-400 transition-all duration-150 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none";
    const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300";

    return (
        <form onSubmit={handleSubmit} className="flex flex-col flex-grow overflow-hidden">
             <div className="flex-shrink-0 flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
                <h2 id="modal-title" className="text-xl font-bold text-slate-800 dark:text-slate-100">{event?.id ? `Edit: ${event.name}` : "Add New Event"}</h2>
                <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><i className="bi bi-x-lg"></i></button>
            </div>
            <div className="flex-grow overflow-y-auto p-6 space-y-4 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="name" className={labelClass}>Event Name</label>
                        <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className={inputClass} required/>
                    </div>
                    <div>
                        <label htmlFor="category" className={labelClass}>Category</label>
                        <select name="category" id="category" value={formData.category} onChange={handleChange} className={inputClass}>
                        {Object.values(EventCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="officerInCharge" className={labelClass}>Officer-in-Charge</label>
                        <input type="text" name="officerInCharge" id="officerInCharge" value={formData.officerInCharge} onChange={handleChange} className={inputClass}/>
                    </div>
                    <div>
                        <label htmlFor="participantsInfo" className={labelClass}>Participants Info</label>
                        <input type="text" name="participantsInfo" id="participantsInfo" placeholder="e.g., 10-15 per team" value={formData.participantsInfo} onChange={handleChange} className={inputClass}/>
                    </div>
                    <div>
                        <label htmlFor="competitionPoints" className={labelClass}>Competition Points</label>
                        <input type="number" name="competitionPoints" id="competitionPoints" value={formData.competitionPoints} onChange={handleChange} className={inputClass}/>
                    </div>
                    <div>
                        <label htmlFor="date" className={labelClass}>Event Date</label>
                        <input type="date" name="date" id="date" value={formData.date} onChange={handleChange} className={inputClass}/>
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="venue" className={labelClass}>Venue</label>
                        <input type="text" name="venue" id="venue" value={formData.venue} onChange={handleChange} className={inputClass}/>
                    </div>
                </div>
                
                <div>
                <label htmlFor="description" className={labelClass}>General Description</label>
                <textarea name="description" id="description" rows={3} value={formData.description} onChange={handleChange} className={inputClass}/>
                </div>
                <div>
                <label htmlFor="mechanics" className={labelClass}>Mechanics / Rules</label>
                <textarea name="mechanics" id="mechanics" rows={5} value={formData.mechanics} onChange={handleChange} className={inputClass}/>
                </div>

                <div>
                    <label className={labelClass}>Criteria for Judging</label>
                    <div className="space-y-2 mt-1">
                        {formData.criteria?.map((crit, index) => (
                            <div key={index} className="grid grid-cols-[1fr_2fr_auto_auto] items-end gap-2 p-2 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
                            <div>
                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Name</label>
                                    <input type="text" value={crit.name} onChange={(e) => handleCriterionChange(index, 'name', e.target.value)} className={`${inputClass} !p-1.5`} />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Description</label>
                                    <input type="text" value={crit.description} onChange={(e) => handleCriterionChange(index, 'description', e.target.value)} className={`${inputClass} !p-1.5`} />
                                </div>
                                <div className="w-20">
                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Points</label>
                                    <input type="number" value={crit.points} onChange={(e) => handleCriterionChange(index, 'points', e.target.value)} className={`${inputClass} !p-1.5`} />
                                </div>
                                <button type="button" onClick={() => handleRemoveCriterion(index)} className="h-9 w-9 flex-shrink-0 bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800 rounded-md font-bold">&times;</button>
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-[1fr_2fr_auto_auto] items-end gap-2 mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                        <div>
                            <label className="text-xs text-slate-500 dark:text-slate-400">New Criterion Name</label>
                            <input type="text" value={newCriterion.name} onChange={(e) => setNewCriterion({...newCriterion, name: e.target.value})} placeholder="e.g., Creativity" className={inputClass}/>
                        </div>
                        <div>
                            <label className="text-xs text-slate-500 dark:text-slate-400">Description</label>
                            <input type="text" value={newCriterion.description} onChange={(e) => setNewCriterion({...newCriterion, description: e.target.value})} placeholder="e.g., Originality of concept" className={inputClass}/>
                        </div>
                        <div className="w-20">
                            <label className="text-xs text-slate-500 dark:text-slate-400">Points</label>
                            <input type="number" value={newCriterion.points} onChange={(e) => setNewCriterion({...newCriterion, points: e.target.value})} placeholder="e.g., 30" className={inputClass}/>
                        </div>
                        <Button type="button" variant="secondary" onClick={handleAddCriterion}>Add</Button>
                    </div>
                </div>

                <div>
                    <label className={labelClass}>Judges</label>
                    <div className="flex flex-wrap gap-2 my-2">
                        {formData.judges?.map((judge, index) => (
                            <span key={index} className="flex items-center bg-slate-200 dark:bg-slate-600 rounded-full px-3 py-1 text-sm">
                                {judge}
                                <button type="button" onClick={() => handleRemoveJudge(index)} className="ml-2 text-red-500 hover:text-red-700">
                                    &times;
                                </button>
                            </span>
                        ))}
                    </div>
                    <div className="flex items-center space-x-2">
                        <input type="text" value={newJudge} onChange={(e) => setNewJudge(e.target.value)} placeholder="Add judge name..." className={inputClass}/>
                        <Button type="button" variant="secondary" onClick={handleAddJudge}>Add</Button>
                    </div>
                </div>
            </div>
            <div className="flex-shrink-0 flex justify-end space-x-3 p-4 border-t border-slate-200 dark:border-slate-700">
                <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                <Button type="submit">Save Event</Button>
            </div>
        </form>
    );
}

const DeleteConfirmationModal: React.FC<{ event: Event; onClose: () => void; onConfirm: () => void; }> = ({ event, onClose, onConfirm }) => {
    return (
        <>
            <div className="flex-shrink-0 flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
                <h2 id="modal-title" className="text-xl font-bold text-slate-800 dark:text-slate-100">Confirm Deletion</h2>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><i className="bi bi-x-lg"></i></button>
            </div>
            <div className="p-6 text-center">
                <p className="mb-4">Are you sure you want to delete the event: <br/><strong className="text-lg">{event.name}</strong>?</p>
                <div className="flex justify-center space-x-4">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button variant="danger" onClick={onConfirm}>Delete</Button>
                </div>
            </div>
        </>
    );
}

// Main Events page component
const Events: React.FC = () => {
    usePageViewLogger('events');
    const { data: events, loading } = useSyncedData<Event[]>(getEvents, [STORAGE_KEYS.EVENTS]);
    const { user } = useAuth();
    const { addToast } = useToast();
    const [searchParams] = useSearchParams();
    const { openModal, closeModal } = useModal();
    const { isDataAvailable } = useEventContext();
    const { settings, isPrivileged } = useVisibility();

    const canManage = user?.role === UserRole.ADMIN || user?.role === UserRole.OFFICER;

    useEffect(() => {
        if (!isDataAvailable || !events) return;
        const eventIdParam = searchParams.get('eventId');
        if (eventIdParam) {
            const foundEvent = events.find(e => e.id === eventIdParam);
            if (foundEvent) {
                openModal(<EventDetailsModal event={foundEvent} onClose={closeModal} />);
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams, isDataAvailable, events]);
  
    const handleSelect = (action: 'view' | 'edit' | 'delete', event: Event) => {
        if (action === 'view') openModal(<EventDetailsModal event={event} onClose={closeModal} />);
        if (action === 'edit') openModal(<EventForm event={event} onSave={handleSaveEvent} onClose={closeModal} />);
        if (action === 'delete') {
            const handleDelete = async () => {
                try {
                    await apiDeleteEvent(event.id);
                    addToast("Event deleted successfully!", "success");
                    closeModal();
                } catch(error) {
                    addToast("Failed to delete event.", "error");
                }
            }
            openModal(<DeleteConfirmationModal event={event} onClose={closeModal} onConfirm={handleDelete} />);
        }
    }

    const handleOpenAddForm = () => {
        openModal(<EventForm event={null} onSave={handleSaveEvent} onClose={closeModal} />);
    }

    const handleSaveEvent = async (eventData: Partial<Event>) => {
        try {
            if (eventData.id) {
                await updateEvent(eventData as Event);
                addToast("Event updated successfully!", "success");
            } else {
                await addEvent(eventData);
                addToast("Event created successfully!", "success");
            }
            closeModal();
        } catch (error) {
            addToast("Failed to save event.", "error");
        }
    }

    const groupedEvents = useMemo(() => {
        if (!events) return {};
        return events.reduce((acc, event) => {
            (acc[event.category] = acc[event.category] || []).push(event);
            return acc;
        }, {} as Record<string, Event[]>);
    }, [events]);

    const categoryOrder = Object.values(EventCategory);
  
    if (!isDataAvailable) {
        return <AnimatedPage><NoDataComponent /></AnimatedPage>
    }

    return (
        <AnimatedPage className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-50">Events</h1>
                {canManage && <Button onClick={handleOpenAddForm}>Add Event</Button>}
            </div>

            {loading ? (
                <p>Loading events...</p>
            ) : (
                <div className="space-y-8">
                {categoryOrder.map(category => 
                    (isPrivileged || settings.events.categories[category]) && groupedEvents[category] && (
                    <div key={category}>
                        <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-4 pb-2 border-b-2 border-indigo-200 dark:border-indigo-800">{category}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {groupedEvents[category].map((event) => (
                            <EventCard key={event.id} event={event} onSelect={handleSelect} canManage={canManage} />
                        ))}
                        </div>
                    </div>
                    )
                )}
                </div>
            )}
        </AnimatedPage>
    );
};

export default Events;