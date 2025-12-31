import { BaseTable } from "@backend/db/base_table";
import type { Db } from "@backend/db/db";
import { SupplementTable } from "@backend/modules/supplements/tables/supplements.table";
import { UserTable } from "@backend/modules/users/tables/users.table";

export class UserAdherenceLogTable extends BaseTable {
  readonly table = "user_adherence_logs";

  columns = this.setColumns((t) => ({
    id: t.uuid().primaryKey().default(t.sql`gen_random_uuid()`),
    userId: t.uuid().foreignKey("users", "id", {
      onDelete: "CASCADE",
      onUpdate: "RESTRICT"
    }),
    supplementId: t.uuid().foreignKey("supplements", "id", {
      onDelete: "CASCADE",
      onUpdate: "RESTRICT"
    }),
    reason: t.string().nullable(),
    status: t.userAdherenceStatusEnum(),
    scheduledFor: t.timestampNumber(),
    actualAt: t.timestampNumber(),
    timeZoneOffset: t.smallint(),
    ...t.timestamps(),
  }));

  relations = {
    user: this.belongsTo(() => UserTable, {
      columns: ["userId"],
      references: ["id"],
    }),
    supplement: this.belongsTo(() => SupplementTable, {
      columns: ["supplementId"],
      references: ["id"],
    })
  }

  init(_orm: Db) {
    this.afterUpdateCommit(["userId", "supplementId"], () => {
      // If all supplements for the day have been taken, update the daily compliance table
    })
  }
}