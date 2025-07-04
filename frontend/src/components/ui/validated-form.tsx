import { useFormValidation, ValidationRule } from '@/hooks/useFormValidation';
import { cn } from '@/lib/utils';
import * as React from 'react';
import {
  StandardForm,
  StandardFormGroup,
  StandardFormHelperText,
  StandardFormInput,
  StandardFormLabel,
  StandardFormTextarea,
} from './standard-form';

interface ValidatedFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  fields: Record<string, ValidationRule>;
  onValidSubmit?: (data: Record<string, string>) => void;
  variant?: 'default' | 'modal' | 'inline';
}

export const ValidatedForm = React.forwardRef<
  HTMLFormElement,
  ValidatedFormProps
>(
  (
    {
      className,
      fields,
      onValidSubmit,
      variant = 'default',
      children,
      onSubmit,
      ...props
    },
    ref
  ) => {
    const { validations, isFormValid } = useFormValidation(fields);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (isFormValid() && onValidSubmit) {
        const formData = Object.keys(validations).reduce(
          (acc, key) => ({
            ...acc,
            [key]: validations[key].value,
          }),
          {}
        );

        onValidSubmit(formData);
      }

      onSubmit?.(e);
    };

    return (
      <StandardForm
        ref={ref}
        className={cn('relative', className)}
        variant={variant}
        onSubmit={handleSubmit}
        {...props}
      >
        {children}
      </StandardForm>
    );
  }
);
ValidatedForm.displayName = 'ValidatedForm';

interface ValidationProps {
  getFieldProps: (name: string) => {
    value: string;
    error: string | undefined;
    validationState: 'error' | 'success' | 'idle' | 'validating';
    onChange: (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => void;
    onBlur: () => void;
  };
  validations: Record<
    string,
    { value: string; state: 'error' | 'success' | 'idle' | 'validating' }
  >;
}

interface ValidatedFieldProps {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'textarea';
  placeholder?: string;
  helperText?: string;
  required: boolean;
  validation: ValidationProps;
  className?: string;
}

export const ValidatedField = React.forwardRef<
  HTMLDivElement,
  ValidatedFieldProps
>(
  (
    {
      name,
      label,
      type = 'text',
      placeholder,
      helperText,
      required = false,
      validation,
      className,
    },
    ref
  ) => {
    const fieldProps = validation.getFieldProps(name);
    const fieldValidation = validation.validations[name];

    return (
      <StandardFormGroup
        ref={ref}
        className={className}
        required={required}
        error={fieldProps.error || ''}
        success={fieldValidation ? fieldValidation.state === 'success' : false}
        validationState={fieldProps.validationState}
      >
        <StandardFormLabel htmlFor={name} required={required}>
          {label}
        </StandardFormLabel>

        {type === 'textarea' ? (
          <StandardFormTextarea
            id={name}
            name={name}
            placeholder={placeholder}
            validationState={fieldProps.validationState}
            value={fieldProps.value}
            onChange={fieldProps.onChange}
            onBlur={fieldProps.onBlur}
            aria-describedby={
              helperText
                ? `${name}-helper`
                : fieldProps.error
                  ? `${name}-error`
                  : undefined
            }
            aria-invalid={!!fieldProps.error}
          />
        ) : (
          <StandardFormInput
            id={name}
            name={name}
            type={type}
            placeholder={placeholder}
            validationState={fieldProps.validationState}
            value={fieldProps.value}
            onChange={fieldProps.onChange}
            onBlur={fieldProps.onBlur}
            aria-describedby={
              helperText
                ? `${name}-helper`
                : fieldProps.error
                  ? `${name}-error`
                  : undefined
            }
            aria-invalid={!!fieldProps.error}
          />
        )}

        {helperText && (
          <StandardFormHelperText id={`${name}-helper`}>
            {helperText}
          </StandardFormHelperText>
        )}
      </StandardFormGroup>
    );
  }
);
ValidatedField.displayName = 'ValidatedField';

export { useFormValidation };
