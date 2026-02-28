import React, { useState } from 'react';
import { CalendarEvent } from '../types';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

interface CalendarViewProps {
  events: CalendarEvent[];
  onDateSelect?: (date: Date) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ events, onDateSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  // Create array of days
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

  const getEventsForDay = (day: number) => {
    return events.filter(event => {
      const eventDate = new Date(event.start);
      return (
        eventDate.getDate() === day &&
        eventDate.getMonth() === currentDate.getMonth() &&
        eventDate.getFullYear() === currentDate.getFullYear()
      );
    }).sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  };

  const handleDateClick = (day: number) => {
    if (onDateSelect) {
      const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      onDateSelect(selectedDate);
    }
  };

  const categoryColors = {
    work: 'bg-blue-100 text-blue-800',
    personal: 'bg-green-100 text-green-800',
    health: 'bg-red-100 text-red-800',
    social: 'bg-purple-100 text-purple-800',
    other: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden w-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <h2 className="text-lg font-bold text-slate-800">
          {monthName} {year}
        </h2>
        <div className="flex gap-2">
          <button 
            onClick={prevMonth}
            className="p-1.5 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all text-slate-500 hover:text-indigo-600 hover:shadow-sm"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={nextMonth}
            className="p-1.5 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all text-slate-500 hover:text-indigo-600 hover:shadow-sm"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Weekdays */}
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center py-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d}>{d}</div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 auto-rows-fr">
            {/* Empty cells for previous month */}
            {emptyDays.map(i => (
              <div key={`empty-${i}`} className="min-h-[100px] border-b border-r border-slate-100 bg-slate-50/30"></div>
            ))}

            {/* Calendar Days */}
            {days.map(day => {
              const dayEvents = getEventsForDay(day);
              const isToday = 
                day === new Date().getDate() && 
                currentDate.getMonth() === new Date().getMonth() && 
                currentDate.getFullYear() === new Date().getFullYear();

              return (
                <div 
                  key={day} 
                  onClick={() => handleDateClick(day)}
                  className={`
                    min-h-[120px] border-b border-r border-slate-100 p-2 relative group transition-colors cursor-pointer
                    ${isToday ? 'bg-indigo-50/30' : 'hover:bg-slate-50'}
                  `}
                >
                  <div className="flex justify-between items-start">
                    <div className={`
                      text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full mb-1
                      ${isToday ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-700'}
                    `}>
                      {day}
                    </div>
                    {onDateSelect && (
                      <button 
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-indigo-600 transition-opacity p-0.5"
                        title="Add event"
                      >
                        <Plus size={14} />
                      </button>
                    )}
                  </div>

                  <div className="space-y-1">
                    {dayEvents.map(event => (
                      <div 
                        key={event.id}
                        className={`
                          text-[10px] px-1.5 py-0.5 rounded truncate hover:opacity-80 transition-opacity
                          ${categoryColors[event.category]}
                        `}
                        title={`${event.title} (${new Date(event.start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})})`}
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent triggering day click if we want event specific action later
                          // For now, day click handles "adding", clicking event could show details (future)
                        }}
                      >
                        <span className="font-semibold mr-1">
                          {new Date(event.start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-[10px] text-slate-400 pl-1">
                        + {dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
