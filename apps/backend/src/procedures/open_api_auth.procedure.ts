import { apiKeyAuthMiddleware } from "@backend/middlewares/api-key-auth.middleware";
import { ipWhitelistMiddleware } from "@backend/middlewares/ip_whitelist.middleware";
import { OpenApiContext, OpenApiContextWithHeaders, openApiPublicProcedure } from "@backend/procedures/open_api_public.procedure";
import { TeamSelectAll } from "@connected-repo/zod-schemas/team.zod";

export interface OpenApiAuthContext extends OpenApiContextWithHeaders {
	"x-team-id": string;
	"x-api-key": string;
	team: TeamSelectAll;
}
// API authenticated procedure - requires API key authentication
export const openApiAuthProcedure = openApiPublicProcedure
  .use(apiKeyAuthMiddleware)
	.use(ipWhitelistMiddleware);

export type ApiAuthContext = OpenApiContext;
