import { journalEntriesRouter } from '@backend/modules/journal-entries/journal-entries.router'
import { promptsRouter } from '@backend/modules/prompts/prompts.router'
import { rpcPublicProcedure } from '@backend/procedures/public.procedure'
import { usersRouter } from '@backend/routers/user_app/users.user_app.router'
import type { InferRouterInputs, InferRouterOutputs, RouterClient } from '@orpc/server'

// Phase 1: Basic health check and testing endpoints
// Modules will be added in later phases

// Health check endpoint
const healthCheck = rpcPublicProcedure
	.route({ method: 'GET' })
	.handler(async () => {
		return {
			status: 'ok',
			timestamp: new Date().toISOString(),
			phase: 1,
			message: 'Phase 1: Core Infrastructure - oRPC server is running',
		}
	})
	
export const router = {
	// Phase 1 test endpoints
	health: healthCheck,
	// Phase 3: Core modules
	users: usersRouter,
	journalEntries: journalEntriesRouter,
	prompts: promptsRouter,
	// Phase 5: teams, subscriptions will be added here
};

export type UserAppRouter = RouterClient<typeof router>;
export type UserAppRouterInputs = InferRouterInputs<typeof router>
export type UserAppRouterOutputs = InferRouterOutputs<typeof router>;
