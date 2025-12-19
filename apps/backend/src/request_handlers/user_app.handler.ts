import { env, isProd, isStaging } from '@backend/configs/env.config';
import { router } from '@backend/routers/user_app/user_app.router';
import { orpcErrorParser } from '@backend/utils/errorParser';
import { logger } from '@backend/utils/logger.utils';
import { LoggingHandlerPlugin } from '@orpc/experimental-pino';
import { ORPCError, onError } from '@orpc/server';
import { RPCHandler } from '@orpc/server/node';
import { CORSPlugin, RequestHeadersPlugin, SimpleCsrfProtectionHandlerPlugin, StrictGetMethodPlugin } from '@orpc/server/plugins';

export const allowedOrigins = [...(env.ALLOWED_ORIGINS?.split(",") || [])];

export const userAppHandler = new RPCHandler(router, {
  plugins: [
    // Request headers plugin for accessing headers in context
    new RequestHeadersPlugin(),
    // CORS configuration with credentials support
    new CORSPlugin({
      origin: [...allowedOrigins],
      allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      credentials: true,
    }),
    // FIXME: Using rate-limit throws an error. Try later at the end.
    // Rate limiting at handler level
    // new RatelimitHandlerPlugin(),
    // Structured logging with Pino
    new LoggingHandlerPlugin({
      logger,
      logRequestResponse: !isProd, // Only log in dev/staging
      logRequestAbort: true,
    }),
    // CSRF protection (disabled in development for easier testing)
    ...(isProd || isStaging ? [new SimpleCsrfProtectionHandlerPlugin()] : []),
    // Strict GET method plugin (queries must use GET)
    new StrictGetMethodPlugin(),
  ],
  interceptors: [
    // Server-side error logging
    onError((error) => {
      logger.error(error, 'Server error');
    }),
  ],
  clientInterceptors: [
    // Client-side error transformation
    onError((error) => {
      const parsed = orpcErrorParser(error as Error);
      throw new ORPCError(parsed.code, {
        status: parsed.httpStatus,
        message: parsed.userFriendlyMessage,
        data: parsed.details,
        cause: error,
      });
    }),
  ],
})