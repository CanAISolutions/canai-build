import 'express';

declare module 'express-serve-static-core' {
  interface Request {
    user?: { id?: string };
    session?: { id?: string };
    tenant?: { id?: string };
  }
}
