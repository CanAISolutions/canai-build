/**
 * Memberstack authentication integration for CanAI Platform
 * Handles gated access to deliverables and user management
 */

import { insertSessionLog } from './supabase';
import { generateCorrelationId } from './tracing';

export interface MemberstackUser {
  id: string;
  email: string;
  metadata: Record<string, unknown>;
  auth: {
    uid: string;
    accessToken: string;
    refreshToken: string;
  };
  planConnections: Array<{
    id: string;
    status: string;
    planId: string;
  }>;
}

export interface MemberstackAuthStatus {
  authenticated: boolean;
  user?: MemberstackUser | undefined;
  hasDeliverableAccess: boolean;
  error?: string | undefined;
}

interface MemberstackError {
  code: string;
  message: string;
  details?: unknown;
}

interface MemberstackEvent {
  type: string;
  data: {
    user: MemberstackUser | null;
    error?: MemberstackError;
  };
}

interface MemberstackEventHandler {
  (event: MemberstackEvent): void;
}

// Remove unused interface
// interface MemberstackEventListener {
//   (handler: MemberstackEventHandler): void;
// }

// Remove unused interface
// interface MemberstackConfig {
//   publicKey: string;
// }

interface MemberstackClient {
  getCurrentMember: () => Promise<{ data: MemberstackUser | null }>;
  on: (event: string, handler: MemberstackEventHandler) => void;
  off: (event: string, handler: MemberstackEventHandler) => void;
}

// Remove unused interface
// interface MemberstackConstructor {
//   new (options: { config: MemberstackConfig }): MemberstackClient;
// }

// Remove unused declarations
// declare const Memberstack: MemberstackConstructor;

// Memberstack configuration
// const MEMBERSTACK_PUBLIC_KEY = import.meta.env['VITE_MEMBERSTACK_PUBLIC_KEY'] || '';

export interface AccessDetails
  extends Record<string, string | number | boolean | undefined> {
  action: string;
  user_email?: string;
  correlation_id: string;
}

// Secure token storage
const TOKEN_KEY = 'canai_auth_token';
const TOKEN_EXPIRY_KEY = 'canai_auth_expiry';

// Token management
// Remove unused setAuthToken function
// const setAuthToken = (token: string, expiresIn: number) => {
//   const expiryTime = Date.now() + expiresIn * 1000;
//   try {
//     // Use sessionStorage for better security
//     sessionStorage.setItem(TOKEN_KEY, token);
//     sessionStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
//   } catch (error) {
//     console.error('[Memberstack] Failed to store auth token:', error);
//   }
// };

const getAuthToken = (): string | null => {
  try {
    const token = sessionStorage.getItem(TOKEN_KEY);
    const expiry = sessionStorage.getItem(TOKEN_EXPIRY_KEY);

    if (!token || !expiry) {
      return null;
    }

    // Check if token is expired
    if (Date.now() > parseInt(expiry, 10)) {
      clearAuthToken();
      return null;
    }

    return token;
  } catch (error) {
    console.error('[Memberstack] Failed to get auth token:', error);
    return null;
  }
};

const clearAuthToken = () => {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_EXPIRY_KEY);
  } catch (error) {
    console.error('[Memberstack] Failed to clear auth token:', error);
  }
};

class MemberstackAuthClient {
  private initialized = false;
  private memberstackInstance: MemberstackClient | null = null;

  constructor() {
    this.initializeMemberstack();
  }

