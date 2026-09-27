import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const userProgress = sqliteTable("user_progress", {
  userId: text("user_id").primaryKey(),
  progressJson: text("progress_json").notNull().default("{}"),
  updatedAt: integer("updated_at").notNull().default(0),
});
