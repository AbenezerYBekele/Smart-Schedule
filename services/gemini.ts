import { GoogleGenAI, Type } from "@google/genai";
import { ScheduleResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const parseScheduleRequest = async (
  prompt: string,
  userTimezone: string = Intl.DateTimeFormat().resolvedOptions().timeZone
): Promise<ScheduleResponse> => {
  const now = new Date().toISOString();
  
  // Define the schema strictly for type safety
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      events: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: "A concise title for the event."
            },
            start: {
              type: Type.STRING,
              description: `The start time of the event in ISO 8601 format (YYYY-MM-DDTHH:mm:ss). Assume current date is ${now} if relative dates like 'tomorrow' or 'next tuesday' are used.`,
            },
            end: {
              type: Type.STRING,
              description: "The end time of the event in ISO 8601 format. If duration is not specified, assume 1 hour."
            },
            description: {
              type: Type.STRING,
              description: "Any additional details or context mentioned."
            },
            location: {
              type: Type.STRING,
              description: "Physical location or virtual meeting link/platform."
            },
            attendees: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of people names or emails invited."
            },
            category: {
              type: Type.STRING,
              enum: ['work', 'personal', 'health', 'social', 'other'],
              description: "Categorize the event based on context."
            }
          },
          required: ["title", "start", "end", "category"],
          propertyOrdering: ["title", "start", "end", "category", "location", "description", "attendees"]
        }
      }
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Current Date/Time: ${now}. Timezone: ${userTimezone}. \n\nExtract calendar events from this request: "${prompt}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from Gemini");
    }

    return JSON.parse(text) as ScheduleResponse;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
