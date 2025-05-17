import { createContext, useContext } from "react";

// Create a context to share the selected guild ID across components
export const GuildContext = createContext<string | null>(null);

// Hook to use the selected guild ID
export const useSelectedGuild = () => {
  return useContext(GuildContext);
};