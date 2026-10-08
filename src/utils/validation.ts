import type { ZodError } from 'zod';

export interface ValidationDetail {
  path: string;
  message: string;
}

export function formatIssues(issues: ZodError['issues'], source?: string): ValidationDetail[] {
  return issues.map((issue) => ({
    path: (source ? [source, ...issue.path] : issue.path).join('.'),
    message: issue.message,
  }));
}
