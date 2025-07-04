import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type ReferModalProps = {
  email: string;
  setEmail: (e: string) => void;
  handleRefer: (e: React.FormEvent) => Promise<void>;
  onClose: () => void;
  open: boolean;
};

export const ReferModal: React.FC<ReferModalProps> = ({
  email,
  setEmail,
  handleRefer,
  onClose,
  open,
}) =>
  !open ? null : (
    <div
      className="fixed inset-0 bg-[#07152aa6] z-50 flex items-center justify-center"
      aria-modal="true"
    >
      <div className="bg-[#163065] p-6 rounded-2xl shadow-2xl flex flex-col items-center w-[90vw] max-w-md gap-4">
        <h2 className="font-bold text-xl mb-2 text-canai-cyan">Refer & Earn</h2>
        <form onSubmit={handleRefer} className="w-full flex flex-col gap-2">
          <label
            htmlFor="refer-email"
            className="text-sm font-medium text-canai-cyan"
          >
            Your Email
          </label>
          <Input
            id="refer-email"
            type="email"
            placeholder="friends@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="bg-[#22467a29]"
          />
          <Button variant="canai" className="mt-2" type="submit">
            Generate Unique Link
          </Button>
        </form>
        <Button variant="ghost" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
