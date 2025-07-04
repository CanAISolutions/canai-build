import { triggerMakecomWorkflow } from './makecom';
import { insertErrorLog, insertSessionLog } from './supabase';
import { generateCorrelationId, retryWithBackoff } from './tracing';

// API Response Types
export interface StripeSessionRequest {
  spark: {
    title: string;
    product_id: string;
    price: number;
  };
  user_id?: string;
}

export interface StripeSessionResponse {
  session: {
    id: string;
    url?: string;
  };
  error: null | string;
}

export interface RefundRequest {
  session_id: string;
  reason: string;
}

export interface RefundResponse {
  status: 'success' | 'failed';
  error: null | string;
}

export interface SwitchProductRequest {
  session_id: string;
  new_product: string;
}

export interface SwitchProductResponse {
  new_session_id: string;
  error: null | string;
}

// Base API configuration
const API_BASE = import.meta.env['VITE_API_BASE'] || '/v1';
const DEFAULT_TIMEOUT = 5000;

// Generic fetch wrapper with retry logic
const apiCall = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_BASE}${endpoint}`;

  return retryWithBackoff(async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
          'X-Correlation-ID': generateCorrelationId(),
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  });
};

// Create Stripe checkout session
export const createStripeSession = async (
  data: StripeSessionRequest
): Promise<StripeSessionResponse> => {
  console.log('[Purchase API] POST /v1/stripe-session called with:', data);

  try {
    // TODO: Replace with actual Stripe integration
    const response = await apiCall<StripeSessionResponse>('/stripe-session', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    console.log('[Purchase API] Stripe session created:', response);

    // Log payment initiation to Supabase
    await logPaymentInitiation({
      user_id: data.user_id,
      stripe_payment_id: response.session.id,
      interaction_details: {
        product: data.spark.product_id,
        price: data.spark.price,
        spark_title: data.spark.title,
      },
    });

    // Trigger Make.com add_project.json workflow
    await triggerMakecomWorkflow('PROJECT_CREATION', {
      action: 'create_project',
      stripe_session_id: response.session.id,
      product: data.spark.product_id,
      user_id: data.user_id,
    });

    return response;
  } catch (error) {
    console.warn(
      '[Purchase API] createStripeSession failed, using fallback:',
      error
    );

    // Fallback: Generate mock session for development
    const mockSessionId = `stripe_mock_${Date.now()}`;

    // Log error
    await logPurchaseError({
      error_message: error instanceof Error ? error.message : 'Unknown error',
      action: 'create_stripe_session',
      error_type: 'timeout',
      user_id: data.user_id,
    });

    return {
      session: {
        id: mockSessionId,
        url: `https://checkout.stripe.com/pay/${mockSessionId}`,
      },
      error: null,
    };
  }
};

// Process refund
export const processRefund = async (
  data: RefundRequest
): Promise<RefundResponse> => {
  console.log('[Purchase API] POST /v1/refund called with:', data);

  try {
    // TODO: Replace with actual Stripe refund integration
    const response = await apiCall<RefundResponse>('/refund', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    console.log('[Purchase API] Refund processed:', response);

    // Log refund to Supabase
    await insertSessionLog({
      stripe_payment_id: data.session_id,
      interaction_type: 'refund_requested',
      interaction_details: {
        reason: data.reason,
        refund_status: response.status,
      },
    });

    return response;
  } catch (error) {
    console.warn('[Purchase API] processRefund failed:', error);

    await logPurchaseError({
      error_message: error instanceof Error ? error.message : 'Unknown error',
      action: 'process_refund',
      error_type: 'timeout',
    });

    return {
      status: 'failed',
      error: 'Refund processing failed',
    };
  }
};

// Switch product during checkout
export const switchProduct = async (
  data: SwitchProductRequest
): Promise<SwitchProductResponse> => {
  console.log('[Purchase API] POST /v1/switch-product called with:', data);

  try {
    // TODO: Replace with actual Stripe product switching
    const response = await apiCall<SwitchProductResponse>('/switch-product', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    console.log('[Purchase API] Product switched:', response);

    // Log product switch to Supabase
    await insertSessionLog({
      stripe_payment_id: data.session_id,
      interaction_type: 'product_switched',
      interaction_details: {
        old_session_id: data.session_id,
        new_session_id: response.new_session_id,
        new_product: data.new_product,
      },
    });

    return response;
  } catch (error) {
    console.warn('[Purchase API] switchProduct failed:', error);

    await logPurchaseError({
      error_message: error instanceof Error ? error.message : 'Unknown error',
      action: 'switch_product',
      error_type: 'timeout',
    });

    return {
      new_session_id: '',
      error: 'Product switch failed',
    };
  }
};

// Log payment initiation with F4-E1 retry logic
interface PaymentInitiationDetails
  extends Record<string, string | number | boolean | null | undefined> {
  product: string;
  price: number;
  spark_title: string;
}

export const logPaymentInitiation = async (paymentData: {
  user_id?: string | undefined;
  stripe_payment_id: string;
  interaction_details: PaymentInitiationDetails;
}): Promise<void> => {
  await insertSessionLog({
    user_id: paymentData.user_id,
    stripe_payment_id: paymentData.stripe_payment_id,
    interaction_type: 'payment_initiated',
    interaction_details: paymentData.interaction_details,
  });
};

type PurchaseErrorType = 'timeout' | 'stripe_failure' | 'invalid_input';

interface PurchaseErrorData {
  error_message: string;
  action: string;
  error_type: PurchaseErrorType;
  user_id?: string | undefined;
}

const logPurchaseError = async (
  errorData: PurchaseErrorData
): Promise<void> => {
  await insertErrorLog({
    error_message: errorData.error_message,
    error_type: errorData.error_type,
    user_id: errorData.user_id,
    error_details: {
      action: errorData.action,
      timestamp: new Date().toISOString(),
    },
  });
};
