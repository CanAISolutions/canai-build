import { DangerZone } from '@/components/feedback/DangerZone';
import EnhancedReferral from '@/components/feedback/EnhancedReferral';
import EnhancedSocialShare from '@/components/feedback/EnhancedSocialShare';
import { Followup } from '@/components/feedback/Followup';
import { ReferModal } from '@/components/feedback/ReferModal';
import { StarRating } from '@/components/feedback/StarRating';
import SuccessAnimation from '@/components/feedback/SuccessAnimation';
import PageHeader from '@/components/PageHeader';
import StandardBackground from '@/components/StandardBackground';
import StandardCard from '@/components/StandardCard';
import {
  BodyText,
  CaptionText,
  PageTitle,
  SectionTitle,
} from '@/components/StandardTypography';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useFeedbackForm } from '@/hooks/useFeedbackForm';
import React, { useState } from 'react';

const quickbooksLink = 'https://quickbooks.intuit.com/';
const prompt_id = 'SPRINKLE_PROMPT_ID';

const FeedbackPage: React.FC = () => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const {
    rating,
    setRating,
    comment,
    setComment,
    email,
    setEmail,
    referModalOpen,
    setReferModalOpen,
    showPurge,
    setShowPurge,
    showFollowup,
    handleSubmit: originalHandleSubmit,
    handleRefer,
    handlePurge,
    handleShare,
    // Remove unused openRefer
  } = useFeedbackForm(prompt_id);

  const handleSubmit = async (e: React.FormEvent) => {
    await originalHandleSubmit(e);
    setShowSuccess(true);
  };

  const handleSuccessComplete = () => {
    setShowSuccess(false);
    setFeedbackSubmitted(true);
  };

  const handleReferralSubmit = async (_email: string) => {
    const mockEvent = { preventDefault: () => {} } as React.FormEvent;
    await handleRefer(mockEvent);
  };

  return (
    <StandardBackground>
      <PageHeader showBackButton={true} logoSize="sm" showTagline={false} />

      <main
        className="flex-1 flex items-center justify-center px-4 py-8"
        aria-label="CanAI Feedback"
      >
        <div className="w-full max-w-4xl mx-auto">
          {!feedbackSubmitted ? (
            <div className="space-y-8">
              {/* Centered Page Title */}
              <div className="text-center mb-12">
                <PageTitle className="text-4xl lg:text-5xl mb-6">
                  Share Your Experience
                </PageTitle>
                <BodyText className="text-lg max-w-xl mx-auto opacity-90">
                  Help us improve CanAI for founders everywhere.
                </BodyText>
              </div>

              {/* Main Feedback Form - Centered */}
              <div className="max-w-2xl mx-auto">
                <StandardCard variant="form" padding="xl" className="mb-8">
                  <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Rating Section */}
                    <div className="text-center">
                      <SectionTitle className="text-2xl mb-6 text-white">
                        How was your{' '}
                        <span className="text-[#36d1fe]">
                          SparkSplit experience
                        </span>
                        ?
                      </SectionTitle>
                      <div className="flex justify-center">
                        <StarRating rating={rating} setRating={setRating} />
                      </div>
                    </div>

                    {/* Comment Section */}
                    <div>
                      <SectionTitle className="text-xl mb-4 text-white">
                        Leave a comment
                      </SectionTitle>
                      <Textarea
                        placeholder="What did you think of the business plan comparison? Suggestions welcome!"
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        className="
                          bg-[rgba(255,255,255,0.05)]
                          border-2 border-[rgba(54,209,254,0.3)]
                          focus:border-[#36d1fe]
                          text-white
                          placeholder:text-[#b3d9f2]
                          min-h-[120px]
                          rounded-xl
                          resize-none
                        "
                        required
                        minLength={5}
                        maxLength={200}
                        rows={4}
                      />
                      <CaptionText className="mt-3 mb-0 text-center">
                        Your feedback helps shape CanAI&apos;s next phase.{' '}
                        <a
                          href={quickbooksLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#36d1fe] hover:text-[#4ae3ff] underline transition-colors duration-200"
                        >
                          Need your invoice?
                        </a>
                      </CaptionText>
                    </div>

                    {/* Submit Button */}
                    <Button
                      variant="default"
                      type="submit"
                      size="lg"
                      className="
                        w-full
                        bg-gradient-to-r from-[#36d1fe] to-[#00b8e6]
                        text-[#0a1628]
                        font-bold
                        text-lg
                        py-6
                        hover:from-[#4ae3ff] hover:to-[#36d1fe]
                        hover:scale-[1.02]
                        transition-all
                        duration-300
                        border-0
                        rounded-xl
                      "
                    >
                      Submit Feedback
                    </Button>
                  </form>

                  {/* Danger Zone */}
                  <div className="flex justify-end mt-8">
                    <button
                      className="
                        text-[#ff8fa3]
                        hover:text-[#ff6b85]
                        font-medium
                        text-sm
                        underline
                        transition-colors
                        duration-200
                      "
                      type="button"
                      onClick={() => setShowPurge(v => !v)}
                    >
                      Purge my data
                    </button>
                  </div>

                  <DangerZone
                    showPurge={showPurge}
                    setShowPurge={setShowPurge}
                    handlePurge={handlePurge}
                  />
                </StandardCard>
              </div>

              {/* Secondary Actions - Centered Below Form */}
              <div className="max-w-3xl mx-auto">
                <div className="text-center mb-6">
                  <SectionTitle className="text-xl text-white mb-2">
                    Share the Love
                  </SectionTitle>
                  <BodyText className="text-sm opacity-80">
                    Help other founders discover CanAI or earn rewards through
                    referrals
                  </BodyText>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <EnhancedSocialShare onShare={handleShare} />
                  <EnhancedReferral onRefer={handleReferralSubmit} />
                </div>
              </div>
            </div>
          ) : (
            /* Post-Submission View - Centered */
            <div className="text-center space-y-8 animate-fade-in max-w-3xl mx-auto">
              <StandardCard variant="form" padding="xl">
                <PageTitle className="text-4xl mb-6">Thank You! 🎉</PageTitle>
                <BodyText className="text-xl mb-10">
                  Your feedback has been received and will help us improve CanAI
                  for all founders.
                </BodyText>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto mb-10">
                  <Button
                    variant="outline"
                    size="lg"
                    className="
                      border-2 border-[#36d1fe]
                      text-[#36d1fe]
                      hover:bg-[#36d1fe]/20
                      hover:scale-105
                      transition-all
                      duration-300
                      py-6
                      rounded-xl
                    "
                    onClick={() => (window.location.href = '/')}
                  >
                    Return Home
                  </Button>
                  <Button
                    variant="default"
                    size="lg"
                    className="
                      bg-gradient-to-r from-[#36d1fe] to-[#00b8e6]
                      hover:from-[#4ae3ff] hover:to-[#36d1fe]
                      text-[#0a1628]
                      font-bold
                      hover:scale-105
                      transition-all
                      duration-300
                      py-6
                      rounded-xl
                      border-0
                    "
                    onClick={() => (window.location.href = '/spark-layer')}
                  >
                    Create Another Plan
                  </Button>
                </div>
              </StandardCard>

              {/* Post-submission sharing - More prominent */}
              <div>
                <SectionTitle className="text-2xl text-white mb-6">
                  Spread the Word About Your Success
                </SectionTitle>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <EnhancedSocialShare onShare={handleShare} />
                  <EnhancedReferral onRefer={handleReferralSubmit} />
                </div>
              </div>
            </div>
          )}

          {/* Success Animation Overlay */}
          <SuccessAnimation
            show={showSuccess}
            onComplete={handleSuccessComplete}
          />

          {/* Modals */}
          <ReferModal
            email={email}
            setEmail={setEmail}
            handleRefer={handleRefer}
            onClose={() => setReferModalOpen(false)}
            open={referModalOpen}
          />
          <Followup show={showFollowup} rating={rating} prompt_id={prompt_id} />
        </div>
      </main>
    </StandardBackground>
  );
};

export default FeedbackPage;
