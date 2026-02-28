
import { supabase } from './supabaseClient';
import { Student, AttendanceRecord, DayNote, Lead } from "../types";

const handleSupabaseError = ({ error, data }: { error: any, data: any }, context: string) => {
  if (error) {
    console.error(`Supabase error in ${context}:`, error.message);
    throw error;
  }
  return data;
};

export const StudentAPI = {
  getAll: async (userId: string): Promise<Student[]> => {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });
    return handleSupabaseError({ data, error }, 'getAll students') || [];
  },
  create: async (studentData: Omit<Student, 'id' | 'attendancePercentage'>, userId: string): Promise<Student> => {
    const { data, error } = await supabase
      .from('students')
      .insert([{ ...studentData, user_id: userId }])
      .select();
    const result = handleSupabaseError({ data, error }, 'create student');
    if (!result || result.length === 0) throw new Error("Failed to create student.");
    return result[0];
  },
  update: async (id: string, updates: Partial<Student>): Promise<Student> => {
    const { data, error } = await supabase
      .from('students')
      .update(updates)
      .eq('id', id)
      .select();
    const result = handleSupabaseError({ data, error }, 'update student');
    return result[0];
  },
  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id);
    handleSupabaseError({ data: null, error }, 'delete student');
  },
};

export const AttendanceAPI = {
  getAll: async (userId: string): Promise<AttendanceRecord[]> => {
    const { data, error } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('user_id', userId);
    return handleSupabaseError({ data, error }, 'getAll attendance') || [];
  },
  saveBatch: async (records: Omit<AttendanceRecord, 'id'>[], userId: string): Promise<AttendanceRecord[]> => {
    if (records.length === 0) return [];
    const recordsWithUser = records.map(r => ({ ...r, user_id: userId }));
    const { data, error } = await supabase
      .from('attendance_records')
      .insert(recordsWithUser)
      .select();
    return handleSupabaseError({ data, error }, 'saveBatch attendance') || [];
  },
  deleteSession: async (date: string, timestamp: string, userId: string): Promise<void> => {
    const { error } = await supabase
      .from('attendance_records')
      .delete()
      .match({ date, timestamp, user_id: userId });
    handleSupabaseError({ data: null, error }, 'deleteSession');
  },
  deleteFolder: async (date: string, userId: string): Promise<void> => {
    const { error } = await supabase
      .from('attendance_records')
      .delete()
      .match({ date, user_id: userId });
    handleSupabaseError({ data: null, error }, 'deleteFolder');
  },
  deleteByStudentId: async (student_id: string): Promise<void> => {
    const { error } = await supabase
      .from('attendance_records')
      .delete()
      .eq('student_id', student_id);
    handleSupabaseError({ data: null, error }, 'deleteByStudentId');
  },
};

export const DayNoteAPI = {
  getAll: async (userId: string): Promise<DayNote[]> => {
    const { data, error } = await supabase
      .from('day_notes')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    return handleSupabaseError({ data, error }, 'getAll day notes') || [];
  },
  create: async (note: Omit<DayNote, 'id'>, userId: string): Promise<DayNote> => {
    const { data, error } = await supabase
      .from('day_notes')
      .insert([{ ...note, user_id: userId }])
      .select();
    const result = handleSupabaseError({ data, error }, 'create day note');
    return result[0];
  },
  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('day_notes')
      .delete()
      .eq('id', id);
    handleSupabaseError({ data: null, error }, 'delete day note');
  }
};

export const LeadAPI = {
  getAll: async (userId: string): Promise<Lead[]> => {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return handleSupabaseError({ data, error }, 'getAll leads') || [];
  },
  create: async (lead: Omit<Lead, 'id'>, userId: string): Promise<Lead> => {
    const { data, error } = await supabase
      .from('leads')
      .insert([{ ...lead, user_id: userId }])
      .select();
    const result = handleSupabaseError({ data, error }, 'create lead');
    return result[0];
  },
  update: async (id: string, updates: Partial<Lead>): Promise<Lead> => {
    const { data, error } = await supabase
      .from('leads')
      .update(updates)
      .eq('id', id)
      .select();
    const result = handleSupabaseError({ data, error }, 'update lead');
    return result[0];
  },
  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id);
    handleSupabaseError({ data: null, error }, 'delete lead');
  }
};
