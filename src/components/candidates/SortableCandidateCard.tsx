import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  MoreHorizontal, 
  Mail, 
  Phone, 
  Calendar, 
  Eye, 
  MessageSquare
} from 'lucide-react';
import type { Candidate } from '@/types';

interface SortableCandidateCardProps {
  candidate: Candidate;
  jobTitle: string;
}

export function SortableCandidateCard({ candidate, jobTitle }: SortableCandidateCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: candidate.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const initials = candidate.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`cursor-grab active:cursor-grabbing shadow-soft hover:shadow-medium transition-smooth ${
        isDragging ? 'opacity-50 rotate-3 shadow-large' : ''
      }`}
      {...attributes}
      {...listeners}
    >
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
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
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