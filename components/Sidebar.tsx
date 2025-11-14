import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';

interface NavItemProps {
  to: string;
  icon: string;
  children: React.ReactNode;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, children, onClick }) => {
  const activeClass = "bg-indigo-600 text-white";
  const inactiveClass = "text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700";

  return (
    <li>
      <NavLink
        to={to}
        onClick={onClick}
        className={({ isActive }) => `${isActive ? activeClass : inactiveClass} flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold transition-colors`}
      >
        <i className={`${icon} text-lg w-6 text-center`}></i>
        <span>{children}</span>
      </NavLink>
    </li>
  );
};

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
    const { user, logout } = useAuth();
    const [showLogout, setShowLogout] = useState(false);
    const navigate = useNavigate();
    const logoutRef = useRef<HTMLDivElement>(null);
    
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
        if (window.innerWidth < 768) { // md breakpoint
            setIsOpen(false);
        }
    }

    const handleLogout = () => {
        logout();
        navigate('/login');
    }

    return (
        <>
            {/* Overlay for mobile */}
            <div 
                className={`fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsOpen(false)}
            ></div>

            <nav className={`fixed top-0 left-0 h-full bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 z-50 w-64 transform transition-transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 md:flex-shrink-0`}>
                <div className="p-4 flex flex-col h-full">
                    <div className="flex items-center gap-2 mb-8">
                        <div className="logo bg-indigo-600 text-white h-10 w-10 rounded-2xl flex items-center justify-center text-xl font-bold">S</div>
                        <div>
                            <div className="font-bold text-slate-800 dark:text-slate-100">SIMS</div>
                            <div className="text-slate-500 dark:text-slate-400 text-xs">Management System</div>
                        </div>
                    </div>

                    <ul className="flex flex-col gap-2">
                        <NavItem to="/dashboard" icon="bi bi-speedometer2" onClick={handleLinkClick}>Dashboard</NavItem>
                        <NavItem to="/leaderboard" icon="bi bi-bar-chart-line-fill" onClick={handleLinkClick}>Leaderboard</NavItem>
                        <NavItem to="/events" icon="bi bi-calendar-event-fill" onClick={handleLinkClick}>Events</NavItem>
                        <NavItem to="/rules" icon="bi bi-journal-text" onClick={handleLinkClick}>Rules & Regs</NavItem>
                        <NavItem to="/profile" icon="bi bi-person-fill" onClick={handleLinkClick}>Profile</NavItem>
                        {user?.role === UserRole.ADMIN && (
                            <NavItem to="/admin" icon="bi bi-shield-lock-fill" onClick={handleLinkClick}>Admin Panel</NavItem>
                        )}
                    </ul>

                    <div className="mt-auto" ref={logoutRef}>
                      <div className="relative">
                          {showLogout && (
                              <div className="absolute bottom-full left-0 w-full mb-2 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-50 overflow-hidden">
                                  <button 
                                      onClick={handleLogout} 
                                      className="w-full text-left px-4 py-3 text-sm text-red-600 dark:text-red-500 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 font-semibold"
                                  >
                                      <i className="bi bi-box-arrow-right text-lg"></i>
                                      <span>Log Out</span>
                                  </button>
                              </div>
                          )}
                          <div 
                               className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-700 cursor-pointer p-2 rounded-lg transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 -mx-2 mt-2"
                               onClick={() => setShowLogout(!showLogout)}
                          >
                               <img 
                                    style={{width: '40px', height: '40px'}} 
                                    src={user?.avatar} 
                                    className="rounded-full object-cover" 
                                    alt={user?.name}
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-sm text-slate-800 dark:text-slate-100 truncate">{user?.name}</div>
                                    <div className="text-slate-500 dark:text-slate-400 text-xs truncate">{user?.email}</div>
                                </div>
                                <i className="bi bi-three-dots-vertical text-slate-400"></i>
                           </div>
                       </div>
                    </div>
                </div>
            </nav>
        </>
    );
};

export default Sidebar;