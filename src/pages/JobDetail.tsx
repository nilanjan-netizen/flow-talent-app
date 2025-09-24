import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Users, FileText, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useJobs, useCandidates, useAssessment } from '@/lib/api';

export default function JobDetail() {
  const { jobId } = useParams<{ jobId: string }>();
  
  if (!jobId) {
    return <div>Job ID not found</div>;
  }

  const { data: jobsData } = useJobs();
  const { data: candidatesData } = useCandidates({ jobId });
  const { data: assessment } = useAssessment(jobId);
  
  const job = jobsData?.data.find(j => j.id === jobId);
  
  if (!job) {
    return <div>Job not found</div>;
  }

  const candidatesByStage = candidatesData?.data.reduce((acc, candidate) => {
    acc[candidate.stage] = (acc[candidate.stage] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link to="/jobs">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">{job.title}</h1>
        <Badge variant={job.status === 'active' ? 'default' : 'secondary'}>
          {job.status}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{candidatesData?.total || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assessment</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {assessment ? assessment.sections.reduce((total, section) => total + section.questions.length, 0) : 0}
            </div>
            <p className="text-xs text-muted-foreground">Questions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{job.department || 'N/A'}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Job Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {job.description || 'No description available'}
            </p>
            {job.tags && job.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {job.tags.map((tag, index) => (
                  <Badge key={index} variant="outline">{tag}</Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Candidate Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {['applied', 'screen', 'tech', 'offer', 'hired', 'rejected'].map(stage => (
                <div key={stage} className="flex justify-between items-center">
                  <span className="capitalize">{stage}</span>
                  <Badge variant="outline">{candidatesByStage[stage] || 0}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <Button>
          <Edit className="h-4 w-4 mr-2" />
          Edit Job
        </Button>
        <Button variant="outline">
          <FileText className="h-4 w-4 mr-2" />
          Manage Assessment
        </Button>
        <Button variant="destructive">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Job
        </Button>
      </div>
    </div>
  );
}