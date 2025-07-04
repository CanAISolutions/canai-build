import * as Sentry from '@sentry/react';

function SentryTest() {
  const handleClick = () => {
    Sentry.addBreadcrumb({
      category: 'ui.click',
      message: 'Test Button Click',
      level: 'info',
    });
    throw new Error('Frontend test error');
  };

  return <button onClick={handleClick}>Trigger Error</button>;
}

export default SentryTest;
