
import { GoogleGenAI } from "@google/genai";
// Updated imports to include Lead type
import { Student, AttendanceRecord, Lead } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Analyzes attendance data and provides a human-readable summary.
 */
export const getAttendanceSummary = async (attendance: AttendanceRecord[], students: Student[]) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze this attendance data and provide a concise human-readable summary.
    Data: ${JSON.stringify(attendance)}
    Students: ${JSON.stringify(students)}
    Focus on trends, low attendance alerts, and key absentees.`,
  });
  return response.text;
};

/**
 * Deep insights assistant with refined system instructions.
 */
export const getAIAssistantResponse = async (
  query: string, 
  data: { students: Student[], attendance: AttendanceRecord[], currentDate: string }
) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `You are an academic assistant for Academix.
    Current Date: ${data.currentDate}
    
    Campus Data:
    - Student List: ${JSON.stringify(data.students)}
    - Attendance Logs: ${JSON.stringify(data.attendance)}
    
    STRICT RULES:
    1. Do NOT use markdown symbols like asterisks (*) for bolding or list markers. 
    2. Provide clean, professional plain text output.
    3. Filter logs for Date: ${data.currentDate} when asked for "today".
    4. Include Department in all student mentions.
    
    User Query: ${query}`,
    config: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
    }
  });
  return response.text;
};

/**
 * Generates an AI follow-up message for a lead.
 * Uses gemini-3-flash-preview for quick drafting.
 */
export const generateLeadFollowup = async (lead: Lead) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Draft a personalized and professional follow-up message for a potential student.
    Lead Name: ${lead.name}
    Course: ${lead.course}
    Previous Notes: ${lead.notes.join(', ')}
    
    The message should be encouraging and aim to schedule a call or meeting. Keep it concise and professional.`,
  });
  return response.text;
};