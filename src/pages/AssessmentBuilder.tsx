import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Save, Eye, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useAssessment, useSaveAssessment, useJobs } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import type { Assessment, Question, QuestionType } from '@/types';

export default function AssessmentBuilder() {
  const { jobId } = useParams<{ jobId: string }>();
  const { toast } = useToast();
  
  if (!jobId) {
    return <div>Job ID not found</div>;
  }

  const { data: assessment } = useAssessment(jobId);
  const { data: jobsData } = useJobs();
  const saveAssessmentMutation = useSaveAssessment();
  
  const job = jobsData?.data.find(j => j.id === jobId);
  
  const [currentAssessment, setCurrentAssessment] = useState<Assessment>(() =>
    assessment || {
      id: '',
      jobId,
      title: `${job?.title || 'Job'} Assessment`,
      description: '',
      sections: [{
        id: '1',
        title: 'General Questions',
        description: '',
        order: 1,
        questions: []
      }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  );

  const [previewMode, setPreviewMode] = useState(false);

  const addQuestion = (sectionIndex: number) => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      type: 'single_choice',
      title: 'New Question',
      order: 1,
      required: false,
      options: [
        { id: '1', label: 'Option 1', value: 'option1', order: 1 }, 
        { id: '2', label: 'Option 2', value: 'option2', order: 2 }
      ],
      validation: {}
    };

    const updatedSections = [...currentAssessment.sections];
    updatedSections[sectionIndex].questions.push(newQuestion);
    
    setCurrentAssessment({
      ...currentAssessment,
      sections: updatedSections
    });
  };

  const updateQuestion = (sectionIndex: number, questionIndex: number, updates: Partial<Question>) => {
    const updatedSections = [...currentAssessment.sections];
    updatedSections[sectionIndex].questions[questionIndex] = {
      ...updatedSections[sectionIndex].questions[questionIndex],
      ...updates
    };
    
    setCurrentAssessment({
      ...currentAssessment,
      sections: updatedSections
    });
  };

  const deleteQuestion = (sectionIndex: number, questionIndex: number) => {
    const updatedSections = [...currentAssessment.sections];
    updatedSections[sectionIndex].questions.splice(questionIndex, 1);
    
    setCurrentAssessment({
      ...currentAssessment,
      sections: updatedSections
    });
  };

  const addOption = (sectionIndex: number, questionIndex: number) => {
    const question = currentAssessment.sections[sectionIndex].questions[questionIndex];
    const newOptions = [...(question.options || []), { 
      id: Date.now().toString(), 
      label: `Option ${(question.options?.length || 0) + 1}`,
      value: `option${(question.options?.length || 0) + 1}`,
      order: (question.options?.length || 0) + 1
    }];
    
    updateQuestion(sectionIndex, questionIndex, { options: newOptions });
  };

  const updateOption = (sectionIndex: number, questionIndex: number, optionIndex: number, value: string) => {
    const question = currentAssessment.sections[sectionIndex].questions[questionIndex];
    const newOptions = [...(question.options || [])];
    newOptions[optionIndex] = { ...newOptions[optionIndex], label: value, value: value.toLowerCase().replace(/\s+/g, '_') };
    
    updateQuestion(sectionIndex, questionIndex, { options: newOptions });
  };

  const saveAssessment = () => {
    saveAssessmentMutation.mutate(
      { jobId, ...currentAssessment },
      {
        onSuccess: () => {
          toast({
            title: 'Assessment Saved',
            description: 'Assessment has been saved successfully.',
          });
        },
        onError: () => {
          toast({
            title: 'Save Failed',
            description: 'Failed to save assessment. Please try again.',
            variant: 'destructive',
          });
        }
      }
    );
  };

  const getQuestionTypeLabel = (type: QuestionType) => {
    switch (type) {
      case 'single_choice': return 'Single Choice';
      case 'multiple_choice': return 'Multiple Choice';
      case 'short_text': return 'Text Input';
      case 'long_text': return 'Long Text';
      case 'numeric': return 'Number';
      case 'file_upload': return 'File Upload';
      default: return type;
    }
  };

  if (previewMode) {
    return (
      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => setPreviewMode(false)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Editor
            </Button>
            <h1 className="text-3xl font-bold">Assessment Preview</h1>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{currentAssessment.title}</CardTitle>
            {currentAssessment.description && (
              <p className="text-muted-foreground">{currentAssessment.description}</p>
            )}
          </CardHeader>
          <CardContent className="space-y-8">
            {currentAssessment.sections.map((section, sectionIndex) => (
              <div key={section.id} className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">{section.title}</h3>
                  {section.description && (
                    <p className="text-sm text-muted-foreground">{section.description}</p>
                  )}
                </div>
                
                {section.questions.map((question, questionIndex) => (
                  <Card key={question.id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <span className="text-sm font-medium">{questionIndex + 1}.</span>
                        <Label className="text-sm">{question.title}</Label>
                        {question.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                      </div>
                      
                      {(question.type === 'single_choice' || question.type === 'multiple_choice') && (
                        <div className="space-y-2 ml-6">
                          {question.options?.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center gap-2">
                              <input 
                                type={question.type === 'single_choice' ? 'radio' : 'checkbox'} 
                                name={`question-${question.id}`}
                                disabled
                              />
                              <Label className="text-sm">{option.label}</Label>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {question.type === 'short_text' && (
                        <Input placeholder="Text answer..." disabled className="ml-6" />
                      )}
                      
                      {question.type === 'long_text' && (
                        <Textarea placeholder="Long text answer..." disabled className="ml-6" />
                      )}
                      
                      {question.type === 'numeric' && (
                        <Input type="number" placeholder="Number answer..." disabled className="ml-6" />
                      )}
                      
                      {question.type === 'file_upload' && (
                        <div className="ml-6 border-2 border-dashed border-gray-300 rounded-lg p-4">
                          <p className="text-sm text-muted-foreground text-center">Click to upload or drag and drop</p>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/jobs/${jobId}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Job
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Assessment Builder</h1>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setPreviewMode(true)}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button onClick={saveAssessment} disabled={saveAssessmentMutation.isPending}>
            <Save className="h-4 w-4 mr-2" />
            {saveAssessmentMutation.isPending ? 'Saving...' : 'Save Assessment'}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assessment Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={currentAssessment.title}
              onChange={(e) => setCurrentAssessment({
                ...currentAssessment,
                title: e.target.value
              })}
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={currentAssessment.description}
              onChange={(e) => setCurrentAssessment({
                ...currentAssessment,
                description: e.target.value
              })}
            />
          </div>
        </CardContent>
      </Card>

      {currentAssessment.sections.map((section, sectionIndex) => (
        <Card key={section.id}>
          <CardHeader>
            <CardTitle>{section.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {section.questions.map((question, questionIndex) => (
              <Card key={question.id} className="p-4">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Question {questionIndex + 1}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteQuestion(sectionIndex, questionIndex)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Question Text</Label>
                      <Input
                        value={question.title}
                        onChange={(e) => updateQuestion(sectionIndex, questionIndex, { title: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Question Type</Label>
                      <Select
                        value={question.type}
                        onValueChange={(value: QuestionType) => 
                          updateQuestion(sectionIndex, questionIndex, { type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single_choice">Single Choice</SelectItem>
                          <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                          <SelectItem value="short_text">Text Input</SelectItem>
                          <SelectItem value="long_text">Long Text</SelectItem>
                          <SelectItem value="numeric">Number</SelectItem>
                          <SelectItem value="file_upload">File Upload</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={question.required}
                      onCheckedChange={(checked) => 
                        updateQuestion(sectionIndex, questionIndex, { required: checked })
                      }
                    />
                    <Label>Required</Label>
                  </div>

                  {(question.type === 'single_choice' || question.type === 'multiple_choice') && (
                    <div className="space-y-2">
                      <Label>Options</Label>
                      {question.options?.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex gap-2">
                          <Input
                            value={option.label}
                            onChange={(e) => updateOption(sectionIndex, questionIndex, optionIndex, e.target.value)}
                            placeholder={`Option ${optionIndex + 1}`}
                          />
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addOption(sectionIndex, questionIndex)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Option
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
            
            <Button
              variant="outline"
              onClick={() => addQuestion(sectionIndex)}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}