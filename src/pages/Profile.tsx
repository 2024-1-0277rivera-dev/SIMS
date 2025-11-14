import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../components/Card.tsx';
import Button from '../components/Button.tsx';
import { useAuth } from '../hooks/useAuth.ts';
import { useToast } from '../hooks/useToast.ts';
import { Team, Event, User } from '../types.ts';
import { getLeaderboard, getEvents, getUsers } from '../services/api.ts';
import { getTeamStyles } from '../config.ts';
import { usePageViewLogger } from '../hooks/usePageViewLogger.ts';

const Profile: React.FC = () => {
  usePageViewLogger('profile');
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

  const calculateAge = (birthdate?: string): number | null => {
    if (!birthdate) return null;
    try {
        const birthDate = new Date(birthdate);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age > 0 ? age : null;
    } catch {
        return null;
    }
  };

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
        setProfileUser(formData as User);
        setIsEditing(false);
    } catch(error: any) {
        addToast(error.message || 'Failed to update profile.', 'error');
    }
  };
  
  const handleCancelEdit = () => {
      setIsEditing(false);
  }

  const inputClass = "w-full px-3 py-2 bg-slate-50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-400 transition-all duration-150 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none disabled:bg-slate-100 dark:disabled:bg-slate-800/50 disabled:cursor-not-allowed disabled:opacity-70";
  const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1";

  const getTeamName = (teamId?: string) => teams.find(t => t.id === teamId)?.name || 'Not Assigned';
  
  if (loading) {
      return <div>Loading profile...</div>;
  }
  
  if (!profileUser) {
      return <div>User not found.</div>;
  }

  const teamStyle = getTeamStyles(profileUser.teamId);
  const age = calculateAge(formData.birthdate);

  const renderViewMode = () => (
    <div className="space-y-6">
       <Card className="p-0 overflow-visible">
            <div 
                className="h-32 rounded-t-2xl"
                style={{ background: `linear-gradient(45deg, ${teamStyle.gradient.from}, ${teamStyle.gradient.to})` }}
            />
            <div className="p-6 pt-0">
                <div className="flex flex-col md:flex-row items-center md:items-end gap-4 -mt-16 relative">
                    <img src={profileUser.avatar || 'https://via.placeholder.com/150'} alt="Profile" className="h-32 w-32 rounded-full object-cover border-4 border-white dark:border-slate-800 shadow-lg" />
                    <div className="text-center md:text-left md:mb-2 flex-grow">
                        <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-50 flex items-center gap-2 justify-center md:justify-start">
                            <span>{profileUser.firstName} {profileUser.lastName}</span>
                             <span className="text-2xl" style={{ textShadow: '2px 2px 5px rgba(0,0,0,0.2)' }}>👋</span>
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 uppercase font-semibold mt-1 tracking-wide">{profileUser.role?.replace('_', ' ')}</p>
                    </div>
                    {canEdit && <Button variant="secondary" onClick={() => setIsEditing(true)} className="absolute top-16 right-0 md:relative md:top-0 md:right-0">Edit Profile</Button>}
                </div>
            </div>
        </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-6">
            <Card className="p-6">
                <h3 className="font-bold text-lg mb-4 text-slate-800 dark:text-slate-100">Personal Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-start gap-3"><i className="bi bi-person-vcard-fill text-indigo-500 mt-1"></i><div><h4 className="font-semibold text-slate-500 dark:text-slate-400">Full Name</h4><p className="text-slate-700 dark:text-slate-200">{profileUser.firstName} {profileUser.middleName} {profileUser.lastName}</p></div></div>
                    <div className="flex items-start gap-3"><i className="bi bi-person-badge-fill text-indigo-500 mt-1"></i><div><h4 className="font-semibold text-slate-500 dark:text-slate-400">Student ID</h4><p className="text-slate-700 dark:text-slate-200">{profileUser.studentId || 'Not set'}</p></div></div>
                    <div className="flex items-start gap-3"><i className="bi bi-envelope-fill text-indigo-500 mt-1"></i><div><h4 className="font-semibold text-slate-500 dark:text-slate-400">Email</h4><p className="text-slate-700 dark:text-slate-200">{profileUser.email}</p></div></div>
                    <div className="flex items-start gap-3"><i className="bi bi-telephone-fill text-indigo-500 mt-1"></i><div><h4 className="font-semibold text-slate-500 dark:text-slate-400">Contact</h4><p className="text-slate-700 dark:text-slate-200">{profileUser.contactInfo || 'Not set'}</p></div></div>
                    <div className="flex items-start gap-3"><i className="bi bi-gender-ambiguous text-indigo-500 mt-1"></i><div><h4 className="font-semibold text-slate-500 dark:text-slate-400">Gender</h4><p className="text-slate-700 dark:text-slate-200">{profileUser.gender || 'Not set'}</p></div></div>
                    <div className="flex items-start gap-3"><i className="bi bi-calendar-heart-fill text-indigo-500 mt-1"></i><div><h4 className="font-semibold text-slate-500 dark:text-slate-400">Birthdate & Age</h4><p className="text-slate-700 dark:text-slate-200">{profileUser.birthdate ? `${new Date(profileUser.birthdate).toLocaleDateString()} (${calculateAge(profileUser.birthdate)} yrs)` : 'Not set'}</p></div></div>
                </div>
            </Card>
            <Card className="p-6">
                <h3 className="font-bold text-lg mb-2 text-slate-800 dark:text-slate-100 flex items-center gap-2"><span className="text-xl" style={{ textShadow: '2px 2px 5px rgba(0,0,0,0.1)' }}>📝</span> Bio</h3>
                <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap text-sm">{profileUser.bio || 'No bio provided.'}</p>
            </Card>
        </div>
        <div className="lg:col-span-2 space-y-6">
             <Card className="p-6">
                <h3 className="font-bold text-lg mb-4 text-slate-800 dark:text-slate-100">Academic & Team</h3>
                 <div className="space-y-4 text-sm">
                    <div className="flex items-start gap-3"><i className="bi bi-bar-chart-steps text-indigo-500 mt-1"></i><div><h4 className="font-semibold text-slate-500 dark:text-slate-400">Year Level</h4><p className="text-slate-700 dark:text-slate-200">{profileUser.yearLevel || 'Not set'}</p></div></div>
                    <div className="flex items-start gap-3"><i className="bi bi-people-fill text-indigo-500 mt-1"></i><div><h4 className="font-semibold text-slate-500 dark:text-slate-400">Section</h4><p className="text-slate-700 dark:text-slate-200">{profileUser.section || 'Not set'}</p></div></div>
                    <div className="flex items-start gap-3"><i className={`${teamStyle.icon} mt-1`} style={{color: teamStyle.gradient.from}}></i><div><h4 className="font-semibold text-slate-500 dark:text-slate-400">Assigned Team</h4><p className="font-bold" style={{color: teamStyle.gradient.from}}>{getTeamName(profileUser.teamId)}</p></div></div>
                </div>
            </Card>
             <Card className="p-6">
                <h3 className="font-bold text-lg mb-3 text-slate-800 dark:text-slate-100 flex items-center gap-2"><span className="text-xl" style={{ textShadow: '2px 2px 5px rgba(0,0,0,0.1)' }}>🎯</span> Interested Events</h3>
                <div className="flex flex-wrap gap-2">
                    {profileUser.interestedEvents && profileUser.interestedEvents.length > 0 ? (
                        profileUser.interestedEvents.map((event, idx) => (
                            <span key={idx} className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200 rounded-full text-sm font-medium">
                                {event}
                            </span>
                        ))
                    ) : (
                        <span className="text-slate-500 dark:text-slate-400 italic text-sm">No events selected.</span>
                    )}
                </div>
            </Card>
        </div>
      </div>
    </div>
  );

  const renderEditMode = () => (
    <div className="space-y-6">
        <Card className="p-6">
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div><label className={labelClass}>First Name <span className="text-red-500">*</span></label><input name="firstName" value={formData.firstName || ''} onChange={handleInputChange} className={inputClass} required /></div>
                <div><label className={labelClass}>Middle Name</label><input name="middleName" value={formData.middleName || ''} onChange={handleInputChange} className={inputClass} /></div>
                <div><label className={labelClass}>Last Name <span className="text-red-500">*</span></label><input name="lastName" value={formData.lastName || ''} onChange={handleInputChange} className={inputClass} required /></div>
                <div><label className={labelClass}>Student ID <span className="text-red-500">*</span></label><input name="studentId" value={formData.studentId || ''} onChange={handleInputChange} className={inputClass} required /></div>
                <div><label className={labelClass}>Contact Number</label><input type="tel" name="contactInfo" value={formData.contactInfo || ''} onChange={handleInputChange} className={inputClass} /></div>
                <div><label className={labelClass}>Email Address</label><input type="email" name="email" value={formData.email || ''} onChange={handleInputChange} className={inputClass} /></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                <div>
                    <label className={labelClass}>Gender</label>
                    <select name="gender" value={formData.gender || ''} onChange={handleInputChange} className={inputClass}>
                        <option value="">Select...</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                    </select>
                </div>
                <div className="relative">
                    <label className={labelClass}>Birthdate</label>
                    <input type="date" name="birthdate" value={formData.birthdate || ''} onChange={handleInputChange} className={inputClass} />
                    {age !== null && <span className="absolute right-3 bottom-2 text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-1 rounded">{age} yrs old</span>}
                </div>
            </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                <div><label className={labelClass}>Year Level</label><select name="yearLevel" value={formData.yearLevel || ''} onChange={handleInputChange} className={inputClass}><option value="">Select...</option><option value="1st Year">1st Year</option><option value="2nd Year">2nd Year</option><option value="3rd Year">3rd Year</option><option value="4th Year">4th Year</option><option value="5th Year">5th Year</option></select></div>
                <div><label className={labelClass}>Section</label><select name="section" value={formData.section || ''} onChange={handleInputChange} className={inputClass}><option value="">Select...</option><option value="Section 1">Section 1</option><option value="Section 2">Section 2</option><option value="Section 3">Section 3</option><option value="Section 4">Section 4</option><option value="Section 5">Section 5</option><option value="Section 6">Section 6</option><option value="International">International</option><option value="N/A">N/A</option></select></div>
                <div><label className={labelClass}>Team</label><select name="teamId" value={formData.teamId || ''} onChange={handleInputChange} className={inputClass}><option value="">Select...</option>{teams.map(t => (<option key={t.id} value={t.id}>{t.name}</option>))}</select></div>
            </div>

            <div className="mt-4">
                <label htmlFor="bio" className={labelClass}>Bio</label>
                <textarea id="bio" name="bio" rows={3} value={formData.bio || ''} onChange={handleInputChange} className={inputClass} placeholder="Tell us something about yourself..." />
            </div>

            <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-4">Interested Events</h3>
                <div className="max-h-60 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg p-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {availableEvents.map(event => (
                        <label key={event.id} className="flex items-center space-x-3 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors">
                            <input type="checkbox" checked={formData.interestedEvents?.includes(event.name)} onChange={() => handleEventSelection(event.name)} className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>
                            <span className="text-sm text-slate-700 dark:text-slate-300">{event.name}</span>
                        </label>
                    ))}
                </div>
            </div>
        </Card>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
      <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-50">{canEdit ? 'My Profile' : `${profileUser.name}'s Profile`}</h1>
          {canEdit && (
            <div className="flex space-x-2">
                {isEditing ? (
                    <>
                      <Button variant="secondary" onClick={handleCancelEdit}>Cancel</Button>
                      <Button onClick={handleSave}>Save Changes</Button>
                    </>
                ) : null}
            </div>
          )}
      </div>
      {isEditing && canEdit ? renderEditMode() : renderViewMode()}
    </div>
  );
};

export default Profile;