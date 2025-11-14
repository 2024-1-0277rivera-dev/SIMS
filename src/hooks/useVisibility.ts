
import { useContext } from 'react';
import { VisibilityContext } from '../contexts/VisibilityContext.tsx';

export const useVisibility = () => {
  const context = useContext(VisibilityContext);
  if (context === undefined) {
    throw new Error('useVisibility must be used within a VisibilityProvider');
  }
  return context;
};