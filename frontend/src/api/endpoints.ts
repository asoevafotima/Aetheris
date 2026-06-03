import api from './client';
import type {
  User, UserProfile, UserSettings, Problem, ProblemShort, ProblemTag,
  Submission, Contest, ContestStanding, Duel, Team, ChatMessage,
  Achievement, UserAchievement, Rating, AIAnalysis, AIHint,
  AlgorithmVisualization, TrainingPlan, Notification, TokenResponse,
} from '../types';

// Auth
export const authApi = {
  register: (data: { username: string; email: string; password: string }) =>
    api.post<User>('/auth/register', data).then(r => r.data),
  login: (data: { email: string; password: string }) =>
    api.post<TokenResponse>('/auth/login', data).then(r => r.data),
  logout: (refresh_token: string) =>
    api.post('/auth/logout', { refresh_token }),
};

// Users
export const usersApi = {
  me: () => api.get<User>('/users/me').then(r => r.data),
  getById: (id: string) => api.get<User>(`/users/${id}`).then(r => r.data),
  list: (skip = 0, limit = 50) =>
    api.get<User[]>('/users/', { params: { skip, limit } }).then(r => r.data),
  updateMe: (data: Partial<User>) =>
    api.patch<User>('/users/me', data).then(r => r.data),
  deleteMe: () => api.delete('/users/me'),
};

// Profiles
export const profilesApi = {
  me: () => api.get<UserProfile>('/profiles/me').then(r => r.data),
  getById: (userId: string) =>
    api.get<UserProfile>(`/profiles/${userId}`).then(r => r.data),
  updateMe: (data: Partial<UserProfile>) =>
    api.patch<UserProfile>('/profiles/me', data).then(r => r.data),
};

// Settings
export const settingsApi = {
  me: () => api.get<UserSettings>('/settings/me').then(r => r.data),
  update: (data: Partial<UserSettings>) =>
    api.patch<UserSettings>('/settings/me', data).then(r => r.data),
};

// Problems
export const problemsApi = {
  list: (params?: { skip?: number; limit?: number; difficulty?: string; topic?: string; difficulty_code?: string }) =>
    api.get<ProblemShort[]>('/problems/', { params }).then(r => r.data),
  get: (slug: string) => api.get<Problem>(`/problems/${slug}`).then(r => r.data),
  create: (data: Partial<Problem>) =>
    api.post<Problem>('/problems/', data).then(r => r.data),
  update: (id: string, data: Partial<Problem>) =>
    api.patch<Problem>(`/problems/${id}`, data).then(r => r.data),
  delete: (id: string) => api.delete(`/problems/${id}`),
};

// Test Cases
export const testCasesApi = {
  forProblem: (problemId: string) =>
    api.get(`/test-cases/problem/${problemId}/all`).then(r => r.data),
  create: (data: { problem_id: string; input_data: string; expected_output: string; is_sample?: boolean; order_num?: number; score?: number }) =>
    api.post(`/test-cases/`, data).then(r => r.data),
  update: (id: string, data: Partial<{ input_data: string; expected_output: string; is_sample: boolean; order_num: number; score: number }>) =>
    api.patch(`/test-cases/${id}`, data).then(r => r.data),
  delete: (id: string) => api.delete(`/test-cases/${id}`),
};

// Tags
export const tagsApi = {
  list: () => api.get<ProblemTag[]>('/tags/').then(r => r.data),
  getTagsForProblem: (problemId: string) =>
    api.get<{ id: string; problem_id: string; tag_id: string }[]>(
      `/problem-tag-map/problem/${problemId}`
    ).then(r => r.data),
};

// Submissions
export const submissionsApi = {
  submit: (data: { problem_id: string; language: string; code: string; contest_id?: string }) =>
    api.post<Submission>('/submissions/', data).then(r => r.data),
  me: (skip = 0, limit = 20) =>
    api.get<Submission[]>('/submissions/me', { params: { skip, limit } }).then(r => r.data),
  get: (id: string) => api.get<Submission>(`/submissions/${id}`).then(r => r.data),
  byProblem: (problemId: string, skip = 0, limit = 20) =>
    api.get<Submission[]>(`/submissions/problem/${problemId}`, { params: { skip, limit } }).then(r => r.data),
};

// Contests
export const contestsApi = {
  list: (params?: { skip?: number; limit?: number; status?: string }) =>
    api.get<Contest[]>('/contests/', { params }).then(r => r.data),
  get: (slug: string) => api.get<Contest>(`/contests/${slug}`).then(r => r.data),
  create: (data: Partial<Contest>) =>
    api.post<Contest>('/contests/', data).then(r => r.data),
  update: (id: string, data: Partial<Contest>) =>
    api.patch<Contest>(`/contests/${id}`, data).then(r => r.data),
  register: (contestId: string) =>
    api.post(`/contest-participants/register/${contestId}`).then(r => r.data),
  unregister: (contestId: string) =>
    api.delete(`/contest-participants/unregister/${contestId}`),
  myRegistration: (contestId: string) =>
    api.get(`/contest-participants/me/${contestId}`).then(r => r.data).catch((e) => {
      if (e?.response?.status === 404) return null;
      throw e;
    }),
  participants: (contestId: string) =>
    api.get(`/contest-participants/${contestId}`).then(r => r.data),
  problems: (contestId: string) =>
    api.get(`/contest-problems/${contestId}`).then(r => r.data),
  standings: (contestId: string) =>
    api.get<ContestStanding[]>(`/contest-standings/${contestId}`).then(r => r.data),
  addProblem: (contestId: string, problemId: string, label?: string) =>
    api.post('/contest-problems/', { contest_id: contestId, problem_id: problemId, label }).then(r => r.data),
};