  private async initializeMemberstack() {
    if (this.initialized) return;

    try {
      const publicKey = import.meta.env['VITE_MEMBERSTACK_PUBLIC_KEY'];
      if (!publicKey) {
        throw new Error('Memberstack public key not found');
      }

      // Initialize Memberstack with public key
      // this.memberstackInstance = await MemberStack.init({ publicKey });
      this.initialized = true;
      console.log('[Memberstack] Initialized successfully');
    } catch (error) {
      console.error('[Memberstack] Initialization failed:', error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<MemberstackUser | null> {
    const token = getAuthToken();
    if (!token) {
      return null;
    }

    try {
      // TODO: Use actual Memberstack getCurrentMember
      // const { data: member } = await this.memberstackInstance.getCurrentMember();
      // return member;
      return null;
    } catch (error) {
      console.error('[Memberstack] Failed to get current user:', error);
      clearAuthToken();
      return null;
    }
  }

  async getAuthStatus(): Promise<MemberstackAuthStatus> {
    try {
      const user = await this.getCurrentUser();
      const authenticated = !!user;
      const hasDeliverableAccess = authenticated
        ? await this.checkDeliverableAccess('business_builder')
        : false;

      return {
        authenticated,
        user: user || undefined,
        hasDeliverableAccess,
      };
    } catch (error) {
      console.error('[Memberstack] Auth status check failed:', error);
      return {
        authenticated: false,
        hasDeliverableAccess: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async loginUser(
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate input
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      if (!this.initialized) {
        throw new Error('Memberstack not initialized');
      }

      // TODO: Use actual Memberstack login
      // const result = await this.memberstackInstance.signIn({ email, password });
      // if (result.data?.token) {
      //   setAuthToken(result.data.token, result.data.expiresIn);
      //   return { success: true };
      // }

      throw new Error('Login failed');
    } catch (error) {
      console.error('[Memberstack] Login failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed',
      };
    }
  }

  async logoutUser(): Promise<void> {
    try {
      // TODO: Use actual Memberstack logout
      // await this.memberstackInstance.signOut();
      clearAuthToken();
    } catch (error) {
      console.error('[Memberstack] Logout failed:', error);
      // Clear token even if logout fails
      clearAuthToken();
    }
  }

  async checkDeliverableAccess(productType: string): Promise<boolean> {
    const user = await this.getCurrentUser();
    if (!user) return false;

    // Check if user has active plan connection for the product
    return user.planConnections.some(
      connection =>
        connection.planId === productType && connection.status === 'ACTIVE'
    );
  }

  async requireDeliverableAccess(productType: string): Promise<boolean> {
    const hasAccess = await this.checkDeliverableAccess(productType);

    if (!hasAccess) {
      console.warn(
        `[Memberstack] Deliverable access denied for ${productType}`
      );

      // Log access attempt
      await insertSessionLog({
        user_id: null,
        interaction_type: 'access_denied',
        interaction_details: {
          product_type: productType,
          reason: 'insufficient_permissions',
          correlation_id: generateCorrelationId(),
        },
      });
    }

    return hasAccess;
  }

  async trackUserAccess(
    action: string,
    details?: Record<string, string | number | boolean | undefined>
  ) {
    const user = await this.getCurrentUser();

    await insertSessionLog({
      user_id: user?.id ?? null,
      interaction_type: 'user_access',
      interaction_details: {
        action,
        user_email: user?.email,
        ...details,
        correlation_id: generateCorrelationId(),
      },
    });
  }
}

// Global Memberstack instance
export const memberstackAuth = new MemberstackAuthClient();

// Helper functions
export const requireDeliverableAccess = async (
  productType: string
): Promise<boolean> => {
  return memberstackAuth.requireDeliverableAccess(productType);
};

export const trackUserAccess = async (
  action: string,
  details?: Record<string, string | number | boolean | undefined>
) => {
  return memberstackAuth.trackUserAccess(action, details);
};

// TODO: Configure Memberstack
/*
1. Add Memberstack script to index.html:
   <script src="https://static.memberstack.com/scripts/v1/memberstack.js" data-memberstack-id="your-public-key"></script>

2. Initialize Memberstack in main.tsx or component:
   import MemberStack from '@memberstack/dom'
   await MemberStack.init({ publicKey: 'pk_your_key' })

3. Environment variables:
   VITE_MEMBERSTACK_PUBLIC_KEY=pk_your_key

4. Configure plans and permissions in Memberstack dashboard:
   - business_builder plan
   - social_email plan
   - site_audit plan

5. Set up password reset flow and member portal
*/
