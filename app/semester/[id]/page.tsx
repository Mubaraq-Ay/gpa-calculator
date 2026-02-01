'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { useAuth } from '@/hooks/use-auth';
import { AppNavbar } from '@/components/app-navbar';
import { SemesterDialog } from '@/components/dialogs/semester-dialog';
import { CourseDialog } from '@/components/dialogs/course-dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  calculateSemesterGPA,
  getTotalUnitsAndQualityPoints,
  getGradeFromScore,
} from '@/lib/gpa-calculations';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, ArrowLeft, Award, BookOpen } from 'lucide-react';

export default function SemesterPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);

  const semesters = useStore(state => state.semesters);
  const coursesBySemester = useStore(state => state.coursesBySemester);
  const deleteSemester = useStore(state => state.deleteSemester);
  const deleteCourse = useStore(state => state.deleteCourse);
  const getSettings = useStore(state => state.getSettings);

  const [semesterDialogOpen, setSemesterDialogOpen] = useState(false);
  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    type: 'semester' | 'course';
    id: string;
  } | null>(null);

  if (!mounted) {
    setMounted(true);
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  const semester = semesters.find(s => s.id === id);
  const courses = coursesBySemester[id as string] || [];
  const settings = getSettings();

  if (!semester) {
    return (
      <div className="min-h-screen bg-background">
        <AppNavbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-4">Semester not found</p>
            <Link href="/dashboard">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const semesterGPA = calculateSemesterGPA(courses);
  const { units: totalUnits, qualityPoints } =
    getTotalUnitsAndQualityPoints(courses);

  const handleDeleteSemester = () => {
    deleteSemester(semester.id);
    toast.success('Semester deleted');
    router.push('/dashboard');
  };

  const handleDeleteCourse = (courseId: string) => {
    deleteCourse(semester.id, courseId);
    toast.success('Course deleted');
    setDeleteConfirmOpen(false);
  };

  // Identify high-unit low-grade courses
  const impactfulCourses = courses.filter(c => c.units >= 3 && c.gradePoint <= 2);

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard" className="flex items-center gap-2 text-primary hover:underline mb-4">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Link>

          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {semester.level}L - {semester.session} (Term {semester.term})
              </h1>
              <p className="text-muted-foreground">
                Manage courses and track your performance
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSemesterDialogOpen(true)}
                className="border-border text-foreground hover:bg-muted"
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setItemToDelete({ type: 'semester', id: semester.id });
                  setDeleteConfirmOpen(true);
                }}
                className="border-destructive text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-4 border border-border">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                Semester GPA
              </p>
              <p className="text-3xl font-bold text-foreground">
                {semesterGPA.toFixed(2)}
              </p>
            </Card>
            <Card className="p-4 border border-border">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                Total Units
              </p>
              <p className="text-3xl font-bold text-foreground">{totalUnits}</p>
            </Card>
            <Card className="p-4 border border-border">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                Quality Points
              </p>
              <p className="text-3xl font-bold text-foreground">
                {qualityPoints.toFixed(1)}
              </p>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Courses */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">Courses</h2>
              <Button
                size="sm"
                onClick={() => {
                  setEditingCourse(null);
                  setCourseDialogOpen(true);
                }}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Course
              </Button>
            </div>

            {courses.length === 0 ? (
              <Card className="p-8 border-2 border-dashed border-border text-center">
                <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground">No courses added yet</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {courses.map(course => (
                  <Card
                    key={course.id}
                    className="p-4 border border-border hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-baseline gap-2 mb-1">
                          <p className="font-semibold text-foreground">
                            {course.code}
                          </p>
                          {impactfulCourses.find(c => c.id === course.id) && (
                            <span className="text-xs px-2 py-0.5 bg-destructive/10 text-destructive rounded-full">
                              High Impact
                            </span>
                          )}
                        </div>
                        {course.title && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {course.title}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-4 text-sm">
                          <div>
                            <p className="text-xs text-muted-foreground">Units</p>
                            <p className="font-semibold text-foreground">
                              {course.units}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Score</p>
                            <p className="font-semibold text-foreground">
                              {course.score.toFixed(0)}/100
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Grade</p>
                            <p className="font-semibold text-foreground">
                              {course.gradeLetter} ({course.gradePoint})
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Quality Points
                            </p>
                            <p className="font-semibold text-foreground">
                              {(course.units * course.gradePoint).toFixed(1)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingCourse(course.id);
                            setCourseDialogOpen(true);
                          }}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setItemToDelete({
                              type: 'course',
                              id: course.id,
                            });
                            setDeleteConfirmOpen(true);
                          }}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Impact Analysis */}
            {impactfulCourses.length > 0 && (
              <Card className="p-4 border border-accent/50 bg-accent/5">
                <h3 className="font-semibold text-accent mb-3 flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Impact Analysis
                </h3>
                <p className="text-xs text-muted-foreground mb-3">
                  These courses significantly impact your GPA:
                </p>
                <div className="space-y-2">
                  {impactfulCourses.map(course => (
                    <div key={course.id} className="text-xs">
                      <p className="font-medium text-foreground">
                        {course.code}
                      </p>
                      <p className="text-muted-foreground">
                        {course.units} units × {course.gradePoint} grade =
                        {' '}
                        {(course.units * course.gradePoint).toFixed(1)} points
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Grade Distribution */}
            <Card className="p-4 border border-border">
              <h3 className="font-semibold text-foreground mb-3">
                Grade Distribution
              </h3>
              <div className="space-y-2">
                {settings.gradeMapping.map(grade => {
                  const count = courses.filter(
                    c => c.gradeLetter === grade.letter
                  ).length;
                  return count > 0 ? (
                    <div key={grade.letter} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{grade.letter}</span>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-16 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{
                              width: `${(count / courses.length) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-foreground font-medium w-6 text-right">
                          {count}
                        </span>
                      </div>
                    </div>
                  ) : null;
                })}
              </div>
            </Card>
          </div>
        </div>
      </main>

      {/* Dialogs */}
      <SemesterDialog
        open={semesterDialogOpen}
        onOpenChange={setSemesterDialogOpen}
        semester={semester}
      />

      {courseDialogOpen && (
        <CourseDialog
          open={courseDialogOpen}
          onOpenChange={setCourseDialogOpen}
          semesterId={semester.id}
          course={
            editingCourse
              ? courses.find(c => c.id === editingCourse)
              : undefined
          }
          existingCourses={courses}
          gradeScale={settings.gradeMapping}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">
              Delete {itemToDelete?.type === 'semester' ? 'Semester' : 'Course'}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This action cannot be undone. All associated data will be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogCancel className="border-border text-foreground hover:bg-muted">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              if (itemToDelete?.type === 'semester') {
                handleDeleteSemester();
              } else if (itemToDelete?.type === 'course') {
                handleDeleteCourse(itemToDelete.id);
              }
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
