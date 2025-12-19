import { envSchemaZod } from "@frontend/utils/env_validator.zod.utils";

export const env = envSchemaZod.parse(import.meta.env);
