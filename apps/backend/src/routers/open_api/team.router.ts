import { openApiAuthProcedure } from "@backend/procedures/open_api_auth.procedure";
import { teamSelectAllZod } from "@connected-repo/zod-schemas/team.zod";

export const getTeamInfo = openApiAuthProcedure
	.route({ method: "GET", path: "/info" })
	.output(teamSelectAllZod)
	.handler(async ({ context }) => {
		return context.team;
	});

export const teamRouter = {
	info: getTeamInfo,
};