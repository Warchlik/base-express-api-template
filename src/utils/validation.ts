import type { ZodError } from 'zod';

export interface ValidationDetail {
  path: string;
  message: string;
}

/** Flattens zod issues to `{ path: "body.email", message }`; `source` is an optional path prefix. */
export function formatIssues(issues: ZodError['issues'], source?: string): ValidationDetail[] {
  return issues.map((issue) => ({
    path: (source ? [source, ...issue.path] : issue.path).join('.'),
    message: issue.message,
  }));
}
