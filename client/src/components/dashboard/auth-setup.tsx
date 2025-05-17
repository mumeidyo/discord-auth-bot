import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Role } from "@/lib/types";

// Import the context hook
import { useSelectedGuild } from "@/lib/GuildContext";

export default function AuthSetup() {
  const { toast } = useToast();
  const [successMessage, setSuccessMessage] = useState("認証が完了しました！サーバーの機能が利用可能になりました。");
  const [failureMessage, setFailureMessage] = useState("認証に失敗しました。もう一度お試しいただくか、サーバー管理者にお問い合わせください。");
  const [localRoles, setLocalRoles] = useState<Role[]>([]);
  
  // Get the selected guild ID
  const selectedGuildId = useSelectedGuild();
  
  // Fetch guild settings
  const { data: guildSettings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ["/api/settings", selectedGuildId],
    enabled: !!selectedGuildId,
    queryFn: async () => {
      if (!selectedGuildId) return null;
      const response = await fetch(`/api/settings/${selectedGuildId}`);
      if (!response.ok) throw new Error('Failed to fetch settings');
      return response.json();
    }
  });
  
  // Update message settings when guild settings change
  useEffect(() => {
    if (guildSettings) {
      setSuccessMessage(guildSettings.successMessage || successMessage);
      setFailureMessage(guildSettings.failureMessage || failureMessage);
    }
  }, [guildSettings]);
  
  // Fetch roles data
  const { data: roles = [], isLoading: isLoadingRoles } = useQuery<Role[]>({
    queryKey: ["/api/roles", selectedGuildId],
    enabled: !!selectedGuildId,
    queryFn: async () => {
      if (!selectedGuildId) return [];
      const response = await fetch(`/api/roles?guildId=${selectedGuildId}`);
      if (!response.ok) throw new Error('Failed to fetch roles');
      return response.json();
    }
  });
  
  // Process and combine roles with enabled status from settings
  useEffect(() => {
    if (roles && roles.length > 0) {
      // If we have settings, mark roles as enabled based on settings
      if (guildSettings && guildSettings.enabledRoles) {
        const enabledRoleIds = guildSettings.enabledRoles;
        
        // Map through roles and mark them as enabled if in the enabledRoles array
        const updatedRoles = roles.map(role => ({
          ...role,
          enabled: enabledRoleIds.includes(role.id)
        }));
        
        setLocalRoles(updatedRoles);
      } else {
        // If no settings, just use roles as is
        setLocalRoles(roles);
      }
    }
  }, [roles.length, guildSettings]);

  // Save settings mutation
  const { mutate: saveSettings, isPending } = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/settings", data);
    },
    onSuccess: () => {
      toast({
        title: "設定を保存しました",
        description: "ボットの設定が更新されました。",
      });
      // Invalidate roles query to refetch with updated data
      queryClient.invalidateQueries({ queryKey: ["/api/roles", selectedGuildId] });
    },
    onError: (error) => {
      toast({
        title: "エラー",
        description: `設定の保存に失敗しました: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleSaveSettings = () => {
    if (!selectedGuildId) {
      toast({
        title: "エラー",
        description: "サーバーが選択されていません。",
        variant: "destructive",
      });
      return;
    }
    
    const enabledRoles = localRoles
      .filter(role => role.enabled)
      .map(role => role.id);
    
    // Get current general and advanced settings from the existing settings
    const generalSettings = guildSettings ? {
      autoAuth: guildSettings.autoAuth !== undefined ? guildSettings.autoAuth : false,
      dmNotify: guildSettings.dmNotify !== undefined ? guildSettings.dmNotify : true,
      logActions: guildSettings.logActions !== undefined ? guildSettings.logActions : true
    } : undefined;
    
    const advancedSettings = guildSettings ? {
      timeout: guildSettings.timeout || 10,
      cooldown: guildSettings.cooldown || 30
    } : undefined;
    
    saveSettings({
      guildId: selectedGuildId,
      roles: enabledRoles,
      messages: {
        success: successMessage,
        failure: failureMessage
      },
      general: generalSettings,
      advanced: advancedSettings
    });
  };

  const toggleRoleStatus = (roleId: string, status: boolean) => {
    setLocalRoles(prevRoles => 
      prevRoles.map(role => 
        role.id === roleId ? { ...role, enabled: status } : role
      )
    );
  };

  const handleAddRole = () => {
    toast({
      title: "情報",
      description: "ロールはDiscordサーバーから自動的に読み込まれます。新しいロールを追加するには、Discordサーバーでロールを作成してください。",
    });
  };

  return (
    <div id="setup" className="bg-discord-darker rounded-lg overflow-hidden mb-6">
      <div className="px-6 py-4 bg-discord-black/20 border-b border-discord-darkgray/30">
        <h2 className="text-lg font-bold">認証設定</h2>
      </div>
      <div className="p-6">
        <div className="mb-6">
          <h3 className="font-medium mb-3">認証ロールの設定</h3>
          <p className="text-discord-lightgray text-sm mb-4">
            認証後にユーザーに付与するロールを選択します。ユーザーが認証に成功すると、これらのロールが自動的に付与されます。
          </p>
          
          {!selectedGuildId ? (
            <div className="bg-discord-black/20 p-4 rounded-md text-center text-discord-lightgray mb-4">
              サイドバーからサーバーを選択してください
            </div>
          ) : (
            <>
              {/* Role Selection */}
              <div className="space-y-3 mb-4">
                {isLoadingRoles || isLoadingSettings ? (
                  <div className="py-4 text-center text-discord-lightgray">ロードしています...</div>
                ) : localRoles.length === 0 ? (
                  <div className="py-4 text-center text-discord-lightgray">ロールが見つかりません</div>
                ) : (
                  localRoles.map((role) => (
                    <div key={role.id} className="flex items-center justify-between bg-discord-black/20 p-3 rounded-md">
                      <div className="flex items-center">
                        <div className={`role-badge ${role.colorClass}`}>
                          <span>{role.name}</span>
                        </div>
                      </div>
                      <Switch 
                        checked={role.enabled} 
                        onCheckedChange={(checked) => toggleRoleStatus(role.id, checked)}
                      />
                    </div>
                  ))
                )}
              </div>
              
              <Button 
                variant="link" 
                onClick={handleAddRole} 
                className="text-discord-blue p-0 h-auto"
              >
                <i className="ri-add-line mr-1"></i> 別のロールを追加
              </Button>
            </>
          )}
        </div>
        
        <div className="mb-6">
          <h3 className="font-medium mb-3">認証メッセージ</h3>
          <p className="text-discord-lightgray text-sm mb-4">
            認証が成功したときにユーザーに表示されるメッセージをカスタマイズします。
          </p>
          
          <div className="mb-4">
            <Label className="block text-discord-lightgray text-sm mb-2">成功メッセージ</Label>
            <Textarea
              className="w-full bg-discord-black/30 border border-discord-darkgray/50 rounded-md p-3 text-white placeholder-discord-gray focus:outline-none focus:ring-2 focus:ring-discord-blue/50"
              rows={2}
              placeholder="認証メッセージを入力..."
              value={successMessage}
              onChange={(e) => setSuccessMessage(e.target.value)}
            />
          </div>
          
          <div>
            <Label className="block text-discord-lightgray text-sm mb-2">失敗メッセージ</Label>
            <Textarea
              className="w-full bg-discord-black/30 border border-discord-darkgray/50 rounded-md p-3 text-white placeholder-discord-gray focus:outline-none focus:ring-2 focus:ring-discord-blue/50"
              rows={2}
              placeholder="失敗メッセージを入力..."
              value={failureMessage}
              onChange={(e) => setFailureMessage(e.target.value)}
            />
          </div>
        </div>
        
        <div>
          <h3 className="font-medium mb-3">認証コマンド設定</h3>
          <p className="text-discord-lightgray text-sm mb-4">
            ユーザーが認証を行うために使用するコマンドです。
          </p>
          
          <div className="bg-discord-black/30 rounded-md p-4 mb-4 command">
            <code className="text-discord-blue">/auth</code> - 基本の認証コマンド
          </div>
          
          <div className="flex items-center mt-6">
            <Button 
              className="bg-discord-blue hover:bg-discord-blue/90 text-white mr-3"
              onClick={handleSaveSettings}
              disabled={isPending}
            >
              {isPending ? "保存中..." : "設定を保存"}
            </Button>
            <Button variant="outline" className="bg-discord-darkgray hover:bg-discord-darkgray/90 text-white">
              キャンセル
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
