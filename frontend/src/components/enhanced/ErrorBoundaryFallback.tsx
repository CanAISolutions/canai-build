import { EnhancedButton } from '@/components/ui/enhanced-button';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface ErrorBoundaryFallbackProps {
  error: Error;
  resetError: () => void;
}

// Sanitize error message to prevent sensitive info leakage
const sanitizeErrorMessage = (error: Error): string => {
  // Remove potential stack traces
  const message = error.message || 'An unknown error occurred';
  // Remove potential file paths
  return (
    message
      .replace(/([A-Za-z]:\\|\/)[^\s]+/g, '[PATH]')
      // Remove potential URLs
      .replace(/(https?:\/\/[^\s]+)/g, '[URL]')
      // Remove potential API keys or tokens
      .replace(/([A-Za-z0-9+/=]){40,}/g, '[REDACTED]')
      // Remove potential email addresses
      .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL]')
  );
};

const ErrorBoundaryFallback: React.FC<ErrorBoundaryFallbackProps> = ({
  error,
  resetError,
}) => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
    resetError();
  };

  // Log error to monitoring service
  React.useEffect(() => {
    // TODO: Add proper error logging service integration
    console.error('[ErrorBoundary]', {
      name: error.name,
      message: sanitizeErrorMessage(error),
      timestamp: new Date().toISOString(),
    });
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0F1C] to-[#00B2E3] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gradient-to-br from-[#172b47]/90 to-[#1e314f]/90 backdrop-blur-sm rounded-2xl border-2 border-[#36d1fe]/40 p-8 text-center">
        <div className="mb-6">
          <AlertTriangle className="h-16 w-16 text-[#36d1fe] mx-auto mb-4 animate-pulse" />
          <h1 className="text-2xl font-bold text-white font-playfair mb-2">
            Oops! Something went wrong
          </h1>
          <p className="text-[#cce7fa] font-manrope">
            We&apos;re sorry for the inconvenience. Our team has been notified.
          </p>
        </div>

        {import.meta.env['MODE'] === 'development' && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-left">
            <p className="text-red-300 text-sm font-mono break-all">
              {sanitizeErrorMessage(error)}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <EnhancedButton
            onClick={resetError}
            variant="primary"
            size="lg"
            icon={<RefreshCw className="h-4 w-4" />}
            iconPosition="left"
            className="flex-1"
          >
            Try Again
          </EnhancedButton>

          <EnhancedButton
            onClick={handleGoHome}
            variant="outline"
            size="lg"
            icon={<Home className="h-4 w-4" />}
            iconPosition="left"
            className="flex-1"
          >
            Go Home
          </EnhancedButton>
        </div>
      </div>
    </div>
  );
};

export default ErrorBoundaryFallback;
