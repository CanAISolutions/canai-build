/**
 * Detailed Input Integration
 */

import { supabase } from '@/integrations/supabase/client';
import { generateCorrelationId } from './tracing';

export interface DetailedInputData {
  businessName: string;
  businessDescription: string;
  targetAudience: string;
  keyProducts: string;
  uniqueValueProp: string;
  location: string;
  primaryGoals: string;
  secondaryGoals: string;
  timeline: string;
  budget: string;
  successMetrics: string;
  additionalContext: string;
}

export interface DetailedInputResponse {
  success: boolean;
  promptId?: string;
  error?: string;
}

export interface ValidationResponse {
  valid: boolean;
  feedback: string;
  suggestions?: string[];
}

// Save detailed input data
export const saveDetailedInput = async (
  data: DetailedInputData
): Promise<DetailedInputResponse> => {
  try {
    console.log('[Detailed Input] Saving data');

    // Validate input data
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid input data');
    }

    // Transform data to match Supabase schema
    const inputData = {
      session_id: generateCorrelationId(),
      prompt_type: 'detailed_input',
      user_input: JSON.stringify(data),
      canai_output: '',
      sterile_output: '',
      created_at: new Date().toISOString(),
    };

    // Store in Supabase
    const { error } = await supabase
      .from('prompt_types')
      .insert([inputData])
      .select();

    if (error) {
      throw error;
    }

    return {
      success: true,
      promptId: inputData.session_id,
    };
  } catch (error) {
    console.error('[Detailed Input] Save failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// Validate detailed input
export const validateDetailedInput = async (
  field: string,
  value: string
): Promise<ValidationResponse> => {
  try {
    console.log('[Detailed Input] Validating field:', field, value);

    // Mock validation logic
    const isValid = value.length > 0;

    return {
      valid: isValid,
      feedback: isValid
        ? 'Field validated successfully'
        : 'Please provide more details',
      suggestions: isValid
        ? []
        : ['Try being more specific', 'Add more context'],
    };
  } catch (error) {
    console.error('[Detailed Input] Validation failed:', error);
    return {
      valid: false,
      feedback: 'Validation error occurred',
    };
  }
};
