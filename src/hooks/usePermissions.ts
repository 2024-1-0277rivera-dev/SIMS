import { useAuth } from './useAuth.ts';
import { UserRole } from '../types.ts';
import { AMARANTH_JOKERS_TEAM_ID } from '../constants.ts';

export const usePermissions = () => {
    const { user } = useAuth();

    if (!user) {
        return {
            isLoggedIn: false,
            isAdmin: false,
            isOfficer: false,
            isTeamLead: false,
            isFacilitator: false,
            canManageUsers: false,
            canManageEvents: false,
            canEditScores: false,
            canManageContentVisibility: false,
            canViewAdminPanel: false,
            canManageTeamInfo: (_teamId?: string) => false,
            canManageRosters: (_teamId?: string) => false,
            canViewDemeritDetails: false,
        };
    }

    const isAdmin = user.role === UserRole.ADMIN;
    const isOfficer = user.role === UserRole.OFFICER;
    const isTeamLead = user.role === UserRole.TEAM_LEAD;
    const isFacilitator = user.teamId === AMARANTH_JOKERS_TEAM_ID;

    const canManageEvents = isAdmin || isOfficer || isFacilitator;
    const canEditScores = isAdmin || isFacilitator;
    
    const canManageTeamInfo = (teamId?: string) => {
        if (!teamId) return false;
        if (isAdmin || isFacilitator) return true;
        if ((isOfficer || isTeamLead) && user.teamId === teamId) return true;
        return false;
    }
    
    const canManageRosters = canManageTeamInfo;

    const canViewDemeritDetails = isAdmin || isOfficer;

    return {
        isLoggedIn: true,
        isAdmin,
        isOfficer,
        isTeamLead,
        isFacilitator,
        canManageUsers: isAdmin,
        canManageEvents,
        canEditScores,
        canManageContentVisibility: isAdmin,
        canViewAdminPanel: isAdmin,
        canManageTeamInfo,
        canManageRosters,
        canViewDemeritDetails,
    };
};