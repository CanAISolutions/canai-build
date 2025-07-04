// Import with `import * as Sentry from "@sentry/node"` if you are using ESM
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: 'https://bb62698f685b49ed1217b8e849aebdde@o4509561217089536.ingest.us.sentry.io/4509565382688768',

  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true,
});

export default Sentry;
