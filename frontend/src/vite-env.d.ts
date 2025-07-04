/// <reference types="vite/client" />

// Add posthog to the global Window type so TypeScript recognizes it
interface Window {
  posthog?: {
    capture: (event: string, properties?: Record<string, unknown>) => void;
    identify: (userId: string, properties?: Record<string, unknown>) => void;
    init: (apiKey: string, config?: Record<string, unknown>) => void;
    reset: () => void;
  };
}
