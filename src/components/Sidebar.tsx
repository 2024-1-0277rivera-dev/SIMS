import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.ts';
import { usePermissions } from '../hooks/usePermissions.ts';
import { useVisibility } from '../hooks/useVisibility.ts';

// --- SVG Icon Definitions ---
const IconDefs = () => (
  <svg width="0" height="0" style={{ position: 'absolute' }}>
    <defs>
      <linearGradient id="icon-grad-blue" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#60A5FA" />
        <stop offset="100%" stopColor="#2563EB" />
      </linearGradient>
      <linearGradient id="icon-grad-white" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="100%" stopColor="#E5E7EB" />
      </linearGradient>
      <filter id="soft-shadow" x="-40%" y="-40%" width="180%" height="180%">
        <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.2" />
      </filter>
    </defs>
  </svg>
);

// --- 3D Icon Components ---
const DashboardIcon: React.FC<{ isActive: boolean }> = ({ isActive }) => ( <svg viewBox="0 0 24 24" width="24" height="24" filter="url(#soft-shadow)"><path fill={isActive ? 'url(#icon-grad-white)' : 'url(#icon-grad-blue)'} d="M21.69,11.55C21.93,11.16 22,10.7 22,10.23C22,9.13 21.1,8.23 20,8.23C19.2,8.23 18.48,8.75 18.17,9.45L12.5,4.5L12.42,4.44C12.68,3.93 13,3.3 13,2.61C13,1.33 11.96,0.3 10.68,0.3C9.3,0.3 8.16,1.44 8.16,2.82C8.16,3.69 8.65,4.44 9.35,4.86L5.83,7.58C5.46,7.13 4.91,6.83 4.28,6.83C3.01,6.83 2,7.84 2,9.11C2,10.38 3.01,11.39 4.28,11.39C5.39,11.39 6.31,10.5 6.31,9.4C6.31,9.13 6.26,8.87 6.17,8.63L9.65,5.95C10.03,6.39 10.59,6.68 11.22,6.68C11.97,6.68 12.64,6.3 13.06,5.73L18.73,10.68L18.83,10.77C18.5,11.34 18.27,12.03 18.27,12.79C18.27,14.28 19.5,15.5 21,15.5C22.5,15.5 23.73,14.28 23.73,12.79C23.73,12.08 23.49,11.45 23.14,10.94L21.69,11.55Z" transform="translate(-1, 2.5) scale(0.9)"/></svg>);
const LeaderboardIcon: React.FC<{ isActive: boolean }> = ({ isActive }) => (<svg viewBox="0 0 24 24" width="24" height="24" filter="url(#soft-shadow)"><path fill={isActive ? 'url(#icon-grad-white)' : 'url(#icon-grad-blue)'} d="M3.5,21.5V9.5C3.5,9.22 3.72,9 4,9H8C8.28,9 8.5,9.22 8.5,9.5V21.5C8.5,21.78 8.28,22 8,22H4C3.72,22 3.5,21.78 3.5,21.5M10.5,21.5V3.5C10.5,3.22 10.72,3 11,3H15C15.28,3 15.5,3.22 15.5,3.5V21.5C15.5,21.78 15.28,22 15,22H11C10.72,22 10.5,21.78 10.5,21.5M17.5,21.5V14.5C17.5,14.22 17.72,14 18,14H22C22.28,14 22.5,14.22 22.5,14.5V21.5C22.5,21.78 22.28,22 22,22H18C17.72,22 17.5,21.78 17.5,21.5Z" transform="translate(-1.5, -0.5) scale(0.95)" /></svg>);
const TeamsIcon: React.FC<{ isActive: boolean }> = ({ isActive }) => (<svg viewBox="0 0 24 24" width="24" height="24" filter="url(#soft-shadow)"><path fill={isActive ? 'url(#icon-grad-white)' : 'url(#icon-grad-blue)'} d="M12,19.2C9.5,19.2 7.29,17.92 6,16C6.03,14 10,12.9 12,12.9C14,12.9 17.97,14 18,16C16.71,17.92 14.5,19.2 12,19.2M12,5A3,3 0 0,1 15,8A3,3 0 0,1 12,11A3,3 0 0,1 9,8A3,3 0 0,1 12,5M19.2,22C17.88,20.9 16.14,20 12,20C7.86,20 6.12,20.9 4.8,22H19.2M16,5A3,3 0 0,1 19,8A3,3 0 0,1 16,11C15.82,11 15.65,10.97 15.5,10.93C16.17,9.9 16.5,8.69 16.5,7.5C16.5,7.16 16.46,6.83 16.39,6.5C16.14,5.65 15.5,5 15.5,5C15.65,5.03 15.82,5 16,5M8,5C7.5,5 6.86,5.65 6.61,6.5C6.54,6.83 6.5,7.16 6.5,7.5C6.5,8.69 6.83,9.9 7.5,10.93C7.35,10.97 7.18,11 7,11A3,3 0 0,1 4,8A3,3 0 0,1 7,5C7.18,5 7.35,5.03 7.5,5C7.5,5 8,5 8,5Z" /></svg>);
const EventsIcon: React.FC<{ isActive: boolean }> = ({ isActive }) => (<svg viewBox="0 0 24 24" width="24" height="24" filter="url(#soft-shadow)"><path fill={isActive ? 'url(#icon-grad-white)' : 'url(#icon-grad-blue)'} d="M19,19H5V8H19M16,1V3H8V1H6V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3H18V1M17,12H12V17H17V12Z" /></svg>);
const RulesIcon: React.FC<{ isActive: boolean }> = ({ isActive }) => (<svg viewBox="0 0 24 24" width="24" height="24" filter="url(#soft-shadow)"><path fill={isActive ? 'url(#icon-grad-white)' : 'url(#icon-grad-blue)'} d="M14.5,12.5L16.5,14.5L14.5,16.5L12,14L9.5,16.5L7.5,14.5L9.5,12.5L7.5,10.5L9.5,8.5L12,11L14.5,8.5L16.5,10.5L14.5,12.5M18,3H6A2,2 0 0,0 4,5V19A2,2 0 0,0 6,21H18A2,2 0 0,0 20,19V5A2,2 0 0,0 18,3Z" /></svg>);
const ReportsIcon: React.FC<{ isActive: boolean }> = ({ isActive }) => (<svg viewBox="0 0 24 24" width="24" height="24" filter="url(#soft-shadow)"><path fill={isActive ? 'url(#icon-grad-white)' : 'url(#icon-grad-blue)'} d="M14.4,6L14,4H5V21H7V14H12.6L13,16H20V6H14.4Z" /></svg>);
const ProfileIcon: React.FC<{ isActive: boolean }> = ({ isActive }) => (<svg viewBox="0 0 24 24" width="24" height="24" filter="url(#soft-shadow)"><path fill={isActive ? 'url(#icon-grad-white)' : 'url(#icon-grad-blue)'} d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" /></svg>);
const AdminIcon: React.FC<{ isActive: boolean }> = ({ isActive }) => (<svg viewBox="0 0 24 24" width="24" height="24" filter="url(#soft-shadow)"><path fill={isActive ? 'url(#icon-grad-white)' : 'url(#icon-grad-blue)'} d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7A2.5,2.5 0 0,1 14.5,9.5A2.5,2.5 0 0,1 12,12A2.5,2.5 0 0,1 9.5,9.5A2.5,2.5 0 0,1 12,7M12,13C13.66,13 15,14.34 15,16V17H9V16C9,14.34 10.34,13 12,13Z" /></svg>);

interface NavItemProps {
  to: string;
  label: string;
  icon: React.ComponentType<{ isActive: boolean }>;
  onClick?: () => void;
  isCollapsed: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, label, icon: Icon, onClick, isCollapsed }) => {
  const activeClass = "bg-indigo-600 text-white shadow-lg";
  const inactiveClass = "text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700";

  return (
    <li className="relative group">
      <NavLink
        to={to}
        onClick={onClick}
        className={({ isActive }) => `${isActive ? activeClass : inactiveClass} flex items-center ${isCollapsed ? 'justify-center' : 'gap-4'} px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200`}
      >
        {({ isActive }) => (
          <>
            <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
              <Icon isActive={isActive} />
            </div>
            <span className={`whitespace-nowrap transition-all duration-200 ${isCollapsed ? 'w-0 opacity-0 overflow-hidden' : 'opacity-100'}`}>{label}</span>
          </>
        )}
      </NavLink>
      {isCollapsed && (
        <div className="absolute left-full ml-4 px-2 py-1 bg-slate-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
          {label}
        </div>
      )}
    </li>
  );
};

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    isCollapsed: boolean;
    setIsCollapsed: (isCollapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen, isCollapsed, setIsCollapsed }) => {
    const { user, logout } = useAuth();
    const { settings, isPrivileged } = useVisibility();
    const { canViewAdminPanel } = usePermissions();
    const [showLogout, setShowLogout] = useState(false);
    const navigate = useNavigate();
    const logoutRef = useRef<HTMLDivElement>(null);
    
    const navLinks = [
        { to: "/dashboard", icon: DashboardIcon, label: "Dashboard", visible: isPrivileged || settings.pages.dashboard },
        { to: "/leaderboard", icon: LeaderboardIcon, label: "Leaderboard", visible: isPrivileged || settings.pages.leaderboard },
        { to: "/teams", icon: TeamsIcon, label: "Teams", visible: isPrivileged || settings.pages.teams },
        { to: "/events", icon: EventsIcon, label: "Events", visible: isPrivileged || settings.pages.events },
        { to: "/rules", icon: RulesIcon, label: "Rules & Regs", visible: isPrivileged || settings.pages.rules },
        { to: "/reports", icon: ReportsIcon, label: "Reports", visible: isPrivileged || settings.pages.reports },
        { to: "/profile", icon: ProfileIcon, label: "Profile", visible: isPrivileged || settings.pages.profile },
        { to: "/admin", icon: AdminIcon, label: "Admin Panel", visible: canViewAdminPanel },
    ];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (logoutRef.current && !logoutRef.current.contains(event.target as Node)) {
                setShowLogout(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLinkClick = () => {
        if (window.innerWidth < 768) {
            setIsOpen(false);
        }
    }

    const handleLogout = () => {
        logout();
        navigate('/login');
    }
    
    if (!settings) return null;

    return (
        <>
            <IconDefs />
            <div 
                className={`fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsOpen(false)}
            ></div>

            <nav className={`fixed top-0 left-0 h-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-r border-slate-200 dark:border-slate-800 z-50 transform transition-all duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 md:flex-shrink-0 ${isCollapsed ? 'md:w-20' : 'md:w-64'}`}>
                <div className={`flex flex-col h-full transition-all duration-300 ${isCollapsed ? 'p-2' : 'p-4'}`}>
                    <div className={`flex items-center gap-3 mb-8 ${isCollapsed ? 'justify-center' : ''}`}>
                        <div className="logo bg-indigo-600 text-white h-10 w-10 rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0">S</div>
                        <div className={`overflow-hidden transition-all duration-200 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                            <div className="font-bold text-slate-800 dark:text-slate-100 whitespace-nowrap">SIMS</div>
                            <div className="text-slate-500 dark:text-slate-400 text-xs whitespace-nowrap">Management System</div>
                        </div>
                    </div>

                    <ul className="flex flex-col gap-2 flex-grow">
                       {navLinks.filter(l => l.visible).map(link => (
                           <NavItem key={link.to} {...link} onClick={handleLinkClick} isCollapsed={isCollapsed} />
                       ))}
                    </ul>

                    <div className="flex-shrink-0 space-y-2">
                        <button 
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="w-full hidden md:flex items-center justify-center h-10 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                           <i className={`bi ${isCollapsed ? 'bi-chevron-double-right' : 'bi-chevron-double-left'}`}></i>
                        </button>
                        <div className="relative" ref={logoutRef}>
                            {showLogout && (
                                <div className="absolute bottom-full left-0 w-full mb-2 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-50 overflow-hidden">
                                    <button 
                                        onClick={handleLogout} 
                                        className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-500 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-3 font-semibold"
                                    >
                                        <i className="bi bi-box-arrow-right text-lg"></i>
                                        <span>Log Out</span>
                                    </button>
                                </div>
                            )}
                            <div 
                                className={`flex items-center pt-2 border-t border-slate-200 dark:border-slate-800 cursor-pointer p-2 rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/50 -mx-2 mt-2 ${isCollapsed ? 'justify-center' : 'gap-3'}`}
                                onClick={() => setShowLogout(!showLogout)}
                            >
                                <img 
                                    src={user?.avatar} 
                                    className="rounded-full object-cover w-10 h-10 flex-shrink-0" 
                                    alt={user?.name}
                                />
                                <div className={`flex-1 min-w-0 overflow-hidden transition-all duration-200 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                                    <div className="font-semibold text-sm text-slate-800 dark:text-slate-100 truncate whitespace-nowrap">{user?.name}</div>
                                    <div className="text-slate-500 dark:text-slate-400 text-xs truncate whitespace-nowrap">{user?.email}</div>
                                </div>
                                <div className={`transition-all duration-200 ${isCollapsed ? 'w-0 opacity-0' : 'opacity-100'}`}>
                                   <i className="bi bi-three-dots-vertical text-slate-400"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </>
    );
};

// FIX: Add missing default export
export default Sidebar;
