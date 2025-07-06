import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, Eye, EyeOff, Mail } from 'lucide-react';
import { useMemberstack } from '@memberstack/react';
import React, { useState } from 'react';
import {
  trackSignupAttempt,
  trackSignupSuccess,
  trackSignupError,
} from '@/utils/purchaseAnalytics';
import DOMPurify from 'dompurify';
import * as Sentry from '@sentry/browser';

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignupSuccess: (user: { id: string; email: string }) => void;
  isProcessing?: boolean;
}

// RFC 5321-compliant email validation
function validateEmail(email: string): boolean {
  // RFC 5321: max 254 chars, local part max 64, domain max 255
  if (!email || email.length > 254) return false;
  const rfc5321Regex =
    /^(?=.{1,64}@)[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@([A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,}$/;
  return rfc5321Regex.test(email);
}

const SignupModal: React.FC<SignupModalProps> = ({
  isOpen,
  onClose,
  onSignupSuccess,
  isProcessing = false,
}) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const memberstack = useMemberstack();

  // Password validation requirements
  const passwordRequirements = {
    length: formData['password'].length >= 8,
    number: /\d/.test(formData['password']),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(formData['password']),
    uppercase: /[A-Z]/.test(formData['password']),
  };

  const allRequirementsMet = Object.values(passwordRequirements).every(Boolean);
  const passwordsMatch = formData['password'] === formData['confirmPassword'];

  const handleInputChange = (field: string, value: string) => {
    const sanitizedValue = DOMPurify.sanitize(value);
    setFormData(prev => ({ ...prev, [field]: sanitizedValue }));
    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData['fullName'].trim()) {
      newErrors['fullName'] = 'Full name is required';
    }

    if (!formData['email'].trim()) {
      newErrors['email'] = 'Email is required';
    } else if (!validateEmail(formData['email'])) {
      newErrors['email'] = 'Please enter a valid email';
    }

    if (!formData['password']) {
      newErrors['password'] = 'Password is required';
    } else if (!allRequirementsMet) {
      newErrors['password'] = 'Password does not meet requirements';
    }

    if (!formData['confirmPassword']) {
      newErrors['confirmPassword'] = 'Please confirm your password';
    } else if (!passwordsMatch) {
      newErrors['confirmPassword'] = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    trackSignupAttempt('purchase_flow');

    try {
      // TODO: Replace with actual signup logic when available in Memberstack API
      await memberstack.openModal('SIGNUP');
      // Simulate successful signup for now
      onSignupSuccess({ id: 'demo-id', email: formData['email'] });
      trackSignupSuccess('demo-id', formData['email'], 'purchase_flow');
    } catch (error: unknown) {
      Sentry.captureException(error);
      const message =
        typeof error === 'object' &&
        error &&
        'message' in error &&
        typeof (error as { message?: unknown }).message === 'string'
          ? (error as { message: string }).message
          : 'Signup failed. Please try again.';
      setErrors({ submit: message });
      trackSignupError(message, 'purchase_flow');
    }
  };

  const handleGoogleSignup = () => {
    // TODO: Integrate with Memberstack Google OAuth
    console.log('Google signup clicked');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="bg-glass-modal border-canai-primary max-w-4xl p-0 overflow-hidden"
        aria-describedby="signup-description"
      >
        <div id="signup-description" className="sr-only">
          Create your account to access CanAI premium features
        </div>

        {/* Split Screen Layout */}
        <div className="grid md:grid-cols-2 gap-0 min-h-[600px]">
          {/* Left Side - Branding */}
          <div className="bg-gradient-to-br from-[#1e3a8a] to-[#0f172a] p-8 flex flex-col justify-center items-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-10"></div>
            <div className="relative z-10 text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-canai-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold mb-4">Welcome to CanAI</h2>
                <p className="text-lg opacity-90 leading-relaxed">
                  Join thousands of entrepreneurs building their dream
                  businesses with AI-powered precision.
                </p>
              </div>

              <div className="space-y-3 text-left">
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-400" />
                  <span>Instant access to premium deliverables</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-400" />
                  <span>Save your progress automatically</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-400" />
                  <span>Priority customer support</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="p-8 flex flex-col justify-center">
            <div className="max-w-sm mx-auto w-full">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-canai-primary mb-2">
                  Create Your Account
                </h3>
                <p className="text-canai-light">
                  Welcome! Please enter your details.
                </p>
              </div>

              {/* Google Signup Button */}
              <Button
                variant="outline"
                className="w-full mb-6 h-11"
                onClick={handleGoogleSignup}
                disabled={isProcessing}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="#4285f4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34a853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#fbbc05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#ea4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Signup with Google
              </Button>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-canai-primary/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-black text-canai-light">
                    or continue with
                  </span>
                </div>
              </div>

              {/* Signup Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="fullName" className="text-canai-light">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={formData['fullName']}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleInputChange('fullName', e.target.value)
                    }
                    className="mt-1"
                    placeholder="Enter your full name"
                    disabled={isProcessing}
                  />
                  {errors['fullName'] && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors['fullName']}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email" className="text-canai-light">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData['email']}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleInputChange('email', e.target.value)
                    }
                    className="mt-1"
                    placeholder="Enter your email"
                    disabled={isProcessing}
                  />
                  {errors['email'] && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors['email']}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="password" className="text-canai-light">
                    Password
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData['password']}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange('password', e.target.value)
                      }
                      placeholder="Enter your password"
                      disabled={isProcessing}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-canai-light hover:text-canai-primary"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {errors['password'] && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors['password']}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="text-canai-light">
                    Confirm Password
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData['confirmPassword']}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange('confirmPassword', e.target.value)
                      }
                      placeholder="Confirm your password"
                      disabled={isProcessing}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-canai-light hover:text-canai-primary"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {errors['confirmPassword'] && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors['confirmPassword']}
                    </p>
                  )}
                </div>

                {/* Password Requirements */}
                {formData['password'] && (
                  <Card className="border-canai-primary/30 bg-canai-dark/50">
                    <CardContent className="p-3">
                      <p className="text-xs text-canai-light mb-2">
                        Your password must contain:
                      </p>
                      <div className="space-y-1 text-xs">
                        <div
                          className={`flex items-center gap-2 ${passwordRequirements['length'] ? 'text-green-400' : 'text-canai-light'}`}
                        >
                          <div
                            className={`w-1 h-1 rounded-full ${passwordRequirements['length'] ? 'bg-green-400' : 'bg-canai-light/50'}`}
                          ></div>
                          A minimum of 8 characters
                        </div>
                        <div
                          className={`flex items-center gap-2 ${passwordRequirements['number'] ? 'text-green-400' : 'text-canai-light'}`}
                        >
                          <div
                            className={`w-1 h-1 rounded-full ${passwordRequirements['number'] ? 'bg-green-400' : 'bg-canai-light/50'}`}
                          ></div>
                          At least one number
                        </div>
                        <div
                          className={`flex items-center gap-2 ${passwordRequirements['special'] ? 'text-green-400' : 'text-canai-light'}`}
                        >
                          <div
                            className={`w-1 h-1 rounded-full ${passwordRequirements['special'] ? 'bg-green-400' : 'bg-canai-light/50'}`}
                          ></div>
                          At least 1 special character
                        </div>
                        <div
                          className={`flex items-center gap-2 ${passwordRequirements['uppercase'] ? 'text-green-400' : 'text-canai-light'}`}
                        >
                          <div
                            className={`w-1 h-1 rounded-full ${passwordRequirements['uppercase'] ? 'bg-green-400' : 'bg-canai-light/50'}`}
                          ></div>
                          At least one uppercase letter
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {errors['submit'] && (
                  <p className="text-red-400 text-sm">{errors['submit']}</p>
                )}

                <Button
                  type="submit"
                  variant="default"
                  className="w-full h-11 mt-6"
                  disabled={
                    isProcessing || !allRequirementsMet || !passwordsMatch
                  }
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Creating Account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>

                <p className="text-center text-sm text-canai-light mt-4">
                  Already have an account?{' '}
                  <button
                    type="button"
                    className="text-canai-primary hover:underline"
                    onClick={() => {
                      // TODO: Show login modal instead
                      console.log('Switch to login');
                    }}
                  >
                    Login
                  </button>
                </p>
              </form>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SignupModal;
