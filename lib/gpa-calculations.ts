// GPA Calculation Utilities

export interface GradePoint {
  letter: string;
  minScore: number;
  maxScore: number;
  point: number;
}

export interface Course {
  id: string;
  code: string;
  title?: string;
  units: number;
  score: number;
  gradeLetter?: string;
  gradePoint: number;
  createdAt: number;
}

export interface Semester {
  id: string;
  session: string; // e.g., "2023/2024"
  term: number; // 1, 2, or 3
  level: number; // 100, 200, 300, etc.
  createdAt: number;
}

// Default Nigerian 5.0 scale
export const DEFAULT_GRADE_SCALE: GradePoint[] = [
  { letter: 'A', minScore: 70, maxScore: 100, point: 5.0 },
  { letter: 'B', minScore: 60, maxScore: 69, point: 4.0 },
  { letter: 'C', minScore: 50, maxScore: 59, point: 3.0 },
  { letter: 'D', minScore: 45, maxScore: 49, point: 2.0 },
  { letter: 'E', minScore: 40, maxScore: 44, point: 1.0 },
  { letter: 'F', minScore: 0, maxScore: 39, point: 0.0 },
];

export const GRADE_SCALE_4_0: GradePoint[] = [
  { letter: 'A', minScore: 90, maxScore: 100, point: 4.0 },
  { letter: 'B', minScore: 80, maxScore: 89, point: 3.0 },
  { letter: 'C', minScore: 70, maxScore: 79, point: 2.0 },
  { letter: 'D', minScore: 60, maxScore: 69, point: 1.0 },
  { letter: 'F', minScore: 0, maxScore: 59, point: 0.0 },
];

/**
 * Get grade letter and point from score based on scale
 */
export function getGradeFromScore(
  score: number,
  gradeScale: GradePoint[]
): { letter: string; point: number } {
  const grade = gradeScale.find(g => score >= g.minScore && score <= g.maxScore);
  if (!grade) {
    return { letter: 'F', point: 0.0 };
  }
  return { letter: grade.letter, point: grade.point };
}

/**
 * Calculate quality points for a course (units × grade point)
 */
export function calculateQualityPoints(course: Course): number {
  return course.units * course.gradePoint;
}

/**
 * Calculate semester GPA
 */
export function calculateSemesterGPA(courses: Course[]): number {
  if (courses.length === 0) return 0;
  
  const totalQualityPoints = courses.reduce((sum, course) => {
    return sum + calculateQualityPoints(course);
  }, 0);

  const totalUnits = courses.reduce((sum, course) => {
    return sum + course.units;
  }, 0);

  if (totalUnits === 0) return 0;
  return Math.round((totalQualityPoints / totalUnits) * 100) / 100;
}

/**
 * Calculate CGPA (Cumulative GPA across all semesters)
 */
export function calculateCGPA(allCourses: Course[]): number {
  if (allCourses.length === 0) return 0;

  const totalQualityPoints = allCourses.reduce((sum, course) => {
    return sum + calculateQualityPoints(course);
  }, 0);

  const totalUnits = allCourses.reduce((sum, course) => {
    return sum + course.units;
  }, 0);

  if (totalUnits === 0) return 0;
  return Math.round((totalQualityPoints / totalUnits) * 100) / 100;
}

/**
 * Get total units and quality points for courses
 */
export function getTotalUnitsAndQualityPoints(
  courses: Course[]
): { units: number; qualityPoints: number } {
  const units = courses.reduce((sum, course) => sum + course.units, 0);
  const qualityPoints = courses.reduce(
    (sum, course) => sum + calculateQualityPoints(course),
    0
  );
  return { units, qualityPoints };
}

/**
 * Identify retake courses (same course code in different semesters)
 */
export function identifyRetakes(
  coursesBySemester: Record<string, Course[]>
): Record<string, string[]> {
  // courseCode -> [semesterId, semesterId, ...]
  const courseCodeMap: Record<string, string[]> = {};

  Object.entries(coursesBySemester).forEach(([semesterId, courses]) => {
    courses.forEach(course => {
      if (!courseCodeMap[course.code]) {
        courseCodeMap[course.code] = [];
      }
      courseCodeMap[course.code].push(semesterId);
    });
  });

  // Filter only courses with retakes
  const retakes: Record<string, string[]> = {};
  Object.entries(courseCodeMap).forEach(([code, semesters]) => {
    if (semesters.length > 1) {
      retakes[code] = semesters;
    }
  });

  return retakes;
}

/**
 * Apply retake policy: replace or keep both
 */
export function applyRetakePolicy(
  courses: Course[],
  policy: 'replace' | 'keep-both',
  retakeCodes: Set<string>
): Course[] {
  if (policy === 'keep-both') {
    return courses;
  }

  if (policy === 'replace') {
    // Group by course code, keep only the latest attempt
    const courseMap: Record<string, Course> = {};
    courses.forEach(course => {
      if (retakeCodes.has(course.code)) {
        // Keep the latest (higher createdAt)
        if (!courseMap[course.code] || course.createdAt > courseMap[course.code].createdAt) {
          courseMap[course.code] = course;
        }
      } else {
        courseMap[course.code] = course;
      }
    });
    return Object.values(courseMap);
  }

  return courses;
}

/**
 * Calculate required average GPA per semester
 */
export function calculateRequiredGPA(
  currentCGPA: number,
  targetCGPA: number,
  remainingSemesters: number,
  totalUnitsCompleted: number,
  unitsPerSemester: number
): number {
  if (remainingSemesters <= 0) return 0;

  const totalFutureUnits = remainingSemesters * unitsPerSemester;
  const totalFutureQualityPoints =
    targetCGPA * (totalUnitsCompleted + totalFutureUnits) -
    currentCGPA * totalUnitsCompleted;

  if (totalFutureUnits === 0) return 0;
  return Math.round((totalFutureQualityPoints / totalFutureUnits) * 100) / 100;
}

/**
 * Validate course data
 */
export function validateCourse(
  code: string,
  units: number,
  score: number
): { valid: boolean; error?: string } {
  if (!code.trim()) {
    return { valid: false, error: 'Course code is required' };
  }
  if (units <= 0) {
    return { valid: false, error: 'Units must be greater than 0' };
  }
  if (score < 0 || score > 100) {
    return { valid: false, error: 'Score must be between 0 and 100' };
  }
  return { valid: true };
}

/**
 * Check for duplicate course code in semester
 */
export function hasDuplicateCourseCode(
  courses: Course[],
  courseCode: string,
  excludeId?: string
): boolean {
  return courses.some(
    c =>
      c.code.toUpperCase() === courseCode.toUpperCase() &&
      c.id !== excludeId
  );
}