// Duels
export const duelsApi = {
  create: (data: { problem_id: string; time_limit_minutes?: number }) =>
    api.post<Duel>('/duels/', data).then(r => r.data),
  listActive: (skip = 0, limit = 20) =>
    api.get<Duel[]>('/duels/active', { params: { skip, limit } }).then(r => r.data),
  mine: (skip = 0, limit = 20) =>
    api.get<Duel[]>('/duels/me', { params: { skip, limit } }).then(r => r.data),
  get: (id: string) => api.get<Duel>(`/duels/${id}`).then(r => r.data),
  accept: (id: string) => api.post<Duel>(`/duels/${id}/accept`).then(r => r.data),
  cancel: (id: string) => api.post(`/duels/${id}/cancel`),
  invitations: () => api.get('/duel-invitations/me').then(r => r.data),
  invite: (data: object) => api.post('/duel-invitations/', data).then(r => r.data),
  acceptInvite: (id: string) => api.post(`/duel-invitations/${id}/accept`).then(r => r.data),
  declineInvite: (id: string) => api.post(`/duel-invitations/${id}/decline`).then(r => r.data),
};

// Teams
export const teamsApi = {
  list: (skip = 0, limit = 20) =>
    api.get<Team[]>('/teams/', { params: { skip, limit } }).then(r => r.data),
  get: (slug: string) => api.get<Team>(`/teams/${slug}`).then(r => r.data),
  create: (data: Partial<Team>) => api.post<Team>('/teams/', data).then(r => r.data),
  update: (id: string, data: Partial<Team>) =>
    api.patch<Team>(`/teams/${id}`, data).then(r => r.data),
  members: (teamId: string) =>
    api.get(`/team-members/${teamId}`).then(r => r.data),
  addMember: (teamId: string, userId: string) =>
    api.post(`/team-members/${teamId}/add`, { user_id: userId }).then(r => r.data),
  removeMember: (teamId: string, userId: string) =>
    api.delete(`/team-members/${teamId}/remove/${userId}`),
};

// Chat
export const chatApi = {
  send: (data: { content: string; contest_id?: string; duel_id?: string }) =>
    api.post<ChatMessage>('/chat/', data).then(r => r.data),
  contest: (contestId: string, skip = 0, limit = 50) =>
    api.get<ChatMessage[]>(`/chat/contest/${contestId}`, { params: { skip, limit } }).then(r => r.data),
  duel: (duelId: string, skip = 0, limit = 50) =>
    api.get<ChatMessage[]>(`/chat/duel/${duelId}`, { params: { skip, limit } }).then(r => r.data),
  delete: (id: string) => api.delete(`/chat/${id}`),
};

// AI
export const aiApi = {
  analyze: (data: { submission_id: string; analysis_type: string }) =>
    api.post<AIAnalysis>('/ai-analysis/', data).then(r => r.data),
  getAnalysis: (submissionId: string) =>
    api.get<AIAnalysis[]>(`/ai-analysis/submission/${submissionId}`).then(r => r.data),
  hint: (data: { problem_id: string; hint_type: string; submission_id?: string }) =>
    api.post<AIHint>('/ai-hints/', data).then(r => r.data),
  hints: (problemId: string) =>
    api.get<AIHint[]>(`/ai-hints/problem/${problemId}`).then(r => r.data),
};

// Ratings
export const ratingsApi = {
  me: (skip = 0, limit = 20) =>
    api.get<Rating[]>('/ratings/me', { params: { skip, limit } }).then(r => r.data),
  user: (userId: string, skip = 0, limit = 20) =>
    api.get<Rating[]>(`/ratings/${userId}`, { params: { skip, limit } }).then(r => r.data),
};

// Achievements
export const achievementsApi = {
  list: () => api.get<Achievement[]>('/achievements/').then(r => r.data),
  mine: () => api.get<UserAchievement[]>('/user-achievements/me').then(r => r.data),
  user: (userId: string) =>
    api.get<UserAchievement[]>(`/user-achievements/${userId}`).then(r => r.data),
};

// Notifications
export const notificationsApi = {
  list: (skip = 0, limit = 20) =>
    api.get<Notification[]>('/notifications/', { params: { skip, limit } }).then(r => r.data),
  unreadCount: () =>
    api.get<{ count: number }>('/notifications/unread-count').then(r => r.data),
  markRead: (id: string) => api.post(`/notifications/${id}/read`),
  markAllRead: () => api.post('/notifications/read-all'),
  delete: (id: string) => api.delete(`/notifications/${id}`),
};

// Follows
export const followsApi = {
  follow: (followingId: string) =>
    api.post('/follows/', { following_id: followingId }).then(r => r.data),
  unfollow: (followingId: string) => api.delete(`/follows/${followingId}`),
  following: () => api.get('/follows/following').then(r => r.data),
  followers: () => api.get('/follows/followers').then(r => r.data),
};

// Bookmarks
export const bookmarksApi = {
  list: () => api.get('/bookmarks/').then(r => r.data),
  add: (problemId: string) =>
    api.post('/bookmarks/', { problem_id: problemId }).then(r => r.data),
  remove: (problemId: string) => api.delete(`/bookmarks/${problemId}`),
};

// Visualizations
export const visApi = {
  list: () =>
    api.get<AlgorithmVisualization[]>('/visualizations/').then(r => r.data),
  get: (id: string) =>
    api.get<AlgorithmVisualization>(`/visualizations/${id}`).then(r => r.data),
};

// Training plans
export const trainingApi = {
  list: () => api.get<TrainingPlan[]>('/training-plans/').then(r => r.data),
  create: (data: Partial<TrainingPlan>) =>
    api.post<TrainingPlan>('/training-plans/', data).then(r => r.data),
  items: (planId: string) =>
    api.get(`/training-plan-items/plan/${planId}`).then(r => r.data),
};
