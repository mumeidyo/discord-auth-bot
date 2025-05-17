import { users, type User, type InsertUser, type DiscordRole, type InsertDiscordRole, type AuthLog, type InsertAuthLog, type BotSettings, type InsertBotSettings } from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Discord Role operations
  getRole(id: string): Promise<DiscordRole | undefined>;
  getRolesByGuildId(guildId: string): Promise<DiscordRole[]>;
  getEnabledRolesByGuildId(guildId: string): Promise<DiscordRole[]>;
  createRole(role: InsertDiscordRole): Promise<DiscordRole>;
  updateRole(id: string, updates: Partial<DiscordRole>): Promise<DiscordRole | undefined>;
  
  // Auth Log operations
  getAuthLogs(guildId: string, limit?: number): Promise<AuthLog[]>;
  getAuthLogsByUserId(userId: string, guildId: string): Promise<AuthLog[]>;
  createAuthLog(log: InsertAuthLog): Promise<AuthLog>;
  
  // Bot Settings operations
  getBotSettings(id: number): Promise<BotSettings | undefined>;
  getBotSettingsByGuildId(guildId: string): Promise<BotSettings | undefined>;
  createBotSettings(settings: InsertBotSettings): Promise<BotSettings>;
  updateBotSettings(guildId: string, updates: Partial<BotSettings>): Promise<BotSettings | undefined>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private roles: Map<string, DiscordRole>;
  private logs: Map<number, AuthLog>;
  private settings: Map<string, BotSettings>;
  
  private userIdCounter: number;
  private logIdCounter: number;
  private settingsIdCounter: number;
  
  constructor() {
    this.users = new Map();
    this.roles = new Map();
    this.logs = new Map();
    this.settings = new Map();
    
    this.userIdCounter = 1;
    this.logIdCounter = 1;
    this.settingsIdCounter = 1;
    
    // Initialize with some sample data
    this.initSampleData();
  }
  
  private initSampleData() {
    // Sample roles for actual Discord servers
    const roles: DiscordRole[] = [
      { id: "1365697949346173068", name: "🐸スタッフ", color: "#57F287", guildId: "1361638822609420379", enabled: true },
      { id: "1366010130865487953", name: "test", color: "#5865F2", guildId: "1361638822609420379", enabled: true },
      { id: "1365698086332285008", name: "bot", color: "#ED4245", guildId: "1361638822609420379", enabled: true },
      { id: "1372938526504779918", name: "新しいロール", color: "#99AAB5", guildId: "1370800184073785364", enabled: true }
    ];
    
    roles.forEach(role => this.roles.set(role.id, role));
    
    // Sample settings
    const settings: BotSettings = {
      id: 1,
      guildId: "guild1",
      successMessage: "認証が完了しました！サーバーの機能が利用可能になりました。",
      failureMessage: "認証に失敗しました。もう一度お試しいただくか、サーバー管理者にお問い合わせください。",
      autoAuth: false,
      dmNotify: true,
      logActions: true,
      timeout: 10,
      cooldown: 30,
      enabledRoles: ["role1", "role2"]
    };
    
    this.settings.set(settings.guildId, settings);
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Discord Role operations
  async getRole(id: string): Promise<DiscordRole | undefined> {
    return this.roles.get(id);
  }
  
  async getRolesByGuildId(guildId: string): Promise<DiscordRole[]> {
    return Array.from(this.roles.values()).filter(
      (role) => role.guildId === guildId
    );
  }
  
  async getEnabledRolesByGuildId(guildId: string): Promise<DiscordRole[]> {
    return Array.from(this.roles.values()).filter(
      (role) => role.guildId === guildId && role.enabled
    );
  }
  
  async createRole(role: InsertDiscordRole): Promise<DiscordRole> {
    this.roles.set(role.id, role as DiscordRole);
    return role as DiscordRole;
  }
  
  async updateRole(id: string, updates: Partial<DiscordRole>): Promise<DiscordRole | undefined> {
    const role = this.roles.get(id);
    if (!role) return undefined;
    
    const updatedRole = { ...role, ...updates };
    this.roles.set(id, updatedRole);
    return updatedRole;
  }
  
  // Auth Log operations
  async getAuthLogs(guildId: string, limit?: number): Promise<AuthLog[]> {
    const logs = Array.from(this.logs.values())
      .filter(log => log.guildId === guildId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return limit ? logs.slice(0, limit) : logs;
  }
  
  async getAuthLogsByUserId(userId: string, guildId: string): Promise<AuthLog[]> {
    return Array.from(this.logs.values())
      .filter(log => log.userId === userId && log.guildId === guildId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
  
  async createAuthLog(insertLog: InsertAuthLog): Promise<AuthLog> {
    const id = this.logIdCounter++;
    const timestamp = new Date();
    const log: AuthLog = { ...insertLog, id, timestamp };
    this.logs.set(id, log);
    return log;
  }
  
  // Bot Settings operations
  async getBotSettings(id: number): Promise<BotSettings | undefined> {
    return Array.from(this.settings.values()).find(
      (settings) => settings.id === id
    );
  }
  
  async getBotSettingsByGuildId(guildId: string): Promise<BotSettings | undefined> {
    return this.settings.get(guildId);
  }
  
  async createBotSettings(insertSettings: InsertBotSettings): Promise<BotSettings> {
    const id = this.settingsIdCounter++;
    const settings: BotSettings = { ...insertSettings, id };
    this.settings.set(settings.guildId, settings);
    return settings;
  }
  
  async updateBotSettings(guildId: string, updates: Partial<BotSettings>): Promise<BotSettings | undefined> {
    const settings = this.settings.get(guildId);
    if (!settings) return undefined;
    
    const updatedSettings = { ...settings, ...updates };
    this.settings.set(guildId, updatedSettings);
    return updatedSettings;
  }
}

export const storage = new MemStorage();
