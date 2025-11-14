
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.ts';
import { useToast } from '../hooks/useToast.ts';
import Card from '../components/Card.tsx';
import Input from '../components/Input.tsx';
import Button from '../components/Button.tsx';
import { Team, Event, User } from '../types.ts';
import { getLeaderboard, getEvents } from '../services/api.ts';

const CompleteProfile: React.FC = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const location = useLocation();
  const { updateUser } = useAuth();
  const { addToast } = useToast();

  const partialUser = location.state?.partialUser as User | undefined;

  // FIX: Simplify and improve initial state setup.
  const [formData, setFormData] = useState<Partial<User>>({
    ...partialUser,
    studentId: '',
    yearLevel: '',
    section: '',
    contactInfo: '',
    teamId: '',
    bio: '',
    interestedEvents: [],
  });

  const [loading, setLoading] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [availableEvents, setAvailableEvents] = useState<Event[]>([]);

  useEffect(() => {
    // FIX: Add a guard to redirect if partialUser is missing.
    if (!partialUser) {
      navigate('/login', { replace: true });
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const [fetchedTeams, fetchedEvents] = await Promise.all([getLeaderboard(), getEvents()]);
        setTeams(fetchedTeams);
        setAvailableEvents(fetchedEvents);
      } catch (e) {
        addToast("Failed to load necessary data", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [partialUser, navigate, addToast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEventToggle = (eventName: string) => {
    setFormData(prev => {
      const interested = prev.interestedEvents || [];
      const exists = interested.includes(eventName);
      return {
        ...prev,
        interestedEvents: exists ? interested.filter(e => e !== eventName) : [...interested, eventName],
      };
    });
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentId || !formData.yearLevel || !formData.section) {
        addToast('Please fill out all required fields.', 'error');
        return;
    }
    setStep(2);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateUser(formData as User);
      addToast('Welcome! Your profile is complete.', 'success');
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      addToast(err.message || 'Failed to complete profile.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-150 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none";

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl my-8">
        <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">Complete Your Profile</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Welcome, {partialUser?.firstName}! Just a few more details to get you started.</p>
        </div>
        <Card className="p-8">
          {step === 1 && (
            <form onSubmit={handleNextStep} className="space-y-6">
                <h2 className="font-bold text-lg text-slate-700 dark:text-slate-200">Step 1: Academic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Student ID *" id="studentId" name="studentId" value={formData.studentId} onChange={handleChange} required />
                    <Input label="Contact Info (Optional)" id="contactInfo" name="contactInfo" value={formData.contactInfo} onChange={handleChange} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Year Level *</label>
                        <select name="yearLevel" value={formData.yearLevel} onChange={handleChange} className={inputClass} required>
                            <option value="">Select...</option>
                            <option value="1st Year">1st Year</option>
                            <option value="2nd Year">2nd Year</option>
                            <option value="3rd Year">3rd Year</option>
                            <option value="4th Year">4th Year</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Section *</label>
                        <select name="section" value={formData.section} onChange={handleChange} className={inputClass} required>
                            <option value="">Select...</option>
                            <option value="Section 1">Section 1</option>
                            <option value="Section 2">Section 2</option>
                            <option value="Section 3">Section 3</option>
                            <option value="International">International</option>
                        </select>
                    </div>
                </div>
                <Button type="submit" className="w-full py-2.5 mt-4" disabled={loading}>
                    Next Step
                </Button>
            </form>
          )}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-6">
                <h2 className="font-bold text-lg text-slate-700 dark:text-slate-200">Step 2: Team & Event Interests</h2>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Select Team (Optional)</label>
                    <select name="teamId" value={formData.teamId} onChange={handleChange} className={inputClass}>
                        <option value="">None</option>
                        {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Bio (Optional)</label>
                    <textarea name="bio" value={formData.bio} onChange={handleChange} className={inputClass} rows={2} placeholder="Short description of yourself"></textarea>
                </div>
                
                 <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Interested Events (Optional)</label>
                    <div className="max-h-40 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {availableEvents.map(event => (
                          <label key={event.id} className="flex items-center space-x-2 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer text-sm">
                              <input type="checkbox" checked={formData.interestedEvents?.includes(event.name)} onChange={() => handleEventToggle(event.name)} className="rounded text-indigo-500 focus:ring-indigo-500" />
                              <span className="text-slate-700 dark:text-slate-300">{event.name}</span>
                          </label>
                      ))}
                    </div>
                </div>
                <div className="flex gap-4 pt-4">
                    <Button variant="secondary" onClick={() => setStep(1)} className="w-full py-2.5">Back</Button>
                    <Button type="submit" className="w-full py-2.5" disabled={loading}>
                        {loading ? 'Saving...' : 'Finish & Go to Dashboard'}
                    </Button>
                </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};

export default CompleteProfile;
