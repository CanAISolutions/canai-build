import React from 'react';
import { Save, CheckCircle, Loader2 } from 'lucide-react';

interface AutoSaveIndicatorProps {
  isAutoSaving: boolean;
  lastSaved: Date | null;
}

const AutoSaveIndicator: React.FC<AutoSaveIndicatorProps> = ({
  isAutoSaving,
  lastSaved,
}) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isAutoSaving) {
    return (
      <div className="flex items-center justify-center mb-6">
        <div className="flex items-center gap-3 bg-[rgba(25,60,101,0.6)] border border-[#36d1fe]/40 rounded-xl px-6 py-3 backdrop-blur-sm">
          <Loader2 className="w-5 h-5 text-[#36d1fe] animate-spin" />
          <span className="text-[#E6F6FF] text-sm font-medium">
            Saving your progress...
          </span>
        </div>
      </div>
    );
  }

  if (lastSaved) {
    return (
      <div className="flex items-center justify-center mb-6">
        <div
          id="save-confirm"
          className="flex items-center gap-3 bg-green-500/20 border border-green-400/50 rounded-xl px-6 py-3 backdrop-blur-sm"
        >
          <CheckCircle className="w-5 h-5 text-green-400" />
          <span className="text-green-400 text-sm font-medium">
            Saved at {formatTime(lastSaved)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center mb-6">
      <div className="flex items-center gap-3 bg-[rgba(25,60,101,0.4)] border border-[#36d1fe]/30 rounded-xl px-6 py-3 backdrop-blur-sm">
        <Save className="w-5 h-5 text-[#E6F6FF] opacity-70" />
        <span className="text-[#E6F6FF] text-sm font-medium opacity-90">
          Auto-save every 10 seconds
        </span>
      </div>
    </div>
  );
};

export default AutoSaveIndicator;
