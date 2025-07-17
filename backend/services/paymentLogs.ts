import { createClient } from '@supabase/supabase-js';

/**
 * Query payment logs with filters, pagination, sorting, and RLS enforcement.
 * @param {Object} params - Query parameters
 * @param {string} [params.user_id] - Filter by user_id (admin only)
 * @param {string} [params.event_type] - Filter by event_type
 * @param {string} [params.status] - Filter by status
 * @param {string} [params.from] - Start date (ISO)
 * @param {string} [params.to] - End date (ISO)
 * @param {number} [params.limit=20] - Page size
 * @param {number} [params.offset=0] - Offset for pagination
 * @param {string} [params.sort='created_at.desc'] - Sort order (e.g., 'created_at.desc')
 * @param {string} jwtToken - JWT for RLS enforcement
 * @param {boolean} isAdmin - Whether the requester is an admin
 * @returns {Promise<{ data: any[], total: number, error: any }>} Query result
 */
export async function queryPaymentLogs(params, jwtToken, isAdmin) {
  const {
    user_id,
    event_type,
    status,
    from,
    to,
    limit = 20,
    offset = 0,
    sort = 'created_at.desc',
  } = params;

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    jwtToken
      ? { global: { headers: { Authorization: `Bearer ${jwtToken}` } } }
      : {}
  );

  let query = supabase.from('payment_logs').select('*', { count: 'exact' });

  // RLS: Only allow user to see their own logs unless admin
  if (!isAdmin) {
    if (!user_id) throw new Error('user_id is required for non-admins');
    query = query.eq('user_id', user_id);
  } else if (user_id) {
    query = query.eq('user_id', user_id);
  }
  if (event_type) query = query.eq('event_type', event_type);
  if (status) query = query.eq('status', status);
  if (from) query = query.gte('created_at', from);
  if (to) query = query.lte('created_at', to);

  // Sorting
  if (sort) {
    const [col, dir] = sort.split('.');
    if (col && dir) query = query.order(col, { ascending: dir === 'asc' });
  }

  // Pagination
  query = query.range(Number(offset), Number(offset) + Number(limit) - 1);

  const { data, count, error } = await query;
  return { data, total: count, error };
}

/**
 * Aggregate payment analytics for MVP: total revenue, total refunds, event counts by type.
 * @param {Object} params - Query parameters (optional: from, to)
 * @param {string} jwtToken - JWT for RLS enforcement
 * @param {boolean} isAdmin - Whether the requester is an admin
 * @returns {Promise<{ totalRevenue: number, totalRefunds: number, eventCounts: Object, error: any }>}
 */
export async function getPaymentAnalytics(params = {}, jwtToken, isAdmin) {
  const { from, to } = params;
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    jwtToken
      ? { global: { headers: { Authorization: `Bearer ${jwtToken}` } } }
      : {}
  );

  let baseQuery = supabase.from('payment_logs').select('*');
  if (!isAdmin) {
    if (!params.user_id) throw new Error('user_id is required for non-admins');
    baseQuery = baseQuery.eq('user_id', params.user_id);
  } else if (params.user_id) {
    baseQuery = baseQuery.eq('user_id', params.user_id);
  }
  if (from) baseQuery = baseQuery.gte('created_at', from);
  if (to) baseQuery = baseQuery.lte('created_at', to);

  // Fetch all relevant logs (MVP: small scale, optimize later)
  const { data: logs, error } = await baseQuery;
  if (error)
    return { totalRevenue: 0, totalRefunds: 0, eventCounts: {}, error };

  let totalRevenue = 0;
  let totalRefunds = 0;
  const eventCounts = {};

  for (const log of logs) {
    // Count events
    eventCounts[log.event_type] = (eventCounts[log.event_type] || 0) + 1;
    // Revenue: count only succeeded payments
    if (log.event_type === 'payment_intent.succeeded' && log.amount) {
      totalRevenue += Number(log.amount);
    }
    // Refunds: count only refund events
    if (log.event_type === 'refund.created' && log.amount) {
      totalRefunds += Number(log.amount);
    }
  }

  return { totalRevenue, totalRefunds, eventCounts, error: null };
}
