import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  disableLayoutAnimation?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className = '', onClick, disableLayoutAnimation = false }) => {
  return (
    <motion.div
      layout={!disableLayoutAnimation}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`bg-white dark:bg-slate-800 rounded-2xl shadow-soft dark:shadow-soft-dark overflow-hidden transition-shadow duration-300 hover:shadow-lg dark:hover:shadow-indigo-500/20 ${className}`}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};

export default Card;
