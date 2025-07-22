import express from 'express';
import stripe from '../services/stripe.js';
import { createCheckoutSession } from '../services/stripeCheckout.js';
import jwt from 'jsonwebtoken';
import {
  queryPaymentLogs,
  getPaymentAnalytics,
} from '../services/paymentLogs.js';
import supabase from '../supabase/client.js';
import { checkoutSessionSchema } from '../schemas/stripe.js';
import validate from '../middleware/validation.js';
import { CustomError } from '../server.js';

const router = express.Router();

// --- CORS Preflight Handler ---
router.options('*', (req, res) => {
  res.sendStatus(204);
});

// const allowedTracks = [
//   'business-plan-builder',
//   'social-media-campaign',
//   'website-audit-feedback',
// ];

router.post(
  '/stripe-session',
  validate({ body: checkoutSessionSchema }),
  async (req, res) => {
    try {
      const { productTrack, user_id, metadata = {} } = req.body;
      const session = await createCheckoutSession({
        productTrack,
        userId: user_id,
        metadata,
      });
      // Log session in Supabase payment_logs
      try {
        await supabase.from('payment_logs').insert([
          {
            user_id,
            amount: session.amount_total ? session.amount_total / 100 : null, // Stripe returns amount in cents
            currency: session.currency || 'usd',
            payment_method:
              (session.payment_method_types &&
                session.payment_method_types[0]) ||
              'card',
            status: 'pending',
            stripe_payment_id: session.payment_intent || session.id, // fallback to session.id if payment_intent missing
            event_type: 'checkout.session.created',
            metadata: session,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]);
      } catch (logErr: unknown) {
        console.error(
          'Failed to log payment event:',
          (logErr as Error).message
        );
      }
      res.json({ session });
    } catch (error: unknown) {
      const customError = error as CustomError;
      res.status(500).json({ error: { message: customError.message } });
    }
  }
);

router.post('/refund', async (req, res) => {
  try {
    const { session_id, reason } = req.body;

    const checkoutSession = await stripe.checkout.sessions.retrieve(session_id);
    const paymentIntentId = checkoutSession.payment_intent;

    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId as string,
      reason,
    });

    // Update payment_logs with refund event_type and metadata
    try {
      await supabase
        .from('payment_logs')
        .update({
          status: 'refunded',
          event_type: 'refund.created',
          metadata: { ...refund, refund_reason: reason },
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_payment_id', paymentIntentId);
    } catch (logErr: unknown) {
      console.error(
        'Failed to update payment log for refund:',
        (logErr as Error).message
      );
    }

    res.json({ refund });
  } catch (error: unknown) {
    const customError = error as CustomError;
    res.status(500).json({ error: { message: customError.message } });
  }
});

/**
 * GET /v1/payment-logs
 * Query payment logs with filtering, pagination, and RLS enforcement.
 * Query params: user_id, event_type, status, from, to, limit, offset, sort
 * Auth: RLS enforced (user can only see own logs unless admin)
 * Response: { data, error, metadata }
 */
router.get('/payment-logs', async (req, res) => {
  try {
    const jwtToken = req.headers.authorization?.replace('Bearer ', '');
    let decodedJwt = null;
    try {
      decodedJwt = jwt.decode(jwtToken);
    } catch (e) {
      return res.status(401).json({ error: 'Invalid JWT' });
    }
    // Determine if user is admin (role claim or similar)
    const isAdmin =
      decodedJwt &&
      (decodedJwt.role === 'admin' ||
        decodedJwt['https://hasura.io/jwt/claims']?.['x-hasura-role'] ===
          'admin');
    // For non-admins, require user_id to match JWT sub
    let user_id = req.query.user_id as string;
    if (!isAdmin) {
      user_id = decodedJwt?.sub;
      if (!user_id)
        return res.status(401).json({ error: 'Missing user_id in JWT' });
    }
    // Validate and parse query params
    const params = {
      user_id,
      event_type: req.query.event_type as string,
      status: req.query.status as string,
      from: req.query.from as string,
      to: req.query.to as string,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
      offset: req.query.offset ? parseInt(req.query.offset as string, 10) : 0,
      sort: (req.query.sort as string) || 'created_at.desc',
    };
    const { data, total, error } = await queryPaymentLogs(
      params,
      jwtToken,
      isAdmin
    );
    if (error) {
      console.error('Payment logs query error:', error);
      return res.status(500).json({ error });
    }
    res.json({ data, metadata: { total } });
  } catch (err: unknown) {
    const customError = err as CustomError;
    console.error('Payment logs route error:', customError);
    res.status(500).json({ error: customError.message || customError });
  }
});

/**
 * GET /payment-logs/analytics
 * Returns MVP analytics: total revenue, total refunds, event counts by type.
 * Query params: user_id, from, to
 * Auth: RLS enforced (user can only see own analytics unless admin)
 * Response: { totalRevenue, totalRefunds, eventCounts, error }
 */
router.get('/payment-logs/analytics', async (req, res) => {
  try {
    const jwtToken = req.headers.authorization?.replace('Bearer ', '');
    let decodedJwt = null;
    try {
      decodedJwt = jwt.decode(jwtToken);
    } catch (e) {
      return res.status(401).json({ error: 'Invalid JWT' });
    }
    const isAdmin =
      decodedJwt &&
      (decodedJwt.role === 'admin' ||
        decodedJwt['https://hasura.io/jwt/claims']?.['x-hasura-role'] ===
          'admin');
    let user_id = req.query.user_id as string;
    if (!isAdmin) {
      user_id = decodedJwt?.sub;
      if (!user_id)
        return res.status(401).json({ error: 'Missing user_id in JWT' });
    }
    const params = {
      user_id,
      from: req.query.from as string,
      to: req.query.to as string,
    };
    const { totalRevenue, totalRefunds, eventCounts, error } =
      await getPaymentAnalytics(params, jwtToken, isAdmin);
    if (error) {
      console.error('Payment analytics error:', error);
      return res.status(500).json({ error });
    }
    res.json({ totalRevenue, totalRefunds, eventCounts });
  } catch (err: unknown) {
    const customError = err as CustomError;
    console.error('Payment analytics route error:', customError);
    res.status(500).json({ error: customError.message || customError });
  }
});

export default router;
