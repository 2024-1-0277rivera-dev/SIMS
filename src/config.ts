

export const TEAM_STYLES: { [key: string]: { gradient: { from: string; to: string; glow: string }; color: string; icon: string; } } = {
    't1': { gradient: { from: '#4b5563', to: '#111827', glow: 'rgba(55, 65, 81, 0.6)' }, color: 'slate-800', icon: 'bi bi-suit-spade-fill' },   // Spades -> Black/Gray
    't2': { gradient: { from: '#f43f5e', to: '#ef4444', glow: 'rgba(239, 68, 68, 0.6)' }, color: 'red-500', icon: 'bi bi-suit-heart-fill' },   // Hearts -> Red
    't3': { gradient: { from: '#22c55e', to: '#10b981', glow: 'rgba(34, 197, 94, 0.6)' }, color: 'green-500', icon: 'bi bi-suit-club-fill' },   // Clovers -> Green
    't4': { gradient: { from: '#3b82f6', to: '#0ea5e9', glow: 'rgba(59, 130, 246, 0.6)' }, color: 'blue-500', icon: 'bi bi-suit-diamond-fill' },  // Diamonds -> Blue
    't5': { gradient: { from: '#ec4899', to: '#a855f7', glow: 'rgba(217, 70, 239, 0.6)' }, color: 'purple-500', icon: 'bi bi-incognito' }, // Jokers -> Pink/Violet
};

export const getTeamStyles = (teamId?: string) => {
    if (teamId && TEAM_STYLES[teamId]) {
        return TEAM_STYLES[teamId];
    }
    // Default style
    return { gradient: { from: '#6b7280', to: '#4b5563', glow: 'rgba(107, 114, 128, 0.6)' }, color: 'gray-500', icon: 'bi bi-question-circle-fill' };
};