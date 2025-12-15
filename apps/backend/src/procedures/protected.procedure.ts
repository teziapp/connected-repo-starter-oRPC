import { rpcAuthMiddleware } from "@backend/modules/auth/auth.middleware";
import { ActiveSessionSelectAll } from "@backend/modules/auth/tables/session.auth.table";
import { RpcContextWithHeaders, rpcPublicProcedure } from "@backend/procedures/public.procedure";
import { UserSelectAll } from "@connected-repo/zod-schemas/user.zod";

export interface RpcAuthenticatedContext extends RpcContextWithHeaders {
  session: ActiveSessionSelectAll;
  user: UserSelectAll;
}

// Protected procedure - requires authentication
export const rpcProtectedProcedure = rpcPublicProcedure
  .use(rpcAuthMiddleware);
