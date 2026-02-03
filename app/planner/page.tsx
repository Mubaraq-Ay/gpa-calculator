'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { useAuth } from '@/hooks/use-auth';
import { AppNavbar } from '@/components/app-navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import {
  calculateCGPA,
  calculateRequiredGPA,
  getTotalUnitsAndQualityPoints,
} from '@/lib/gpa-calculations';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useTheme } from 'next-themes';
import { Lightbulb, TrendingUp } from 'lucide-react';

export default function PlannerPage() {
  const { isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();

  const coursesBySemester = useStore(state => state.coursesBySemester);
  const getSettings = useStore(state => state.getSettings);
  const updateSettings = useStore(state => state.updateSettings);

  const [targetCgpa, setTargetCgpa] = useState<string>('4.0');
  const [remainingSemesters, setRemainingSemesters] = useState<string>('4');
  const [unitsPerSemester, setUnitsPerSemester] = useState<string>('15');
  const [scenarioMode, setScenarioMode] = useState(false);
  const [scenarioGPA, setScenarioGPA] = useState<string>('3.5');

  useEffect(() => {
    setMounted(true);
    const settings = getSettings();
    setTargetCgpa(settings.targetCgpa.toString());
  }, [getSettings]);

  if (!mounted) return null;
  if (!isAuthenticated) return null;

  const settings = getSettings();
  const allCourses = Object.values(coursesBySemester).flat();
  const currentCGPA = calculateCGPA(allCourses);
  const { units: totalUnits } = getTotalUnitsAndQualityPoints(allCourses);

  const targetGPA = parseFloat(targetCgpa) || 4.0;
  const remaining = parseInt(remainingSemesters) || 4;
  const unitsPerSem = parseInt(unitsPerSemester) || 15;

  const requiredGPA = calculateRequiredGPA(
    currentCGPA,
    targetGPA,
    remaining,
    totalUnits,
    unitsPerSem
  );

  const isDark = theme === 'dark';
  const gridColor = isDark ? 'oklch(0.26 0.05 256)' : 'oklch(0.92 0.01 258)';
  const textColor = isDark ? 'oklch(0.97 0.01 258)' : 'oklch(0.16 0.02 256.1)';

  // Projection scenarios
  const projectionData = [];
  let projectedCGPA = currentCGPA;
  let projectedUnits = totalUnits;

  for (let i = 1; i <= remaining; i++) {
    let semesterGPA = requiredGPA;

    // Scenario mode: first semester with scenario GPA, rest at required
    if (scenarioMode && i === 1) {
      semesterGPA = parseFloat(scenarioGPA) || requiredGPA;
    }

    const qualityPoints = semesterGPA * unitsPerSem;
    projectedUnits += unitsPerSem;
    projectedCGPA = (currentCGPA * totalUnits + qualityPoints) / projectedUnits;

    projectionData.push({
      semester: `Sem ${i}`,
      projectedGPA: Math.min(projectedCGPA, settings.scaleType === '5.0' ? 5.0 : 4.0),
      requiredGPA: Math.min(requiredGPA, settings.scaleType === '5.0' ? 5.0 : 4.0),
      targetGPA: Math.min(targetGPA, settings.scaleType === '5.0' ? 5.0 : 4.0),
    });
  }

  const finalProjectedCGPA = projectionData[projectionData.length - 1]?.projectedGPA || currentCGPA;
  const achievesTarget = finalProjectedCGPA >= targetGPA;

  const handleSaveTarget = () => {
    updateSettings({
      targetCgpa: parseFloat(targetCgpa) || 4.0,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">GPA Planner</h1>
          <p className="text-muted-foreground">
            Plan your academic path and calculate required average GPA per semester
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            {/* Current Stats */}
            <Card className="p-4 border border-border bg-card">
              <h3 className="font-semibold text-foreground mb-4">Current Status</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                    Current CGPA
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    {currentCGPA.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                    Total Units
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {totalUnits}
                  </p>
                </div>
              </div>
            </Card>

            {/* Planning Inputs */}
            <Card className="p-6 border border-border">
              <h3 className="font-semibold text-foreground mb-4">Planning Inputs</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="target" className="text-foreground font-medium">
                      Target CGPA
                    </Label>
                    <span className="text-sm font-semibold text-primary">
                      {targetCgpa}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      id="target"
                      type="number"
                      min="0"
                      max={settings.scaleType === '5.0' ? '5' : '4'}
                      step="0.1"
                      value={targetCgpa}
                      onChange={e => setTargetCgpa(e.target.value)}
                      className="flex-1 bg-background text-foreground border-border"
                    />
                    <Button
                      size="sm"
                      onClick={handleSaveTarget}
                      className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                    >
                      Save
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="semesters" className="text-foreground font-medium block mb-2">
                    Remaining Semesters: {remainingSemesters}
                  </Label>
                  <Slider
                    id="semesters"
                    min={1}
                    max={10}
                    step={1}
                    value={[parseInt(remainingSemesters)]}
                    onValueChange={v => setRemainingSemesters(v[0].toString())}
                    className="w-full"
                  />
                </div>

                <div>
                  <Label htmlFor="units" className="text-foreground font-medium block mb-2">
                    Units per Semester: {unitsPerSemester}
                  </Label>
                  <Slider
                    id="units"
                    min={3}
                    max={30}
                    step={1}
                    value={[parseInt(unitsPerSemester)]}
                    onValueChange={v => setUnitsPerSemester(v[0].toString())}
                    className="w-full"
                  />
                </div>
              </div>
            </Card>

            {/* Scenario Section */}
            <Card className="p-6 border border-border">
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  id="scenario"
                  checked={scenarioMode}
                  onChange={e => setScenarioMode(e.target.checked)}
                  className="rounded"
                />
                <label
                  htmlFor="scenario"
                  className="text-sm font-medium text-foreground cursor-pointer"
                >
                  What-If Scenario
                </label>
              </div>

              {scenarioMode && (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground">
                    See how a specific semester GPA affects your projection
                  </p>
                  <div>
                    <Label htmlFor="scenario-gpa" className="text-foreground font-medium block mb-2">
                      First Semester GPA
                    </Label>
                    <Input
                      id="scenario-gpa"
                      type="number"
                      min="0"
                      max={settings.scaleType === '5.0' ? '5' : '4'}
                      step="0.1"
                      value={scenarioGPA}
                      onChange={e => setScenarioGPA(e.target.value)}
                      className="bg-background text-foreground border-border"
                    />
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Required GPA Card */}
            <Card className="p-6 border border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-accent" />
                Required Average GPA
              </h3>

              {requiredGPA > (settings.scaleType === '5.0' ? 5.0 : 4.0) ? (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <p className="text-destructive font-semibold">
                    Target Not Achievable
                  </p>
                  <p className="text-xs text-destructive/80 mt-1">
                    To reach {targetCgpa} CGPA in {remainingSemesters} semesters, you would need an average GPA of {requiredGPA.toFixed(2)}, which exceeds the maximum of {settings.scaleType === '5.0' ? '5.0' : '4.0'}. Consider extending your timeline or lowering your target.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-primary/10 rounded-lg p-4">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">
                      Required Per Semester
                    </p>
                    <p className="text-3xl font-bold text-primary">
                      {requiredGPA.toFixed(2)}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-muted rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1">
                        Total Future Units
                      </p>
                      <p className="text-xl font-bold text-foreground">
                        {unitsPerSem * remaining}
                      </p>
                    </div>
                    <div className="bg-muted rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1">
                        Final CGPA (projected)
                      </p>
                      <p className={`text-xl font-bold ${achievesTarget ? 'text-accent' : 'text-destructive'}`}>
                        {finalProjectedCGPA.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {achievesTarget && (
                    <div className="bg-accent/10 border border-accent/20 rounded-lg p-3 flex items-start gap-2">
                      <Lightbulb className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-accent">
                        With consistent {requiredGPA.toFixed(2)} GPA, you'll achieve your target!
                      </p>
                    </div>
                  )}
                </div>
              )}
            </Card>

            {/* Projection Chart */}
            <Card className="p-6 border border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                CGPA Projection
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={projectionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="semester" stroke={textColor} style={{ fontSize: '12px' }} />
                  <YAxis
                    domain={[0, settings.scaleType === '5.0' ? 5.1 : 4.1]}
                    stroke={textColor}
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? 'oklch(0.18 0.01 256)' : 'oklch(1 0 0)',
                      border: `1px solid ${gridColor}`,
                      borderRadius: '8px',
                      color: textColor,
                    }}
                    labelStyle={{ color: textColor }}
                    formatter={(value: number) => (value as number).toFixed(2)}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="projectedGPA"
                    stroke="oklch(0.26 0.16 264.4)"
                    name="Projected CGPA"
                    strokeWidth={3}
                    dot={{ fill: 'oklch(0.26 0.16 264.4)', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="requiredGPA"
                    stroke="oklch(0.62 0.24 29.24)"
                    name="Required Per Sem"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="targetGPA"
                    stroke={gridColor}
                    name="Target"
                    strokeWidth={1}
                    strokeDasharray="3 3"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
