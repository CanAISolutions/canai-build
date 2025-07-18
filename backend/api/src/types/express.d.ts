import { Request } from 'express';

declare module 'express' {
  interface Request {
    user?: {
      id: string;
      email: string;
      roles: string[];
      customFields: Record<string, any>;
    };
    session?: {
      id: string;
    };
    tenant?: {
      id: string;
    };
    memberstackUser?: {
      userId: string;
      email: string;
      roles: string[];
      customFields: Record<string, any>;
    };
    memberstackUserRaw?: any;
    // Add other custom properties as needed
  }
}
