import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/sonner';

export const useFeedbackForm = (prompt_id: string) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [email, setEmail] = useState('');
  const [referModalOpen, setReferModalOpen] = useState(false);
  const [showPurge, setShowPurge] = useState(false);
  const [showFollowup, setShowFollowup] = useState(false);

  // PostHog page view
  useEffect(() => {
    window.posthog?.capture('feedback_page_view', { prompt_id });
  }, [prompt_id]);

  // Feedback submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    window.posthog?.capture('feedback_form_submit', {
      prompt_id,
      rating,
      comment,
    });
    const sentiment =
      rating >= 4 ? 'positive' : rating === 3 ? 'neutral' : 'negative';
    try {
      const res = await fetch('/v1/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt_id, rating, comment, sentiment }),
      });
      if (!res.ok) throw new Error('Submission failed');
      toast('Feedback received.');
      if (rating < 3) {
        window.posthog?.capture('poor_rating', { rating, prompt_id });
        await fetch('/v1/log-error', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            error_type: 'low_confidence',
            prompt_id,
            comment,
          }),
        });
      }
      window.posthog?.capture('followup_scheduled', {
        prompt_id,
        date: '2025-06-22T10:26:00-06:00',
        rating,
      });
      setShowFollowup(true);
    } catch (err) {
      toast('Could not send feedback.');
    }
  };

  // Referral submit
  const handleRefer = async (e: React.FormEvent) => {
    e.preventDefault();
    const uniqueLink = `${
      window.location.origin
    }/refer?email=${encodeURIComponent(email)}&ref=${Math.random()
      .toString(36)
      .slice(2)}`;
    await fetch('/v1/log-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, referred_by_prompt: prompt_id }),
    });
    window.posthog?.capture('refer_submitted', { email });
    toast(`Your unique link: ${uniqueLink}`);
    setEmail('');
    setReferModalOpen(false);
  };

  // RLS purge
  const handlePurge = async () => {
    await fetch('/v1/rls-purge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt_id }),
    });
    window.posthog?.capture('rls_data_purged', { prompt_id });
    toast(
      'Per your request, your feedback and session data have been deleted.'
    );
  };

  // Social share handlers
  const handleShare = (platform: 'instagram' | 'facebook') => {
    let url = '';
    const shareTxt = encodeURIComponent(
      'Check out how Sprinkle Haven Bakery uses CanAI!'
    );

    if (platform === 'instagram')
      url = `https://www.instagram.com/?url=${window.location.origin}&text=${shareTxt}`;
    else if (platform === 'facebook')
      url = `https://www.facebook.com/sharer/sharer.php?u=${window.location.origin}&quote=${shareTxt}`;

    window.posthog?.capture('social_share_clicked', { platform });
    window.open(url, '_blank');
  };

  // Refer modal open
  const openRefer = () => {
    window.posthog?.capture('refer_btn_clicked', { prompt_id });
    setReferModalOpen(true);
  };

  return {
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
    setShowFollowup,
    handleSubmit,
    handleRefer,
    handlePurge,
    handleShare,
    openRefer,
  };
};
