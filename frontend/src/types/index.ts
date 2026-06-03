export interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin' | 'moderator';
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  first_name?: string;
  last_name?: string;
  bio?: string;
  avatar_url?: string;
  country?: string;
  city?: string;
  github_url?: string;
  linkedin_url?: string;
  website_url?: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  theme?: string;
  language?: string;
  email_notifications?: boolean;
}

export interface Problem {
  id: string;
  title: string;
  slug: string;
  description: string;
  input_format: string;
  output_format: string;
  constraints: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  difficulty_code?: string;
  topic?: string;
  status: 'draft' | 'published' | 'archived';
  time_limit_ms: number;
  memory_limit_mb: number;
  author_id: string;
  solve_count: number;
  attempt_count: number;
  rating: number;
  is_public: boolean;
  created_at: string;
}

export interface ProblemShort {
  id: string;
  title: string;
  slug: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  difficulty_code?: string;
  topic?: string;
  solve_count: number;
  rating: number;
}

export interface ProblemTag {
  id: string;
  name: string;
  slug: string;
}

export interface Submission {
  id: string;
  user_id: string;
  problem_id: string;
  contest_id?: string;
  language: string;
  status: SubmissionStatus;
  time_ms?: number;
  memory_mb?: number;
  score: number;
  error_message?: string;
  created_at: string;
}

export type SubmissionStatus =
  | 'pending' | 'running' | 'accepted' | 'wrong_answer'
  | 'time_limit' | 'memory_limit' | 'runtime_error'
  | 'compile_error' | 'system_error';

export interface Contest {
  id: string;
  title: string;
  slug: string;
  description: string;
  starts_at: string;
  ends_at: string;
  status: 'upcoming' | 'running' | 'finished';
  is_public: boolean;
  max_participants?: number;
  author_id: string;
  created_at: string;
}

export interface ContestStanding {
  id: string;
  contest_id: string;
  user_id: string;
  score: number;
  penalty: number;
  rank: number;
  updated_at: string;
}

export interface Duel {
  id: string;
  challenger_id: string;
  opponent_id?: string;
  problem_id: string;
  status: 'pending' | 'active' | 'finished' | 'cancelled';
  winner_id?: string;
  starts_at?: string;
  ends_at?: string;
  time_limit_minutes: number;
  created_at: string;
}

export interface Team {
  id: string;
  name: string;
  slug: string;
  description?: string;
  avatar_url?: string;
  owner_id: string;
  is_public: boolean;
  max_members: number;
  rating: number;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  contest_id?: string;
  duel_id?: string;
  content: string;
  is_deleted: boolean;
  created_at: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon?: string;
  points: number;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  earned_at: string;
  achievement?: Achievement;
}

export interface Rating {
  id: string;
  user_id: string;
  rating: number;
  delta: number;
  contest_id?: string;
  created_at: string;
}

export interface AIAnalysis {
  id: string;
  user_id: string;
  submission_id: string;
  analysis_type: string;
  result: string;
  tokens_used: number;
  created_at: string;
}

export interface AIHint {
  id: string;
  user_id: string;
  problem_id: string;
  submission_id?: string;
  hint_type: string;
  response_text: string;
  tokens_used: number;
  created_at: string;
}

export interface AlgorithmVisualization {
  id: string;
  title: string;
  algorithm_name: string;
  description?: string;
  steps_json?: string;
  author_id?: string;
  created_at: string;
}

export interface TrainingPlan {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}
