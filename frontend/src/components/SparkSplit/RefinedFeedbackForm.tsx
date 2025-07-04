import React, { useState } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import SparkleIcon from './SparkleIcon';

type RefinedFeedbackFormProps = {
  onSubmit: (rating: number, comment: string) => Promise<void>;
  isSubmitting?: boolean;
};

const RefinedFeedbackForm: React.FC<RefinedFeedbackFormProps> = ({
  onSubmit,
  isSubmitting = false,
}) => {
  const [selection, setSelection] = useState('');
  const [feedback, setFeedback] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Convert selection to rating (1-5 scale)
    let rating = 5; // Default for CanAI selection
    if (selection === 'generic') rating = 3;
    if (selection === 'neither') rating = 2;

    await onSubmit(rating, feedback);
  };

  return (
    <div className="bg-gradient-to-br from-[#172b47f6] to-[#1E314F] rounded-2xl border border-[#36d1fe66] p-8 shadow-2xl animate-fade-in">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <h3
            className="flex items-center text-2xl font-bold font-playfair text-canai-light mb-3"
            id="feedback-heading"
          >
            <span
              role="img"
              aria-label="question"
              className="mr-2 animate-glow-pop text-canai-cyan text-3xl"
            >
              💬
            </span>
            <span className="bg-gradient-to-r from-[#193c65] via-[#00B2E3]/40 to-transparent px-3 py-1 rounded-xl animate-fade-in">
              Which output feels more like you?
            </span>
          </h3>
          <p className="text-base text-canai-light opacity-80 mb-6 font-manrope">
            Your honest feedback helps us understand what resonates with you.
          </p>
          <RadioGroup
            value={selection}
            onValueChange={setSelection}
            className="space-y-4"
            aria-labelledby="feedback-heading"
          >
            <div className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-[#00CFFF]/10 to-transparent border border-[#00CFFF]/30 p-6 focus-within:border-[#00CFFF] focus-within:ring-2 focus-within:ring-[#00CFFF]/15">
              <div className="flex items-center space-x-4">
                <RadioGroupItem
                  value="canai"
                  id="choice-canai"
                  className="border-[#00CFFF] text-[#00CFFF] focus:ring-[#00CFFF] focus:ring-offset-[#172b47] w-6 h-6 transition-all duration-200"
                />
                <Label
                  htmlFor="choice-canai"
                  className="text-[#00CFFF] font-semibold font-playfair cursor-pointer flex-1 text-xl"
                >
                  <SparkleIcon className="scale-90" />
                  CanAI Output
                  <span className="block text-sm text-[#E6F6FF] opacity-70 font-normal mt-1 font-manrope">
                    Personalized for your vision
                  </span>
                </Label>
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-gray-500/10 to-transparent border border-gray-400/40 p-6 focus-within:border-gray-400 focus-within:ring-2 focus-within:ring-gray-400/10">
              <div className="flex items-center space-x-4">
                <RadioGroupItem
                  value="generic"
                  id="choice-generic"
                  className="border-gray-400 text-gray-400 focus:ring-gray-400 focus:ring-offset-[#172b47] w-6 h-6 transition-all duration-200"
                />
                <Label
                  htmlFor="choice-generic"
                  className="text-gray-200 font-semibold font-playfair cursor-pointer flex-1 text-xl"
                >
                  🤖 Generic Output
                  <span className="block text-sm text-[#E6F6FF] opacity-75 font-normal mt-1 font-manrope">
                    Standard AI response
                  </span>
                </Label>
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-orange-500/10 to-transparent border border-orange-400/30 p-6 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-400/15">
              <div className="flex items-center space-x-4">
                <RadioGroupItem
                  value="neither"
                  id="choice-neither"
                  className="border-orange-400 text-orange-400 focus:ring-orange-400 focus:ring-offset-[#172b47] w-6 h-6 transition-all duration-200"
                />
                <Label
                  htmlFor="choice-neither"
                  className="text-orange-300 font-semibold font-playfair cursor-pointer flex-1 text-xl"
                >
                  😐 Neither
                  <span className="block text-sm text-[#E6F6FF] opacity-75 font-normal mt-1 font-manrope">
                    Both outputs need improvement
                  </span>
                </Label>
              </div>
            </div>
          </RadioGroup>
        </div>
        {(selection === 'generic' || selection === 'neither') && (
          <div className="space-y-4 animate-fade-in">
            <Label
              htmlFor="feedback-text"
              className="text-lg font-semibold text-canai-light font-playfair block"
            >
              {selection === 'generic'
                ? 'What made the generic output feel better?'
                : 'What would make either output feel more like you?'}
            </Label>
            <Textarea
              id="feedback-text"
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              placeholder={
                selection === 'generic'
                  ? 'Tell us what resonated with you about the generic version...'
                  : 'Help us understand what both outputs are missing...'
              }
              className="min-h-[140px] bg-[#15202b]/80 border-[#36d1fe66] text-canai-light font-manrope placeholder:text-[#E6F6FF]/60 focus:border-[#00CFFF] focus:ring-[#00CFFF] resize-none rounded-xl text-base p-4"
              required
              aria-describedby={
                selection === 'generic' ? 'generic-help' : 'neither-help'
              }
            />
            <p
              id={selection === 'generic' ? 'generic-help' : 'neither-help'}
              className="text-sm text-canai-light opacity-60"
            >
              Your feedback helps us improve our AI to better match your vision.
            </p>
          </div>
        )}
        <Button
          type="submit"
          disabled={
            !selection ||
            isSubmitting ||
            ((selection === 'generic' || selection === 'neither') &&
              !feedback.trim())
          }
          className="w-full py-4 text-lg font-bold font-playfair bg-gradient-to-r from-[#00CFFF] to-[#00B2E3] hover:from-[#00B2E3] hover:to-[#0099CC] text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 focus:ring-2 focus:ring-[#00CFFF] focus:ring-offset-2 focus:ring-offset-[#172b47] disabled:opacity-50 disabled:cursor-not-allowed animate-pulse"
          aria-describedby="submit-help"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
        </Button>
        <p
          id="submit-help"
          className="text-sm text-canai-light opacity-60 text-center"
        >
          Your preferences are saved securely and help improve our AI.
        </p>
      </form>
    </div>
  );
};

export default RefinedFeedbackForm;
