import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import type { Job } from '@/types';

interface JobFormProps {
  initialData?: Job;
  onSubmit: (data: Partial<Job> & { id?: string }) => void;
}

const departments = [
  'Engineering',
  'Product',
  'Design',
  'Marketing',
  'Sales',
  'Operations',
  'HR',
  'Finance',
  'Legal'
];

const locations = [
  'Remote',
  'San Francisco',
  'New York',
  'London',
  'Berlin',
  'Toronto',
  'Sydney',
  'Tokyo'
];

const commonTags = [
  'React',
  'TypeScript',
  'Node.js',
  'Python',
  'AWS',
  'Docker',
  'Kubernetes',
  'SQL',
  'NoSQL',
  'GraphQL',
  'REST API',
  'Microservices',
  'CI/CD',
  'Agile',
  'Scrum'
];

export function JobForm({ initialData, onSubmit }: JobFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    department: initialData?.department || '',
    location: initialData?.location || '',
    status: initialData?.status || 'active' as const,
    tags: initialData?.tags || [],
  });
  const [newTag, setNewTag] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      return;
    }

    onSubmit({
      ...(initialData?.id && { id: initialData.id }),
      ...formData,
      tags: formData.tags.filter(tag => tag.trim()),
    });
  };

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, trimmedTag]
      });
    }
    setNewTag('');
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Job Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g. Senior Frontend Developer"
          required
        />
      </div>

      {/* Department & Location */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Select
            value={formData.department}
            onValueChange={(value) => setFormData({ ...formData, department: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Select
            value={formData.location}
            onValueChange={(value) => setFormData({ ...formData, location: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              {locations.map((loc) => (
                <SelectItem key={loc} value={loc}>
                  {loc}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Status */}
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select
          value={formData.status}
          onValueChange={(value) => setFormData({ ...formData, status: value as 'active' | 'archived' })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe the role, responsibilities, and requirements..."
          className="min-h-[100px]"
        />
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label>Skills & Technologies</Label>
        
        {/* Current Tags */}
        {formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {formData.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="px-2 py-1">
                {tag}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 ml-1 hover:bg-transparent"
                  onClick={() => removeTag(tag)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        )}

        {/* Add New Tag */}
        <div className="flex gap-2">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Add a skill or technology"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag(newTag);
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => addTag(newTag)}
            disabled={!newTag.trim()}
          >
            Add
          </Button>
        </div>

        {/* Common Tags */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Common tags:</p>
          <div className="flex flex-wrap gap-1">
            {commonTags
              .filter(tag => !formData.tags.includes(tag))
              .slice(0, 10)
              .map((tag) => (
                <Button
                  key={tag}
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-auto px-2 py-1 text-xs"
                  onClick={() => addTag(tag)}
                >
                  {tag}
                </Button>
              ))}
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-3 pt-4">
        <Button type="submit" className="gradient-primary">
          {initialData ? 'Update Job' : 'Create Job'}
        </Button>
      </div>
    </form>
  );
}