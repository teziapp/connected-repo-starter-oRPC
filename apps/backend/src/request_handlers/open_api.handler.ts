import { env, isProd } from "@backend/configs/env.config";
import { openApiRouter } from "@backend/routers/open_api/open_api.router";
import { logger } from "@backend/utils/logger.utils";
import { LoggingHandlerPlugin } from "@orpc/experimental-pino";
import { OpenAPIHandler } from "@orpc/openapi/node";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { onError, ORPCError } from "@orpc/server";
import { CORSPlugin, RequestHeadersPlugin } from "@orpc/server/plugins";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { flattenError, prettifyError } from "zod";

export const allowedOrigins = [...(env.ALLOWED_ORIGINS?.split(",") || [])];

export const openApiHandler = new OpenAPIHandler(openApiRouter, {
	plugins: [
		new CORSPlugin({
			origin: '*', // or env.API_ALLOWED_ORIGINS if you want restrictions
			allowMethods: ['GET', 'POST', 'OPTIONS'],
			credentials: false, // No cookies/credentials needed for API key auth
		}),
		new LoggingHandlerPlugin({
      logger,
      logRequestResponse: !isProd, // Only log in dev/staging
      logRequestAbort: true,
    }),
		new OpenAPIReferencePlugin({
			docsProvider: "scalar",
			docsPath: "/",
			specPath: "/spec.json",
			schemaConverters: [new ZodToJsonSchemaConverter()],
			specGenerateOptions: {
				info: {
					title: "API Documentation",
					version: "1.0.0",
					description: "OpenAPI documentation for the application",
				},
				servers: [{ url: "/api" }],
				components: {
					securitySchemes: {
						"x-team-id": {
							type: "apiKey",
							in: "header",
							name: "x-team-id",
							description: "Team ID for authentication",
						},
						"x-api-key": {
							type: "apiKey",
							in: "header",
							name: "x-api-key",
							description: "API Key for authentication",
						},
					},
				},
				security: [
					{
						"x-team-id": [],
						"x-api-key": [],
					},
				],
			},
		}),
		new RequestHeadersPlugin(),
	],
	interceptors: [
		// Server-side error logging
		onError((error) => {
			logger.error(error, "OpenAPI error");
		}),
	],
  clientInterceptors: [
    // Client-side error transformation
    onError((error) => {
      // Handle Zod validation errors for input
      if (
        error instanceof ORPCError
        && error.code === 'BAD_REQUEST'
        // @ts-ignore typescript throwing errors during build. No idea why.
        && error.cause instanceof ValidationError
      ) {
        // @ts-ignore
        const zodError = new ZodError(error.cause.issues as $ZodIssue[])

        throw new ORPCError('INPUT_VALIDATION_FAILED', {
          status: 422,
          message: prettifyError(zodError),
          data: flattenError(zodError),
        // @ts-ignore
          cause: error.cause,
        })
      }

      // Handle Zod validation errors for output
      if (
        error instanceof ORPCError
        && error.code === 'INTERNAL_SERVER_ERROR'
        // @ts-ignore
        && error.cause instanceof ValidationError
      ) {
        throw new ORPCError('OUTPUT_VALIDATION_FAILED', {
        // @ts-ignore
          cause: error.cause,
        })
      }
    }),
  ],
});
