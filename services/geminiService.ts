

import { GoogleGenAI } from "@google/genai";
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
 * Generates a follow-up message for a lead.
 */
export const generateLeadFollowup = async (lead: Lead) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `You are an admissions assistant for Academix.
    Generate a concise, friendly, and professional follow-up message for a prospective student.
    
    Lead Details:
    - Name: ${lead.name}
    - Course of Interest: ${lead.course}
    - Last Note: ${lead.notes.length > 0 ? lead.notes[0] : 'No notes available.'}
    
    RULES:
    - Keep the message under 40 words.
    - The tone should be encouraging and helpful.
    - Do NOT use markdown.
    - End with a question to encourage a reply.`,
  });
  return response.text;
};