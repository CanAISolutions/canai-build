import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';
import { setSentryContext } from './utils/sentry';

// Lazy load pages for better performance
const Index = lazy(() => import('./pages/Index'));
const DiscoveryHook = lazy(() => import('./pages/DiscoveryHook'));
const Samples = lazy(() => import('./pages/Samples'));
const NotFound = lazy(() => import('./pages/NotFound'));
const DiscoveryFunnel = lazy(() => import('./pages/DiscoveryFunnel'));
const DetailedInput = lazy(() => import('./pages/DetailedInput'));
const IntentMirror = lazy(() => import('./pages/IntentMirror'));
const SparkLayer = lazy(() => import('./pages/SparkLayer'));
const PurchaseFlow = lazy(() => import('./pages/PurchaseFlow'));
const DeliverableGeneration = lazy(
  () => import('./pages/DeliverableGeneration')
);
const SparkSplit = lazy(() => import('./pages/SparkSplit'));
const FeedbackPage = lazy(() => import('./pages/Feedback'));
const TodoList = lazy(() => import('./components/TodoList'));
const SentryTest = lazy(() => import('./components/SentryTest'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => {
  useEffect(() => {
    // TODO: Integrate with Memberstack or your actual auth system for production
    // Example: setSentryContext({ id: user?.id }, tenantId)
    setSentryContext({ id: 'user123' }, 'tenant456'); // Replace with real user/tenant
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Suspense
            fallback={
              <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#36d1fe]"></div>
              </div>
            }
          >
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/discovery-hook" element={<DiscoveryHook />} />
              <Route path="/samples" element={<Samples />} />
              <Route path="/todos" element={<TodoList />} />
              <Route path="/discovery-funnel" element={<DiscoveryFunnel />} />
              <Route path="/spark-layer" element={<SparkLayer />} />
              <Route path="/purchase" element={<PurchaseFlow />} />
              <Route path="/purchase-flow" element={<PurchaseFlow />} />
              <Route path="/detailed-input" element={<DetailedInput />} />
              <Route path="/intent-mirror" element={<IntentMirror />} />
              <Route path="/deliverable" element={<DeliverableGeneration />} />
              <Route path="/spark-split" element={<SparkSplit />} />
              <Route path="/feedback" element={<FeedbackPage />} />
              <Route path="/prompts" element={<TodoList />} />

              {/* Legacy/placeholder routes */}
              <Route
                path="/checkout"
                element={<div>Redirecting to purchase...</div>}
              />
              <Route
                path="/generating"
                element={<div>Redirecting to deliverable...</div>}
              />
              <Route
                path="/business-builder"
                element={<div>Business Builder - Coming Soon</div>}
              />
              <Route
                path="/social-email"
                element={<div>Social Email - Coming Soon</div>}
              />
              <Route
                path="/site-audit"
                element={<div>Site Audit - Coming Soon</div>}
              />
              <Route path="/sentry-test" element={<SentryTest />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
