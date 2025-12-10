
export enum MemberStatus {
  Active = 'Active',
  Warning = 'Warning',
  Critical = 'Critical',
  OnLeave = 'OnLeave'
}

export type TaskStatus = 'Todo' | 'InProgress' | 'Done';

export interface TaskDetail {
  id: string;
  title: string;
  dueDate: string;
  status: TaskStatus;
  progress: number; // 0-100
}

export interface FeedbackLog {
  id: string;
  date: string;
  type: 'Positive' | 'Constructive';
  content: string;
  // New: Member Response
  memberResponse?: {
    date: string;
    content: string;
    reaction: 'Thanks' | 'Fire' | 'Check' | 'Question'; 
  };
}

export interface SkillAssessment {
  skillName: string;
  selfReview: number; // 1-5
  leaderReview: number; // 1-5
}

export interface HistoricalEvaluation {
  year: number;
  performanceScore: number;
  leaderComment: string;
  strengthsKeywords: string[];
  skillSnapshot?: { skillName: string; score: number }[]; 
  majorTasks?: string[];
}

export interface LeaderSelfReview {
  listeningScore: number;   // 1-5
  questioningScore: number; // 1-5
  actionScore: number;      // 1-5
  feedback: string;         
}

export interface OneOnOneSession {
  id: string;
  date: string;     // YYYY-MM-DD
  time: string;     // HH:mm
  title: string;
  summary: string;
  strengthsMemo: string;
  developmentTasks: string;
  nextStepCheckpoint: string;
  isCompleted: boolean;
  selfReview?: LeaderSelfReview;
  sentQuestions?: string[]; // Added: Persist sent questions
}

export interface LeaderFeedback {
  id: string;
  date: string;
  scores: {
    vision: number;        
    decision: number;      
    execution: number;     
    coaching: number;      
    communication: number; 
    innovation: number;    
  };
  comment: string; 
}

export interface TeamMember {
  id: string;
  name: string;
  jobLevel: string; 
  jobName: string; 
  avgLeaderSkillScore: number; 
  role: string;
  avatar: string;
  status: MemberStatus;
  performanceScore: number; // 0-100
  happinessScore: number; // 0-100
  lastFeedbackDate: string;
  strengths: string[];
  areasForImprovement: string[];
  tasks: TaskDetail[]; 
  feedbackHistory: FeedbackLog[];
  skillAssessments: SkillAssessment[]; 
  historicalEvaluations: HistoricalEvaluation[];
  oneOnOneHistory: OneOnOneSession[];
  leaderFeedbacks: LeaderFeedback[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface SimulationMessage {
  id: string;
  role: 'leader' | 'member'; // leader = user, member = AI
  text: string;
}

export interface DashboardStat {
  label: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
}

export interface LearningResource {
  id: string;
  title: string;
  type: 'Article' | 'Book' | 'Video' | 'Course';
  author: string;
  description: string;
  tags: string[];
}

export enum ViewState {
  Dashboard = 'Dashboard',
  TaskFeedback = 'TaskFeedback',
  KPI = 'KPI',
  GrowthHub = 'GrowthHub',
  LeaderGuide = 'LeaderGuide', 
  CompanySync = 'CompanySync', 
  Settings = 'Settings',
  Calendar = 'Calendar',
}

export type RetrospectiveType = 'Keep' | 'Problem' | 'Try';

export interface RetrospectiveItem {
  id: string;
  type: RetrospectiveType;
  content: string;
  votes: number;
  author: string;
}

export interface RetrospectiveSession {
  id: string;
  title: string;
  date: string;
  status: 'InProgress' | 'Done';
  items: RetrospectiveItem[];
}

export interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  type: string;
  time?: string;
  description?: string;
  memberId?: string;
}
