// MirageJS server setup for API simulation
import { createServer, Model, Factory, Response } from 'miragejs';
import { v4 as uuidv4 } from 'uuid';
import type { 
  Job, 
  Candidate, 
  Assessment, 
  AssessmentResponse, 
  CandidateTimeline,
  User,
  CandidateStage
} from '@/types';
import {
  jobStorage,
  candidateStorage,
  assessmentStorage,
  assessmentResponseStorage,
  timelineStorage,
  userStorage
} from './storage';

// Helper to simulate network latency (200-1200ms)
const delay = () => Math.random() * 1000 + 200;

// Helper to simulate occasional errors (5-10% error rate)
const shouldError = () => Math.random() < 0.075; // 7.5% error rate

// Generate slug from title
const generateSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

// Seed data generators
const generateJobs = (): Job[] => {
  const titles = [
    'Senior Frontend Developer',
    'Product Manager', 
    'UX/UI Designer',
    'DevOps Engineer',
    'Data Scientist',
    'Backend Developer',
    'Mobile Developer',
    'Technical Writer',
    'Marketing Manager',
    'Sales Representative',
    'Customer Success Manager',
    'Quality Assurance Engineer',
    'Security Engineer',
    'Full Stack Developer',
    'Business Analyst',
    'Project Manager',
    'Content Creator',
    'HR Specialist',
    'Finance Manager',
    'Operations Coordinator',
    'Machine Learning Engineer',
    'Cloud Architect',
    'Database Administrator',
    'Site Reliability Engineer',
    'Growth Hacker'
  ];

  const departments = ['Engineering', 'Product', 'Design', 'Marketing', 'Sales', 'Operations'];
  const locations = ['Remote', 'San Francisco', 'New York', 'London', 'Berlin', 'Toronto'];
  const tagOptions = ['React', 'TypeScript', 'Node.js', 'Python', 'AWS', 'Docker', 'Kubernetes', 'SQL', 'NoSQL', 'GraphQL'];

  return titles.slice(0, 25).map((title, index) => ({
    id: uuidv4(),
    title,
    slug: generateSlug(title),
    status: Math.random() > 0.3 ? 'active' as const : 'archived' as const,
    tags: tagOptions.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 4) + 1),
    order: index,
    department: departments[Math.floor(Math.random() * departments.length)],
    location: locations[Math.floor(Math.random() * locations.length)],
    description: `We are looking for a talented ${title} to join our growing team...`,
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  }));
};

