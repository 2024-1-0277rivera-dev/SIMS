import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.ts';
import Card from '../components/Card.tsx';
import Input from '../components/Input.tsx';
import Button from '../components/Button.tsx';
import { Team, Event } from '../types.ts';
import { getLeaderboard, getEvents } from '../services/api.ts';
import Skeleton from '../components/Skeleton.tsx';

const Signup: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '', middleName: '', lastName: '', studentId: '', email: '', password: '', confirmPassword: '',
    yearLevel: '', section: '', contactInfo: '', teamId: '', bio: '', interestedEvents: [] as string[],
    avatar: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [availableEvents, setAvailableEvents] = useState<Event[]>([]);
  
  const navigate = useNavigate();
  const { register } = useAuth();
  const avatarUploadRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
      const fetchData = async () => {
          try {
              const [fetchedTeams, fetchedEvents] = await Promise.all([getLeaderboard(), getEvents()]);
              setTeams(fetchedTeams.filter(t => t.name !== 'Amaranth Jokers'));
              setAvailableEvents(fetchedEvents);
          } catch (e) {
              console.error("Failed to fetch form data", e);
          }
      }
      fetchData();
  }, []);
  
  useEffect(() => {
    const email = formData.email.trim();
    if (email && /\S+@\S+\.\S+/.test(email)) {
        // Mock fetching avatar from a service based on email
        const newAvatarUrl = `https://robohash.org/${email}.png`;
        setFormData(prev => ({ ...prev, avatar: newAvatarUrl }));
    }
  }, [formData.email]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
  }
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

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
  
  const inputClass = "w-full px-3 py-2 bg-white dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-400 transition-all duration-150 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none";

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl my-8">
        <h1 className="text-3xl font-bold text-center text-indigo-600 dark:text-indigo-400 mb-6">
          Create SIMS Account
        </h1>
        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-3 gap-8 items-start p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <div className="md:col-span-1 text-center">
                    <div className="relative w-32 h-32 mx-auto">
                        <img 
                            src={formData.avatar || 'https://i.pravatar.cc/150?u=guest'} 
                            alt="Avatar Preview" 
                            className="w-32 h-32 rounded-full object-cover shadow-md" 
                        />
                        <input type="file" ref={avatarUploadRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                        <Button type="button" variant="secondary" onClick={() => avatarUploadRef.current?.click()} className="absolute bottom-0 right-0 !rounded-full w-10 h-10 p-0 flex items-center justify-center shadow-lg">
                            <i className="bi bi-camera-fill"></i>
                        </Button>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">We'll try to fetch a public avatar from your email. You can also upload your own.</p>
                </div>
                <div className="md:col-span-2 space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                        <Input label="First Name *" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required />
                        <Input label="Last Name *" id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required />
                    </div>
                     <Input label="Student ID *" id="studentId" name="studentId" value={formData.studentId} onChange={handleChange} required />
                    <div>
                      <Input label="Email Address *" id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
                  </div>
                </div>
            </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Password *" id="password" name="password" type="password" value={formData.password} onChange={handleChange} required />
                <Input label="Confirm Password *" id="confirmPassword" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} required />
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
            
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Select Team (Optional)</label>
                 <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">If you select a team, a request to join will be sent to the team leader for approval.</p>
                <select name="teamId" value={formData.teamId} onChange={handleChange} className={inputClass}>
                    <option value="">None</option>
                    {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
            </div>

            {error && <p className="text-sm text-red-500 text-center font-semibold">{error}</p>}
            
            <div className="flex flex-col gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
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