
import { GoogleGenAI } from "@google/genai";
import { Student, AttendanceRecord, Lead } from "../types";

let aiInstance: GoogleGenAI | null = null;

const getAI = () => {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set in the environment.");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
};

/**
 * Analyzes attendance data and provides a human-readable summary.
 */
export const getAttendanceSummary = async (attendance: AttendanceRecord[], students: Student[]) => {
  const ai = getAI();
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
  const ai = getAI();
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
 * Generates a followup message for a lead using AI.
 */
export const generateLeadFollowup = async (lead: Lead) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a short, friendly professional follow-up message for a student lead.
    Lead Name: ${lead.name}
    Course Interest: ${lead.course}
    Last Notes: ${JSON.stringify(lead.notes)}
    The message should be suitable for WhatsApp or Email.`,
  });
  return response.text;
};
