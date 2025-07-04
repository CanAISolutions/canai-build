import React from 'react';
import * as Sentry from '@sentry/react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    Sentry.captureException(error, { extra: { ...errorInfo } });
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          tabIndex={-1}
          ref={node => node && node.focus()}
          className="min-h-screen bg-gradient-to-br from-[#0A0F1C] to-[#00B2E3] flex items-center justify-center"
        >
          <div className="text-center text-white p-8">
            <h1 className="text-4xl font-bold mb-4">Something went wrong</h1>
            <p className="text-lg mb-6">
              We&apos;re sorry, but something unexpected happened.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-[#36d1fe] text-[#0A0F1C] px-6 py-3 rounded-lg font-semibold hover:bg-[#4ae3ff] transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
