import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useSubmitAssessment } from '@/lib/api';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import type { Assessment, Question } from '@/types';

interface AssessmentFormProps {
  assessment: Assessment;
  candidateId: string;
  onSubmit?: (responses: Record<string, any>) => void;
}

export default function AssessmentForm({ assessment, candidateId, onSubmit }: AssessmentFormProps) {
  const { toast } = useToast();
  const submitAssessmentMutation = useSubmitAssessment();
  
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-save responses to local storage
  useEffect(() => {
    const saveDraft = async () => {
      try {
        await storage.set(`${STORAGE_KEYS.ASSESSMENT_RESPONSES}_draft_${assessment.id}_${candidateId}`, responses);
      } catch (error) {
        console.error('Failed to save draft:', error);
      }
    };

    const timeoutId = setTimeout(saveDraft, 1000);
    return () => clearTimeout(timeoutId);
  }, [responses, assessment.id, candidateId]);

  // Load draft responses on mount
  useEffect(() => {
    const loadDraft = async () => {
      try {
        const draft = await storage.get(`${STORAGE_KEYS.ASSESSMENT_RESPONSES}_draft_${assessment.id}_${candidateId}`);
        if (draft) {
          setResponses(draft as Record<string, any>);
        }
      } catch (error) {
        console.error('Failed to load draft:', error);
      }
    };

    loadDraft();
  }, [assessment.id, candidateId]);

  const isQuestionVisible = (question: Question): boolean => {
    if (!question.conditionalLogic) return true;

    const dependentValue = responses[question.conditionalLogic.dependsOn];
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
      const { minLength, maxLength, min, max, pattern, customMessage } = question.validation;

      if (question.type === 'short_text' || question.type === 'long_text') {
        if (minLength && value && value.length < minLength) {
          return customMessage || `Minimum length is ${minLength} characters`;
        }
        if (maxLength && value && value.length > maxLength) {
          return customMessage || `Maximum length is ${maxLength} characters`;
        }
        if (pattern && value && !new RegExp(pattern).test(value)) {
          return customMessage || 'Invalid format';
        }
      }

      if (question.type === 'numeric') {
        const numValue = Number(value);
        if (min !== undefined && numValue < min) {
          return customMessage || `Minimum value is ${min}`;
        }
        if (max !== undefined && numValue > max) {
          return customMessage || `Maximum value is ${max}`;
        }
      }
    }

    return null;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    assessment.sections.forEach(section => {
      section.questions.filter(isQuestionVisible).forEach(question => {
        const error = validateQuestion(question, responses[question.id]);
        if (error) {
          newErrors[question.id] = error;
          isValid = false;
        }
      });
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors before submitting.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await submitAssessmentMutation.mutateAsync({
        jobId: assessment.jobId,
        assessmentId: assessment.id,
        candidateId,
        answers: responses
      });

      // Clear draft after successful submission
      await storage.remove(`${STORAGE_KEYS.ASSESSMENT_RESPONSES}_draft_${assessment.id}_${candidateId}`);

      toast({
        title: 'Assessment Submitted',
        description: 'Your assessment has been submitted successfully.',
      });

      onSubmit?.(responses);
    } catch (error) {
      toast({
        title: 'Submission Failed',
        description: 'Failed to submit assessment. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const updateResponse = (questionId: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
    
    // Clear error for this question
    if (errors[questionId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{assessment.title}</CardTitle>
          {assessment.description && (
            <p className="text-muted-foreground">{assessment.description}</p>
          )}
        </CardHeader>
        <CardContent className="space-y-8">
          {assessment.sections.map((section, sectionIndex) => (
            <div key={section.id} className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">{section.title}</h3>
                {section.description && (
                  <p className="text-sm text-muted-foreground">{section.description}</p>
                )}
              </div>
              
              {section.questions.filter(isQuestionVisible).map((question, questionIndex) => (
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
                                ? responses[question.id] === option.value
                                : responses[question.id]?.includes(option.value)
                              }
                              onChange={(e) => {
                                if (question.type === 'single_choice') {
                                  updateResponse(question.id, e.target.value);
                                } else {
                                  const current = responses[question.id] || [];
                                  const updated = e.target.checked
                                    ? [...current, option.value]
                                    : current.filter((v: string) => v !== option.value);
                                  updateResponse(question.id, updated);
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
                        placeholder="Enter your answer..." 
                        value={responses[question.id] || ''} 
                        onChange={(e) => updateResponse(question.id, e.target.value)}
                        className="ml-6" 
                      />
                    )}
                    
                    {question.type === 'long_text' && (
                      <Textarea 
                        placeholder="Enter your detailed answer..." 
                        value={responses[question.id] || ''} 
                        onChange={(e) => updateResponse(question.id, e.target.value)}
                        className="ml-6" 
                        rows={4}
                      />
                    )}
                    
                    {question.type === 'numeric' && (
                      <Input 
                        type="number" 
                        placeholder="Enter a number..." 
                        value={responses[question.id] || ''} 
                        onChange={(e) => updateResponse(question.id, e.target.value)}
                        min={question.validation?.min}
                        max={question.validation?.max}
                        className="ml-6" 
                      />
                    )}
                    
                    {question.type === 'file_upload' && (
                      <div className="ml-6 border-2 border-dashed border-border rounded-lg p-4">
                        <p className="text-sm text-muted-foreground text-center">
                          Click to upload or drag and drop
                        </p>
                        <input 
                          type="file" 
                          className="hidden" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              updateResponse(question.id, {
                                fileName: file.name,
                                fileSize: file.size,
                                fileType: file.type
                              });
                            }
                          }}
                        />
                      </div>
                    )}

                    {errors[question.id] && (
                      <p className="text-sm text-destructive ml-6">{errors[question.id]}</p>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          ))}
          
          <div className="flex justify-end pt-6">
            <Button 
              onClick={handleSubmit} 
              disabled={submitAssessmentMutation.isPending}
              size="lg"
            >
              {submitAssessmentMutation.isPending ? 'Submitting...' : 'Submit Assessment'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}