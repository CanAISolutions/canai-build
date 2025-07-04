import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

type FeedbackFormProps = {
  selection: string;
  onSelection: (v: string) => void;
  feedback: string;
  onFeedback: (v: string) => void;
  dislikeFeedback: string;
  onDislike: (v: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
};

const FeedbackForm: React.FC<FeedbackFormProps> = ({
  selection,
  onSelection,
  feedback,
  onFeedback,
  dislikeFeedback,
  onDislike,
  onSubmit,
}) => {
  return (
    <form className="mt-6 flex flex-col gap-5" onSubmit={onSubmit}>
      <div className="text-base font-semibold" id="comparison-prompt">
        Which feels more like you?
      </div>
      <RadioGroup
        onValueChange={onSelection}
        className="flex flex-col gap-2"
        defaultValue=""
        aria-label="Comparison Choices"
        value={selection}
      >
        <div className="flex items-center gap-4">
          <RadioGroupItem id="radio-canai" value="canai" />
          <Label htmlFor="radio-canai" className="font-medium text-canai-cyan">
            CanAI
          </Label>
        </div>
        <div className="flex items-center gap-4">
          <RadioGroupItem id="radio-generic" value="generic" />
          <Label htmlFor="radio-generic" className="font-medium text-green-200">
            Generic
          </Label>
        </div>
        <div className="flex items-center gap-4">
          <RadioGroupItem id="radio-dislike" value="dislike" />
          <Label htmlFor="radio-dislike" className="font-medium text-red-300">
            Neither feels right
          </Label>
        </div>
      </RadioGroup>
      {selection === 'generic' && (
        <div className="w-full">
          <Label htmlFor="generic-feedback" className="mb-1 text-sm block">
            Why does this feel better?
          </Label>
          <Textarea
            id="generic-feedback"
            placeholder="Explain why the generic output worked for you..."
            className="bg-feedback-input border-canai-primary text-canai-light"
            value={feedback}
            onChange={e => onFeedback(e.target.value)}
            required
          />
        </div>
      )}
      {selection === 'dislike' && (
        <div className="w-full">
          <Label htmlFor="dislike-feedback" className="mb-1 text-sm block">
            What’s missing?
          </Label>
          <Textarea
            id="dislike-feedback"
            placeholder="Let us know what both plans missed..."
            className="bg-feedback-input border-canai-primary text-canai-light"
            value={dislikeFeedback}
            onChange={e => onDislike(e.target.value)}
            required
          />
        </div>
      )}
      <Button variant="canai" type="submit" className="mt-2 w-fit">
        Submit Feedback
      </Button>
    </form>
  );
};

export default FeedbackForm;
