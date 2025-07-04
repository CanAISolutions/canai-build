import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ErrorBoundary from '@/components/ErrorBoundary';
import Index from './pages/Index';
import DiscoveryHook from './pages/DiscoveryHook';
import Samples from './pages/Samples';
import NotFound from './pages/NotFound';
import DiscoveryFunnel from './pages/DiscoveryFunnel';
import DetailedInput from './pages/DetailedInput';
import IntentMirror from './pages/IntentMirror';
import SparkLayer from './pages/SparkLayer';
import PurchaseFlow from './pages/PurchaseFlow';
import DeliverableGeneration from './pages/DeliverableGeneration';
import SparkSplit from './pages/SparkSplit';
import FeedbackPage from './pages/Feedback';
import TodoList from './components/TodoList';
import { setSentryContext } from './utils/sentry';
import { useEffect } from 'react';
import SentryTest from './components/SentryTest';

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
          <BrowserRouter>
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
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
