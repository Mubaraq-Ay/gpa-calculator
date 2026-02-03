'use client';

import React from "react"

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { useAuth } from '@/hooks/use-auth';
import { AppNavbar } from '@/components/app-navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { DEFAULT_GRADE_SCALE, GRADE_SCALE_4_0, type GradePoint } from '@/lib/gpa-calculations';
import { Settings as SettingsIcon, Download, Upload } from 'lucide-react';

export default function SettingsPage() {
  const { isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);

  const getSettings = useStore(state => state.getSettings);
  const updateSettings = useStore(state => state.updateSettings);
  const semesters = useStore(state => state.semesters);
  const coursesBySemester = useStore(state => state.coursesBySemester);

  const [scaleType, setScaleType] = useState<'5.0' | '4.0'>('5.0');
  const [retakePolicy, setRetakePolicy] = useState<'replace' | 'keep-both'>('replace');
  const [targetCgpa, setTargetCgpa] = useState('4.0');
  const [gradeMapping, setGradeMapping] = useState<GradePoint[]>(DEFAULT_GRADE_SCALE);

  useEffect(() => {
    setMounted(true);
    const settings = getSettings();
    setScaleType(settings.scaleType);
    setRetakePolicy(settings.retakePolicy);
    setTargetCgpa(settings.targetCgpa.toString());
    setGradeMapping(settings.gradeMapping);
  }, [getSettings]);

  if (!mounted) return null;
  if (!isAuthenticated) return null;

  const handleSaveGradeScale = () => {
    updateSettings({
      scaleType,
      gradeMapping: scaleType === '5.0' ? DEFAULT_GRADE_SCALE : GRADE_SCALE_4_0,
    });
    toast.success('Grade scale updated');
  };

  const handleSaveRetakePolicy = () => {
    updateSettings({ retakePolicy });
    toast.success('Retake policy updated');
  };

  const handleSaveTargetCGPA = () => {
    updateSettings({ targetCgpa: parseFloat(targetCgpa) || 4.0 });
    toast.success('Target CGPA updated');
  };

  const handleExportData = () => {
    const data = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      semesters,
      coursesBySemester,
      settings: getSettings(),
    };

    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gpa-calculator-export-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success('Data exported successfully');
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        
        // Validate structure
        if (!data.semesters || !data.coursesBySemester || !data.settings) {
          toast.error('Invalid export file format');
          return;
        }

        // This would require additional store actions to support bulk import
        // For now, show a message
        toast.info('Import feature requires backend support');
      } catch (error) {
        toast.error('Failed to parse import file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
            <SettingsIcon className="h-8 w-8" />
            Settings
          </h1>
          <p className="text-muted-foreground">
            Customize your GPA calculation preferences
          </p>
        </div>

        <Tabs defaultValue="grading" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-muted">
            <TabsTrigger value="grading" className="text-foreground">
              Grading
            </TabsTrigger>
            <TabsTrigger value="policies" className="text-foreground">
              Policies
            </TabsTrigger>
            <TabsTrigger value="goals" className="text-foreground">
              Goals
            </TabsTrigger>
            <TabsTrigger value="data" className="text-foreground">
              Data
            </TabsTrigger>
          </TabsList>

          {/* Grading Tab */}
          <TabsContent value="grading" className="space-y-6">
            <Card className="p-6 border border-border">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Grade Scale
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Select your institution's grade scale
              </p>

              <div className="space-y-4">
                <div>
                  <Label className="text-foreground font-medium mb-3 block">
                    Scale Type
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    {(['5.0', '4.0'] as const).map(scale => (
                      <button
                        key={scale}
                        onClick={() => setScaleType(scale)}
                        className={`p-4 rounded-lg border-2 transition-all text-center cursor-pointer ${
                          scaleType === scale
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <p className="font-bold text-lg text-foreground">{scale}</p>
                        <p className="text-xs text-muted-foreground">
                          {scale === '5.0'
                            ? 'Nigerian Universities'
                            : 'US/International'}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleSaveGradeScale}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                >
                  Save Grade Scale
                </Button>
              </div>
            </Card>

            <Card className="p-6 border border-border">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Grade Mapping
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Current scale: {scaleType} GPA
              </p>

              <div className="space-y-3">
                <div className="grid grid-cols-4 gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  <div>Letter</div>
                  <div>Min Score</div>
                  <div>Max Score</div>
                  <div>Points</div>
                </div>

                {gradeMapping.map(grade => (
                  <div
                    key={grade.letter}
                    className="grid grid-cols-4 gap-2 p-3 bg-muted rounded-lg items-center"
                  >
                    <div className="font-bold text-foreground">{grade.letter}</div>
                    <div className="text-foreground">{grade.minScore}</div>
                    <div className="text-foreground">{grade.maxScore}</div>
                    <div className="text-foreground font-semibold">
                      {grade.point.toFixed(1)}
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-xs text-muted-foreground mt-4">
                Grade mappings are automatically set based on your selected scale. Custom mappings coming soon.
              </p>
            </Card>
          </TabsContent>

          {/* Policies Tab */}
          <TabsContent value="policies" className="space-y-6">
            <Card className="p-6 border border-border">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Retake Policy
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                How to handle repeated courses (retakes)
              </p>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(['replace', 'keep-both'] as const).map(policy => (
                    <button
                      key={policy}
                      onClick={() => setRetakePolicy(policy)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        retakePolicy === policy
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <p className="font-semibold text-foreground mb-1">
                        {policy === 'replace' ? 'Replace Old Grade' : 'Keep Both Grades'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {policy === 'replace'
                          ? 'Only the latest attempt counts'
                          : 'Both attempts count in CGPA'}
                      </p>
                    </button>
                  ))}
                </div>

                <Button
                  onClick={handleSaveRetakePolicy}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Save Retake Policy
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-6">
            <Card className="p-6 border border-border">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Target CGPA
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Set your academic goal
              </p>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="target" className="text-foreground font-medium">
                    Target CGPA
                  </Label>
                  <div className="flex gap-3 mt-2">
                    <Input
                      id="target"
                      type="number"
                      min="0"
                      max={scaleType === '5.0' ? '5' : '4'}
                      step="0.1"
                      value={targetCgpa}
                      onChange={e => setTargetCgpa(e.target.value)}
                      className="flex-1 bg-background text-foreground border-border"
                    />
                    <span className="text-sm font-semibold text-muted-foreground self-center px-3 py-2 bg-muted rounded-md">
                      / {scaleType}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handleSaveTargetCGPA}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Save Target
                </Button>
              </div>

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium text-foreground mb-2">
                  Quick Presets
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {[3.0, 3.5, 4.0, scaleType === '5.0' ? 5.0 : 4.0].map(preset => (
                    <Button
                      key={preset}
                      variant="outline"
                      size="sm"
                      onClick={() => setTargetCgpa(preset.toString())}
                      className="border-border text-foreground hover:bg-muted"
                    >
                      {preset.toFixed(1)}
                    </Button>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Data Tab */}
          <TabsContent value="data" className="space-y-6">
            <Card className="p-6 border border-border">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Data Management
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                Export and backup your data
              </p>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button
                    onClick={handleExportData}
                    variant="outline"
                    className="border-border text-foreground hover:bg-muted h-auto flex items-center justify-start gap-3 p-4 bg-transparent"
                  >
                    <Download className="h-5 w-5" />
                    <div className="text-left">
                      <p className="font-semibold text-foreground">Export Data</p>
                      <p className="text-xs text-muted-foreground">
                        Download as JSON file
                      </p>
                    </div>
                  </Button>

                  <label className="border-2 border-border rounded-lg p-4 cursor-pointer hover:bg-muted transition-colors">
                    <div className="flex items-center justify-start gap-3">
                      <Upload className="h-5 w-5 text-foreground" />
                      <div className="text-left">
                        <p className="font-semibold text-foreground">Import Data</p>
                        <p className="text-xs text-muted-foreground">
                          Restore from JSON file
                        </p>
                      </div>
                    </div>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportData}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                    Current Data
                  </p>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Semesters</p>
                      <p className="font-bold text-foreground text-lg">
                        {semesters.length}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Courses</p>
                      <p className="font-bold text-foreground text-lg">
                        {Object.values(coursesBySemester).flat().length}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Last Updated</p>
                      <p className="font-bold text-foreground text-lg">
                        {new Date().toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 border border-destructive/20 bg-destructive/5">
              <h3 className="text-lg font-semibold text-destructive mb-2">
                Danger Zone
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Irreversible actions
              </p>
              <Button
                variant="outline"
                className="border-destructive text-destructive hover:bg-destructive/10 bg-transparent"
                disabled
              >
                Clear All Data (Coming Soon)
              </Button>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
