import React from 'react';
import { openLoginModal, getCurrentUser } from '@/utils/memberstack';
import { trackEvent, POSTHOG_EVENTS } from '@/utils/analytics';

/**
 * Memberstack login button with actual integration
 * Connects to Memberstack for authentication and user management
 */
const MemberstackLoginButton: React.FC = () => {
  const handleLoginClick = async () => {
    // Track login attempt
    trackEvent(POSTHOG_EVENTS.CTA_CLICKED, {
      cta_type: 'login_button',
      source: 'discovery_hook_header',
      timestamp: new Date().toISOString(),
    });

    // Check if user is already logged in
    const currentUser = await getCurrentUser();
    if (currentUser) {
      console.log('[Memberstack] User already logged in:', currentUser);
      // TODO: Redirect to dashboard or show user menu
      return;
    }

    // Open Memberstack login modal
    await openLoginModal();
  };

  return (
    <button
      id="memberstack-login"
      className="ms-login-btn fixed top-6 right-6 z-50 px-7 py-3 rounded-full bg-[#00CFFF] text-white font-semibold shadow-[0_0_18px_#00F0FF66] hover:bg-[#00F0FF] hover:shadow-[0_0_36px_8px_#00F0FFE6] transition-all duration-200 text-[16px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-canai-cyan"
      aria-label="Memberstack Login"
      style={{ fontFamily: 'Inter, Manrope, sans-serif' }}
      onClick={handleLoginClick}
    >
      Log In
    </button>
  );
};

export default MemberstackLoginButton;
