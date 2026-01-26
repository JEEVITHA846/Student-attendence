import { supabase } from './supabaseClient';
import { Student, AttendanceRecord } from "../types";

// Helper to handle Supabase responses and errors consistently
const handleSupabaseError = ({ error, data }: { error: any, data: any }, context: string) => {
  if (error) {
    console.error(`Supabase error in ${context}:`, error.message);
    throw error;
  }
  return data;
};

export const StudentAPI = {
  getAll: async (): Promise<Student[]> => {
    const { data, error } = await supabase.from('students').select('*').order('name', { ascending: true });
    return handleSupabaseError({ data, error }, 'getAll students');
  },
  create: async (studentData: Omit<Student, 'id' | 'attendancePercentage'>): Promise<Student> => {
    const { data, error } = await supabase.from('students').insert([studentData]).select();
    const result = handleSupabaseError({ data, error }, 'create student');
    return result[0];
  },
  update: async (id: string, updates: Partial<Student>): Promise<Student> => {
    const { data, error } = await supabase.from('students').update(updates).eq('id', id).select();
    const result = handleSupabaseError({ data, error }, 'update student');
    return result[0];
  },
  delete: async (id: string): Promise<void> => {
    const { error } = await supabase.from('students').delete().eq('id', id);
    handleSupabaseError({ data: null, error }, 'delete student');
  },
};

export const AttendanceAPI = {
  getAll: async (): Promise<AttendanceRecord[]> => {
    const { data, error } = await supabase.from('attendance_records').select('*');
    return handleSupabaseError({ data, error }, 'getAll attendance');
  },
  saveBatch: async (records: Omit<AttendanceRecord, 'id'>[]): Promise<AttendanceRecord[]> => {
    const { data, error } = await supabase.from('attendance_records').insert(records).select();
    return handleSupabaseError({ data, error }, 'saveBatch attendance');
  },
  deleteSession: async (date: string, timestamp: string): Promise<void> => {
    const { error } = await supabase.from('attendance_records').delete().match({ date, timestamp });
    handleSupabaseError({ data: null, error }, 'deleteSession');
  },
  deleteFolder: async (date: string): Promise<void> => {
    const { error } = await supabase.from('attendance_records').delete().eq('date', date);
    handleSupabaseError({ data: null, error }, 'deleteFolder');
  },
  deleteByStudentId: async (student_id: string): Promise<void> => {
    const { error } = await supabase.from('attendance_records').delete().eq('student_id', student_id);
    handleSupabaseError({ data: null, error }, 'deleteByStudentId');
  },
};
