import DOMPurify from 'dompurify';
import { useCallback, useState } from 'react';

export type ValidationRule = {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  email?: boolean;
  custom?: (value: string) => string | null;
  sanitize?: boolean;
};

export type ValidationState = 'idle' | 'error' | 'success' | 'validating';

export interface FieldValidation {
  value: string;
  error: string | null;
  state: ValidationState;
  touched: boolean;
}

// Sanitize input to prevent XSS
const sanitizeInput = (value: string): string => {
  return DOMPurify.sanitize(value, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [], // No attributes allowed
  });
};

// Enhanced email validation
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 254; // RFC 5321
};

export const useFormValidation = (fields: Record<string, ValidationRule>) => {
  const [validations, setValidations] = useState<
    Record<string, FieldValidation>
  >(
    Object.keys(fields).reduce(
      (acc, key) => ({
        ...acc,
        [key]: {
          value: '',
          error: null,
          state: 'idle' as ValidationState,
          touched: false,
        },
      }),
      {}
    )
  );

  const validateField = useCallback(
    (fieldName: string, value: string): string | null => {
      const rules = fields[fieldName];
      if (!rules) return null;

      // Sanitize input if enabled
      const sanitizedValue = rules.sanitize ? sanitizeInput(value) : value;

      // Required validation
      if (rules.required && (!sanitizedValue || sanitizedValue.trim() === '')) {
        return 'This field is required';
      }

      // Skip other validations if field is empty and not required
      if (!sanitizedValue.trim() && !rules.required) {
        return null;
      }

      // Email validation with enhanced security
      if (rules.email) {
        if (!validateEmail(sanitizedValue)) {
          return 'Please enter a valid email address';
        }
      }

      // Pattern validation
      if (rules.pattern && !rules.pattern.test(sanitizedValue)) {
        return 'Please enter a valid format';
      }

      // Length validations with reasonable limits
      if (rules.minLength && sanitizedValue.length < rules.minLength) {
        return `Must be at least ${rules.minLength} characters`;
      }

      const maxLen = rules.maxLength || 1000; // Reasonable default max length
      if (sanitizedValue.length > maxLen) {
        return `Must be no more than ${maxLen} characters`;
      }

      // Custom validation
      if (rules.custom) {
        return rules.custom(sanitizedValue);
      }

      return null;
    },
    [fields]
  );

  const updateField = useCallback(
    (fieldName: string, value: string) => {
      setValidations(prev => {
        const currentField = prev[fieldName];
        const error = validateField(fieldName, value);
        const state: ValidationState = error
          ? 'error'
          : value.trim()
            ? 'success'
            : 'idle';

        return {
          ...prev,
          [fieldName]: {
            value: fields[fieldName]?.sanitize ? sanitizeInput(value) : value,
            error,
            state,
            touched: currentField?.touched || value.length > 0,
          },
        };
      });
    },
    [validateField, fields]
  );

  const touchField = useCallback((fieldName: string) => {
    setValidations(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        value: prev[fieldName]?.value || '',
        error: prev[fieldName]?.error || null,
        state: prev[fieldName]?.state || 'idle',
        touched: true,
      },
    }));
  }, []);

  const isFormValid = useCallback(() => {
    return Object.values(validations).every(
      field =>
        field.state === 'success' ||
        (field.state === 'idle' &&
          !fields[
            Object.keys(validations).find(key => validations[key] === field)!
          ]?.required)
    );
  }, [validations, fields]);

  const getFieldProps = useCallback(
    (fieldName: string) => {
      const field = validations[fieldName];
      return {
        value: field?.value || '',
        error: field?.touched ? field.error : null,
        validationState: field?.state || 'idle',
        onChange: (
          e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
        ) => {
          updateField(fieldName, e.target.value);
        },
        onBlur: () => touchField(fieldName),
      };
    },
    [validations, updateField, touchField]
  );

  const resetForm = useCallback(() => {
    setValidations(
      Object.keys(fields).reduce(
        (acc, key) => ({
          ...acc,
          [key]: {
            value: '',
            error: null,
            state: 'idle' as ValidationState,
            touched: false,
          },
        }),
        {}
      )
    );
  }, [fields]);

  return {
    validations,
    updateField,
    touchField,
    isFormValid,
    getFieldProps,
    resetForm,
  };
};
