export type EventCategory = 'work' | 'personal' | 'health' | 'social' | 'other';

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string; // ISO Date string
  end: string; // ISO Date string
  description?: string;
  location?: string;
  attendees?: string[];
  category: EventCategory;
}

export interface ScheduleResponse {
  events: Omit<CalendarEvent, 'id'>[];
}
