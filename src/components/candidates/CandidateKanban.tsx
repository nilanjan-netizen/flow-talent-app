import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  MoreHorizontal, 
  Mail, 
  Phone, 
  Calendar, 
  Eye, 
  MessageSquare,
  User
} from 'lucide-react';
import { SortableCandidateCard } from './SortableCandidateCard';
import { useUpdateCandidate } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import type { Candidate, CandidateStage, Job } from '@/types';

interface CandidateKanbanProps {
  candidates: Candidate[];
  isLoading: boolean;
  jobs: Job[];
}

const stages: { value: CandidateStage; label: string; color: string }[] = [
  { value: 'applied', label: 'Applied', color: 'stage-applied' },
  { value: 'screening', label: 'Screening', color: 'stage-screening' },
  { value: 'interview', label: 'Interview', color: 'stage-interview' },
  { value: 'offer', label: 'Offer', color: 'stage-offer' },
  { value: 'hired', label: 'Hired', color: 'stage-hired' },
  { value: 'rejected', label: 'Rejected', color: 'stage-rejected' },
];

export function CandidateKanban({ candidates, isLoading, jobs }: CandidateKanbanProps) {
  const [activeCandidate, setActiveCandidate] = useState<Candidate | null>(null);
  const updateCandidateMutation = useUpdateCandidate();
  const { toast } = useToast();

  const candidatesByStage = candidates.reduce((acc, candidate) => {
    if (!acc[candidate.stage]) {
      acc[candidate.stage] = [];
    }
    acc[candidate.stage].push(candidate);
    return acc;
  }, {} as Record<CandidateStage, Candidate[]>);

  const getJobTitle = (jobId: string) => {
    return jobs.find(job => job.id === jobId)?.title || 'Unknown Position';
  };

  const handleDragStart = (event: DragStartEvent) => {
    const candidate = candidates.find(c => c.id === event.active.id);
    setActiveCandidate(candidate || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      setActiveCandidate(null);
      return;
    }

    // Check if dropped over a stage column
    const targetStage = stages.find(stage => over.id === `stage-${stage.value}`);
    if (targetStage) {
      const candidate = candidates.find(c => c.id === active.id);
      if (candidate && candidate.stage !== targetStage.value) {
        updateCandidateMutation.mutate(
          { id: candidate.id, stage: targetStage.value },
          {
            onSuccess: () => {
              toast({
                title: "Candidate Updated",
                description: `${candidate.name} moved to ${targetStage.label}`,
              });
            },
            onError: () => {
              toast({
                title: "Error",
                description: "Failed to update candidate stage",
                variant: "destructive",
              });
            }
          }
        );
      }
    }

    setActiveCandidate(null);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stages.map((stage) => (
          <Card key={stage.value} className="shadow-soft border-0">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-sm">
                <span>{stage.label}</span>
                <div className="w-6 h-6 bg-muted rounded-full animate-pulse" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stages.map((stage) => {
          const stageCandidates = candidatesByStage[stage.value] || [];
          
          return (
            <Card
              key={stage.value}
              id={`stage-${stage.value}`}
              className="shadow-soft border-0 min-h-[500px]"
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${stage.color} border-2 border-current`} />
                    {stage.label}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {stageCandidates.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-3 pb-4">
                <SortableContext
                  items={stageCandidates.map(c => c.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {stageCandidates.map((candidate) => (
                    <SortableCandidateCard
                      key={candidate.id}
                      candidate={candidate}
                      jobTitle={getJobTitle(candidate.jobId)}
                    />
                  ))}
                </SortableContext>
                
                {stageCandidates.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No candidates in this stage
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <DragOverlay>
        {activeCandidate ? (
          <CandidateCard 
            candidate={activeCandidate} 
            jobTitle={getJobTitle(activeCandidate.jobId)}
            isDragging
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

interface CandidateCardProps {
  candidate: Candidate;
  jobTitle: string;
  isDragging?: boolean;
}

function CandidateCard({ candidate, jobTitle, isDragging = false }: CandidateCardProps) {
  const initials = candidate.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card className={`cursor-grab active:cursor-grabbing shadow-soft hover:shadow-medium transition-smooth ${
      isDragging ? 'rotate-3 shadow-large' : ''
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-medium text-sm text-foreground truncate">
                  {candidate.name}
                </h3>
                <p className="text-xs text-muted-foreground truncate">
                  {jobTitle}
                </p>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Eye className="h-3 w-3 mr-2" />
                    View Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Mail className="h-3 w-3 mr-2" />
                    Send Email
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <MessageSquare className="h-3 w-3 mr-2" />
                    Add Note
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div className="space-y-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                <span className="truncate">{candidate.email}</span>
              </div>
              {candidate.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  <span>{candidate.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>Applied {new Date(candidate.appliedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}