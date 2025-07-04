---
description:
globs:
alwaysApply: false
---
# CanAI Form Patterns Guidelines

## Purpose
Standardize form handling, validation, and accessibility patterns across the 9-stage user journey (F1-F9), ensuring consistent user experience, security, and compliance with WCAG 2.2 AA standards while leveraging the existing form infrastructure.

## Scope
Apply to all form components, validation hooks, and form-related UI elements throughout the CanAI platform, prioritizing emotional resonance and trust-building through excellent form UX.

## Core Principles

### Form Architecture
- Use [useFormValidation.ts](mdc:frontend/src/hooks/useFormValidation.ts) hook for all form validation
- Leverage [validated-form.tsx](mdc:frontend/src/components/ui/validated-form.tsx) for consistent form structure
- Implement [standard-form.tsx](mdc:frontend/src/components/ui/standard-form.tsx) components for UI consistency

### Validation Strategy
- **Security First**: Always sanitize inputs using `DOMPurify` to prevent XSS attacks
- **Real-time Feedback**: Validate on blur and provide immediate visual feedback
- **Progressive Enhancement**: Show validation states (idle → validating → success/error)
- **User-Friendly Messages**: Use clear, helpful error messages without technical jargon

## Implementation Patterns

### ✅ Form Hook Usage
```typescript
import { useFormValidation, ValidationRule } from '@/hooks/useFormValidation';

// Define validation rules with security measures
const validationRules: Record<string, ValidationRule> = {
  businessName: {
    required: true,
    minLength: 3,
    maxLength: 50,
    sanitize: true, // Enable XSS protection
    custom: (value) => {
      if (value.includes('<script')) return 'Invalid characters detected';
      return null;
    }
  },
  email: {
    required: true,
    email: true,
    sanitize: true,
    maxLength: 254 // RFC 5321 compliance
  }
};

export const BusinessDetailsForm = () => {
  const { validations, getFieldProps, isFormValid, resetForm } =
    useFormValidation(validationRules);

  return (
    <ValidatedForm
      fields={validationRules}
      onValidSubmit={handleSubmit}
      variant="modal"
    >
      <ValidatedField
        name="businessName"
        label="Business Name"
        type="text"
        required
        validation={{ getFieldProps, validations }}
        helperText="Enter your business or project name"
      />
    </ValidatedForm>
  );
};
```

### ✅ Validation States & Accessibility
```typescript
// Proper ARIA labels and live regions
<StandardFormGroup
  validationState={fieldState}
  error={error}
  success={isValid}
>
  <StandardFormLabel htmlFor="email" required>
    Email Address
  </StandardFormLabel>
  <StandardFormInput
    id="email"
    type="email"
    validationState={validationState}
    aria-describedby={error ? "email-error" : "email-helper"}
    aria-invalid={!!error}
    {...getFieldProps('email')}
  />
  {error && (
    <div
      id="email-error"
      role="alert"
      aria-live="polite"
      className="text-red-500 text-sm mt-1"
    >
      {error}
    </div>
  )}
</StandardFormGroup>
```

### ✅ Multi-Step Forms (F2, F5)
```typescript
// Journey-aware form progression
interface FormStepProps {
  currentStep: number;
  totalSteps: number;
  onNext: (data: StepData) => void;
  onPrevious: () => void;
  autoSave?: boolean;
}

export const MultiStepForm: React.FC<FormStepProps> = ({
  currentStep,
  totalSteps,
  onNext,
  autoSave = true
}) => {
  const form = useFormValidation(stepValidationRules);
  const { watch } = form;

  // Auto-save for F5: Detailed Input Collection
  useEffect(() => {
    if (autoSave) {
      const timer = setTimeout(() => {
        saveFormProgress(`step-${currentStep}`, watch());
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [watch(), autoSave, currentStep]);

  return (
    <ValidatedForm fields={stepValidationRules} onValidSubmit={onNext}>
      <ProgressIndicator
        current={currentStep}
        total={totalSteps}
        aria-label={`Step ${currentStep} of ${totalSteps}`}
      />
      {/* Form fields */}
    </ValidatedForm>
  );
};
```

### ✅ Error Handling & Recovery
```typescript
// Graceful error handling with fallbacks
const handleFormError = (error: FormError) => {
  // Log to analytics for improvement
  logError({
    action: 'form_submission',
    error_type: error.type,
    user_journey_stage: currentStage,
    form_data: sanitizedFormData
  });

  // Show user-friendly message
  const userMessage = getUserFriendlyErrorMessage(error);
  toast.error(userMessage, {
    action: {
      label: 'Try Again',
      onClick: () => retrySubmission()
    }
  });
};

const getUserFriendlyErrorMessage = (error: FormError): string => {
  switch (error.type) {
    case 'validation_failed':
      return 'Please check the highlighted fields and try again';
    case 'network_error':
      return 'Connection issue. We\'ll retry automatically';
    case 'server_error':
      return 'Something went wrong. Our team has been notified';
    default:
      return 'Please try again in a moment';
  }
};
```

