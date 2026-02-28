import React, { useState, useEffect, useRef } from 'react';
import { parseScheduleRequest } from './services/gemini';
import { CalendarEvent, User } from './types';
import { EventCard } from './components/EventCard';
import { InputArea } from './components/InputArea';
import { Auth } from './components/Auth';
import { CalendarView } from './components/CalendarView';
import { authService } from './services/auth';
import { CalendarCheck, LayoutGrid, List as ListIcon, Info, Calendar as CalendarIcon, LogOut, User as UserIcon } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'calendar'>('grid');
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Lifted input state to control it from other actions (like calendar click)
  const [promptValue, setPromptValue] = useState('');
  const inputSectionRef = useRef<HTMLDivElement>(null);

  // Check for existing session on mount
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setIsInitializing(false);
  }, []);

  // Load events for the specific user when user changes
  useEffect(() => {
    if (user) {
      const savedEvents = localStorage.getItem(`smartSchedule_events_${user.id}`);
      if (savedEvents) {
        try {
          setEvents(JSON.parse(savedEvents));
        } catch (e) {
          console.error("Failed to parse saved events");
          setEvents([]);
        }
      } else {
        setEvents([]);
      }
    }
  }, [user]);

  // Save events to local storage whenever they change (user-specific)
  useEffect(() => {
    if (user) {
      localStorage.setItem(`smartSchedule_events_${user.id}`, JSON.stringify(events));
    }
  }, [events, user]);

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setEvents([]);
    setPromptValue('');
  };

  const handleScheduleRequest = async () => {
    if (!promptValue.trim()) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await parseScheduleRequest(promptValue);
      
      if (response.events && response.events.length > 0) {
        const newEvents: CalendarEvent[] = response.events.map(evt => ({
          ...evt,
          id: crypto.randomUUID(), // Assign a client-side ID
        }));
        setEvents(prev => [...newEvents, ...prev]);
        setPromptValue(''); // Clear input on success
        
        // Notification logic could go here
      } else {
        setError("I couldn't find any events in that request. Try being more specific about time and date.");
      }
    } catch (err) {
      setError("Something went wrong while talking to the AI. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  const handleDateSelect = (date: Date) => {
    const formattedDate = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    setPromptValue(prev => {
      const prefix = `On ${formattedDate}, `;
      // If prompt is empty or just contains another date prefix, replace/set it
      if (!prev || prev.startsWith("On ")) {
         return prefix;
      }
      return prev + ` on ${formattedDate}`;
    });
    
    // Smooth scroll to input area
    if (inputSectionRef.current) {
      inputSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Sort events by date
  const sortedEvents = [...events].sort((a, b) => 
    new Date(a.start).getTime() - new Date(b.start).getTime()
  );

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin text-indigo-600">
          <CalendarCheck size={40} />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth onLogin={setUser} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 bg-opacity-90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-sm">
              <CalendarCheck size={24} />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 hidden sm:block">
              SmartSchedule
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                aria-label="Grid view"
                title="Grid View"
              >
                <LayoutGrid size={18} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                aria-label="List view"
                title="List View"
              >
                <ListIcon size={18} />
              </button>
              <button 
                onClick={() => setViewMode('calendar')}
                className={`p-2 rounded-md transition-all ${viewMode === 'calendar' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                aria-label="Calendar view"
                title="Calendar View"
              >
                <CalendarIcon size={18} />
              </button>
            </div>

            <div className="h-6 w-px bg-slate-200 mx-1"></div>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-medium text-slate-700">{user.name}</span>
                <span className="text-xs text-slate-400">{user.email}</span>
              </div>
              <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 border border-indigo-200">
                <UserIcon size={16} />
              </div>
              <button 
                onClick={handleLogout}
                className="text-slate-400 hover:text-red-500 transition-colors p-1"
                title="Log out"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center px-4 sm:px-6 pt-8 pb-12 w-full max-w-6xl mx-auto">
        
        {/* Hero / Input Section */}
        <section ref={inputSectionRef} className="w-full mb-10 text-center max-w-3xl mx-auto scroll-mt-28">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-3 tracking-tight">
            Welcome back, {user.name.split(' ')[0]}
          </h2>
          <p className="text-slate-500 mb-6">
            What would you like to schedule today?
          </p>
          
          <InputArea 
            value={promptValue} 
            onChange={setPromptValue} 
            onSubmit={handleScheduleRequest} 
            isLoading={isLoading} 
          />
          
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg border border-red-100 flex items-center gap-2 max-w-2xl mx-auto animate-fadeIn mt-4 text-left">
              <Info size={18} className="flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}
        </section>

        {/* Events Display */}
        <section className="w-full">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              Your Schedule
              <span className="text-sm font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                {events.length}
              </span>
            </h3>
          </div>

          {events.length === 0 ? (
            <div className="text-center py-16 px-4 border-2 border-dashed border-slate-200 rounded-2xl bg-white/50">
              <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
                <CalendarCheck size={32} />
              </div>
              <h4 className="text-lg font-medium text-slate-600 mb-2">No events scheduled yet</h4>
              <p className="text-slate-400 max-w-sm mx-auto">
                Try typing something like "Team meeting next Monday at 10am regarding Q4 goals."
              </p>
            </div>
          ) : (
            <>
              {viewMode === 'calendar' ? (
                <div className="animate-fadeIn">
                  <CalendarView events={events} onDateSelect={handleDateSelect} />
                </div>
              ) : (
                <div className={`
                  ${viewMode === 'grid' 
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' 
                    : 'space-y-4 max-w-3xl mx-auto'
                  }
                `}>
                  {sortedEvents.map((event) => (
                    <div key={event.id} className="animate-slideUp">
                      <EventCard event={event} onDelete={handleDeleteEvent} />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      </main>

      <footer className="bg-white border-t border-slate-200 py-6">
        <div className="max-w-6xl mx-auto px-4 text-center text-slate-400 text-sm">
          &copy; {new Date().getFullYear()} SmartSchedule AI. Powered by Google Gemini.
        </div>
      </footer>
    </div>
  );
};

export default App;
