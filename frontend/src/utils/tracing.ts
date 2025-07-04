/**
 * Tracing utilities for correlation IDs and request tracking
 */

export const generateCorrelationId = (): string => {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 8);
  return `canai-${timestamp}-${randomPart}`;
};

export const withCorrelationId = (headers: HeadersInit = {}): HeadersInit => {
  return {
    ...headers,
    'X-Correlation-ID': generateCorrelationId(),
  };
};

export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxRetries) {
        console.error(`Max retries (${maxRetries}) exceeded:`, lastError);
        throw lastError;
      }

      const delay = Math.pow(2, attempt) * baseDelay;
      console.warn(
        `Attempt ${attempt + 1} failed, retrying in ${delay}ms:`,
        error
      );
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
};
