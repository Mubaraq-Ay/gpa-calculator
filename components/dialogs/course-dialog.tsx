'use client';

import React from "react"

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  getGradeFromScore,
  validateCourse,
  hasDuplicateCourseCode,
  type Course,
  type GradePoint,
} from '@/lib/gpa-calculations';

interface CourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  semesterId: string;
  course?: Course;
  existingCourses: Course[];
  gradeScale: GradePoint[];
}

export function CourseDialog({
  open,
  onOpenChange,
  semesterId,
  course,
  existingCourses,
  gradeScale,
}: CourseDialogProps) {
  const addCourse = useStore(state => state.addCourse);
  const updateCourse = useStore(state => state.updateCourse);
  const [loading, setLoading] = useState(false);
  const [inputMode, setInputMode] = useState<'score' | 'letter'>('score');
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    units: '',
    score: '',
    letter: '',
  });

  useEffect(() => {
    if (course) {
      setFormData({
        code: course.code,
        title: course.title || '',
        units: course.units.toString(),
        score: course.score.toString(),
        letter: course.gradeLetter || '',
      });
      setInputMode(course.score > 0 ? 'score' : 'letter');
    } else {
      setFormData({
        code: '',
        title: '',
        units: '',
        score: '',
        letter: '',
      });
      setInputMode('score');
    }
  }, [course, open]);

  const handleScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(p => ({ ...p, score: value }));

    if (value) {
      const score = parseFloat(value);
      if (score >= 0 && score <= 100) {
        const { letter } = getGradeFromScore(score, gradeScale);
        setFormData(p => ({ ...p, letter }));
      }
    }
  };

  const handleLetterChange = (value: string) => {
    setFormData(p => ({ ...p, letter: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const code = formData.code.toUpperCase();
      const units = parseInt(formData.units);
      const score = inputMode === 'score' ? parseFloat(formData.score) : 0;

      // Validation
      const validation = validateCourse(code, units, score);
      if (!validation.valid) {
        toast.error(validation.error);
        setLoading(false);
        return;
      }

      // Check for duplicate course code
      if (
        hasDuplicateCourseCode(existingCourses, code, course?.id)
      ) {
        toast.error('This course code already exists in this semester');
        setLoading(false);
        return;
      }

      // Get grade
      let finalScore = score;
      let gradeLetter = formData.letter;

      if (inputMode === 'letter') {
        const gradeInfo = gradeScale.find(g => g.letter === gradeLetter);
        if (!gradeInfo) {
          toast.error('Invalid grade letter');
          setLoading(false);
          return;
        }
        finalScore = gradeInfo.minScore; // Use minimum score for letter grade
      }

      const { letter, point } = getGradeFromScore(finalScore, gradeScale);

      if (course) {
        updateCourse(semesterId, course.id, {
          code,
          title: formData.title || undefined,
          units,
          score: finalScore,
          gradeLetter: letter,
          gradePoint: point,
        });
        toast.success('Course updated');
      } else {
        const newCourse: Course = {
          id: `course_${Date.now()}`,
          code,
          title: formData.title || undefined,
          units,
          score: finalScore,
          gradeLetter: letter,
          gradePoint: point,
          createdAt: Date.now(),
        };
        addCourse(semesterId, newCourse);
        toast.success('Course added');
      }

      onOpenChange(false);
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {course ? 'Edit Course' : 'Add Course'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Enter course details and grade information
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="code" className="text-foreground font-medium">
              Course Code *
            </Label>
            <Input
              id="code"
              placeholder="CSC101"
              value={formData.code}
              onChange={e =>
                setFormData(p => ({ ...p, code: e.target.value.toUpperCase() }))
              }
              className="mt-2 bg-background text-foreground border-border uppercase"
              disabled={!!course}
            />
          </div>

          <div>
            <Label htmlFor="title" className="text-foreground font-medium">
              Course Title (Optional)
            </Label>
            <Input
              id="title"
              placeholder="Introduction to Programming"
              value={formData.title}
              onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
              className="mt-2 bg-background text-foreground border-border"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="units" className="text-foreground font-medium">
                Units *
              </Label>
              <Input
                id="units"
                type="number"
                placeholder="3"
                min="1"
                value={formData.units}
                onChange={e => setFormData(p => ({ ...p, units: e.target.value }))}
                className="mt-2 bg-background text-foreground border-border"
              />
            </div>
          </div>

          <div>
            <Label className="text-foreground font-medium mb-2 block">
              Grade Input *
            </Label>
            <Tabs
              value={inputMode}
              onValueChange={v => setInputMode(v as 'score' | 'letter')}
            >
              <TabsList className="grid w-full grid-cols-2 bg-muted">
                <TabsTrigger value="score" className="text-foreground">
                  Score
                </TabsTrigger>
                <TabsTrigger value="letter" className="text-foreground">
                  Letter Grade
                </TabsTrigger>
              </TabsList>

              <TabsContent value="score" className="space-y-2">
                <Input
                  type="number"
                  placeholder="75"
                  min="0"
                  max="100"
                  value={formData.score}
                  onChange={handleScoreChange}
                  className="mt-2 bg-background text-foreground border-border"
                />
                <p className="text-xs text-muted-foreground">Enter score 0-100</p>
              </TabsContent>

              <TabsContent value="letter" className="space-y-2">
                <Select value={formData.letter} onValueChange={handleLetterChange}>
                  <SelectTrigger className="mt-2 bg-background text-foreground border-border">
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {gradeScale.map(grade => (
                      <SelectItem key={grade.letter} value={grade.letter}>
                        {grade.letter} ({grade.minScore}-{grade.maxScore})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TabsContent>
            </Tabs>
          </div>

          {formData.letter && (
            <div className="p-3 bg-accent/10 border border-accent/20 rounded-lg">
              <p className="text-sm text-accent font-medium">
                Grade: {formData.letter} ({getGradeFromScore(parseFloat(formData.score) || 0, gradeScale).point} points)
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-border text-foreground hover:bg-muted"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
