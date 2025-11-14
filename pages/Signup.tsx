
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import { Team, Event } from '../types';
import { getLeaderboard, getEvents } from '../services/api';

const Signup: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '', middleName: '', lastName: '', studentId: '', email: '', password: '', confirmPassword: '',
    yearLevel: '', section: '', contactInfo: '', teamId: '', bio: '', interestedEvents: [] as string[]
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [availableEvents, setAvailableEvents] = useState<Event[]>([]);
  
  const navigate = useNavigate();
  const { register } = useAuth();

  useEffect(() => {
      const fetchData = async () => {
          try {
              const [fetchedTeams, fetchedEvents] = await Promise.all([getLeaderboard(), getEvents()]);
              setTeams(fetchedTeams);
              setAvailableEvents(fetchedEvents);
          } catch (e) {
              console.error("Failed to fetch form data", e);
          }
      }
      fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
  }
  
  const handleEventToggle = (eventName: string) => {
      setFormData(prev => {
          const exists = prev.interestedEvents.includes(eventName);
          return {
              ...prev,
              interestedEvents: exists ? prev.interestedEvents.filter(e => e !== eventName) : [...prev.interestedEvents, eventName]
          };
      });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        return;
    }
    setLoading(true);
    setError('');
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...dataToSubmit } = formData;
      await register(dataToSubmit);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };
  
  const inputClass = "w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-150 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none";

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl my-8">
        <h1 className="text-3xl font-bold text-center text-indigo-600 dark:text-indigo-400 mb-6">
          Create SIMS Account
        </h1>
        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input label="First Name *" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required />
                <Input label="Middle Name" id="middleName" name="middleName" value={formData.middleName} onChange={handleChange} />
                <Input label="Last Name *" id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Student ID *" id="studentId" name="studentId" value={formData.studentId} onChange={handleChange} required />
                <Input label="Email Address *" id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
            </div>
            
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Password *" id="password" name="password" type="password" value={formData.password} onChange={handleChange} required />
                <Input label="Confirm Password *" id="confirmPassword" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Year Level</label>
                    <select name="yearLevel" value={formData.yearLevel} onChange={handleChange} className={inputClass} required>
                        <option value="">Select...</option>
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Section</label>
                    <select name="section" value={formData.section} onChange={handleChange} className={inputClass} required>
                        <option value="">Select...</option>
                        <option value="Section 1">Section 1</option>
                        <option value="Section 2">Section 2</option>
                        <option value="Section 3">Section 3</option>
                        <option value="International">International</option>
                    </select>
                </div>
                <Input label="Contact Info" id="contactInfo" name="contactInfo" value={formData.contactInfo} onChange={handleChange} />
            </div>
            
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Select Team (Optional)</label>
                <select name="teamId" value={formData.teamId} onChange={handleChange} className={inputClass}>
                    <option value="">None</option>
                    {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Bio</label>
                <textarea name="bio" value={formData.bio} onChange={handleChange} className={inputClass} rows={2} placeholder="Short description of yourself"></textarea>
            </div>

             <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Interested Events</label>
                <div className="max-h-40 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {availableEvents.map(event => (
                      <label key={event.id} className="flex items-center space-x-2 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer text-sm">
                          <input type="checkbox" checked={formData.interestedEvents.includes(event.name)} onChange={() => handleEventToggle(event.name)} className="rounded" />
                          <span className="text-slate-700 dark:text-slate-300">{event.name}</span>
                      </label>
                  ))}
                </div>
            </div>

            {error && <p className="text-sm text-red-500 text-center font-semibold">{error}</p>}
            
            <div className="flex flex-col gap-4">
                <Button type="submit" className="w-full py-3" disabled={loading}>
                {loading ? 'Creating account...' : 'Register Account'}
                </Button>
                <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                    Already have an account? <span onClick={() => navigate('/login')} className="text-indigo-600 hover:underline cursor-pointer">Log In</span>
                </p>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
