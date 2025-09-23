import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  GripVertical, 
  MoreHorizontal, 
  Edit, 
  Archive, 
  Eye,
  Building2,
  MapPin,
  Calendar,
  Users
} from 'lucide-react';
import type { Job } from '@/types';

interface SortableJobCardProps {
  job: Job;
  onEdit: () => void;
  onArchive: () => void;
}

export function SortableJobCard({ job, onEdit, onArchive }: SortableJobCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: job.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`shadow-soft border-0 hover:shadow-medium transition-smooth cursor-default ${
        isDragging ? 'opacity-50 shadow-large' : ''
      }`}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Drag Handle */}
          <Button
            variant="ghost"
            size="sm"
            className="p-1 cursor-grab active:cursor-grabbing hover:bg-muted/50"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </Button>

          {/* Job Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  {job.title}
                </h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {job.department && (
                    <div className="flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {job.department}
                    </div>
                  )}
                  {job.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {job.location}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(job.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  variant={job.status === 'active' ? 'default' : 'secondary'}
                  className={job.status === 'active' ? 'bg-success text-success-foreground' : ''}
                >
                  {job.status}
                </Badge>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => window.open(`/jobs/${job.id}`, '_blank')}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onEdit}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Job
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onArchive}>
                      <Archive className="h-4 w-4 mr-2" />
                      {job.status === 'active' ? 'Archive' : 'Activate'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Description */}
            {job.description && (
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {job.description}
              </p>
            )}

            {/* Tags */}
            {job.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {job.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>0 applicants</span>
              </div>
              <div>
                Updated {new Date(job.updatedAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}