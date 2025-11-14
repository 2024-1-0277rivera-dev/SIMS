import React from 'react';
import { Team } from '../types.ts';

// This component is DEPRECATED.
// The TeamHub logic has been moved directly into the Teams.tsx page
// to support the new master-detail layout. This component is kept
// to avoid breaking imports but it no longer does anything.

interface TeamDetailsModalProps {
  team: Team | null;
  isOpen: boolean;
  onClose: () => void;
}

const TeamDetailsModal: React.FC<TeamDetailsModalProps> = () => {
  return null;
};

export default TeamDetailsModal;