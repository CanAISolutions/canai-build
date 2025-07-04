import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Pencil, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Props for modal control and field context
interface EditModalProps {
  show: boolean;
  field: string;
  onClose: () => void;
  onContinue: () => void;
}

/**
 * Animations:
 *  - Modal: fade/glow in
 *  - Pencil: pulse
 *  - Progress saved: pill styling
 */
const EditModal: React.FC<EditModalProps> = ({
  show,
  field,
  onClose,
  onContinue,
}) => (
  <Dialog open={show} onOpenChange={v => (v ? undefined : onClose())}>
    <DialogContent
      className={`
        !max-w-[390px] sm:!max-w-lg mx-auto
        p-0
        transition-all
        animate-modal-fade-in
        !bg-transparent
        !border-0
        flex flex-col items-center
        shadow-none
      `}
      style={{
        background: 'transparent',
        boxShadow: 'none',
        border: 'none',
      }}
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="relative w-full px-2 pt-2 pb-0">
        {/* Outer soft cyan/blue glow */}
        <div
          aria-hidden
          className="absolute inset-0 z-0 pointer-events-none rounded-[30px]"
          style={{
            boxShadow:
              '0 0 80px 12px #00F0FF33, 0 0 36px 8px #00CFFF33, 0 0 0 5px #36d1fe1a inset',
            borderRadius: '30px',
          }}
        />
        <div
          className={`
            relative z-10 w-full
            bg-[rgba(24,38,67,0.94)]
            rounded-[30px]
            px-8 pt-7 pb-6
            shadow-xl
            backdrop-blur-[28px]
            border border-[#00cfff22]
            ring-1 ring-[#00cfff33]
            transition-all duration-200
            before:absolute before:inset-0 before:rounded-[30px]
            before:bg-gradient-to-br before:from-[#111c2a4c] before:via-[#111a2677] before:to-[#00cfff11]
            before:blur-[4px] before:opacity-70 before:pointer-events-none
            before:z-0
            overflow-hidden
          `}
          style={{
            boxShadow:
              '0 0 28px 4px #00F0FF44, 0 2px 24px #12294a66, 0 0 0 1.5px #00cfff22',
          }}
        >
          {/* Close button */}
          <button
            aria-label="Close editing modal"
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-transparent text-canai-cyan hover:bg-[#00cfff1a] focus:outline-none focus-visible:ring-2 focus-visible:ring-canai-primary transition"
            tabIndex={0}
            style={{ lineHeight: 0 }}
          >
            <X className="w-5 h-5" />
          </button>
          <DialogHeader className="text-center mb-1 pt-0 pb-2 border-none">
            <DialogTitle
              id="modal-title"
              className={`
                text-[1.7rem] font-extrabold font-manrope
                bg-gradient-to-r from-[#cfefff] via-[#00cfff] to-[#54c1fe] text-transparent bg-clip-text
                animate-text-glow drop-shadow-xl
                tracking-tight
                mb-0
              `}
            >
              Edit Your Details
            </DialogTitle>
            <div className="w-14 h-[5px] mx-auto rounded bg-gradient-to-r from-canai-cyan to-canai-primary mt-2 mb-2 animate-countup-glow" />
          </DialogHeader>
          <div className="flex flex-col items-center mt-2">
            <div className="relative flex items-center justify-center mb-2">
              {/* Glowing glass circle */}
              <div
                className="absolute inset-0 z-0 mx-auto my-auto rounded-full"
                style={{
                  width: 54,
                  height: 54,
                  boxShadow:
                    '0 0 15px 4px #00F0FF55, 0 0 24px 6px #00cfff44 inset',
                  background:
                    'radial-gradient(circle at 60% 40%, #00cfff33 60%, #182643 100%)',
                  filter: 'blur(1px) saturate(1.1)',
                }}
              />
              <span
                className="relative flex items-center justify-center rounded-full bg-[#19234cfa] border-2 border-canai-cyan shadow-[0_0_15px_#00cfff77] canai-glow-cube"
                style={{
                  width: 54,
                  height: 54,
                  boxShadow: '0 0 10px #00f0ff99, 0 1px 10px #00cfff2b',
                }}
              >
                {/* Animate pencil icon pulse */}
                <Pencil className="w-7 h-7 text-canai-cyan drop-shadow-xl animate-pulse-pencil" />
              </span>
            </div>
            {/* Supporting text with cleaner spacing */}
            <div className="mt-5 text-[1.09rem] leading-snug font-medium text-canai-light text-center px-2 mb-1">
              You&apos;ll return to the detailed input form to update your
              <br />
              <span className="font-bold text-canai-cyan underline underline-offset-2 whitespace-nowrap">
                {field
                  .replace(/([A-Z])/g, ' $1')
                  .replace(/^./, s => s.toUpperCase())}
              </span>{' '}
              information.
            </div>
          </div>
          {/* Progress Saved - now a subtle pill */}
          <div className="flex items-center justify-center gap-2 bg-[#2b3f5e]/85 border border-canai-primary/20 rounded-full px-4 py-1 my-3 text-xs font-medium text-canai-light-soft shadow-strong w-fit mx-auto animate-fade-in">
            <svg
              width="18"
              height="18"
              viewBox="0 0 20 20"
              className="mr-1"
              fill="none"
            >
              <rect
                x="4"
                y="4"
                width="12"
                height="12"
                rx="3.5"
                stroke="#00cfff"
                strokeWidth="2"
              />
              <path
                d="M8.5 10.5l2 2 3-3"
                stroke="#00cfff"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Progress saved automatically
          </div>
          {/* Control buttons */}
          <div className="flex flex-col gap-2 mt-6">
            <Button
              variant="canai"
              onClick={onContinue}
              className="w-full h-12 text-base font-bold canai-btn-glow canai-focus-glow transition-all duration-200 rounded-[13px] focus-visible:ring-2 focus-visible:ring-canai-primary animate-fade-in"
              style={{
                background:
                  'linear-gradient(90deg, #172d46 85%, #00cfff24 100%)',
                border: '1.9px solid #36d1fe',
                color: '#E6F6FF',
                boxShadow: '0 0 26px #00f0ff20',
              }}
              tabIndex={0}
            >
              <Pencil className="w-5 h-5 mr-2" />
              Continue to Edit
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full h-12 rounded-[13px] font-semibold border-2 border-[#36d1fe77] text-canai-light transition-all duration-150 hover:bg-[#36d1fe15] hover:text-white focus-visible:ring-2 focus-visible:ring-canai-primary"
              style={{
                background: 'rgba(25,60,101,0.65)',
                border: '1.7px solid #00cfff2c',
                marginTop: '6px',
              }}
              tabIndex={0}
            >
              Cancel
            </Button>
          </div>
          {/* Timeliness note */}
          <div className="w-full flex justify-center pt-7 pb-2">
            <span className="flex items-center gap-2 text-[#b3e7fa] text-base bg-canai-primary/10 rounded-full px-4 py-1 border border-canai-primary/20 shadow-strong animate-fade-in">
              <svg width="16" height="16" fill="none" viewBox="0 0 20 20">
                <circle
                  cx="10"
                  cy="10"
                  r="8.5"
                  stroke="#00cfff"
                  strokeWidth="1.5"
                />
                <path
                  d="M10 6.5v3.6l2.3 2.3"
                  stroke="#00cfff"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                />
              </svg>
              Takes less than 30 seconds
            </span>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);

export default EditModal;
