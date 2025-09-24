// Core data types for TalentFlow

export interface Job {
  id: string;
  title: string;
  slug: string;
  status: 'active' | 'archived';
  tags: string[];
  order: number;
  description?: string;
  department?: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  jobId: string;
  stage: CandidateStage;
  resumeUrl?: string;
  notes: Note[];
  appliedAt: string;
  updatedAt: string;
}

export type CandidateStage = 
  | 'applied' 
  | 'screen' 
  | 'tech' 
  | 'offer' 
  | 'hired' 
  | 'rejected';

export interface Note {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  mentions: string[];
  createdAt: string;
}

export interface CandidateTimeline {
  id: string;
  candidateId: string;
  type: 'stage_change' | 'note_added' | 'assessment_submitted';
  description: string;
  fromStage?: CandidateStage;
  toStage?: CandidateStage;
  metadata?: Record<string, any>;
  createdAt: string;
}

// Assessment types
export interface Assessment {
  id: string;
  jobId: string;
  title: string;
  description?: string;
  sections: AssessmentSection[];
  createdAt: string;
  updatedAt: string;
}

export interface AssessmentSection {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
  order: number;
}

export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  required: boolean;
  options?: QuestionOption[];
  validation?: QuestionValidation;
  conditionalLogic?: ConditionalLogic;
  order: number;
}

export type QuestionType = 
  | 'single_choice' 
  | 'multiple_choice' 
  | 'short_text' 
  | 'long_text' 
  | 'numeric' 
  | 'file_upload';

export interface QuestionOption {
  id: string;
  label: string;
  value: string;
  order: number;
}

export interface QuestionValidation {
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  pattern?: string;
}

export interface ConditionalLogic {
  dependsOn: string; // question ID
  condition: 'equals' | 'not_equals' | 'contains';
  value: string;
}

export interface AssessmentResponse {
  id: string;
  assessmentId: string;
  candidateId: string;
  answers: Record<string, any>;
  submittedAt: string;
  status: 'draft' | 'submitted';
}

// API response types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, any>;
}

// Filter types
export interface JobFilters {
  search?: string;
  status?: Job['status'];
  tags?: string[];
  page?: number;
  pageSize?: number;
  sort?: 'title' | 'createdAt' | 'order';
  order?: 'asc' | 'desc';
}

export interface CandidateFilters {
  search?: string;
  stage?: CandidateStage;
  jobId?: string;
  page?: number;
  pageSize?: number;
}

// User mentions for notes
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'recruiter' | 'interviewer';
}