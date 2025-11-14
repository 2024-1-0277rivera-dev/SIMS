export const timeAgo = (timestamp: string): string => {
    const now = new Date();
    const secondsPast = (now.getTime() - new Date(timestamp).getTime()) / 1000;

    if (secondsPast < 60) {
        return 'just now';
    }
    if (secondsPast < 3600) {
        return `${Math.round(secondsPast / 60)}m ago`;
    }
    if (secondsPast <= 86400) {
        return `${Math.round(secondsPast / 3600)}h ago`;
    }
    const days = Math.round(secondsPast / 86400);
    if (days < 7) {
        return `${days}d ago`;
    }
    return new Date(timestamp).toLocaleDateString();
};
