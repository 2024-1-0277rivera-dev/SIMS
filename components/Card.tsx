import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  return (
    <div
      className={`bg-white dark:bg-slate-800 rounded-2xl shadow-soft dark:shadow-soft-dark overflow-hidden transition-all duration-300 hover:shadow-lg dark:hover:shadow-indigo-500/20 ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;