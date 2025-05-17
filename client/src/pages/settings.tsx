import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { toast } = useToast();
  
  const saveSettings = () => {
    toast({
      title: "設定を保存しました",
      description: "ボットの設定が更新されました。",
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Bot 設定</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>一般設定</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auto-auth">自動認証</Label>
              <p className="text-sm text-discord-lightgray">新しいユーザーがサーバーに参加したときに自動的に認証プロセスを開始する</p>
            </div>
            <Switch id="auto-auth" />
          </div>
          
          <Separator className="my-4" />
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="dm-notify">DMでの通知</Label>
              <p className="text-sm text-discord-lightgray">認証完了時にユーザーにDMで通知する</p>
            </div>
            <Switch id="dm-notify" defaultChecked />
          </div>
          
          <Separator className="my-4" />
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="log-actions">アクションのログ記録</Label>
              <p className="text-sm text-discord-lightgray">すべての認証アクションをログに記録する</p>
            </div>
            <Switch id="log-actions" defaultChecked />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>高度な設定</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="timeout">認証タイムアウト（分）</Label>
              <p className="text-sm text-discord-lightgray">認証プロセスがタイムアウトするまでの時間</p>
            </div>
            <input 
              id="timeout"
              type="number" 
              min="1" 
              max="60" 
              defaultValue="10"
              className="w-20 bg-discord-black/30 border border-discord-darkgray/50 rounded-md p-2 text-white" 
            />
          </div>
          
          <Separator className="my-4" />
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="cooldown">クールダウン（秒）</Label>
              <p className="text-sm text-discord-lightgray">同じユーザーが再度認証を試みるまでの待機時間</p>
            </div>
            <input 
              id="cooldown"
              type="number" 
              min="0" 
              max="300" 
              defaultValue="30"
              className="w-20 bg-discord-black/30 border border-discord-darkgray/50 rounded-md p-2 text-white" 
            />
          </div>
        </CardContent>
      </Card>
      
      <div className="flex items-center space-x-3">
        <Button 
          className="bg-discord-blue hover:bg-discord-blue/90 text-white"
          onClick={saveSettings}
        >
          設定を保存
        </Button>
        <Button variant="outline" className="bg-discord-darkgray hover:bg-discord-darkgray/90 text-white">
          リセット
        </Button>
      </div>
    </div>
  );
}
