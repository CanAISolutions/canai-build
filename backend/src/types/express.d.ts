import 'express';

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id: string;
      email: string;
    };
    memberstackUser?: {
      userId: string;
      email: string;
      roles: string[];
      customFields: Record<string, any>;
    };
    session?: {
      id: string;
    };
  }
}
