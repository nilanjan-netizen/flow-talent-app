import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Save, Eye, Trash2, GripVertical, Settings, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAssessment, useSaveAssessment, useJobs } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import type { Assessment, Question, QuestionType, AssessmentSection } from '@/types';

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
        description: 'Basic assessment questions',
        order: 1,
        questions: []
      }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  );

  const [previewMode, setPreviewMode] = useState(false);
  const [previewResponses, setPreviewResponses] = useState<Record<string, any>>({});

  // Auto-save draft to local storage
  useEffect(() => {
    const saveDraft = async () => {
      try {
        await storage.set(`${STORAGE_KEYS.ASSESSMENTS}_draft_${jobId}`, currentAssessment);
      } catch (error) {
        console.error('Failed to save draft:', error);
      }
    };

    const timeoutId = setTimeout(saveDraft, 1000);
    return () => clearTimeout(timeoutId);
  }, [currentAssessment, jobId]);

  // Load draft on mount
  useEffect(() => {
    const loadDraft = async () => {
      try {
        const draft = await storage.get(`${STORAGE_KEYS.ASSESSMENTS}_draft_${jobId}`);
        if (draft && !assessment) {
          setCurrentAssessment(draft as Assessment);
        }
      } catch (error) {
        console.error('Failed to load draft:', error);
      }
    };

    loadDraft();
  }, [jobId, assessment]);

  const addSection = () => {
    const newSection: AssessmentSection = {
      id: Date.now().toString(),
      title: 'New Section',
      description: '',
      order: currentAssessment.sections.length + 1,
      questions: []
    };

    setCurrentAssessment({
      ...currentAssessment,
      sections: [...currentAssessment.sections, newSection]
    });
  };

  const updateSection = (sectionIndex: number, updates: Partial<AssessmentSection>) => {
    const updatedSections = [...currentAssessment.sections];
    updatedSections[sectionIndex] = { ...updatedSections[sectionIndex], ...updates };
    
    setCurrentAssessment({
      ...currentAssessment,
      sections: updatedSections
    });
  };

  const deleteSection = (sectionIndex: number) => {
    if (currentAssessment.sections.length === 1) {
      toast({
        title: 'Cannot Delete',
        description: 'At least one section is required.',
        variant: 'destructive',
      });
      return;
    }

    const updatedSections = [...currentAssessment.sections];
    updatedSections.splice(sectionIndex, 1);
    
    setCurrentAssessment({
      ...currentAssessment,
      sections: updatedSections
    });
  };

  const addQuestion = (sectionIndex: number) => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      type: 'single_choice',
      title: 'New Question',
      description: '',
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

  const duplicateQuestion = (sectionIndex: number, questionIndex: number) => {
    const question = currentAssessment.sections[sectionIndex].questions[questionIndex];
    const duplicatedQuestion: Question = {
      ...question,
      id: Date.now().toString(),
      title: `${question.title} (Copy)`
    };

    const updatedSections = [...currentAssessment.sections];
    updatedSections[sectionIndex].questions.splice(questionIndex + 1, 0, duplicatedQuestion);
    
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
    newOptions[optionIndex] = { 
      ...newOptions[optionIndex], 
      label: value, 
      value: value.toLowerCase().replace(/\s+/g, '_') 
    };
    
    updateQuestion(sectionIndex, questionIndex, { options: newOptions });
  };

  const removeOption = (sectionIndex: number, questionIndex: number, optionIndex: number) => {
    const question = currentAssessment.sections[sectionIndex].questions[questionIndex];
    const newOptions = [...(question.options || [])];
    newOptions.splice(optionIndex, 1);
    
    updateQuestion(sectionIndex, questionIndex, { options: newOptions });
  };

  const saveAssessment = async () => {
    try {
      await saveAssessmentMutation.mutateAsync({ jobId, ...currentAssessment });
      
      // Clear draft after successful save
      await storage.remove(`${STORAGE_KEYS.ASSESSMENTS}_draft_${jobId}`);
      
      toast({
        title: 'Assessment Saved',
        description: 'Assessment has been saved successfully.',
      });
    } catch (error) {
      toast({
        title: 'Save Failed',
        description: 'Failed to save assessment. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getQuestionTypeLabel = (type: QuestionType) => {
    switch (type) {
      case 'single_choice': return 'Single Choice';
      case 'multiple_choice': return 'Multiple Choice';
      case 'short_text': return 'Short Text';
      case 'long_text': return 'Long Text';
      case 'numeric': return 'Number';
      case 'file_upload': return 'File Upload';
      default: return type;
    }
  };

  const isQuestionVisible = (question: Question): boolean => {
    if (!question.conditionalLogic) return true;

    const dependentValue = previewResponses[question.conditionalLogic.dependsOn];
    if (dependentValue === undefined) return false;

    switch (question.conditionalLogic.condition) {
      case 'equals':
        return dependentValue === question.conditionalLogic.value;
      case 'not_equals':
        return dependentValue !== question.conditionalLogic.value;
      case 'contains':
        return String(dependentValue).includes(String(question.conditionalLogic.value));
      case 'greater_than':
        return Number(dependentValue) > Number(question.conditionalLogic.value);
      case 'less_than':
        return Number(dependentValue) < Number(question.conditionalLogic.value);
      default:
        return true;
    }
  };

  const validateQuestion = (question: Question, value: any): string | null => {
    if (question.required && (!value || (Array.isArray(value) && value.length === 0))) {
      return 'This field is required';
    }

    if (question.validation) {
      const { minLength, maxLength, min, max, pattern } = question.validation;

      if (question.type === 'short_text' || question.type === 'long_text') {
        if (minLength && value && value.length < minLength) {
          return `Minimum length is ${minLength} characters`;
        }
        if (maxLength && value && value.length > maxLength) {
          return `Maximum length is ${maxLength} characters`;
        }
        if (pattern && value && !new RegExp(pattern).test(value)) {
          return question.validation.customMessage || 'Invalid format';
        }
      }

      if (question.type === 'numeric') {
        const numValue = Number(value);
        if (min !== undefined && numValue < min) {
          return `Minimum value is ${min}`;
        }
        if (max !== undefined && numValue > max) {
          return `Maximum value is ${max}`;
        }
      }
    }

    return null;
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
                
                {section.questions.filter(isQuestionVisible).map((question, questionIndex) => {
                  const validationError = validateQuestion(question, previewResponses[question.id]);
                  
                  return (
                    <Card key={question.id} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          <span className="text-sm font-medium">{questionIndex + 1}.</span>
                          <div className="flex-1">
                            <Label className="text-sm font-medium">{question.title}</Label>
                            {question.description && (
                              <p className="text-xs text-muted-foreground mt-1">{question.description}</p>
                            )}
                          </div>
                          {question.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                        </div>
                        
                        {(question.type === 'single_choice' || question.type === 'multiple_choice') && (
                          <div className="space-y-2 ml-6">
                            {question.options?.map((option, optionIndex) => (
                              <div key={optionIndex} className="flex items-center gap-2">
                                <input 
                                  type={question.type === 'single_choice' ? 'radio' : 'checkbox'} 
                                  name={`question-${question.id}`}
                                  value={option.value}
                                  checked={question.type === 'single_choice' 
                                    ? previewResponses[question.id] === option.value
                                    : previewResponses[question.id]?.includes(option.value)
                                  }
                                  onChange={(e) => {
                                    if (question.type === 'single_choice') {
                                      setPreviewResponses(prev => ({
                                        ...prev,
                                        [question.id]: e.target.value
                                      }));
                                    } else {
                                      setPreviewResponses(prev => {
                                        const current = prev[question.id] || [];
                                        const updated = e.target.checked
                                          ? [...current, option.value]
                                          : current.filter((v: string) => v !== option.value);
                                        return { ...prev, [question.id]: updated };
                                      });
                                    }
                                  }}
                                />
                                <Label className="text-sm">{option.label}</Label>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {question.type === 'short_text' && (
                          <Input 
                            placeholder="Text answer..." 
                            value={previewResponses[question.id] || ''} 
                            onChange={(e) => setPreviewResponses(prev => ({
                              ...prev,
                              [question.id]: e.target.value
                            }))}
                            className="ml-6" 
                          />
                        )}
                        
                        {question.type === 'long_text' && (
                          <Textarea 
                            placeholder="Long text answer..." 
                            value={previewResponses[question.id] || ''} 
                            onChange={(e) => setPreviewResponses(prev => ({
                              ...prev,
                              [question.id]: e.target.value
                            }))}
                            className="ml-6" 
                          />
                        )}
                        
                        {question.type === 'numeric' && (
                          <Input 
                            type="number" 
                            placeholder="Number answer..." 
                            value={previewResponses[question.id] || ''} 
                            onChange={(e) => setPreviewResponses(prev => ({
                              ...prev,
                              [question.id]: e.target.value
                            }))}
                            min={question.validation?.min}
                            max={question.validation?.max}
                            className="ml-6" 
                          />
                        )}
                        
                        {question.type === 'file_upload' && (
                          <div className="ml-6 border-2 border-dashed border-border rounded-lg p-4">
                            <p className="text-sm text-muted-foreground text-center">Click to upload or drag and drop</p>
                            <input type="file" className="hidden" />
                          </div>
                        )}

                        {validationError && (
                          <p className="text-sm text-destructive ml-6">{validationError}</p>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            ))}
            
            <div className="flex justify-end pt-4">
              <Button>Submit Assessment</Button>
            </div>
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
            <div className="flex items-center justify-between">
              <div className="space-y-2 flex-1">
                <Input
                  value={section.title}
                  onChange={(e) => updateSection(sectionIndex, { title: e.target.value })}
                  className="text-lg font-semibold"
                  placeholder="Section title"
                />
                <Input
                  value={section.description || ''}
                  onChange={(e) => updateSection(sectionIndex, { description: e.target.value })}
                  placeholder="Section description (optional)"
                />
              </div>
              <div className="flex gap-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteSection(sectionIndex)}
                  disabled={currentAssessment.sections.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {section.questions.map((question, questionIndex) => (
              <Card key={question.id} className="p-4">
                <Tabs defaultValue="basic" className="w-full">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Question {questionIndex + 1}</span>
                      <Badge variant="secondary">{getQuestionTypeLabel(question.type)}</Badge>
                    </div>
                    <div className="flex gap-2">
                      <TabsList className="grid w-[300px] grid-cols-3">
                        <TabsTrigger value="basic">Basic</TabsTrigger>
                        <TabsTrigger value="validation">Validation</TabsTrigger>
                        <TabsTrigger value="conditional">Conditional</TabsTrigger>
                      </TabsList>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => duplicateQuestion(sectionIndex, questionIndex)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteQuestion(sectionIndex, questionIndex)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <TabsContent value="basic" className="space-y-4">
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
                            <SelectItem value="short_text">Short Text</SelectItem>
                            <SelectItem value="long_text">Long Text</SelectItem>
                            <SelectItem value="numeric">Number</SelectItem>
                            <SelectItem value="file_upload">File Upload</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label>Description (optional)</Label>
                      <Input
                        value={question.description || ''}
                        onChange={(e) => updateQuestion(sectionIndex, questionIndex, { description: e.target.value })}
                        placeholder="Additional instructions or context"
                      />
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
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeOption(sectionIndex, questionIndex, optionIndex)}
                              disabled={(question.options?.length || 0) <= 2}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
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
                  </TabsContent>

                  <TabsContent value="validation" className="space-y-4">
                    {(question.type === 'short_text' || question.type === 'long_text') && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Minimum Length</Label>
                          <Input
                            type="number"
                            value={question.validation?.minLength || ''}
                            onChange={(e) => updateQuestion(sectionIndex, questionIndex, {
                              validation: { ...question.validation, minLength: Number(e.target.value) || undefined }
                            })}
                          />
                        </div>
                        <div>
                          <Label>Maximum Length</Label>
                          <Input
                            type="number"
                            value={question.validation?.maxLength || ''}
                            onChange={(e) => updateQuestion(sectionIndex, questionIndex, {
                              validation: { ...question.validation, maxLength: Number(e.target.value) || undefined }
                            })}
                          />
                        </div>
                      </div>
                    )}

                    {question.type === 'numeric' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Minimum Value</Label>
                          <Input
                            type="number"
                            value={question.validation?.min || ''}
                            onChange={(e) => updateQuestion(sectionIndex, questionIndex, {
                              validation: { ...question.validation, min: Number(e.target.value) || undefined }
                            })}
                          />
                        </div>
                        <div>
                          <Label>Maximum Value</Label>
                          <Input
                            type="number"
                            value={question.validation?.max || ''}
                            onChange={(e) => updateQuestion(sectionIndex, questionIndex, {
                              validation: { ...question.validation, max: Number(e.target.value) || undefined }
                            })}
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <Label>Custom Validation Message</Label>
                      <Input
                        value={question.validation?.customMessage || ''}
                        onChange={(e) => updateQuestion(sectionIndex, questionIndex, {
                          validation: { ...question.validation, customMessage: e.target.value }
                        })}
                        placeholder="Custom error message"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="conditional" className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <Label>Depends On Question</Label>
                        <Select
                          value={question.conditionalLogic?.dependsOn || ''}
                          onValueChange={(value) => {
                            if (value) {
                              updateQuestion(sectionIndex, questionIndex, {
                                conditionalLogic: { ...question.conditionalLogic, dependsOn: value, condition: 'equals', value: '' }
                              });
                            } else {
                              updateQuestion(sectionIndex, questionIndex, { conditionalLogic: undefined });
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a question" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">None (always show)</SelectItem>
                            {currentAssessment.sections.flatMap(s => s.questions)
                              .filter(q => q.id !== question.id)
                              .map(q => (
                                <SelectItem key={q.id} value={q.id}>
                                  {q.title}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {question.conditionalLogic && (
                        <>
                          <div>
                            <Label>Condition</Label>
                            <Select
                              value={question.conditionalLogic.condition}
                              onValueChange={(value: any) => updateQuestion(sectionIndex, questionIndex, {
                                conditionalLogic: { ...question.conditionalLogic, condition: value }
                              })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="equals">Equals</SelectItem>
                                <SelectItem value="not_equals">Not Equals</SelectItem>
                                <SelectItem value="contains">Contains</SelectItem>
                                <SelectItem value="greater_than">Greater Than</SelectItem>
                                <SelectItem value="less_than">Less Than</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label>Value</Label>
                            <Input
                              value={question.conditionalLogic.value}
                              onChange={(e) => updateQuestion(sectionIndex, questionIndex, {
                                conditionalLogic: { ...question.conditionalLogic, value: e.target.value }
                              })}
                              placeholder="Condition value"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
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

      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={addSection}
          className="w-full max-w-md"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Section
        </Button>
      </div>
    </div>
  );
}