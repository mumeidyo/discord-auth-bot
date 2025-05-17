import { eq } from 'drizzle-orm';
import { db } from './db';
import { users, discordRoles, authLogs, botSettings } from '@shared/schema';
import { type User, type InsertUser, type DiscordRole, type InsertDiscordRole, type AuthLog, type InsertAuthLog, type BotSettings, type InsertBotSettings } from '@shared/schema';
import { IStorage } from './storage';

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Discord Role operations
  async getRole(id: string): Promise<DiscordRole | undefined> {
    const [role] = await db.select().from(discordRoles).where(eq(discordRoles.id, id));
    return role || undefined;
  }

  async getRolesByGuildId(guildId: string): Promise<DiscordRole[]> {
    return db.select().from(discordRoles).where(eq(discordRoles.guildId, guildId));
  }

  async getEnabledRolesByGuildId(guildId: string): Promise<DiscordRole[]> {
    return db.select().from(discordRoles).where(eq(discordRoles.guildId, guildId)).where(eq(discordRoles.enabled, true));
  }

  async createRole(role: InsertDiscordRole): Promise<DiscordRole> {
    const [createdRole] = await db
      .insert(discordRoles)
      .values(role)
      .returning();
    return createdRole;
  }

  async updateRole(id: string, updates: Partial<DiscordRole>): Promise<DiscordRole | undefined> {
    const [updatedRole] = await db
      .update(discordRoles)
      .set(updates)
      .where(eq(discordRoles.id, id))
      .returning();
    return updatedRole || undefined;
  }

  // Auth Log operations
  async getAuthLogs(guildId: string, limit?: number): Promise<AuthLog[]> {
    const query = db.select().from(authLogs).where(eq(authLogs.guildId, guildId))
      .orderBy(authLogs.timestamp);
    
    if (limit) {
      query.limit(limit);
    }
    
    return query;
  }

  async getAuthLogsByUserId(userId: string, guildId: string): Promise<AuthLog[]> {
    return db.select().from(authLogs)
      .where(eq(authLogs.userId, userId))
      .where(eq(authLogs.guildId, guildId))
      .orderBy(authLogs.timestamp);
  }

  async createAuthLog(log: InsertAuthLog): Promise<AuthLog> {
    const [createdLog] = await db
      .insert(authLogs)
      .values({
        ...log,
        timestamp: new Date()
      })
      .returning();
    return createdLog;
  }

  // Bot Settings operations
  async getBotSettings(id: number): Promise<BotSettings | undefined> {
    const [settings] = await db.select().from(botSettings).where(eq(botSettings.id, id));
    return settings || undefined;
  }

  async getBotSettingsByGuildId(guildId: string): Promise<BotSettings | undefined> {
    const [settings] = await db.select().from(botSettings).where(eq(botSettings.guildId, guildId));
    return settings || undefined;
  }

  async createBotSettings(insertSettings: InsertBotSettings): Promise<BotSettings> {
    const [settings] = await db
      .insert(botSettings)
      .values(insertSettings)
      .returning();
    return settings;
  }

  async updateBotSettings(guildId: string, updates: Partial<BotSettings>): Promise<BotSettings | undefined> {
    const [settings] = await db
      .update(botSettings)
      .set(updates)
      .where(eq(botSettings.guildId, guildId))
      .returning();
    return settings || undefined;
  }
}