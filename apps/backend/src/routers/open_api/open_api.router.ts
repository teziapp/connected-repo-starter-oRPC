import { openApiAuthProcedure } from "@backend/procedures/open_api_auth.procedure";
import { openApiPublicProcedure } from "@backend/procedures/open_api_public.procedure";
import { teamSelectAllZod } from "@connected-repo/zod-schemas/team.zod";
import * as z from "zod";

// Health check endpoint for OpenAPI (public - no auth required)
export const healthCheck = openApiPublicProcedure
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

// Example authenticated endpoint using API key
export const getTeamInfo = openApiAuthProcedure
	.route({ method: "GET", path: "/team/info" })
	.output(
		teamSelectAllZod
	)
	.handler(async ({ context: { team } }) => {
		return team;
	});

export const openApiRouter = {
	health: healthCheck,
	teamInfo: getTeamInfo,
};
