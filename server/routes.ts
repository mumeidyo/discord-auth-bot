import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertBotSettingsSchema, insertAuthLogSchema } from "@shared/schema";
import { DiscordBot } from "./discord-bot";

// Sample data for development
const sampleRoles = [
  { id: "role1", name: "認証済みユーザー", colorClass: "bg-blue-500/20 text-blue-400", enabled: true },
  { id: "role2", name: "メンバー", colorClass: "bg-green-500/20 text-green-400", enabled: true },
  { id: "role3", name: "ゲスト", colorClass: "bg-purple-500/20 text-purple-400", enabled: false }
];

const sampleLogs = [
  {
    id: "1",
    user: { id: "user1", name: "Yamada", tag: "yamada#1234", initial: "Y" },
    action: "認証",
    status: "success" as const,
    timestamp: "2023/10/12 14:20"
  },
  {
    id: "2",
    user: { id: "user2", name: "Suzuki", tag: "suzuki#5678", initial: "S" },
    action: "認証",
    status: "success" as const,
    timestamp: "2023/10/12 13:45"
  },
  {
    id: "3",
    user: { id: "user3", name: "Tanaka", tag: "tanaka#9012", initial: "T" },
    action: "認証",
    status: "failure" as const,
    timestamp: "2023/10/12 12:30"
  }
];

let discordBot: DiscordBot | null = null;

// Initialize Discord bot if token is available
const initDiscordBot = () => {
  const token = process.env.DISCORD_BOT_TOKEN;
  const clientId = process.env.DISCORD_CLIENT_ID;
  
  if (token && clientId) {
    discordBot = new DiscordBot(token, clientId, storage);
    discordBot.start().catch(err => {
      console.error("Failed to start Discord bot:", err);
      discordBot = null;
    });
  } else {
    console.warn("Discord bot token or client ID not provided. Bot will not start.");
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize Discord bot
  initDiscordBot();
  
  // API Routes

  // Get Discord guilds
  app.get("/api/guilds", async (req, res) => {
    try {
      if (!discordBot) {
        return res.status(503).json({ error: "Discord bot is not connected" });
      }
      
      const client = discordBot.getClient();
      const guilds = client.guilds.cache.map(guild => ({
        id: guild.id,
        name: guild.name,
        initial: guild.name.charAt(0),
        icon: guild.iconURL() || undefined
      }));
      
      res.json(guilds);
    } catch (error) {
      console.error("Error fetching guilds:", error);
      res.status(500).json({ message: "Failed to fetch guilds" });
    }
  });
  
  // Get all roles
  app.get("/api/roles", async (req, res) => {
    try {
      // Get the guild ID from query parameter
      const { guildId } = req.query;
      
      if (guildId && discordBot) {
        const client = discordBot.getClient();
        const guild = client.guilds.cache.get(guildId as string);
        
        if (guild) {
          // Fetch roles from the Discord guild
          const roles = guild.roles.cache
            .filter(role => !role.managed && role.name !== '@everyone')
            .map(role => ({
              id: role.id,
              name: role.name,
              colorClass: role.hexColor === '#000000' 
                ? 'bg-gray-500/20 text-gray-300' 
                : `bg-[${role.hexColor}]/20 text-[${role.hexColor}]`,
              enabled: false // Default to false, would be updated from database
            }));
          
          return res.json(roles);
        }
      }
      
      // If no guildId or guild not found, return sample data
      res.json(sampleRoles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch roles" });
    }
  });
  
  // Update role status
  app.put("/api/roles/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { enabled } = req.body;
      
      // In a real implementation, this would update the role in the database
      // For now, just return success
      res.json({ id, enabled });
    } catch (error) {
      res.status(500).json({ message: "Failed to update role" });
    }
  });
  
  // Get authentication logs
  app.get("/api/logs", async (req, res) => {
    try {
      // In a real implementation, this would fetch logs from the database
      // For now, return sample data (limited to 3 entries for dashboard)
      res.json(sampleLogs.slice(0, 3));
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch logs" });
    }
  });
  
  // Get all authentication logs
  app.get("/api/logs/all", async (req, res) => {
    try {
      // In a real implementation, this would fetch all logs from the database
      // For now, return all sample data
      res.json(sampleLogs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch logs" });
    }
  });
  
  // Get bot settings for a guild
  app.get("/api/settings/:guildId", async (req, res) => {
    try {
      const { guildId } = req.params;
      
      if (!guildId) {
        return res.status(400).json({ message: "Guild ID is required" });
      }
      
      // Try to get existing settings
      let settings = await storage.getBotSettingsByGuildId(guildId);
      
      // If settings don't exist, create default settings
      if (!settings) {
        const defaultSettings = {
          guildId,
          successMessage: "認証が完了しました！サーバーの機能が利用可能になりました。",
          failureMessage: "認証に失敗しました。もう一度お試しいただくか、サーバー管理者にお問い合わせください。",
          autoAuth: false,
          dmNotify: true,
          logActions: true,
          timeout: 10,
          cooldown: 30,
          enabledRoles: []
        };
        
        settings = await storage.createBotSettings(defaultSettings);
      }
      
      res.json(settings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });
  
  // Save bot settings
  app.post("/api/settings", async (req, res) => {
    try {
      const settingsSchema = z.object({
        guildId: z.string(),
        roles: z.array(z.string()),
        messages: z.object({
          success: z.string(),
          failure: z.string()
        }),
        general: z.object({
          autoAuth: z.boolean().optional(),
          dmNotify: z.boolean().optional(),
          logActions: z.boolean().optional()
        }).optional(),
        advanced: z.object({
          timeout: z.number().optional(),
          cooldown: z.number().optional()
        }).optional()
      });
      
      const validatedData = settingsSchema.parse(req.body);
      const { guildId, roles, messages, general, advanced } = validatedData;
      
      // Check if settings already exist
      let settings = await storage.getBotSettingsByGuildId(guildId);
      
      if (settings) {
        // Update existing settings
        settings = await storage.updateBotSettings(guildId, {
          enabledRoles: roles,
          successMessage: messages.success,
          failureMessage: messages.failure,
          ...(general && {
            autoAuth: general.autoAuth,
            dmNotify: general.dmNotify,
            logActions: general.logActions
          }),
          ...(advanced && {
            timeout: advanced.timeout,
            cooldown: advanced.cooldown
          })
        });
      } else {
        // Create new settings
        settings = await storage.createBotSettings({
          guildId,
          successMessage: messages.success,
          failureMessage: messages.failure,
          autoAuth: general?.autoAuth || false,
          dmNotify: general?.dmNotify || true,
          logActions: general?.logActions || true,
          timeout: advanced?.timeout || 10,
          cooldown: advanced?.cooldown || 30,
          enabledRoles: roles
        });
      }
      
      res.json({ message: "Settings saved successfully", settings });
    } catch (error) {
      console.error("Error saving settings:", error);
      res.status(400).json({ message: "Invalid settings data" });
    }
  });
  
  // Create the HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}
