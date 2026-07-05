/**
 * Clean TypeScript interfaces representing the data structures
 */

export interface Profile {
  id: string;
  name: string;
  role: 'student' | 'faculty';
  enrollmentNo?: string; // Present only for students
  employeeId?: string;   // Present only for faculty
  department: string;
  email: string;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
}

export interface Attendance {
  id: string;
  studentId: string; // references Profile.id
  courseId: string;  // references Course.id
  date: string;      // YYYY-MM-DD
  status: 'Present' | 'Absent' | 'Late';
}

export type AssessmentType = 'MST-1' | 'MST-2' | 'Assignment' | 'End-Sem';

export interface Marks {
  id: string;
  studentId: string;       // references Profile.id
  courseId: string;        // references Course.id
  assessmentType: AssessmentType;
  marksObtained: number;
  maxMarks: number;
}

/**
 * Mock Profiles
 */
export const mockProfiles: Profile[] = [
  {
    id: 'p-student-1',
    name: 'Jay Rajput',
    role: 'student',
    enrollmentNo: '0808CI251117',
    department: 'Computer Science and Engineering',
    email: 'jay.rajput@example.com'
  },
  {
    id: 'p-faculty-1',
    name: 'Dr. Saroj Raghuvanshi',
    role: 'faculty',
    employeeId: 'EMP-SAROJ-101',
    department: 'Applied Sciences',
    email: 'saroj.raghuvanshi@example.com'
  }
];

/**
 * Mock Courses
 */
export const mockCourses: Course[] = [
  {
    id: 'c-bt104',
    code: 'BT-104',
    name: 'Basic Electrical Engineering (BT-104)',
    credits: 4
  },
  {
    id: 'c-bt105',
    code: 'BT-105',
    name: 'Applied Chemistry (BT-105)',
    credits: 4
  }
];

/**
 * Mock Attendance Rows
 */
export const mockAttendance: Attendance[] = [
  // Attendance records for Jay Rajput in Basic Electrical Engineering (BT-104)
  {
    id: 'att-1',
    studentId: 'p-student-1',
    courseId: 'c-bt104',
    date: '2026-07-01',
    status: 'Present'
  },
  {
    id: 'att-2',
    studentId: 'p-student-1',
    courseId: 'c-bt104',
    date: '2026-07-02',
    status: 'Present'
  },
  {
    id: 'att-3',
    studentId: 'p-student-1',
    courseId: 'c-bt104',
    date: '2026-07-03',
    status: 'Absent'
  },
  {
    id: 'att-4',
    studentId: 'p-student-1',
    courseId: 'c-bt104',
    date: '2026-07-04',
    status: 'Present'
  },

  // Attendance records for Jay Rajput in Applied Chemistry (BT-105)
  {
    id: 'att-5',
    studentId: 'p-student-1',
    courseId: 'c-bt105',
    date: '2026-07-01',
    status: 'Present'
  },
  {
    id: 'att-6',
    studentId: 'p-student-1',
    courseId: 'c-bt105',
    date: '2026-07-02',
    status: 'Late'
  },
  {
    id: 'att-7',
    studentId: 'p-student-1',
    courseId: 'c-bt105',
    date: '2026-07-03',
    status: 'Present'
  },
  {
    id: 'att-8',
    studentId: 'p-student-1',
    courseId: 'c-bt105',
    date: '2026-07-04',
    status: 'Absent'
  }
];

/**
 * Mock Marks entries (MST-1, MST-2, Assignments, End-Sem)
 */
export const mockMarks: Marks[] = [
  // Marks for Jay Rajput in Basic Electrical Engineering (BT-104)
  {
    id: 'mark-1',
    studentId: 'p-student-1',
    courseId: 'c-bt104',
    assessmentType: 'MST-1',
    marksObtained: 17,
    maxMarks: 20
  },
  {
    id: 'mark-2',
    studentId: 'p-student-1',
    courseId: 'c-bt104',
    assessmentType: 'MST-2',
    marksObtained: 18,
    maxMarks: 20
  },
  {
    id: 'mark-3',
    studentId: 'p-student-1',
    courseId: 'c-bt104',
    assessmentType: 'Assignment',
    marksObtained: 9,
    maxMarks: 10
  },
  {
    id: 'mark-4',
    studentId: 'p-student-1',
    courseId: 'c-bt104',
    assessmentType: 'End-Sem',
    marksObtained: 62,
    maxMarks: 70
  },

  // Marks for Jay Rajput in Applied Chemistry (BT-105)
  {
    id: 'mark-5',
    studentId: 'p-student-1',
    courseId: 'c-bt105',
    assessmentType: 'MST-1',
    marksObtained: 15,
    maxMarks: 20
  },
  {
    id: 'mark-6',
    studentId: 'p-student-1',
    courseId: 'c-bt105',
    assessmentType: 'MST-2',
    marksObtained: 16,
    maxMarks: 20
  },
  {
    id: 'mark-7',
    studentId: 'p-student-1',
    courseId: 'c-bt105',
    assessmentType: 'Assignment',
    marksObtained: 8,
    maxMarks: 10
  },
  {
    id: 'mark-8',
    studentId: 'p-student-1',
    courseId: 'c-bt105',
    assessmentType: 'End-Sem',
    marksObtained: 58,
    maxMarks: 70
  }
];
