import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Briefcase, 
  Users, 
  ClipboardList, 
  TrendingUp,
  Plus,
  ArrowRight,
  Clock,
  Target
} from 'lucide-react';
import { useJobs, useCandidates } from '@/lib/api';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { data: jobsData } = useJobs({ page: 1, pageSize: 5 });
  const { data: candidatesData } = useCandidates({ page: 1, pageSize: 5 });

  const stats = [
    {
      title: 'Active Jobs',
      value: jobsData?.data?.filter(job => job.status === 'active').length || 0,
      icon: Briefcase,
      description: '+12% from last month',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Total Candidates',
      value: candidatesData?.total || 0,
      icon: Users,
      description: '+5% from last month',
      color: 'text-blue-600',
      bgColor: 'bg-blue-600/10',
    },
    {
      title: 'Technical Interviews',
      value: candidatesData?.data?.filter(c => c.stage === 'tech').length || 0,
      icon: Clock,
      description: '8 this week',
      color: 'text-orange-600',
      bgColor: 'bg-orange-600/10',
    },
    {
      title: 'Offers Extended',
      value: candidatesData?.data?.filter(c => c.stage === 'offer').length || 0,
      icon: Target,
      description: '3 pending responses',
      color: 'text-green-600',
      bgColor: 'bg-green-600/10',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your hiring pipeline today.
          </p>
        </div>
        <Button className="gradient-primary shadow-medium hover:shadow-large transition-smooth">
          <Plus className="h-4 w-4 mr-2" />
          New Job
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="shadow-soft hover:shadow-medium transition-smooth border-0 gradient-subtle">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Jobs */}
        <Card className="shadow-soft border-0">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                Recent Jobs
              </CardTitle>
              <CardDescription>
                Latest job postings and their status
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/jobs">
                View all
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {jobsData?.data?.slice(0, 5).map((job) => (
              <div key={job.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-quick">
                <div className="space-y-1">
                  <p className="font-medium text-sm">{job.title}</p>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={job.status === 'active' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {job.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {job.department}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {job.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Candidates */}
        <Card className="shadow-soft border-0">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Recent Candidates
              </CardTitle>
              <CardDescription>
                Latest candidate applications
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/candidates">
                View all
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {candidatesData?.data?.slice(0, 5).map((candidate) => (
              <div key={candidate.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-quick">
                <div className="space-y-1">
                  <p className="font-medium text-sm">{candidate.name}</p>
                  <p className="text-xs text-muted-foreground">{candidate.email}</p>
                </div>
                <div className="text-right">
                  <Badge className={`stage-${candidate.stage} text-xs`}>
                    {candidate.stage}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(candidate.appliedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="shadow-soft border-0 gradient-subtle">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Common tasks to get you started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button variant="outline" className="h-auto p-4 text-left flex-col items-start space-y-2 hover:bg-primary/5 transition-smooth" asChild>
              <Link to="/jobs">
                <Briefcase className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Create New Job</p>
                  <p className="text-xs text-muted-foreground">Post a new position</p>
                </div>
              </Link>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 text-left flex-col items-start space-y-2 hover:bg-primary/5 transition-smooth" asChild>
              <Link to="/candidates">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">Review Candidates</p>
                  <p className="text-xs text-muted-foreground">Check new applications</p>
                </div>
              </Link>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 text-left flex-col items-start space-y-2 hover:bg-primary/5 transition-smooth" asChild>
              <Link to="/assessments">
                <ClipboardList className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-medium">Build Assessment</p>
                  <p className="text-xs text-muted-foreground">Create candidate tests</p>
                </div>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}