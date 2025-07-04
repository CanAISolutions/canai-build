/**
 * SparkSplit API Integration
 */

import { supabase } from '@/integrations/supabase/client';
import { generateCorrelationId } from './tracing';

export interface SparkSplitRequest {
  businessName?: string;
  tone?: string;
  outcome?: string;
}

export interface EmotionalResonance {
  canaiScore: number;
  genericScore: number;
  delta: number;
}

export interface SparkSplitResponse {
  canaiOutput: string;
  genericOutput: string;
  trustDelta: number;
  emotionalResonance: EmotionalResonance;
  error?: string;
}

export interface FeedbackRequest {
  rating: number;
  comment: string;
  trust_delta: number;
  emotional_resonance: EmotionalResonance;
}

export interface FeedbackResponse {
  success: boolean;
  error?: string;
}

// Generate spark split comparison
export const generateSparkSplit = async (
  request: SparkSplitRequest
): Promise<SparkSplitResponse> => {
  try {
    console.log('[SparkSplit API] Generating comparison:', request);

    // Mock response for development
    return {
      canaiOutput: `# BUSINESS_BUILDER: The Community Spark

Transform your family bakery vision into Denver's most beloved neighborhood gathering place.

## Executive Summary
Your warm, family-centered bakery isn't just about bread and pastries—it's about creating the heart of your community. This plan leverages your personal story and values to build sustainable connections that turn first-time customers into lifelong advocates.`,

      genericOutput: `# Business Plan: Bakery

## Overview
This document outlines a business plan for starting a bakery.

## Market Analysis
The bakery industry serves customers who want baked goods. There is demand for bread, cakes, and pastries in most markets.`,

      trustDelta: 4.2,
      emotionalResonance: {
        canaiScore: 8.7,
        genericScore: 3.2,
        delta: 5.5,
      },
    };
  } catch (error) {
    console.error('[SparkSplit API] Generation failed:', error);
    return {
      canaiOutput: '',
      genericOutput: '',
      trustDelta: 0,
      emotionalResonance: { canaiScore: 0, genericScore: 0, delta: 0 },
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// Submit feedback
export const submitFeedback = async (
  request: FeedbackRequest
): Promise<FeedbackResponse> => {
  try {
    console.log('[SparkSplit API] Submitting feedback');

    // Validate request
    if (!request || typeof request !== 'object') {
      throw new Error('Invalid feedback request');
    }

    // Transform feedback data to match Supabase schema
    const feedbackData = {
      session_id: generateCorrelationId(),
      prompt_type: 'spark_split_feedback',
      user_input: request.comment || '',
      canai_output: JSON.stringify(request),
      sterile_output: '',
      canai_trust_score: request.trust_delta,
      canai_emotional_resonance: request.emotional_resonance,
      canai_generation_time_ms: Date.now(),
      created_at: new Date().toISOString(),
    };

    // Store in Supabase
    const { error } = await supabase
      .from('sparksplit_comparisons')
      .insert([feedbackData])
      .select();

    if (error) {
      throw error;
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('[SparkSplit API] Feedback submission failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};
