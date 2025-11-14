import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../components/Card.tsx';
import Button from '../components/Button.tsx';
import { useAuth } from '../hooks/useAuth.ts';
import { useToast } from '../hooks/useToast.ts';
import { Team, Event, User } from '../types.ts';
import { getLeaderboard, getEvents, getUsers } from '../services/api.ts';

const Profile: React.FC = () => {
  const { userId } = useParams<{ userId?: string }>();
  const { user: loggedInUser, updateUser } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  const [teams, setTeams] = useState<Team[]>([]);
  const [availableEvents, setAvailableEvents] = useState<Event[]>([]);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<User>>({});

  const canEdit = !userId || loggedInUser?.id === userId;

  useEffect(() => {
    const loadProfileData = async () => {
      setLoading(true);
      try {
        const [fetchedTeams, fetchedEvents, allUsers] = await Promise.all([
          getLeaderboard(),
          getEvents(),
          getUsers(),
        ]);
        setTeams(fetchedTeams);
        setAvailableEvents(fetchedEvents);

        let userToDisplay: User | null | undefined = null;
        if (userId) {
          userToDisplay = allUsers.find(u => u.id === userId);
          if (!userToDisplay) {
            addToast('User not found.', 'error');
            navigate('/dashboard', { replace: true });
            return;
          }
        } else {
          userToDisplay = loggedInUser;
        }
        
        if (userToDisplay) {
            setProfileUser(userToDisplay);
            setFormData({ ...userToDisplay });
            setAvatarPreview(userToDisplay.avatar || null);
        }
        
      } catch (err) {
        console.error("Error fetching profile data", err);
        addToast('Failed to load profile data.', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadProfileData();
  }, [userId, loggedInUser, navigate, addToast]);
  
  useEffect(() => {
      if (!isEditing && profileUser) {
          setFormData({ ...profileUser });
          setAvatarPreview(profileUser.avatar || null);
      }
  }, [isEditing, profileUser]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({...prev, [name]: value}));
  };
  
  const handleEventSelection = (eventName: string) => {
    setFormData(prev => {
        const interestedEvents = prev.interestedEvents || [];
        const newInterestedEvents = interestedEvents.includes(eventName)
          ? interestedEvents.filter(e => e !== eventName)
          : [...interestedEvents, eventName];
        return { ...prev, interestedEvents: newInterestedEvents };
    });
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canEdit) return;
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setAvatarPreview(result);
        setFormData(prev => ({...prev, avatar: result}));
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSave = async () => {
    if (!canEdit) return;
    if (!formData.firstName?.trim() || !formData.lastName?.trim() || !formData.studentId?.trim()) {
        addToast('First name, last name, and ID number are required.', 'error');
        return;
    }

    try {
        await updateUser(formData as User);
        addToast('Profile updated successfully!', 'success');
        setProfileUser(formData as User); // Optimistically update local state
        setIsEditing(false);
    } catch(error: any) {
        addToast(error.message || 'Failed to update profile.', 'error');
    }
  };
  
  const handleCancelEdit = () => {
      setIsEditing(false);
  }

  const inputClass = "w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-400 transition-all duration-150 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none disabled:bg-slate-100 dark:disabled:bg-slate-800/50 disabled:cursor-not-allowed disabled:opacity-70";
  const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1";

  const getTeamName = (teamId?: string) => teams.find(t => t.id === teamId)?.name || 'N/A';
  
  if (loading) {
      return <div>Loading profile...</div>;
  }
  
  if (!profileUser) {
      return <div>User not found.</div>;
  }

  const renderViewMode = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-center gap-6 pb-6 border-b border-slate-200 dark:border-slate-700 relative">
        <div className="relative group inline-block">
            <img src={profileUser.avatar || 'https://via.placeholder.com/150'} alt="Profile" className="h-32 w-32 rounded-full object-cover border-4 border-slate-200 dark:border-slate-700 shadow-sm" />
            {canEdit && (
                <button 
                    onClick={() => setIsEditing(true)}
                    className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full shadow-lg hover:bg-indigo-700 transition-colors"
                    title="Edit Profile"
                >
                    <i className="bi bi-pencil-fill text-sm"></i>
                </button>
            )}
        </div>
        <div className="text-center md:text-left">
          <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-50">{profileUser.firstName} {profileUser.middleName ? `${profileUser.middleName} ` : ''}{profileUser.lastName}</h2>
          <p className="text-slate-500 dark:text-slate-400 uppercase font-semibold mt-1 tracking-wide">{profileUser.role?.replace('_', ' ')}</p>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{profileUser.email}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
              <h4 className="font-medium text-slate-500 dark:text-slate-400 mb-1">Full Name</h4>
              <p className="font-semibold text-slate-800 dark:text-slate-100 text-lg">{profileUser.firstName} {profileUser.middleName} {profileUser.lastName}</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
              <h4 className="font-medium text-slate-500 dark:text-slate-400 mb-1">Student ID</h4>
              <p className="font-semibold text-slate-800 dark:text-slate-100 text-lg">{profileUser.studentId || 'Not set'}</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
              <h4 className="font-medium text-slate-500 dark:text-slate-400 mb-1">Assigned Team</h4>
              <p className="font-semibold text-slate-800 dark:text-slate-100 text-lg">{getTeamName(profileUser.teamId)}</p>
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
              <h4 className="font-medium text-slate-500 dark:text-slate-400 mb-1">Year Level</h4>
              <p className="font-semibold text-slate-800 dark:text-slate-100">{profileUser.yearLevel || 'Not set'}</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
              <h4 className="font-medium text-slate-500 dark:text-slate-400 mb-1">Section</h4>
              <p className="font-semibold text-slate-800 dark:text-slate-100">{profileUser.section || 'Not set'}</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
              <h4 className="font-medium text-slate-500 dark:text-slate-400 mb-1">Contact Info</h4>
              <p className="font-semibold text-slate-800 dark:text-slate-100">{profileUser.contactInfo || 'Not set'}</p>
          </div>
      </div>
      
      <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
          <h4 className="font-medium text-slate-500 dark:text-slate-400 mb-2">Bio</h4>
          <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{profileUser.bio || 'No bio provided.'}</p>
      </div>
      
      <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
          <h4 className="font-medium text-slate-500 dark:text-slate-400 mb-3">Interested Events</h4>
          <div className="flex flex-wrap gap-2">
              {profileUser.interestedEvents && profileUser.interestedEvents.length > 0 ? (
                  profileUser.interestedEvents.map((event, idx) => (
                      <span key={idx} className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm font-medium">
                          {event}
                      </span>
                  ))
              ) : (
                  <span className="text-slate-500 dark:text-slate-400 italic">No events selected.</span>
              )}
          </div>
      </div>
    </div>
  );

  const renderEditMode = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-center gap-6 pb-6 border-b border-slate-200 dark:border-slate-700">
        <div className="relative group">
            <img src={avatarPreview || 'https://via.placeholder.com/150'} alt="Profile" className="h-32 w-32 rounded-full object-cover border-4 border-slate-200 dark:border-slate-700" />
            <label htmlFor="avatar-upload" className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <i className="bi bi-camera-fill text-white text-2xl"></i>
                <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>
        </div>
        <div className="text-center md:text-left">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Edit Profile</h2>
          <p className="text-slate-500 dark:text-slate-400">Update your personal information</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
              <label className={labelClass}>First Name <span className="text-red-500">*</span></label>
              <input name="firstName" value={formData.firstName || ''} onChange={handleInputChange} className={inputClass} required />
          </div>
          <div>
              <label className={labelClass}>Middle Name (Optional)</label>
              <input name="middleName" value={formData.middleName || ''} onChange={handleInputChange} className={inputClass} />
          </div>
          <div>
              <label className={labelClass}>Last Name <span className="text-red-500">*</span></label>
              <input name="lastName" value={formData.lastName || ''} onChange={handleInputChange} className={inputClass} required />
          </div>
          
          <div>
              <label className={labelClass}>Student ID Number <span className="text-red-500">*</span></label>
              <input name="studentId" value={formData.studentId || ''} onChange={handleInputChange} className={inputClass} required />
          </div>
          <div>
              <label className={labelClass}>Year Level</label>
              <select name="yearLevel" value={formData.yearLevel || ''} onChange={handleInputChange} className={inputClass}>
                  <option value="">Select Year</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="5th Year">5th Year</option>
              </select>
          </div>
          <div>
              <label className={labelClass}>Block/Section</label>
              <select name="section" value={formData.section || ''} onChange={handleInputChange} className={inputClass}>
                  <option value="">Select Section</option>
                  <option value="Section 1">Section 1</option>
                  <option value="Section 2">Section 2</option>
                  <option value="Section 3">Section 3</option>
                  <option value="Section 4">Section 4</option>
                  <option value="Section 5">Section 5</option>
                  <option value="Section 6">Section 6</option>
                  <option value="International">International</option>
                  <option value="N/A">N/A</option>
              </select>
          </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
              <label className={labelClass}>Email Address</label>
              <input type="email" name="email" value={formData.email || ''} onChange={handleInputChange} className={inputClass} />
          </div>
          <div>
              <label className={labelClass}>Contact Number</label>
              <input type="tel" name="contactInfo" value={formData.contactInfo || ''} onChange={handleInputChange} className={inputClass} />
          </div>
          <div className="md:col-span-2">
              <label className={labelClass}>Assigned Unit/Team</label>
              <select name="teamId" value={formData.teamId || ''} onChange={handleInputChange} className={inputClass}>
                  <option value="">Select Team</option>
                  {teams.map(team => (
                      <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
              </select>
          </div>
      </div>

      <div>
          <label htmlFor="bio" className={labelClass}>Bio</label>
          <textarea id="bio" name="bio" rows={3} value={formData.bio || ''} onChange={handleInputChange} className={inputClass} placeholder="Tell us something about yourself..." />
      </div>

      <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
          <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-4">Prospect Player Statistics</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Select the events you are experienced in or interested in joining.</p>
          
          <div className="max-h-60 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg p-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {availableEvents.map(event => (
                  <label key={event.id} className="flex items-center space-x-3 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors">
                      <input 
                        type="checkbox" 
                        checked={formData.interestedEvents?.includes(event.name)} 
                        onChange={() => handleEventSelection(event.name)}
                        className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300">{event.name}</span>
                  </label>
              ))}
          </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-50">{canEdit ? 'My Profile' : `${profileUser.name}'s Profile`}</h1>
          {canEdit && (
            <div className="flex space-x-2">
                {isEditing ? (
                    <>
                      <Button variant="secondary" onClick={handleCancelEdit}>Cancel</Button>
                      <Button onClick={handleSave}>Save Changes</Button>
                    </>
                ) : (
                  <Button variant="secondary" onClick={() => setIsEditing(true)}>Edit Profile</Button>
                )}
            </div>
          )}
      </div>

      <Card>
        <div className="p-8 space-y-6">
            {isEditing && canEdit ? renderEditMode() : renderViewMode()}
        </div>
      </Card>
    </div>
  );
};

export default Profile;
