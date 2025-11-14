
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth.ts';
import { useTheme } from '../hooks/useTheme.ts';
import { useNotification } from '../hooks/useNotification.ts';
import { useNavigate } from 'react-router-dom';
import { getEvents, getLeaderboard, getUsers } from '../services/api.ts';
import { Team, Event, User } from '../types.ts';

const Header: React.FC<{ onToggleSidebar: () => void }> = ({ onToggleSidebar }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ teams: Team[], events: Event[], users: User[] }>({ teams: [], events: [], users: [] });
  const [showResults, setShowResults] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      // Load initial data for search
      const loadData = async () => {
          try {
              const [fetchedTeams, fetchedEvents, fetchedUsers] = await Promise.all([getLeaderboard(), getEvents(), getUsers()]);
              setTeams(fetchedTeams);
              setEvents(fetchedEvents);
              setAllUsers(fetchedUsers);
          } catch (error) {
              console.error("Error loading search data", error);
          }
      }
      loadData();
      
      const handleClickOutside = (event: MouseEvent) => {
          if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
              setShowResults(false);
          }
          if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
              setShowNotifications(false);
          }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
      if (searchQuery.trim() === '') {
          setSearchResults({ teams: [], events: [], users: [] });
          return;
      }
      const lowerQuery = searchQuery.toLowerCase();
      const matchedTeams = teams.filter(t => t.name.toLowerCase().includes(lowerQuery));
      const matchedEvents = events.filter(e => e.name.toLowerCase().includes(lowerQuery));
      const matchedUsers = allUsers.filter(u => 
        u.name.toLowerCase().includes(lowerQuery) || 
        (u.studentId && u.studentId.toLowerCase().includes(lowerQuery))
      );
      setSearchResults({ teams: matchedTeams, events: matchedEvents, users: matchedUsers });
  }, [searchQuery, teams, events, allUsers]);

  const handleSearchResultClick = (type: 'team' | 'event' | 'user', id: string) => {
      setSearchQuery('');
      setShowResults(false);
      if (type === 'team') {
          navigate(`/leaderboard?teamId=${id}`);
      } else if (type === 'event') {
          navigate(`/events?eventId=${id}`);
      } else if (type === 'user') {
          navigate(`/profile/${id}`);
      }
  }

  const handleNotificationClick = (notificationId: string, link: string) => {
      markAsRead(notificationId);
      setShowNotifications(false);
      navigate(link);
  }
  
  const handleBellClick = () => {
      setShowNotifications(!showNotifications);
  }

  return (
    <header className="bg-white dark:bg-slate-800/80 backdrop-blur-sm shadow-soft dark:shadow-soft-dark z-30 p-4 relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onToggleSidebar} className="text-slate-600 dark:text-slate-300 md:hidden">
            <i className="bi bi-list text-2xl"></i>
          </button>
          <div>
            <h5 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-0 hidden sm:block">Welcome back, {user?.firstName || user?.name}! 👋</h5>
            <small className="text-slate-500 dark:text-slate-400 hidden sm:block">Here's a look at the current standings.</small>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative hidden md:block" ref={searchRef}>
            <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input 
              className="pl-9 pr-4 py-2 w-64 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 focus:outline-none transition" 
              placeholder="Search teams, events, users..." 
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setShowResults(true); }}
              onFocus={() => setShowResults(true)}
            />
            {showResults && searchQuery && (searchResults.teams.length > 0 || searchResults.events.length > 0 || searchResults.users.length > 0) && (
                <div className="absolute top-full mt-2 w-full bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden z-50">
                    {searchResults.teams.length > 0 && (
                        <div className="p-2">
                            <h6 className="text-xs font-bold text-slate-500 dark:text-slate-400 px-2 mb-1">TEAMS</h6>
                            <ul>
                                {searchResults.teams.slice(0, 3).map(team => (
                                    <li key={team.id} onClick={() => handleSearchResultClick('team', team.id)} className="px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg cursor-pointer transition-colors text-sm text-slate-700 dark:text-slate-200 flex justify-between">
                                        <span>{team.name}</span>
                                        <span className="text-xs text-slate-500">Rank #{team.rank}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {searchResults.events.length > 0 && (
                        <div className="p-2 border-t border-slate-100 dark:border-slate-700">
                            <h6 className="text-xs font-bold text-slate-500 dark:text-slate-400 px-2 mb-1">EVENTS</h6>
                             <ul>
                                {searchResults.events.slice(0, 3).map(event => (
                                    <li key={event.id} onClick={() => handleSearchResultClick('event', event.id)} className="px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg cursor-pointer transition-colors text-sm text-slate-700 dark:text-slate-200">
                                        <span>{event.name}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {searchResults.users.length > 0 && (
                        <div className="p-2 border-t border-slate-100 dark:border-slate-700">
                            <h6 className="text-xs font-bold text-slate-500 dark:text-slate-400 px-2 mb-1">USERS</h6>
                             <ul>
                                {searchResults.users.slice(0, 3).map(u => (
                                    <li key={u.id} onClick={() => handleSearchResultClick('user', u.id)} className="px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg cursor-pointer transition-colors text-sm text-slate-700 dark:text-slate-200 flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <img src={u.avatar} alt={u.name} className="h-6 w-6 rounded-full object-cover" />
                                            <span>{u.name}</span>
                                        </div>
                                        <span className="text-xs text-slate-500">{u.studentId}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
          </div>
          <button onClick={toggleTheme} className="p-2 h-10 w-10 flex items-center justify-center rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700">
            {theme === 'dark' ? <i className="bi bi-sun-fill text-lg"></i> : <i className="bi bi-moon-fill text-lg"></i>}
          </button>
          
          <div className="relative" ref={notificationRef}>
              <button onClick={handleBellClick} className="p-2 h-10 w-10 flex items-center justify-center rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 relative transition-colors">
                <i className="bi bi-bell-fill text-lg"></i>
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center border-2 border-white dark:border-slate-800">
                      {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              
              {showNotifications && (
                  <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50">
                      <div className="p-3 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                          <h6 className="font-bold text-slate-800 dark:text-slate-100">Notifications</h6>
                          {unreadCount > 0 && (
                              <button onClick={markAllAsRead} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">Mark all read</button>
                          )}
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                          {notifications.length === 0 ? (
                              <div className="p-4 text-center text-slate-500 dark:text-slate-400 text-sm">No notifications yet.</div>
                          ) : (
                              <ul>
                                  {notifications.map(notif => (
                                      <li key={notif.id} onClick={() => handleNotificationClick(notif.id, notif.link)} className={`p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors border-b border-slate-100 dark:border-slate-700/50 last:border-0 ${!notif.read ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''}`}>
                                          <div className="flex gap-3 items-start">
                                              <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${!notif.read ? 'bg-indigo-600' : 'bg-transparent'}`}></div>
                                              <div>
                                                  <h6 className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-tight mb-1">{notif.title}</h6>
                                                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{notif.message}</p>
                                                  <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">{new Date(notif.timestamp).toLocaleString()}</span>
                                              </div>
                                          </div>
                                      </li>
                                  ))}
                              </ul>
                          )}
                      </div>
                  </div>
              )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
