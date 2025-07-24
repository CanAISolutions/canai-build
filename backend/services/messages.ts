import { createClient } from '@supabase/supabase-js';
import log from '../Shared/Logger.js';

const logger = log;

export interface MessageFilters {
  limit?: number;
  offset?: number;
  type?: string;
}

export interface Message {
  text: string;
  user_id: string | null;
  created_at: string;
}

export class MessagesRepository {
  private supabase;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    );
  }

  async getMessages(
    filters: MessageFilters
  ): Promise<{ data: Message[]; count: number }> {
    if (process.env.NODE_ENV === 'test') {
      logger.info('[repository] getMessages ENTRY', filters);
    }

    // PRD: Query trust_indicators table primarily
    let query = this.supabase
      .from('trust_indicators')
      .select('*', { count: 'exact' });

    // Apply filters for pagination
    if (filters.limit) query = query.limit(filters.limit);
    if (filters.offset)
      query = query.range(filters.offset, filters.offset + filters.limit - 1);

    query = query.order('created_at', { ascending: false });

    const { data, error, count } = await query;
    if (error) {
      logger.error('[repository] getMessages ERROR:', error);
      throw new Error('Failed to fetch trust indicators');
    }

    // PRD: Map to expected format { text: string, user_id: uuid|null }
    const mappedData = (data || []).map(item => ({
      text: item.text,
      user_id: null, // PRD: trust_indicators don't have user_id
      created_at: item.created_at,
    }));

    return { data: mappedData, count: count || 0 };
  }

  async getStatistics(): Promise<{
    total_messages: number;
    trust_indicators: number;
    comparisons_count: number;
  }> {
    if (process.env.NODE_ENV === 'test') {
      logger.info('[repository] getStatistics ENTRY');
    }

    // Get trust indicators count
    const { count: trustIndicators } = await this.supabase
      .from('trust_indicators')
      .select('*', { count: 'exact', head: true });

    // PRD: Calculate stats via query (SELECT COUNT(*) FROM comparisons WHERE created_at IS NOT NULL)
    const { count: comparisonsCount } = await this.supabase
      .from('comparisons')
      .select('*', { count: 'exact', head: true })
      .not('created_at', 'is', null);

    // Get total messages count from messages table
    const { count: totalMessages } = await this.supabase
      .from('messages')
      .select('*', { count: 'exact', head: true });

    return {
      total_messages: totalMessages || 0,
      trust_indicators: trustIndicators || 0,
      comparisons_count: comparisonsCount || 0,
    };
  }
}
