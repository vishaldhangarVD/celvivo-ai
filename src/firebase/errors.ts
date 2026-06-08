'use client';

export type SecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete' | 'write';
  requestResourceData?: any;
};

export class FirestorePermissionError extends Error {
  public context: SecurityRuleContext;

  constructor(context: SecurityRuleContext) {
    const message = `Firestore Error: Missing or insufficient permissions at ${context.path} during ${context.operation}.`;
    super(message);
    this.name = 'FirestorePermissionError';
    this.context = context;

    // This is used for the Next.js error overlay to show a cleaner error
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, FirestorePermissionError);
    }
  }
}
