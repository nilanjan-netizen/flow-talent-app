import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Search, 
  Filter, 
  Grid, 
  List, 
  Plus,
  Mail,
  Phone,
  Calendar,
  Eye,
  MessageSquare
} from 'lucide-react';
import { useCandidates, useJobs } from '@/lib/api';
import { VirtualCandidateList } from '@/components/candidates/VirtualCandidateList';
import { CandidateKanban } from '@/components/candidates/CandidateKanban';
import type { CandidateFilters, CandidateStage } from '@/types';

const stages: { value: CandidateStage; label: string; color: string }[] = [
  { value: 'applied', label: 'Applied', color: 'stage-applied' },
  { value: 'screening', label: 'Screening', color: 'stage-screening' },
  { value: 'interview', label: 'Interview', color: 'stage-interview' },
  { value: 'offer', label: 'Offer', color: 'stage-offer' },
  { value: 'hired', label: 'Hired', color: 'stage-hired' },
  { value: 'rejected', label: 'Rejected', color: 'stage-rejected' },
];

export default function Candidates() {
  const [view, setView] = useState<'list' | 'kanban'>('kanban');
  const [filters, setFilters] = useState<CandidateFilters>({
    page: 1,
    pageSize: 50,
  });

  const { data: candidatesData, isLoading } = useCandidates(filters);
  const { data: jobsData } = useJobs({ pageSize: 100 });

  const candidatesByStage = useMemo(() => {
    if (!candidatesData?.data) return {};
    
    return candidatesData.data.reduce((acc, candidate) => {
      if (!acc[candidate.stage]) {
        acc[candidate.stage] = [];
      }
      acc[candidate.stage].push(candidate);
      return acc;
    }, {} as Record<CandidateStage, typeof candidatesData.data>);
  }, [candidatesData?.data]);

  const stageCounts = useMemo(() => {
    return stages.map(stage => ({
      ...stage,
      count: candidatesByStage[stage.value]?.length || 0
    }));
  }, [candidatesByStage]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8 text-blue-600" />
            Candidates
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and track candidates through your hiring pipeline
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-muted/30 rounded-lg p-1">
            <Button
              variant={view === 'kanban' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('kanban')}
              className="h-8"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={view === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('list')}
              className="h-8"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          
          <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-medium hover:shadow-large transition-smooth">
            <Plus className="h-4 w-4 mr-2" />
            Add Candidate
          </Button>
        </div>
      </div>

      {/* Stage Overview */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        {stageCounts.map((stage) => (
          <Card key={stage.value} className="shadow-soft border-0 hover:shadow-medium transition-smooth">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stage.label}
                  </p>
                  <p className="text-2xl font-bold">
                    {stage.count}
                  </p>
                </div>
                <div className={`w-3 h-3 rounded-full ${stage.color} border-2 border-current`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="shadow-soft border-0">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search candidates by name or email..."
                className="pl-10 bg-background/50"
                value={filters.search || ''}
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              />
            </div>
            
            <Select 
              value={filters.stage || 'all'} 
              onValueChange={(value) => setFilters({ 
                ...filters, 
                stage: value === 'all' ? undefined : value as CandidateStage, 
                page: 1 
              })}
            >
              <SelectTrigger className="w-[150px] bg-background/50">
                <SelectValue placeholder="Stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                {stages.map((stage) => (
                  <SelectItem key={stage.value} value={stage.value}>
                    {stage.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select 
              value={filters.jobId || 'all'} 
              onValueChange={(value) => setFilters({ 
                ...filters, 
                jobId: value === 'all' ? undefined : value, 
                page: 1 
              })}
            >
              <SelectTrigger className="w-[200px] bg-background/50">
                <SelectValue placeholder="Job" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Jobs</SelectItem>
                {jobsData?.data?.map((job) => (
                  <SelectItem key={job.id} value={job.id}>
                    {job.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      <div className="space-y-6">
        {view === 'kanban' ? (
          <CandidateKanban 
            candidates={candidatesData?.data || []}
            isLoading={isLoading}
            jobs={jobsData?.data || []}
          />
        ) : (
          <VirtualCandidateList 
            candidates={candidatesData?.data || []}
            isLoading={isLoading}
            jobs={jobsData?.data || []}
            total={candidatesData?.total || 0}
          />
        )}
      </div>
    </div>
  );
}