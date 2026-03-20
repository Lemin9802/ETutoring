import { UserListType } from "@/types/Users";

// Generate mock users data
const mockUsers: UserListType[] = Array.from({ length: 50 }).map<UserListType>(
  (_, i) => ({
    id: crypto.randomUUID(),
    name: `User ${i}`,
    role: i % 3 === 0 ? "tutor" : i % 2 === 0 ? "student" : "moderator",
    email: `user${i}@example.com`,
    address: `London, Park Lane no. ${i}`,
  })
);

// Filter mock data for students and tutors
export const initialStudentsData: UserListType[] = mockUsers.filter(user => user.role === "student");
export const initialTutorsData: UserListType[] = mockUsers.filter(user => user.role === "tutor");

export interface TeacherStudentType {
  id: string;
  student_id: string;
  tutor_id: string;
  created_at: string;
  updated_at: string;
}

export interface MeetingType {
  id: string;
  teacher_student_id: string;
  scheduled_date: string;
  scheduled_time: string;
  duration_minutes: number;
  topic: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  mode: 'online' | 'offline';
  location: string;
  created_at: string;
  updated_at: string;
}

// Generate initial teacher-student associations using the mock data
const initialTeacherStudentData: TeacherStudentType[] = initialStudentsData.slice(0, 3).flatMap(student => 
  initialTutorsData.slice(0, 2).map(tutor => ({
    id: crypto.randomUUID(),
    student_id: student.id,
    tutor_id: tutor.id,
    created_at: new Date("2024-01-01").toISOString(),
    updated_at: new Date("2024-01-01").toISOString()
  }))
);

// Generate initial appointments using the teacher-student associations
export const initialAppointmentsData: MeetingType[] = initialTeacherStudentData.slice(0, 2).map((ts, index) => ({
  id: crypto.randomUUID(),
  teacher_student_id: ts.id,
  scheduled_date: new Date(2024, 3, 5 + index * 5).toISOString(),
  scheduled_time: `${10 + index * 4}:00`,
  duration_minutes: 60,
  topic: index === 0 ? "Math Tutoring" : "English Language",
  status: 'scheduled',
  mode: index % 2 === 0 ? 'online' : 'offline',
  location: index % 2 === 0 ? `https://meet.example.com/room${index + 1}` : "London, UK",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}));

// Helper function to get user name by ID
export const getUserNameById = (id: string): string => {
  const student = initialStudentsData.find((s: UserListType) => s.id === id);
  if (student) return student.name;
  const tutor = initialTutorsData.find((t: UserListType) => t.id === id);
  if (tutor) return tutor.name;
  return 'Unknown User';
};

// Helper functions for teacher-student associations
export const getStudentTutors = (studentId: string): UserListType[] => {
  const associations = initialTeacherStudentData.filter(ts => ts.student_id === studentId);
  return initialTutorsData.filter((tutor: UserListType) => associations.some(assoc => assoc.tutor_id === tutor.id));
};

export const getTutorStudents = (tutorId: string): UserListType[] => {
  const associations = initialTeacherStudentData.filter(ts => ts.tutor_id === tutorId);
  return initialStudentsData.filter((student: UserListType) => associations.some(assoc => assoc.student_id === student.id));
};

export const getTeacherStudentById = (id: string): TeacherStudentType | undefined => {
  return initialTeacherStudentData.find(ts => ts.id === id);
};

export const createTeacherStudent = async (studentId: string, tutorId: string): Promise<TeacherStudentType> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  if (Math.random() > 0.1) {
    const newAssociation: TeacherStudentType = {
      id: crypto.randomUUID(),
      student_id: studentId,
      tutor_id: tutorId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    initialTeacherStudentData.push(newAssociation);
    return newAssociation;
  }
  throw new Error('Failed to create teacher-student association');
};

// Mock API functions
export const associateTutorsWithStudent = async (selectedTutorIds: string[], studentId: string) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  if (Math.random() > 0.1) {
    // Create new teacher-student associations
    await Promise.all(selectedTutorIds.map(tutorId => createTeacherStudent(studentId, tutorId)));
    return true;
  }
  throw new Error('Failed to associate tutors');
};

export const associateStudentsWithTutor = async (selectedStudentIds: string[], tutorId: string) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  if (Math.random() > 0.1) {
    // Create new teacher-student associations
    await Promise.all(selectedStudentIds.map(studentId => createTeacherStudent(studentId, tutorId)));
    return true;
  }
  throw new Error('Failed to associate students');
};

// Meeting-related functions
export const createMeeting = async (meeting: Omit<MeetingType, 'id' | 'created_at' | 'updated_at'>) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  if (Math.random() > 0.1) {
    const newMeeting: MeetingType = {
      ...meeting,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    initialAppointmentsData.push(newMeeting);
    return newMeeting;
  }
  throw new Error('Failed to create meeting');
};

export const updateMeetingStatus = async (meetingId: string, status: MeetingType['status']) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  if (Math.random() > 0.1) {
    const meetingIndex = initialAppointmentsData.findIndex(a => a.id === meetingId);
    if (meetingIndex !== -1) {
      initialAppointmentsData[meetingIndex].status = status;
      initialAppointmentsData[meetingIndex].updated_at = new Date().toISOString();
      return initialAppointmentsData[meetingIndex];
    }
    throw new Error('Meeting not found');
  }
  throw new Error('Failed to update meeting status');
};

export const deleteMeeting = async (meetingId: string) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  if (Math.random() > 0.1) {
    const meetingIndex = initialAppointmentsData.findIndex(a => a.id === meetingId);
    if (meetingIndex !== -1) {
      initialAppointmentsData.splice(meetingIndex, 1);
      return true;
    }
    throw new Error('Meeting not found');
  }
  throw new Error('Failed to delete meeting');
};

// Basic API gets
export const getStudents = async () => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return initialStudentsData;
};

export const getTutors = async () => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return initialTutorsData;
};

export const getMeetings = async () => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return initialAppointmentsData;
}; 