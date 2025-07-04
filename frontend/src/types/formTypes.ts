export interface FormData {
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

  // Additional fields for enhanced forms
  primaryGoal: string;
  competitiveContext: string;
  brandVoice: string;
  uniqueValue: string;
  planPurpose: string;
  resourceConstraints: string;
  currentStatus: string;
  revenueModel: string;
}

export interface StepOneFormProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  errors: Partial<FormData>;
}

export interface StepTwoFormProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  errors: Partial<FormData>;
}

export interface AutoSaveIndicatorProps {
  lastSaved: Date | null;
  isAutoSaving?: boolean;
}
