import { openApiPublicProcedure } from "@backend/procedures/open_api_public.procedure";
import * as z from "zod";
import { teamRouter } from "./team.router";

// Health check endpoint for OpenAPI (public - no auth required)
const healthCheck = openApiPublicProcedure
	.route({ method: "GET", path: "/health" })
	.output(
		z.object({
			status: z.string(),
			timestamp: z.string(),
		})
	)
	.handler(async () => {
		return {
			status: "ok",
			timestamp: new Date().toISOString(),
		};
	});

export const openApiRouter = {
	health: healthCheck,
	v1: {
		team: teamRouter,
	},
};
