import EnhancedHero from '@/components/DiscoveryHook/EnhancedHero';
import EnhancedSecondaryCTAs from '@/components/DiscoveryHook/EnhancedSecondaryCTAs';
import MemberstackLoginButton from '@/components/DiscoveryHook/MemberstackLoginButton';
import ProductCardsSection from '@/components/DiscoveryHook/ProductCardsSection';
import PsychologicalTrustIndicators from '@/components/DiscoveryHook/PsychologicalTrustIndicators';
import PreviewModal from '@/components/PreviewModal';
import PricingModal from '@/components/PricingModal';
import { BackgroundImage } from '@/components/ui/background-image';
import { useAccessibility } from '@/hooks/useAccessibility';
import { memberstackAuth } from '@/utils/memberstackAuth';
import React, { useEffect, useState } from 'react';

// Import API and analytics utilities
import {
  trackFunnelStep,
  trackPageView,
  trackPreviewView,
  trackPricingView,
} from '@/utils/analytics';
import { getMessages } from '@/utils/api';

interface Message {
  id: string;
  content: string;
  timestamp: string;
}

const DiscoveryHook: React.FC = () => {
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [authStatus, setAuthStatus] = useState({
    isLoggedIn: false,
    userName: '',
  });

  const { setPageTitle } = useAccessibility();

  // Load auth status
  useEffect(() => {
    const loadAuthStatus = async () => {
      const status = await memberstackAuth.getAuthStatus();
      setAuthStatus({
        isLoggedIn: status.authenticated,
        userName: status.user?.email?.split('@')[0] || '',
      });
    };

    loadAuthStatus();
  }, []);

  // Load messages
  useEffect(() => {
    const loadMessages = async () => {
      try {
        setIsLoading(true);
        const data = await getMessages();
        setMessages(data.messages || []);
      } catch (error) {
        console.error('Failed to load messages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, []);

  // Track page view
  useEffect(() => {
    setPageTitle('Discovery Hook');
    trackPageView('discovery_hook');
    trackFunnelStep('discovery_hook_viewed');
  }, [setPageTitle]);

  // Handle pricing modal
  const handlePricingOpen = () => {
    setIsPricingOpen(true);
    trackPricingView('discovery_hook');
  };

  // Handle preview modal
  const handlePreviewOpen = () => {
    setIsPreviewOpen(true);
    trackPreviewView('discovery_hook');
  };

  // Handle start journey
  const handleStartJourney = () => {
    trackFunnelStep('begin_journey');
    window.location.href = '/discovery-funnel';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0F1C] to-[#00B2E3]">
      <BackgroundImage
        src="/images/background.jpg"
        alt="Digital technology background"
      />

      <div className="relative z-10">
        <EnhancedHero
          userName={authStatus.userName}
          onStart={handleStartJourney}
        />

        <PsychologicalTrustIndicators />

        <ProductCardsSection onOpenPricing={handlePricingOpen} />

        <EnhancedSecondaryCTAs
          onOpenPricing={handlePricingOpen}
          onOpenPreview={handlePreviewOpen}
        />

        {!authStatus.isLoggedIn && (
          <div className="fixed bottom-4 right-4">
            <MemberstackLoginButton />
          </div>
        )}
      </div>

      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
      />

      <PreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        messages={messages}
        isLoading={isLoading}
      />
    </div>
  );
};

export default DiscoveryHook;
