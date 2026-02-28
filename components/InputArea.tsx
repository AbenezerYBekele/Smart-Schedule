import React, { KeyboardEvent } from 'react';
import { Send, Sparkles, Loader2 } from 'lucide-react';

interface InputAreaProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export const InputArea: React.FC<InputAreaProps> = ({ value, onChange, onSubmit, isLoading }) => {
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !isLoading) {
        onSubmit();
      }
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto mb-8">
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative bg-white rounded-2xl shadow-xl flex items-end p-2 border border-slate-100">
          <div className="p-3 text-indigo-500 hidden sm:block">
            <Sparkles size={24} />
          </div>
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your plan naturally... e.g. 'Lunch with Sarah tomorrow at 12pm at The Diner'"
            className="w-full bg-transparent border-0 focus:ring-0 text-black placeholder-slate-400 resize-none py-3 px-2 min-h-[60px] max-h-[120px]"
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={onSubmit}
            disabled={!value.trim() || isLoading}
            className={`p-3 rounded-xl transition-all duration-200 flex-shrink-0 mb-1 mr-1 ${
              value.trim() && !isLoading
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5' 
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
          </button>
        </div>
      </div>
      <p className="text-center text-xs text-slate-400 mt-3">
        Powered by Gemini 3 Flash • Intelligent Event Extraction
      </p>
    </div>
  );
};