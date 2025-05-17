import { useLocation, Link } from "wouter";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Guild } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";

export default function Sidebar() {
  const [location] = useLocation();
  const [selectedGuildId, setSelectedGuildId] = useState<string | null>(null);
  
  // Fetch guilds from the API
  const { data: guilds = [], isLoading } = useQuery<Guild[]>({
    queryKey: ["/api/guilds"],
  });
  
  // Set the first guild as selected by default when data loads
  useEffect(() => {
    if (guilds.length > 0 && !selectedGuildId) {
      setSelectedGuildId(guilds[0].id);
    }
  }, [guilds, selectedGuildId]);
  
  const navItems = [
    { path: "/", icon: "ri-dashboard-line", label: "ダッシュボード" },
    { path: "/settings", icon: "ri-settings-line", label: "設定" },
    { path: "/logs", icon: "ri-history-line", label: "ログ" },
    { path: "/help", icon: "ri-question-line", label: "ヘルプ" }
  ];

  return (
    <nav className="lg:w-64 bg-discord-darker rounded-lg p-4 h-auto lg:h-screen lg:sticky top-0">
      <div className="flex items-center mb-8">
        <div className="w-10 h-10 rounded-full bg-discord-blue flex items-center justify-center">
          <i className="ri-robot-fill text-white text-xl"></i>
        </div>
        <div className="ml-3">
          <h1 className="font-bold text-lg">RoleAuth Bot</h1>
          <div className="flex items-center">
            <span className="w-2 h-2 bg-discord-green rounded-full"></span>
            <span className="text-xs text-discord-lightgray ml-1">オンライン</span>
          </div>
        </div>
      </div>

      <div className="space-y-1 mb-6">
        {navItems.map((item) => (
          <Link 
            key={item.path} 
            href={item.path}
            className={cn(
              "block py-2 px-3 rounded transition-colors",
              location === item.path 
                ? "bg-discord-blue/10 text-discord-blue" 
                : "hover:bg-discord-blue/5"
            )}
          >
            <i className={`${item.icon} mr-2`}></i>
            {item.label}
          </Link>
        ))}
      </div>

      <div className="pt-4 border-t border-discord-darkgray/30">
        <h3 className="text-discord-lightgray text-xs font-semibold uppercase tracking-wider mb-2">サーバー</h3>
        {isLoading ? (
          <div className="py-3 text-center text-sm text-discord-lightgray">
            読み込み中...
          </div>
        ) : guilds.length === 0 ? (
          <div className="py-3 text-center text-sm text-discord-lightgray">
            サーバーがありません
          </div>
        ) : (
          <div className="space-y-1">
            {guilds.map((server) => (
              <div 
                key={server.id}
                onClick={() => {
                  setSelectedGuildId(server.id);
                  // 選択されたサーバーIDをカスタムイベントとして発行
                  window.dispatchEvent(new CustomEvent('guildSelected', {
                    detail: { guildId: server.id }
                  }));
                }}
                className={cn(
                  "flex items-center py-2 px-3 rounded cursor-pointer",
                  selectedGuildId === server.id
                    ? "bg-discord-blue/10 text-discord-blue" 
                    : "hover:bg-discord-blue/5 transition-colors"
                )}
              >
                {server.icon ? (
                  <img 
                    src={server.icon} 
                    alt={server.name} 
                    className="w-6 h-6 rounded-full flex-shrink-0"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gray-600 flex-shrink-0 flex items-center justify-center text-xs">
                    {server.initial}
                  </div>
                )}
                <span className="ml-2 truncate">{server.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
