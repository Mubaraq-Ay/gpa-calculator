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
import { toast } from 'sonner';
import type { Semester } from '@/lib/gpa-calculations';

interface SemesterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  semester?: Semester;
}

export function SemesterDialog({
  open,
  onOpenChange,
  semester,
}: SemesterDialogProps) {
  const addSemester = useStore(state => state.addSemester);
  const updateSemester = useStore(state => state.updateSemester);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    session: '',
    term: '',
    level: '',
  });

  useEffect(() => {
    if (semester) {
      setFormData({
        session: semester.session,
        term: semester.term.toString(),
        level: semester.level.toString(),
      });
    } else {
      setFormData({
        session: new Date().getFullYear() + '/' + (new Date().getFullYear() + 1),
        term: '1',
        level: '100',
      });
    }
  }, [semester, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.session.trim()) {
        toast.error('Session is required');
        setLoading(false);
        return;
      }

      if (semester) {
        updateSemester(semester.id, {
          session: formData.session,
          term: parseInt(formData.term),
          level: parseInt(formData.level),
        });
        toast.success('Semester updated');
      } else {
        const newSemester: Semester = {
          id: `sem_${Date.now()}`,
          session: formData.session,
          term: parseInt(formData.term),
          level: parseInt(formData.level),
          createdAt: Date.now(),
        };
        addSemester(newSemester);
        toast.success('Semester added');
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
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {semester ? 'Edit Semester' : 'Add Semester'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {semester
              ? 'Update semester details'
              : 'Create a new semester to add courses'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="session" className="text-foreground font-medium">
              Session
            </Label>
            <Input
              id="session"
              placeholder="2024/2025"
              value={formData.session}
              onChange={e => setFormData(p => ({ ...p, session: e.target.value }))}
              className="mt-2 bg-background text-foreground border-border"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Format: YYYY/YYYY (e.g., 2024/2025)
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="term" className="text-foreground font-medium">
                Term
              </Label>
              <Select value={formData.term} onValueChange={v => setFormData(p => ({ ...p, term: v }))}>
                <SelectTrigger className="mt-2 bg-background text-foreground border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="1">Term 1</SelectItem>
                  <SelectItem value="2">Term 2</SelectItem>
                  <SelectItem value="3">Term 3</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="level" className="text-foreground font-medium">
                Level
              </Label>
              <Select value={formData.level} onValueChange={v => setFormData(p => ({ ...p, level: v }))}>
                <SelectTrigger className="mt-2 bg-background text-foreground border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="100">100 Level</SelectItem>
                  <SelectItem value="200">200 Level</SelectItem>
                  <SelectItem value="300">300 Level</SelectItem>
                  <SelectItem value="400">400 Level</SelectItem>
                  <SelectItem value="500">500 Level</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

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
