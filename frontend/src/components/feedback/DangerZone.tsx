import React from 'react';
import { Button } from '@/components/ui/button';

type DangerZoneProps = {
  showPurge: boolean;
  setShowPurge: (v: boolean) => void;
  handlePurge: () => Promise<void>;
};

export const DangerZone: React.FC<DangerZoneProps> = ({
  showPurge,
  setShowPurge,
  handlePurge,
}) => (
  <>
    {showPurge && (
      <div
        className="
        mt-4 
        p-4 
        rounded-xl 
        bg-gradient-to-r from-[rgba(255,69,69,0.1)] to-[rgba(255,99,99,0.1)]
        border-2 border-[rgba(255,69,69,0.3)]
        backdrop-blur-sm
        animate-fade-in
      "
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex-1">
            <p className="text-[#ff8fa3] font-manrope font-medium text-sm mb-1">
              <span className="font-bold">Warning:</span> This will permanently
              delete all your data.
            </p>
            <p className="text-[#ffb3c1] font-manrope text-xs">
              This action cannot be undone and will remove all feedback and
              session logs.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPurge(false)}
              className="
                text-[#cce7fa] 
                hover:text-white 
                hover:bg-[rgba(255,255,255,0.1)]
                border border-[rgba(255,255,255,0.2)]
                font-manrope
              "
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handlePurge}
              className="
                bg-gradient-to-r from-[#ff4545] to-[#ff6b6b]
                hover:from-[#ff3030] hover:to-[#ff4545]
                border-0
                font-manrope font-bold
                shadow-[0_0_15px_rgba(255,69,69,0.4)]
                hover:shadow-[0_0_25px_rgba(255,69,69,0.6)]
                transition-all duration-300
              "
            >
              Confirm Purge
            </Button>
          </div>
        </div>
      </div>
    )}
  </>
);
