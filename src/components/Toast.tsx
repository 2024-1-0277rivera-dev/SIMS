
import React, { useEffect } from 'react';
import { useToast } from '../hooks/useToast';

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

const Toast: React.FC<ToastMessage> = ({ id, message, type }) => {
  const { removeToast } = useToast();

  useEffect(() => {
    if (type !== 'error') {
      const timer = setTimeout(() => {
        removeToast(id);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [id, type, removeToast]);

  const baseClasses = 'flex items-center w-full max-w-xs p-4 mb-4 text-slate-500 bg-white rounded-2xl shadow-lg dark:text-slate-400 dark:bg-slate-800';
  const typeClasses = {
    success: 'bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-200',
    error: 'bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200',
    info: 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200',
  };
  const iconClasses = {
     success: 'text-green-500 bg-green-100 dark:bg-green-800 dark:text-green-200',
     error: 'text-red-500 bg-red-100 dark:bg-red-800 dark:text-red-200',
     info: 'text-blue-500 bg-blue-100 dark:bg-blue-800 dark:text-blue-200',
  }
  
  const Icon = () => {
      if (type === 'success') return <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>;
      if (type === 'error') return <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.607a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>;
      return <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path></svg>;
  }

  return (
    <div className={`${baseClasses} ${typeClasses[type]}`}>
      <div className={`inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg ${iconClasses[type]}`}>
        <Icon />
      </div>
      <div className="ml-3 text-sm font-normal">{message}</div>
      <button onClick={() => removeToast(id)} className="ml-auto -mx-1.5 -my-1.5 bg-white text-slate-400 hover:text-slate-900 rounded-lg focus:ring-2 focus:ring-slate-300 p-1.5 hover:bg-slate-100 inline-flex h-8 w-8 dark:text-slate-500 dark:hover:text-white dark:bg-slate-800 dark:hover:bg-slate-700">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.607a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
      </button>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
    const { toasts } = useToast();
    return (
        <div className="fixed top-5 right-5 z-50">
            {toasts.map((toast) => (
                <Toast key={toast.id} {...toast} />
            ))}
        </div>
    );
}
