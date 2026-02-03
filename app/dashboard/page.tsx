'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { useAuth } from '@/hooks/use-auth';
import { AppNavbar } from '@/components/app-navbar';
import { GPACard } from '@/components/dashboard/gpa-card';
import { StatsCard } from '@/components/dashboard/stats-card';
import { GPATrendChart } from '@/components/dashboard/gpa-trend-chart';
import { ProgressRing } from '@/components/dashboard/progress-ring';
import { Button } from '@/components/ui/button';
import {
  calculateCGPA,
  calculateSemesterGPA,
  getTotalUnitsAndQualityPoints,
  type Semester,
  type Course,
} from '@/lib/gpa-calculations';
import { Plus, BookOpen, Award, Zap } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);

  const semesters = useStore(state => state.semesters);
  const coursesBySemester = useStore(state => state.coursesBySemester);
  const getSettings = useStore(state => state.getSettings);

  const settings = getSettings();

  if (!mounted) {
    setMounted(true);
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  // Get all courses
  const allCourses = Object.values(coursesBySemester).flat();

  // Calculate GPAs
  const cgpa = calculateCGPA(allCourses);
  const { units: totalUnits, qualityPoints: totalQualityPoints } =
    getTotalUnitsAndQualityPoints(allCourses);

  // Calculate GPA for latest semester
  const latestSemester = semesters.sort(
    (a, b) => b.createdAt - a.createdAt
  )[0];
  const latestSemesterCourses = latestSemester
    ? coursesBySemester[latestSemester.id] || []
    : [];
  const latestSemesterGPA = calculateSemesterGPA(latestSemesterCourses);
  const { units: latestSemesterUnits } = getTotalUnitsAndQualityPoints(
    latestSemesterCourses
  );

  // Build trend data
  const trendData = semesters
    .sort((a, b) => a.createdAt - b.createdAt)
    .map((semester, index) => {
      const courses = coursesBySemester[semester.id] || [];
      const semesterGPA = calculateSemesterGPA(courses);
      const allPreviousCoursesForCGPA = Object.values(coursesBySemester)
        .slice(0, index + 1)
        .flat();
      const cumulativeGPA = calculateCGPA(allPreviousCoursesForCGPA);

      return {
        semester: `${semester.level}L ${semester.term}`,
        gpa: semesterGPA,
        cgpa: cumulativeGPA,
      };
    });

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Track your academic progress across semesters
          </p>
        </div>

        {semesters.length === 0 ? (
          <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h2 className="text-lg font-semibold text-foreground mb-2">
              No semesters yet
            </h2>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Start tracking your GPA by adding your first semester and courses.
            </p>
            <Link href="/dashboard?add-semester=true">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer">
                <Plus className="h-4 w-4 mr-2" />
                Add First Semester
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Main GPA Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GPACard
                title="Cumulative GPA (CGPA)"
                gpa={cgpa}
                maxGPA={settings.scaleType === '5.0' ? 5.0 : 4.0}
                description={`${totalUnits} total units completed`}
                color="primary"
              />
              {latestSemester && (
                <GPACard
                  title="Current Semester GPA"
                  gpa={latestSemesterGPA}
                  maxGPA={settings.scaleType === '5.0' ? 5.0 : 4.0}
                  description={`${latestSemesterUnits} units in ${latestSemester.level}L ${latestSemester.term}`}
                  color="accent"
                />
              )}
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatsCard
                title="Total Units"
                value={totalUnits}
                icon={BookOpen}
                description="Completed"
                variant="default"
              />
              <StatsCard
                title="Total Quality Points"
                value={totalQualityPoints.toFixed(1)}
                icon={Award}
                description="GPA × Units sum"
                variant="accent"
              />
              <StatsCard
                title="Semesters"
                value={semesters.length}
                icon={Zap}
                description="Active"
                variant="secondary"
              />
            </div>

            {/* Progress to Target */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <GPATrendChart
                  data={trendData}
                  targetCGPA={settings.targetCgpa}
                />
              </div>
              <ProgressRing
                current={cgpa}
                target={settings.targetCgpa}
                maxValue={settings.scaleType === '5.0' ? 5.0 : 4.0}
                title="CGPA Target Progress"
                subtitle={`Target: ${settings.targetCgpa.toFixed(2)} GPA`}
              />
            </div>

            {/* Quick Actions */}
            <div className="bg-card border border-border rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link href="/dashboard/add-semester">
                  <Button
                    variant="outline"
                    className="w-full border-border text-foreground hover:bg-muted bg-transparent"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Semester
                  </Button>
                </Link>
                {latestSemester && (
                  <Link href={`/semester/${latestSemester.id}`}>
                    <Button
                      variant="outline"
                      className="w-full border-border text-foreground hover:bg-muted bg-transparent"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Course
                    </Button>
                  </Link>
                )}
                <Link href="/planner">
                  <Button
                    variant="outline"
                    className="w-full border-border text-foreground hover:bg-muted bg-transparent"
                  >
                    Plan Future GPA
                  </Button>
                </Link>
                <Link href="/settings">
                  <Button
                    variant="outline"
                    className="w-full border-border text-foreground hover:bg-muted bg-transparent"
                  >
                    View Settings
                  </Button>
                </Link>
              </div>
            </div>

            {/* Recent Semesters */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Recent Semesters
              </h3>
              <div className="space-y-3">
                {semesters
                  .sort((a, b) => b.createdAt - a.createdAt)
                  .slice(0, 5)
                  .map(semester => {
                    const courses = coursesBySemester[semester.id] || [];
                    const semesterGPA = calculateSemesterGPA(courses);

                    return (
                      <Link
                        key={semester.id}
                        href={`/semester/${semester.id}`}
                        className="block"
                      >
                        <div className="flex items-center justify-between p-3 hover:bg-muted rounded-lg transition-colors border border-transparent hover:border-border">
                          <div>
                            <p className="font-medium text-foreground">
                              {semester.level}L - {semester.session}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Term {semester.term} • {courses.length} courses
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-foreground">
                              {semesterGPA.toFixed(2)}
                            </p>
                            <p className="text-xs text-muted-foreground">GPA</p>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
