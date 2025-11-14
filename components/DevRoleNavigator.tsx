import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';

const DevRoleNavigator: React.FC = () => {
  const { user, switchUserRole } = useAuth();
  const navigate = useNavigate();

  // This component should only be visible in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const handleRoleChangeAndNavigate = (role: UserRole) => {
    switchUserRole(role);
    // Navigate to a relevant page after role switch
    switch (role) {
      case UserRole.ADMIN:
        navigate('/admin');
        break;
      case UserRole.OFFICER:
        navigate('/events');
        break;
      case UserRole.TEAM_LEAD:
        navigate('/leaderboard');
        break;
      default:
        navigate('/profile');
    }
  };
  
  const roleButtons = [
    { role: UserRole.ADMIN, label: 'Admin' },
    { role: UserRole.OFFICER, label: 'Officer' },
    { role: UserRole.TEAM_LEAD, label: 'Team Lead' },
    { role: UserRole.USER, label: 'User' },
  ];

  return (
    <div className="fixed bottom-4 right-4 z-[100] bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-3 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
      <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-2 text-center">DEV Controls</h4>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 text-center">Current Role: <span className="font-bold capitalize">{user?.role?.replace('_', ' ')}</span></p>
      <div className="grid grid-cols-2 gap-2">
        {roleButtons.map(({ role, label }) => (
            <button
              key={role}
              onClick={() => handleRoleChangeAndNavigate(role)}
              className={`text-xs px-2 py-1 rounded-lg transition-colors font-semibold
                ${user?.role === role 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600'
                }`}
            >
              {label}
            </button>
        ))}
      </div>
    </div>
  );
};

export default DevRoleNavigator;
