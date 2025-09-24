import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useCandidates, useCandidateTimeline, useJobs } from '@/lib/api';
import { format } from 'date-fns';

export default function CandidateDetail() {
  const { candidateId } = useParams<{ candidateId: string }>();
  
  if (!candidateId) {
    return <div>Candidate ID not found</div>;
  }

  const { data: candidatesData } = useCandidates();
  const { data: timeline } = useCandidateTimeline(candidateId);
  const { data: jobsData } = useJobs();
  
  const candidate = candidatesData?.data.find(c => c.id === candidateId);
  const job = candidate ? jobsData?.data.find(j => j.id === candidate.jobId) : null;
  
  if (!candidate) {
    return <div>Candidate not found</div>;
  }

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'applied': return 'bg-blue-100 text-blue-800';
      case 'screen': return 'bg-yellow-100 text-yellow-800';
      case 'tech': return 'bg-purple-100 text-purple-800';
      case 'offer': return 'bg-orange-100 text-orange-800';
      case 'hired': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link to="/candidates">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Candidates
          </Link>
        </Button>
        <Avatar className="h-12 w-12">
          <AvatarFallback>
            {candidate.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold">{candidate.name}</h1>
          <p className="text-muted-foreground">{job?.title || 'Unknown Position'}</p>
        </div>
        <Badge className={getStageColor(candidate.stage)}>
          {candidate.stage}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contact</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span className="text-sm">{candidate.email}</span>
              </div>
              {candidate.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span className="text-sm">{candidate.phone}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Application Date</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">
              {format(new Date(candidate.appliedAt), 'MMM dd, yyyy')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Experience</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">
              N/A
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            {candidate.notes && candidate.notes.length > 0 ? (
              <div className="space-y-4">
                {candidate.notes.map((note, index) => (
                  <div key={index} className="border-l-2 border-primary pl-4">
                    <p className="text-sm">{note.content}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {note.authorId} • {format(new Date(note.createdAt), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No notes available</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            {timeline && timeline.length > 0 ? (
              <div className="space-y-4">
                {timeline.map((event, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      {index < timeline.length - 1 && (
                        <div className="w-px h-8 bg-border"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{event.type}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(event.createdAt), 'MMM dd, yyyy HH:mm')}
                      </p>
                      {event.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {event.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No timeline events</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <Button>
          <Mail className="h-4 w-4 mr-2" />
          Send Email
        </Button>
        <Button variant="outline">
          Edit Candidate
        </Button>
        <Button variant="outline">
          Add Note
        </Button>
      </div>
    </div>
  );
}