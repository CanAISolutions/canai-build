// backend/tests/vitest.setup.js
import { vi } from 'vitest';

vi.stubEnv('POSTHOG_API_KEY', 'test-key');
vi.stubEnv('POSTHOG_HOST', 'http://localhost');
vi.stubEnv('npm_package_version', '1.2.3');
vi.stubEnv('NODE_ENV', 'test');
vi.stubEnv('DEPLOYMENT_ID', 'test-deploy');
vi.stubEnv('POSTHOG_FLUSH_AT', '20');
vi.stubEnv('POSTHOG_FLUSH_INTERVAL', '10000');
vi.stubEnv('SESSION_TIMEOUT_MINUTES', '30');