## Journey-Specific Patterns

### F2: Discovery Funnel Forms
```typescript
// Quick, low-friction validation
const discoveryValidation: ValidationRule = {
  businessType: { required: true },
  primaryChallenge: { required: true, maxLength: 200 },
  // Minimal validation for quick engagement
};
```

### F5: Detailed Input Collection
```typescript
// Comprehensive validation with auto-save
const detailedInputValidation: ValidationRule = {
  businessName: {
    required: true,
    minLength: 3,
    maxLength: 50,
    sanitize: true
  },
  targetMarket: {
    required: true,
    maxLength: 500,
    sanitize: true,
    custom: validateTargetMarket
  },
  // Rich validation for detailed collection
};

// Auto-save implementation
const useAutoSave = (formData: FormData, intervalMs: number = 2000) => {
  useEffect(() => {
    const timer = setInterval(() => {
      saveToSupabase(formData).catch(console.error);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [formData, intervalMs]);
};
```

### F6: Intent Mirror Validation
```typescript
// Confirmation and edit patterns
const intentMirrorValidation = {
  // Validate confidence scores
  confidence: {
    required: true,
    custom: (value) => {
      const score = parseFloat(value);
      return score >= 0.7 ? null : 'Low confidence - please review';
    }
  }
};
```

## Security & Performance

### Input Sanitization
```typescript
// Always sanitize user inputs
const sanitizeInput = (value: string): string => {
  return DOMPurify.sanitize(value, {
    ALLOWED_TAGS: [], // No HTML tags
    ALLOWED_ATTR: [], // No attributes
  });
};

// Validate email with enhanced security
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 254;
};
```

### Performance Optimization
```typescript
// Debounced validation for better UX
const useDebouncedValidation = (
  value: string,
  validateFn: (val: string) => string | null,
  delay: number = 300
) => {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setError(validateFn(value));
    }, delay);

    return () => clearTimeout(timer);
  }, [value, validateFn, delay]);

  return error;
};
```

## Testing Patterns

### Form Testing
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

describe('BusinessDetailsForm', () => {
  it('validates required fields and shows appropriate errors', async () => {
    render(<BusinessDetailsForm />);

    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/business name is required/i)).toBeInTheDocument();
    });
  });

  it('sanitizes input to prevent XSS', async () => {
    render(<BusinessDetailsForm />);

    const input = screen.getByLabelText(/business name/i);
    fireEvent.change(input, { target: { value: '<script>alert("xss")</script>Test' } });

    await waitFor(() => {
      expect(input).toHaveValue('Test'); // Script tags removed
    });
  });

  it('meets accessibility standards', async () => {
    const { container } = render(<BusinessDetailsForm />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

## Anti-Patterns

### ❌ Avoid These Patterns
```typescript
// DON'T: Inline validation without security
<input onChange={(e) => setName(e.target.value)} /> // No sanitization

// DON'T: Poor error messaging
{error && <span>Error</span>} // Non-descriptive

// DON'T: Missing accessibility
<input type="email" /> // No labels, ARIA attributes

// DON'T: No loading states
<button onClick={handleSubmit}>Submit</button> // No loading indication
```

### ✅ Correct Patterns
```typescript
// DO: Secure, accessible, user-friendly forms
<ValidatedField
  name="email"
  label="Email Address"
  type="email"
  required
  validation={{ getFieldProps, validations }}
  helperText="We'll use this to send your business plan"
  aria-describedby="email-helper"
/>
```

## Integration Requirements

### Analytics Integration
```typescript
// Track form interactions for optimization
const trackFormEvent = (eventName: string, properties: object) => {
  posthog.capture(eventName, {
    ...properties,
    journey_stage: currentStage,
    form_type: formType
  });
};

// Track form completion funnel
useEffect(() => {
  trackFormEvent('form_step_viewed', {
    step: currentStep,
    total_steps: totalSteps
  });
}, [currentStep]);
```

### Error Logging
```typescript
// Log form errors for improvement
const logFormError = async (error: FormError) => {
  await insertErrorLog({
    error_message: error.message,
    error_type: 'form_validation',
    action: `form_${formType}_${currentStep}`,
    user_id: userId
  });
};
```

## Accessibility Requirements

- **WCAG 2.2 AA Compliance**: All forms must pass accessibility audits
- **Keyboard Navigation**: Full keyboard operability
- **Screen Reader Support**: Proper ARIA labels and live regions
- **Color Contrast**: Minimum 4.5:1 ratio for all text
- **Focus Management**: Clear focus indicators and logical tab order

## Validation Standards

- **Required Fields**: Clear visual and semantic indication
- **Error Messages**: Descriptive, actionable, non-technical
- **Success States**: Positive feedback when validation passes
- **Loading States**: Clear indication during submission
- **Recovery Options**: Easy ways to fix errors and retry

---

**Created**: January 2025
**Version**: 1.0.0
**Alignment**: PRD Sections 5, 6, 7, 9

