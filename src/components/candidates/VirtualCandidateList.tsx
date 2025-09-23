import { useMemo, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  MoreHorizontal, 
  Mail, 
  Phone, 
  Calendar, 
  Eye, 
  MessageSquare,
  Users
} from 'lucide-react';
import type { Candidate, Job } from '@/types';

interface VirtualCandidateListProps {
  candidates: Candidate[];
  isLoading: boolean;
  jobs: Job[];
  total: number;
}

export function VirtualCandidateList({ candidates, isLoading, jobs, total }: VirtualCandidateListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: candidates.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120,
    overscan: 10,
  });

  const getJobTitle = (jobId: string) => {
    return jobs.find(job => job.id === jobId)?.title || 'Unknown Position';
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <Card className="shadow-soft border-0">
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg animate-pulse">
                <div className="w-12 h-12 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/4" />
                  <div className="h-3 bg-muted rounded w-1/3" />
                </div>
                <div className="h-6 bg-muted rounded w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (candidates.length === 0) {
    return (
      <Card className="shadow-soft border-0">
        <CardContent className="p-12 text-center">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No candidates found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search filters or add new candidates
          </p>
          <Button>
            Add Candidate
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-soft border-0">
      <CardContent className="p-0">
        <div
          ref={parentRef}
          className="h-[600px] overflow-auto"
        >
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const candidate = candidates[virtualRow.index];
              if (!candidate) return null;

              return (
                <div
                  key={virtualRow.key}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <div className="p-4 border-b border-border hover:bg-muted/30 transition-quick">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary/10 text-primary font-medium">
                          {getInitials(candidate.name)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-foreground">
                              {candidate.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {getJobTitle(candidate.jobId)}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Badge className={`stage-${candidate.stage} text-xs`}>
                              {candidate.stage}
                            </Badge>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Mail className="h-4 w-4 mr-2" />
                                  Send Email
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <MessageSquare className="h-4 w-4 mr-2" />
                                  Add Note
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            <span className="truncate max-w-[200px]">{candidate.email}</span>
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
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Footer with total count */}
        <div className="p-4 border-t border-border bg-muted/20">
          <p className="text-sm text-muted-foreground text-center">
            Showing {candidates.length} of {total} candidates
          </p>
        </div>
      </CardContent>
    </Card>
  );
}