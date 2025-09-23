import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Archive, 
  Eye,
  GripVertical,
  Building2,
  MapPin,
  Calendar
} from 'lucide-react';
import { useJobs, useCreateJob, useUpdateJob, useReorderJob } from '@/lib/api';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableJobCard } from '@/components/jobs/SortableJobCard';
import { JobForm } from '@/components/jobs/JobForm';
import { useToast } from '@/hooks/use-toast';
import type { Job, JobFilters } from '@/types';

export default function Jobs() {
  const { toast } = useToast();
  const [filters, setFilters] = useState<JobFilters>({
    page: 1,
    pageSize: 20,
    sort: 'order',
    order: 'asc'
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  const { data: jobsData, isLoading } = useJobs(filters);
  const createJobMutation = useCreateJob();
  const updateJobMutation = useUpdateJob();
  const reorderJobMutation = useReorderJob();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id && jobsData?.data) {
      const oldIndex = jobsData.data.findIndex((job) => job.id === active.id);
      const newIndex = jobsData.data.findIndex((job) => job.id === over.id);

      const newOrder = arrayMove(jobsData.data, oldIndex, newIndex);
      
      // Update the order values and trigger the API call
      reorderJobMutation.mutate(
        { id: active.id, newOrder: newIndex },
        {
          onError: () => {
            toast({
              title: "Reorder Failed",
              description: "Failed to reorder jobs. Please try again.",
              variant: "destructive",
            });
          }
        }
      );
    }
  };

  const handleCreateJob = async (jobData: Partial<Job>) => {
    try {
      await createJobMutation.mutateAsync(jobData);
      setIsCreateModalOpen(false);
      toast({
        title: "Job Created",
        description: `${jobData.title} has been created successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create job. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateJob = async (jobData: Partial<Job> & { id: string }) => {
    try {
      await updateJobMutation.mutateAsync(jobData);
      setEditingJob(null);
      toast({
        title: "Job Updated",
        description: `${jobData.title} has been updated successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update job. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleArchiveJob = async (job: Job) => {
    try {
      await updateJobMutation.mutateAsync({
        id: job.id,
        status: job.status === 'active' ? 'archived' : 'active'
      });
      toast({
        title: job.status === 'active' ? "Job Archived" : "Job Activated",
        description: `${job.title} has been ${job.status === 'active' ? 'archived' : 'activated'}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update job status. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building2 className="h-8 w-8 text-primary" />
            Jobs
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your job postings and track their performance
          </p>
        </div>
        
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary shadow-medium hover:shadow-large transition-smooth">
              <Plus className="h-4 w-4 mr-2" />
              Create Job
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Job</DialogTitle>
              <DialogDescription>
                Add a new job posting to your hiring pipeline
              </DialogDescription>
            </DialogHeader>
            <JobForm onSubmit={handleCreateJob} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="shadow-soft border-0">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs..."
                className="pl-10 bg-background/50"
                value={filters.search || ''}
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              />
            </div>
            
            <Select 
              value={filters.status || 'all'} 
              onValueChange={(value) => setFilters({ 
                ...filters, 
                status: value === 'all' ? undefined : value as any, 
                page: 1 
              })}
            >
              <SelectTrigger className="w-[150px] bg-background/50">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Jobs List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : jobsData?.data?.length === 0 ? (
          <Card className="shadow-soft border-0">
            <CardContent className="p-12 text-center">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
              <p className="text-muted-foreground mb-4">
                Get started by creating your first job posting
              </p>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Job
              </Button>
            </CardContent>
          </Card>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={jobsData?.data?.map(job => job.id) || []}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {jobsData?.data?.map((job) => (
                  <SortableJobCard
                    key={job.id}
                    job={job}
                    onEdit={() => setEditingJob(job)}
                    onArchive={() => handleArchiveJob(job)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Edit Job Modal */}
      <Dialog open={!!editingJob} onOpenChange={() => setEditingJob(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Job</DialogTitle>
            <DialogDescription>
              Update the job posting details
            </DialogDescription>
          </DialogHeader>
          {editingJob && (
            <JobForm 
              initialData={editingJob}
              onSubmit={handleUpdateJob}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Pagination */}
      {jobsData && jobsData.totalPages > 1 && (
        <Card className="shadow-soft border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {((filters.page || 1) - 1) * (filters.pageSize || 20) + 1} to{' '}
                {Math.min((filters.page || 1) * (filters.pageSize || 20), jobsData.total)} of{' '}
                {jobsData.total} jobs
              </p>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!filters.page || filters.page <= 1}
                  onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={filters.page === jobsData.totalPages}
                  onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}