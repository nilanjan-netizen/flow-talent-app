// React Query API hooks for TalentFlow
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  Job,
  Candidate,
  Assessment,
  AssessmentResponse,
  PaginatedResponse,
  JobFilters,
  CandidateFilters,
  CandidateTimeline
} from '@/types';

const API_BASE = '/api';

// Utility function to build query strings
const buildQueryString = (params: Record<string, any>) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  return searchParams.toString();
};

// Generic fetch function
const fetcher = async <T>(url: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
};

// Job API hooks
export const useJobs = (filters?: JobFilters) => {
  return useQuery({
    queryKey: ['jobs', filters],
    queryFn: () => {
      const queryString = filters ? buildQueryString(filters) : '';
      return fetcher<PaginatedResponse<Job>>(`/jobs?${queryString}`);
    },
  });
};

export const useCreateJob = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (jobData: Partial<Job>) =>
      fetcher<Job>('/jobs', {
        method: 'POST',
        body: JSON.stringify(jobData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
};

export const useUpdateJob = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Job> & { id: string }) =>
      fetcher<Job>(`/jobs/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
};

export const useReorderJob = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, fromOrder, toOrder }: { id: string; fromOrder: number; toOrder: number }) =>
      fetcher<Job>(`/jobs/${id}/reorder`, {
        method: 'PATCH',
        body: JSON.stringify({ fromOrder, toOrder }),
      }),
    onMutate: async ({ id, toOrder }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['jobs'] });

      // Snapshot previous value
      const previousJobs = queryClient.getQueryData(['jobs']);

      // Optimistically update
      queryClient.setQueryData(['jobs'], (old: any) => {
        if (!old?.data) return old;
        
        return {
          ...old,
          data: old.data.map((job: Job) =>
            job.id === id ? { ...job, order: toOrder } : job
          ).sort((a: Job, b: Job) => a.order - b.order)
        };
      });

      return { previousJobs };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousJobs) {
        queryClient.setQueryData(['jobs'], context.previousJobs);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
};

// Candidate API hooks
export const useCandidates = (filters?: CandidateFilters) => {
  return useQuery({
    queryKey: ['candidates', filters],
    queryFn: () => {
      const queryString = filters ? buildQueryString(filters) : '';
      return fetcher<PaginatedResponse<Candidate>>(`/candidates?${queryString}`);
    },
  });
};

export const useUpdateCandidate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Candidate> & { id: string }) =>
      fetcher<Candidate>(`/candidates/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
    },
  });
};

export const useCandidateTimeline = (candidateId: string) => {
  return useQuery({
    queryKey: ['candidate-timeline', candidateId],
    queryFn: () => fetcher<CandidateTimeline[]>(`/candidates/${candidateId}/timeline`),
    enabled: !!candidateId,
  });
};

// Assessment API hooks
export const useAssessment = (jobId: string) => {
  return useQuery({
    queryKey: ['assessment', jobId],
    queryFn: () => fetcher<Assessment | null>(`/assessments/${jobId}`),
    enabled: !!jobId,
  });
};

export const useSaveAssessment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ jobId, ...data }: Partial<Assessment> & { jobId: string }) =>
      fetcher<Assessment>(`/assessments/${jobId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['assessment', data.jobId] });
    },
  });
};

export const useSubmitAssessment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ jobId, ...data }: Partial<AssessmentResponse> & { jobId: string }) =>
      fetcher<AssessmentResponse>(`/assessments/${jobId}/submit`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessment-responses'] });
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
    },
  });
};

export const useAssessmentResponses = (filters?: { candidateId?: string; assessmentId?: string }) => {
  return useQuery({
    queryKey: ['assessment-responses', filters],
    queryFn: () => {
      const queryString = filters ? buildQueryString(filters) : '';
      return fetcher<AssessmentResponse[]>(`/assessment-responses?${queryString}`);
    },
  });
};

// Users API hooks
// Create candidate API hook
export const useCreateCandidate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (candidateData: Partial<Candidate>) =>
      fetcher<Candidate>('/candidates', {
        method: 'POST',
        body: JSON.stringify(candidateData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
    },
  });
};

// Users API hooks
export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => fetcher<any[]>('/users'),
  });
};