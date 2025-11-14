
export enum UserRole {
  USER = 'user',
  TEAM_LEAD = 'team_lead',
  OFFICER = 'officer',
  ADMIN = 'admin',
}

export interface User {
  id: string;
  name: string; // Kept for backward compatibility, derived from first+last
  email: string;
  role: UserRole;
  avatar: string;
  studentId?: string;
  bio?: string;
  teamId?: string;
  password?: string; // For mock auth only
  
  // New profile fields
  firstName?: string;
  middleName?: string;
  lastName?: string;
  contactInfo?: string;
  yearLevel?: string;
  section?: string;
  interestedEvents?: string[]; // Array of event names/ids
}

// New types for team details
export interface PointLog {
    id?: string;
    points: number;
    reason: string;
    updatedBy: string; // Name of officer/admin
    timestamp: string;
}

export interface Demerit extends PointLog {
    responsiblePerson?: string; // Name of the person who got the demerit
}

export interface Merit extends PointLog {}

export interface JudgeScore {
    criteria: string;
    score: number;
    maxScore: number;
}

// Updated to include detailed breakdown lists
export interface EventScore {
    eventId: string;
    eventName: string;
    placement: number;
    competitionPoints: number;
    rawScore: number; // Sum of criteria scores
    scores: JudgeScore[];
    meritAdjustment?: number;
    demeritAdjustment?: number;
    merits?: ScoreAdjustment[];
    demerits?: ScoreAdjustment[];
}

export interface PlacementStats {
  first: number;
  second: number;
  third: number;
  fourth: number;
  merits: number;
  demerits: number;
}

export interface ScoreHistoryPoint {
    date: string;
    score: number;
}

export interface Team {
  rank: number;
  id: string;
  name: string;
  score: number;
  wins: number;
  losses: number;
  playersCount: number;
  description?: string;
  merits?: Merit[];
  demerits?: Demerit[];
  eventScores?: EventScore[];
  scoreHistory?: number[]; // Old history format
  progressHistory?: ScoreHistoryPoint[]; // New history format for graphs
  
  // New leadership fields
  unitLeader?: string;
  unitSecretary?: string;
  unitTreasurer?: string;
  unitErrands?: string[];
  adviser?: string;
  placementStats?: PlacementStats;
}

export enum EventStatus {
  OPEN = 'open',
  CLOSED = 'closed',
  UPCOMING = 'upcoming',
  COMPLETED = 'completed'
}

export enum EventCategory {
  JOKER_FLAG = 'Joker Flag',
  CIT_QUEST = 'CIT Quest',
  MINDSCAPE = 'MindScape',
  HOOP_SPIKE = 'Hoop & Spike',
  CODING_TECH_CHALLENGES = 'Coding & Tech Challenges',
  PIXEL_PLAY = 'Pixel Play',
  TABLE_MASTERS = 'Table Masters'
}

export interface CriteriaItem {
  name: string;
  description: string;
  points: number;
}

// New interface for specific score adjustments
export interface ScoreAdjustment {
    name: string;
    description?: string;
    points: number;
    timestamp?: string;
    venue?: string;
}

export interface EventResult {
    teamId: string;
    criteriaScores: Record<string, number>; // Map criteria name -> score
    meritAdjustment: number;
    demeritAdjustment: number;
    merits?: ScoreAdjustment[]; // Detailed merit entries
    demerits?: ScoreAdjustment[]; // Detailed demerit entries
}

export interface Event {
  id: string;
  name: string;
  date: string;
  venue: string;
  description: string;
  mechanics: string;
  criteria: CriteriaItem[];
  status: EventStatus;
  category: EventCategory;
  officerInCharge: string;
  participantsInfo: string;
  judges: string[];
  competitionPoints: number;
  results?: EventResult[]; // Stores raw inputs for each team
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  link: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read?: boolean;
}
