import {
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  credits: integer("credits").default(1000).notNull(),
  /** Stable Stripe Customer id (`cus_*`) attached at first checkout / portal setup. */
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
});

export const stripeWebhookEvents = pgTable("stripe_webhook_events", {
  id: serial("id").primaryKey(),
  /** Stripe event id (`evt_*`) — used for idempotent fulfillment. */
  eventId: varchar("event_id", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * One row per Stripe business object fulfilled (invoice or Checkout session).
 * Prevents duplicate credit grants across webhook retries and concurrent deliveries.
 */
export const stripeFulfillmentClaims = pgTable("stripe_fulfillment_claims", {
  fulfillmentKey: varchar("fulfillment_key", { length: 512 }).primaryKey(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
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
  targetDomain: text("target_domain").default("http://localhost:3000"),
  globalInstruction: text("global_instruction"),
});

export const TestCasesTable = pgTable("test_cases", {
  id: serial("id").primaryKey(),

  // User / project details
  userId: varchar("user_id", { length: 255 }).notNull(),
  repoId: varchar("repo_id", { length: 255 }),
  repoName: varchar("repo_name", { length: 255 }).notNull(),
  repoOwner: varchar("repo_owner", { length: 255 }).notNull(),
  branch: varchar("branch", { length: 100 }).default("main"),

  // Main test case data
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description").notNull(),
  type: varchar("type", { length: 100 }).notNull(),
  priority: varchar("priority", { length: 50 }).notNull(),

  // Routing + repo file context fed to Gemini for hosted-browser automation scripts
  targetRoute: varchar("target_route", { length: 500 }),
  targetFiles: jsonb("target_files").$type<string[]>().default([]),
  expectedResult: text("expected_result"),

  /** Playwright automation body persisted for `/api/test-cases/run` (column name retained for compatibility). */
  browserbaseScript: text("browserbase_script"),
  status: varchar("status", { length: 100 }).default("generated"),

  createdAt: timestamp("created_at").defaultNow(),

  /** Console / system lines from the last hosted browser run (JSON array). */
  logs: jsonb("logs").$type<string[]>().default([]),
  sessionId: varchar("session_id", { length: 255 }),
  sessionUrl: varchar("session_url", { length: 255 }),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Repository = typeof repositories.$inferSelect;
export type TestCase = typeof TestCasesTable.$inferSelect;
