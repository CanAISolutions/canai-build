import StandardCard from '@/components/StandardCard';
import {
  BodyText,
  CaptionText,
  SectionTitle,
} from '@/components/StandardTypography';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, Copy, Gift, Users } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';

interface EnhancedReferralProps {
  onRefer: (email: string) => Promise<void>;
}

const EnhancedReferral: React.FC<EnhancedReferralProps> = ({ onRefer }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    try {
      await onRefer(email);

      // Generate mock referral link
      const uniqueLink = `${
        window.location.origin
      }/refer?email=${encodeURIComponent(email)}&ref=${Math.random()
        .toString(36)
        .slice(2)}`;
      setGeneratedLink(uniqueLink);
      setEmail('');

      toast.success('Referral link generated!');
    } catch (error) {
      toast.error('Failed to generate referral link');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink);
      setLinkCopied(true);
      toast.success('Link copied to clipboard!');

      setTimeout(() => setLinkCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  return (
    <StandardCard variant="form" padding="lg" className="animate-fade-in">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Gift className="w-6 h-6 text-[#36d1fe]" />
          <SectionTitle className="text-lg mb-0 text-white">
            Refer & Earn
          </SectionTitle>
        </div>

        <BodyText className="text-sm mb-4">
          Get $10 credit for each successful referral
        </BodyText>

        {/* Benefits */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <div className="bg-[rgba(54,209,254,0.1)] rounded-xl p-3 border border-[rgba(54,209,254,0.2)]">
            <Users className="w-5 h-5 text-[#36d1fe] mx-auto mb-2" />
            <CaptionText className="text-xs text-white mb-0">
              You get $10 credit
            </CaptionText>
          </div>
          <div className="bg-[rgba(54,209,254,0.1)] rounded-xl p-3 border border-[rgba(54,209,254,0.2)]">
            <Gift className="w-5 h-5 text-[#36d1fe] mx-auto mb-2" />
            <CaptionText className="text-xs text-white mb-0">
              Friend gets 20% off
            </CaptionText>
          </div>
        </div>
      </div>

      {!generatedLink ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="referral-email" className="text-white font-medium">
              Friend&apos;s Email
            </Label>
            <Input
              id="referral-email"
              type="email"
              placeholder="friend@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="
                bg-[rgba(255,255,255,0.05)]
                border-2 border-[rgba(54,209,254,0.3)]
                focus:border-[#36d1fe]
                text-white
                placeholder:text-[#b3d9f2]
                mt-2
              "
              required
            />
          </div>

          <Button
            type="submit"
            variant="default"
            className="
              w-full
              bg-gradient-to-r from-[#36d1fe] to-[#00b8e6]
              text-[#0a1628]
              font-bold
              hover:from-[#4ae3ff] hover:to-[#36d1fe]
              hover:scale-105
              transition-all duration-300
              border-0
            "
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Generating...' : 'Generate Referral Link'}
          </Button>
        </form>
      ) : (
        <div className="space-y-4">
          <div>
            <Label className="text-white font-medium mb-2 block">
              Your Referral Link
            </Label>
            <div className="flex gap-2">
              <Input
                value={generatedLink}
                readOnly
                className="
                  bg-[rgba(255,255,255,0.05)]
                  border-2 border-[rgba(54,209,254,0.3)]
                  text-white
                  text-xs
                  flex-1
                "
              />
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                className="
                  border-[#36d1fe]
                  text-[#36d1fe]
                  hover:bg-[#36d1fe]/20
                  px-3
                "
              >
                {linkCopied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setGeneratedLink('');
              setLinkCopied(false);
            }}
            className="text-[#cce7fa] hover:text-[#36d1fe] text-sm"
          >
            Generate Another Link
          </Button>
        </div>
      )}
    </StandardCard>
  );
};

export default EnhancedReferral;