const generateCandidates = (jobs: Job[]): Candidate[] => {
  const firstNames = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Avery', 'Quinn', 'Blake', 'Sage'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
  const stages: CandidateStage[] = ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected'];
  
  const candidates: Candidate[] = [];
  
  // Generate exactly 1000 candidates
  for (let i = 0; i < 1000; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const job = jobs[Math.floor(Math.random() * jobs.length)];
    
    candidates.push({
      id: uuidv4(),
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
      phone: `+1 (555) ${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      jobId: job.id,
      stage: stages[Math.floor(Math.random() * stages.length)],
      notes: [],
      appliedAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
  
  return candidates;
};

const generateUsers = (): User[] => {
  return [
    {
      id: 'user-1',
      name: 'Sarah Chen',
      email: 'sarah.chen@company.com',
      role: 'admin'
    },
    {
      id: 'user-2',
      name: 'Mike Rodriguez',
      email: 'mike.rodriguez@company.com',
      role: 'recruiter'
    },
    {
      id: 'user-3',
      name: 'Emma Thompson',
      email: 'emma.thompson@company.com',
      role: 'interviewer'
    },
    {
      id: 'user-4',
      name: 'David Kim',
      email: 'david.kim@company.com',
      role: 'recruiter'
    }
  ];
};

const generateAssessments = (jobs: Job[]): Assessment[] => {
  const assessmentTemplates = [
    {
      title: 'Technical Skills Assessment',
      sections: [
        {
          title: 'Programming Experience',
          questions: [
            { type: 'single_choice', title: 'Years of experience with React?', options: ['0-1', '2-3', '4-5', '6+'], required: true },
            { type: 'multiple_choice', title: 'Which technologies have you used?', options: ['TypeScript', 'Node.js', 'GraphQL', 'AWS'], required: false },
            { type: 'long_text', title: 'Describe your most challenging project', required: true },
            { type: 'single_choice', title: 'Preferred development environment?', options: ['VS Code', 'WebStorm', 'Vim', 'Other'], required: true },
            { type: 'numeric', title: 'How many years of total programming experience?', required: true },
            { type: 'short_text', title: 'Primary programming language?', required: true },
          ]
        },
        {
          title: 'Problem Solving',
          questions: [
            { type: 'long_text', title: 'Describe how you would approach debugging a performance issue', required: true },
            { type: 'single_choice', title: 'Preferred testing approach?', options: ['Unit tests', 'Integration tests', 'E2E tests', 'All of the above'], required: true },
            { type: 'multiple_choice', title: 'Which design patterns have you used?', options: ['Observer', 'Factory', 'Singleton', 'MVC'], required: false },
            { type: 'short_text', title: 'Favorite development tool?', required: false },
            { type: 'long_text', title: 'Explain a complex technical concept to a non-technical person', required: true },
          ]
        }
      ]
    },
    {
      title: 'Culture Fit Assessment',
      sections: [
        {
          title: 'Work Style',
          questions: [
            { type: 'single_choice', title: 'Preferred work environment?', options: ['Remote', 'Office', 'Hybrid'], required: true },
            { type: 'short_text', title: 'What motivates you at work?', required: true },
            { type: 'single_choice', title: 'Team size preference?', options: ['Small (2-5)', 'Medium (6-10)', 'Large (10+)'], required: false },
            { type: 'multiple_choice', title: 'Communication preferences?', options: ['Slack', 'Email', 'Video calls', 'In-person'], required: false },
            { type: 'long_text', title: 'Describe your ideal workday', required: true },
            { type: 'numeric', title: 'Preferred hours per week?', required: false },
          ]
        },
        {
          title: 'Values & Goals',
          questions: [
            { type: 'long_text', title: 'What are your career goals for the next 2 years?', required: true },
            { type: 'single_choice', title: 'Learning style preference?', options: ['Self-directed', 'Mentorship', 'Formal training', 'Peer learning'], required: true },
            { type: 'short_text', title: 'Most important workplace value?', required: true },
            { type: 'multiple_choice', title: 'Interests outside of work?', options: ['Sports', 'Reading', 'Travel', 'Music', 'Gaming'], required: false },
            { type: 'long_text', title: 'Why do you want to work here?', required: true },
          ]
        }
      ]
    },
    {
      title: 'Leadership & Communication Assessment',
      sections: [
        {
          title: 'Leadership Experience',
          questions: [
            { type: 'single_choice', title: 'Have you led a team before?', options: ['Yes, formally', 'Yes, informally', 'No, but interested', 'No preference'], required: true },
            { type: 'long_text', title: 'Describe a challenging team situation you handled', required: true },
            { type: 'multiple_choice', title: 'Leadership qualities you possess?', options: ['Empathy', 'Vision', 'Decisiveness', 'Communication'], required: false },
            { type: 'short_text', title: 'Preferred leadership style?', required: false },
            { type: 'numeric', title: 'Largest team size you\'ve managed?', required: false },
          ]
        },
        {
          title: 'Communication Skills',
          questions: [
            { type: 'long_text', title: 'How do you handle conflict resolution?', required: true },
            { type: 'single_choice', title: 'Presentation comfort level?', options: ['Very comfortable', 'Somewhat comfortable', 'Uncomfortable', 'Terrified'], required: true },
            { type: 'multiple_choice', title: 'Communication strengths?', options: ['Written', 'Verbal', 'Visual', 'Non-verbal'], required: false },
            { type: 'short_text', title: 'How do you give feedback?', required: true },
            { type: 'long_text', title: 'Describe a time you had to explain a complex idea', required: true },
            { type: 'single_choice', title: 'Meeting preference?', options: ['Short & frequent', 'Long & detailed', 'As needed', 'Avoid when possible'], required: false },
          ]
        }
      ]
    }
  ];

  return jobs.slice(0, 3).map((job, index) => {
    const template = assessmentTemplates[index % assessmentTemplates.length];
    return {
      id: uuidv4(),
      jobId: job.id,
      title: template.title,
      description: `Assessment for ${job.title} position`,
      sections: template.sections.map((section, sIndex) => ({
        id: uuidv4(),
        title: section.title,
        order: sIndex,
        questions: section.questions.map((q, qIndex) => ({
          id: uuidv4(),
          type: q.type as any,
          title: q.title,
          required: q.required || false,
          options: q.options?.map((opt, oIndex) => ({
            id: uuidv4(),
            label: opt,
            value: opt.toLowerCase().replace(/\s+/g, '_'),
            order: oIndex
          })),
          order: qIndex
        }))
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  });
};

// Initialize data on startup
const initializeData = async () => {
  // Check if data already exists
  const existingJobs = await jobStorage.getAll();
  
  if (existingJobs.length === 0) {
    // Generate seed data
    const jobs = generateJobs();
    const candidates = generateCandidates(jobs);
    const users = generateUsers();
    const assessments = generateAssessments(jobs);

    // Store seed data
    await jobStorage.setAll(jobs);
    await candidateStorage.setAll(candidates);
    await userStorage.setAll(users);
    await assessmentStorage.setAll(assessments);
    await timelineStorage.setAll([]);
    await assessmentResponseStorage.setAll([]);

    console.log('🌱 Seed data created:', {
      jobs: jobs.length,
      candidates: candidates.length,
      users: users.length,
      assessments: assessments.length
    });
  }
};

export const setupMirageServer = () => {
  // Initialize data before starting server
  initializeData();

  return createServer({
    models: {
      job: Model,
      candidate: Model,
      assessment: Model,
      assessmentResponse: Model,
      candidateTimeline: Model,
      user: Model
    },

    factories: {
      job: Factory.extend({}),
      candidate: Factory.extend({}),
    },

    routes() {
      this.namespace = '/api';
      this.timing = delay();

      // Jobs endpoints
      this.get('/jobs', async (schema, request) => {
        if (shouldError()) {
          return new Response(500, {}, { message: 'Server error occurred' });
        }

        const jobs: Job[] = await jobStorage.getAll();
        const queryParams = request.queryParams;
        const search = typeof queryParams.search === 'string' ? queryParams.search : '';
        const status = typeof queryParams.status === 'string' ? queryParams.status : '';
        const page = typeof queryParams.page === 'string' ? parseInt(queryParams.page) : 1;
        const pageSize = typeof queryParams.pageSize === 'string' ? parseInt(queryParams.pageSize) : 10;
        const sort = typeof queryParams.sort === 'string' ? queryParams.sort : 'order';
        const order = typeof queryParams.order === 'string' ? queryParams.order : 'asc';

        let filtered = jobs;

        // Apply filters
        if (search) {
          filtered = filtered.filter(job => 
            job.title.toLowerCase().includes(search.toLowerCase()) ||
            job.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
          );
        }

        if (status) {
          filtered = filtered.filter(job => job.status === status);
        }

        // Apply sorting
        filtered.sort((a, b) => {
          const aValue = (a as any)[sort];
          const bValue = (b as any)[sort];
          const modifier = order === 'desc' ? -1 : 1;
          
          if (typeof aValue === 'string') {
            return aValue.localeCompare(bValue) * modifier;
          }
          return (aValue - bValue) * modifier;
        });

        // Apply pagination
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedJobs = filtered.slice(startIndex, endIndex);

        return {
          data: paginatedJobs,
          total: filtered.length,
          page: page,
          pageSize: pageSize,
          totalPages: Math.ceil(filtered.length / pageSize)
        };
      });

      this.post('/jobs', async (schema, request) => {
        if (shouldError()) {
          return new Response(500, {}, { message: 'Failed to create job' });
        }

        const attrs = JSON.parse(request.requestBody);
        const jobs: Job[] = await jobStorage.getAll();
        
        // Check for unique slug
        const existingSlug = jobs.find(job => job.slug === generateSlug(attrs.title));
        if (existingSlug) {
          return new Response(400, {}, { message: 'Job with this title already exists' });
        }

        const newJob: Job = {
          id: uuidv4(),
          title: attrs.title,
          slug: generateSlug(attrs.title),
          status: attrs.status || 'active',
          tags: attrs.tags || [],
          order: jobs.length,
          department: attrs.department,
          location: attrs.location,
          description: attrs.description,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        jobs.push(newJob);
        await jobStorage.setAll(jobs);

        return newJob;
      });

      this.patch('/jobs/:id', async (schema, request) => {
        if (shouldError()) {
          return new Response(500, {}, { message: 'Failed to update job' });
        }

        const { id } = request.params;
        const attrs = JSON.parse(request.requestBody);
        const jobs: Job[] = await jobStorage.getAll();
        
        const jobIndex = jobs.findIndex(job => job.id === id);
        if (jobIndex === -1) {
          return new Response(404, {}, { message: 'Job not found' });
        }

        jobs[jobIndex] = {
          ...jobs[jobIndex],
          ...attrs,
          updatedAt: new Date().toISOString()
        };

        await jobStorage.setAll(jobs);
        return jobs[jobIndex];
      });

      this.patch('/jobs/:id/reorder', async (schema, request) => {
        // Occasionally return error to test rollback
        if (shouldError()) {
          return new Response(500, {}, { message: 'Reorder failed - server error' });
        }

        const { id } = request.params;
        const { fromOrder, toOrder } = JSON.parse(request.requestBody);
        const jobs: Job[] = await jobStorage.getAll();
        
        const jobIndex = jobs.findIndex(job => job.id === id);
        if (jobIndex === -1) {
          return new Response(404, {}, { message: 'Job not found' });
        }

        jobs[jobIndex].order = toOrder;
        jobs[jobIndex].updatedAt = new Date().toISOString();

        await jobStorage.setAll(jobs);
        return jobs[jobIndex];
      });

      // Candidates endpoints
      this.get('/candidates', async (schema, request) => {
        if (shouldError()) {
          return new Response(500, {}, { message: 'Server error occurred' });
        }

        const candidates: Candidate[] = await candidateStorage.getAll();
        const queryParams = request.queryParams;
        const search = typeof queryParams.search === 'string' ? queryParams.search : '';
        const stage = typeof queryParams.stage === 'string' ? queryParams.stage : '';
        const jobId = typeof queryParams.jobId === 'string' ? queryParams.jobId : '';
        const page = typeof queryParams.page === 'string' ? parseInt(queryParams.page) : 1;
        const pageSize = typeof queryParams.pageSize === 'string' ? parseInt(queryParams.pageSize) : 50;

        let filtered = candidates;

        // Apply filters
        if (search) {
          filtered = filtered.filter(candidate => 
            candidate.name.toLowerCase().includes(search.toLowerCase()) ||
            candidate.email.toLowerCase().includes(search.toLowerCase())
          );
        }

        if (stage) {
          filtered = filtered.filter(candidate => candidate.stage === stage);
        }

        if (jobId) {
          filtered = filtered.filter(candidate => candidate.jobId === jobId);
        }

        // Apply pagination
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedCandidates = filtered.slice(startIndex, endIndex);

        return {
          data: paginatedCandidates,
          total: filtered.length,
          page: page,
          pageSize: pageSize,
          totalPages: Math.ceil(filtered.length / pageSize)
        };
      });

      // Create candidate
      this.post('/candidates', async (schema, request) => {
        if (shouldError()) {
          return new Response(500, {}, { message: 'Server error occurred' });
        }

        const attrs = JSON.parse(request.requestBody);
        const candidates: Candidate[] = await candidateStorage.getAll();
        
        const newCandidate: Candidate = {
          id: `candidate-${Date.now()}`,
          name: attrs.name,
          email: attrs.email,
          jobId: attrs.jobId,
          stage: attrs.stage || 'applied',
          notes: [],
          appliedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ...attrs
        };

        candidates.push(newCandidate);
        await candidateStorage.setAll(candidates);
        
        return newCandidate;
      });

      this.patch('/candidates/:id', async (schema, request) => {
        if (shouldError()) {
          return new Response(500, {}, { message: 'Failed to update candidate' });
        }

        const { id } = request.params;
        const attrs = JSON.parse(request.requestBody);
        const candidates: Candidate[] = await candidateStorage.getAll();
        
        const candidateIndex = candidates.findIndex(candidate => candidate.id === id);
        if (candidateIndex === -1) {
          return new Response(404, {}, { message: 'Candidate not found' });
        }

        const oldCandidate = candidates[candidateIndex];
        candidates[candidateIndex] = {
          ...oldCandidate,
          ...attrs,
          updatedAt: new Date().toISOString()
        };

        await candidateStorage.setAll(candidates);

        // Add timeline entry for stage changes
        if (attrs.stage && attrs.stage !== oldCandidate.stage) {
          const timeline: CandidateTimeline[] = await timelineStorage.getAll();
          timeline.push({
            id: uuidv4(),
            candidateId: id,
            type: 'stage_change',
            description: `Moved from ${oldCandidate.stage} to ${attrs.stage}`,
            fromStage: oldCandidate.stage,
            toStage: attrs.stage,
            createdAt: new Date().toISOString()
          });
          await timelineStorage.setAll(timeline);
        }

        return candidates[candidateIndex];
      });

      this.get('/candidates/:id/timeline', async (schema, request) => {
        const { id } = request.params;
        const timeline: CandidateTimeline[] = await timelineStorage.getAll();
        return timeline.filter(entry => entry.candidateId === id);
      });

      // Assessment endpoints
      this.get('/assessments/:jobId', async (schema, request) => {
        const { jobId } = request.params;
        const assessments: Assessment[] = await assessmentStorage.getAll();
        return assessments.find(assessment => assessment.jobId === jobId) || null;
      });

      this.put('/assessments/:jobId', async (schema, request) => {
        if (shouldError()) {
          return new Response(500, {}, { message: 'Failed to save assessment' });
        }

        const { jobId } = request.params;
        const assessmentData = JSON.parse(request.requestBody);
        const assessments: Assessment[] = await assessmentStorage.getAll();
        
        const existingIndex = assessments.findIndex(a => a.jobId === jobId);
        
        const assessment: Assessment = {
          ...assessmentData,
          id: assessmentData.id || uuidv4(),
          jobId,
          updatedAt: new Date().toISOString()
        };

        if (existingIndex >= 0) {
          assessments[existingIndex] = assessment;
        } else {
          assessments.push(assessment);
        }

        await assessmentStorage.setAll(assessments);
        return assessment;
      });

      this.post('/assessments/:jobId/submit', async (schema, request) => {
        if (shouldError()) {
          return new Response(500, {}, { message: 'Failed to submit assessment' });
        }

        const { jobId } = request.params;
        const responseData = JSON.parse(request.requestBody);
        const responses: AssessmentResponse[] = await assessmentResponseStorage.getAll();
        
        const newResponse: AssessmentResponse = {
          id: uuidv4(),
          assessmentId: responseData.assessmentId,
          candidateId: responseData.candidateId,
          answers: responseData.answers,
          submittedAt: new Date().toISOString(),
          status: 'submitted'
        };

        responses.push(newResponse);
        await assessmentResponseStorage.setAll(responses);

        return newResponse;
      });

      // Users endpoint
      this.get('/users', async () => {
        return await userStorage.getAll();
      });
    }
  });
};