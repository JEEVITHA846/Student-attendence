
export enum AttendanceStatus {
  PRESENT = 'Present',
  ABSENT = 'Absent',
  OD = 'OD',
  NOT_MARKED = 'Not Marked'
}

// Added LeadStatus enum to support Lead Desk features
export enum LeadStatus {
  NEW = 'New',
  CONTACTED = 'Contacted',
  CONVERTED = 'Converted'
}

export interface Student {
  id: string;
  roll_no: string;
  name: string;
  department: string;
  year: number;
  status: 'Active' | 'Inactive';
  attendancePercentage: number;
}

// Added Lead interface for tracking student inquiries
export interface Lead {
  id: string;
  name: string;
  phone: string;
  course: string;
  status: LeadStatus;
  next_follow_up: string;
  notes: string[];
}

export interface AttendanceRecord {
  id: string;
  date: string;
  timestamp: string; // To track exact time for folder-like sorting
  student_id: string;
  status: AttendanceStatus;
  subject: string;
  class: string;
  remark?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}