import React from 'react';
import { CalendarEvent } from '../types';
import { Calendar, Clock, MapPin, Users, Trash2 } from 'lucide-react';

interface EventCardProps {
  event: CalendarEvent;
  onDelete: (id: string) => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onDelete }) => {
  const startDate = new Date(event.start);
  const endDate = new Date(event.end);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(undefined, { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(undefined, { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const categoryColors = {
    work: 'bg-blue-100 text-blue-800 border-blue-200',
    personal: 'bg-green-100 text-green-800 border-green-200',
    health: 'bg-red-100 text-red-800 border-red-200',
    social: 'bg-purple-100 text-purple-800 border-purple-200',
    other: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow duration-200 group relative">
      <button 
        onClick={() => onDelete(event.id)}
        className="absolute top-4 right-4 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
        aria-label="Delete event"
      >
        <Trash2 size={18} />
      </button>

      <div className="flex items-start justify-between mb-3">
        <div>
          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium mb-2 ${categoryColors[event.category]}`}>
            {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
          </span>
          <h3 className="text-lg font-semibold text-slate-800 leading-tight">{event.title}</h3>
        </div>
      </div>

      <div className="space-y-2 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-slate-400" />
          <span>{formatDate(startDate)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-slate-400" />
          <span>{formatTime(startDate)} - {formatTime(endDate)}</span>
        </div>
        
        {event.location && (
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-slate-400" />
            <span className="truncate">{event.location}</span>
          </div>
        )}

        {event.attendees && event.attendees.length > 0 && (
          <div className="flex items-start gap-2">
            <Users size={16} className="text-slate-400 mt-0.5" />
            <div className="flex flex-wrap gap-1">
              {event.attendees.map((attendee, idx) => (
                <span key={idx} className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">
                  {attendee}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {event.description && (
          <p className="text-slate-500 mt-3 text-xs italic border-t border-slate-100 pt-2">
            "{event.description}"
          </p>
        )}
      </div>
    </div>
  );
};
