import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  credits: integer("credits").default(1000).notNull(),
});

export const repositories = pgTable("repositories", {
  id: serial("id").primaryKey(),
  repoId: integer("repo_id").notNull().unique(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  name: text("name").notNull(),
  fullName: text("full_name").notNull(),
  private: boolean("private").notNull(),
  htmlUrl: text("html_url").notNull(),
  defaultBranch: text("default_branch").notNull(),
  owner: text("owner").notNull(),
  description: text("description").notNull(),
  language: text("language").notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Repository = typeof repositories.$inferSelect;
