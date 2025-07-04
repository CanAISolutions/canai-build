import { trackEvent, POSTHOG_EVENTS } from './analytics';

// Purchase Flow specific PostHog events
export const trackPriceViewed = (priceData: {
  product: 'business_builder' | 'social_email' | 'site_audit';
  price: number;
  currency?: string;
  source?: string;
}) => {
  trackEvent('price_viewed', {
    product: priceData.product,
    price: priceData.price,
    currency: priceData.currency || 'USD',
    source: priceData.source || 'purchase_flow',
    viewed_at: new Date().toISOString(),
  });
};

export const trackProductSwitched = (switchData: {
  from_product: string;
  to_product: string;
  from_price?: number;
  to_price?: number;
  switch_reason?: string;
}) => {
  trackEvent('product_switched', {
    from_product: switchData.from_product,
    to_product: switchData.to_product,
    new_track: switchData.to_product,
    from_price: switchData.from_price,
    to_price: switchData.to_price,
    switch_reason: switchData.switch_reason || 'user_preference',
    switched_at: new Date().toISOString(),
  });
};

export const trackCheckoutStarted = (checkoutData: {
  product: string;
  price: number;
  session_id?: string;
}) => {
  trackEvent(POSTHOG_EVENTS.FUNNEL_STEP, {
    funnel_step: 'checkout_started',
    product: checkoutData.product,
    price: checkoutData.price,
    session_id: checkoutData.session_id,
    checkout_timestamp: new Date().toISOString(),
  });
};

export const trackPaymentCompleted = (paymentData: {
  product: string;
  price: number;
  stripe_session_id: string;
  completion_time_ms?: number;
}) => {
  trackEvent(POSTHOG_EVENTS.FUNNEL_STEP, {
    funnel_step: 'payment_completed',
    product: paymentData.product,
    price: paymentData.price,
    stripe_session_id: paymentData.stripe_session_id,
    completion_time_ms: paymentData.completion_time_ms,
    payment_timestamp: new Date().toISOString(),
  });
};

export const trackRefundRequested = (refundData: {
  stripe_session_id: string;
  reason: string;
  amount?: number;
}) => {
  trackEvent(POSTHOG_EVENTS.FUNNEL_STEP, {
    funnel_step: 'refund_requested',
    stripe_session_id: refundData.stripe_session_id,
    reason: refundData.reason,
    amount: refundData.amount,
    refund_timestamp: new Date().toISOString(),
  });
};

export const trackCheckoutAbandoned = (abandonData: {
  product: string;
  price: number;
  step: string;
  time_spent_ms?: number;
}) => {
  trackEvent(POSTHOG_EVENTS.FUNNEL_STEP, {
    funnel_step: 'checkout_abandoned',
    product: abandonData.product,
    price: abandonData.price,
    abandoned_at_step: abandonData.step,
    time_spent_ms: abandonData.time_spent_ms,
    abandon_timestamp: new Date().toISOString(),
  });
};
