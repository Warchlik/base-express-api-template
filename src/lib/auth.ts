import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { env } from '../config/env.ts';
import { db } from '../db/index.ts';

const DAY_IN_SECONDS = 60 * 60 * 24;

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'pg' }),
  session: {
    expiresIn: 7 * DAY_IN_SECONDS,
    updateAge: DAY_IN_SECONDS,
  },
  // better-auth enables its built-in rate limit only when NODE_ENV === 'production'; ours is 'prod'.
  rateLimit: { enabled: env.NODE_ENV === 'prod' },
  emailAndPassword: { enabled: true },
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: env.CORS_ORIGIN,
});

export type AuthSession = typeof auth.$Infer.Session;
