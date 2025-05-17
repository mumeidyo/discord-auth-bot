// Discord role type
export interface Role {
  id: string;
  name: string;
  colorClass: string;
  enabled: boolean;
}

// Auth log entry type
export interface AuthLog {
  id: string;
  user: {
    id: string;
    name: string;
    tag: string;
    initial: string;
  };
  action: string;
  status: "success" | "failure";
  timestamp: string;
  details?: string;
}

// Bot settings type
export interface BotSettings {
  roles: string[];
  messages: {
    success: string;
    failure: string;
  };
  general: {
    autoAuth: boolean;
    dmNotify: boolean;
    logActions: boolean;
  };
  advanced: {
    timeout: number;
    cooldown: number;
  };
}

// Discord guild (server) type
export interface Guild {
  id: string;
  name: string;
  icon?: string;
  initial: string;
}
