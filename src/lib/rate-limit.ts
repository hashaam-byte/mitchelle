// lib/rate-limit.ts
import { NextRequest, NextResponse } from 'next/server';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

// Clean up old entries every hour
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach((key) => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}, 60 * 60 * 1000);

export function rateLimit(options: {
  interval: number; // in milliseconds
  uniqueTokenPerInterval?: number;
}) {
  return {
    check: async (req: NextRequest, limit: number, token: string) => {
      const now = Date.now();
      const tokenKey = `${token}`;

      if (!store[tokenKey]) {
        store[tokenKey] = {
          count: 0,
          resetTime: now + options.interval,
        };
      }

      const tokenData = store[tokenKey];

      // Reset if interval has passed
      if (now > tokenData.resetTime) {
        tokenData.count = 0;
        tokenData.resetTime = now + options.interval;
      }

      tokenData.count++;

      if (tokenData.count > limit) {
        return {
          success: false,
          remaining: 0,
          reset: new Date(tokenData.resetTime),
        };
      }

      return {
        success: true,
        remaining: limit - tokenData.count,
        reset: new Date(tokenData.resetTime),
      };
    },
  };
}

// Helper to get client IP
export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  return 'unknown';
}

// Create rate limiters for different endpoints
export const loginRateLimiter = rateLimit({
  interval: 15 * 60 * 1000, // 15 minutes
});

export const apiRateLimiter = rateLimit({
  interval: 60 * 1000, // 1 minute
});

export const strictRateLimiter = rateLimit({
  interval: 60 * 60 * 1000, // 1 hour
});