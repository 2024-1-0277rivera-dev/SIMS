import { useEffect, useRef } from 'react';
import { useAuth } from './useAuth';
// FIX: Correct import path for logActivity
import { logActivity } from '../services/api';

export const usePageViewLogger = (pageName: string) => {
    const { user } = useAuth();
    const hasLogged = useRef(false);

    useEffect(() => {
        if (user && !hasLogged.current) {
            logActivity(user.id, `viewed the ${pageName} page`);
            hasLogged.current = true;
        }
    }, [user, pageName]);
};