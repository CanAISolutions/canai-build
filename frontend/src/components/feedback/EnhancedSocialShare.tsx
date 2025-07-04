import StandardCard from '@/components/StandardCard';
import {
  BodyText,
  CaptionText,
  SectionTitle,
} from '@/components/StandardTypography';
import { Button } from '@/components/ui/button';
import { Facebook, Instagram, Share2 } from 'lucide-react';
import React from 'react';

interface EnhancedSocialShareProps {
  onShare: (platform: 'instagram' | 'facebook') => void;
}

const EnhancedSocialShare: React.FC<EnhancedSocialShareProps> = ({
  onShare,
}) => {
  const shareStats = {
    instagram: '2.3k+ shares',
    facebook: '1.8k+ shares',
  };

  return (
    <StandardCard variant="glass" padding="lg" className="animate-fade-in">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Share2 className="w-5 h-5 text-[#36d1fe]" />
          <SectionTitle className="text-lg mb-0 text-white">
            Spread the Word
          </SectionTitle>
        </div>

        <BodyText className="text-sm opacity-90 mb-0">
          Help other founders discover CanAI&apos;s power
        </BodyText>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Instagram Share */}
        <Button
          variant="outline"
          className="
            bg-gradient-to-br from-purple-600/20 to-pink-600/20
            border-2 border-purple-400/30
            text-white
            hover:from-purple-600/30 hover:to-pink-600/30
            hover:border-purple-400/50
            hover:scale-105
            transition-all duration-300
            p-4 h-auto flex-col gap-2
            group
          "
          onClick={() => onShare('instagram')}
        >
          <Instagram className="w-6 h-6 group-hover:scale-110 transition-transform" />
          <span className="font-medium">Instagram</span>
          <CaptionText className="text-xs opacity-75 mb-0">
            {shareStats.instagram}
          </CaptionText>
        </Button>

        {/* Facebook Share */}
        <Button
          variant="outline"
          className="
            bg-gradient-to-br from-blue-600/20 to-blue-800/20
            border-2 border-blue-400/30
            text-white
            hover:from-blue-600/30 hover:to-blue-800/30
            hover:border-blue-400/50
            hover:scale-105
            transition-all duration-300
            p-4 h-auto flex-col gap-2
            group
          "
          onClick={() => onShare('facebook')}
        >
          <Facebook className="w-6 h-6 group-hover:scale-110 transition-transform" />
          <span className="font-medium">Facebook</span>
          <CaptionText className="text-xs opacity-75 mb-0">
            {shareStats.facebook}
          </CaptionText>
        </Button>
      </div>

      <CaptionText className="text-center mt-4 opacity-70 mb-0">
        Share your success story with your network
      </CaptionText>
    </StandardCard>
  );
};

export default EnhancedSocialShare;
