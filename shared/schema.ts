import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Discord roles table
export const discordRoles = pgTable("discord_roles", {
  id: text("id").primaryKey(), // Discord role ID
  name: text("name").notNull(),
  color: text("color").notNull(),
  guildId: text("guild_id").notNull(),
  enabled: boolean("enabled").default(false),
});

export const insertDiscordRoleSchema = createInsertSchema(discordRoles);

export type InsertDiscordRole = z.infer<typeof insertDiscordRoleSchema>;
export type DiscordRole = typeof discordRoles.$inferSelect;

// Authentication logs table
export const authLogs = pgTable("auth_logs", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // Discord user ID
  userName: text("user_name").notNull(),
  userTag: text("user_tag").notNull(),
  action: text("action").notNull(),
  status: text("status").notNull(), // "success" or "failure"
  details: text("details"),
  guildId: text("guild_id").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertAuthLogSchema = createInsertSchema(authLogs).omit({
  id: true,
  timestamp: true,
});

export type InsertAuthLog = z.infer<typeof insertAuthLogSchema>;
export type AuthLog = typeof authLogs.$inferSelect;

// Bot settings table
export const botSettings = pgTable("bot_settings", {
  id: serial("id").primaryKey(),
  guildId: text("guild_id").notNull().unique(),
  successMessage: text("success_message").notNull().default("認証が完了しました！サーバーの機能が利用可能になりました。"),
  failureMessage: text("failure_message").notNull().default("認証に失敗しました。もう一度お試しいただくか、サーバー管理者にお問い合わせください。"),
  autoAuth: boolean("auto_auth").default(false),
  dmNotify: boolean("dm_notify").default(true),
  logActions: boolean("log_actions").default(true),
  timeout: integer("timeout").default(10), // minutes
  cooldown: integer("cooldown").default(30), // seconds
  enabledRoles: json("enabled_roles").$type<string[]>().default([]),
});

export const insertBotSettingsSchema = createInsertSchema(botSettings).omit({
  id: true,
});

export type InsertBotSettings = z.infer<typeof insertBotSettingsSchema>;
export type BotSettings = typeof botSettings.$inferSelect;
