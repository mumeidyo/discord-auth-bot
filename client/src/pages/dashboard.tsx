import StatusBar from "@/components/layout/status-bar";
import WelcomeCard from "@/components/dashboard/welcome-card";
import AuthSetup from "@/components/dashboard/auth-setup";
import UsageExample from "@/components/dashboard/usage-example";
import LogCard from "@/components/dashboard/log-card";
import { GuildContext } from "@/lib/GuildContext";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Guild } from "@/lib/types";

export default function DashboardPage() {
  const [selectedGuildId, setSelectedGuildId] = useState<string | null>(null);
  
  // Fetch guilds from the API
  const { data: guilds = [] } = useQuery<Guild[]>({
    queryKey: ["/api/guilds"],
  });
  
  // Set the first guild as selected by default when data loads
  useEffect(() => {
    if (guilds.length > 0 && !selectedGuildId) {
      setSelectedGuildId(guilds[0].id);
    }
  }, [guilds, selectedGuildId]);
  
  // Subscribe to guild selection changes from sidebar
  useEffect(() => {
    const handleGuildChange = (event: CustomEvent) => {
      setSelectedGuildId(event.detail.guildId);
    };
    
    window.addEventListener('guildSelected' as any, handleGuildChange);
    
    return () => {
      window.removeEventListener('guildSelected' as any, handleGuildChange);
    };
  }, []);
  
  return (
    <GuildContext.Provider value={selectedGuildId}>
      <StatusBar />
      <WelcomeCard />
      <AuthSetup />
      <UsageExample />
      <LogCard />
    </GuildContext.Provider>
  );
}
