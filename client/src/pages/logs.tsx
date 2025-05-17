import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { AuthLog } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function LogsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: logs = [], isLoading } = useQuery<AuthLog[]>({
    queryKey: ["/api/logs/all"],
  });
  
  const filteredLogs = logs.filter(log => 
    log.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.user.tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">認証ログ</h1>
        
        <div className="flex space-x-2">
          <Input
            placeholder="ユーザー名で検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64 bg-discord-black/30 border border-discord-darkgray/50 text-white"
          />
          <Button 
            variant="outline" 
            className="bg-discord-darkgray hover:bg-discord-darkgray/90 text-white"
            onClick={() => setSearchQuery("")}
          >
            クリア
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>すべてのログ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-discord-darkgray/30">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-discord-lightgray uppercase tracking-wider">ユーザー</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-discord-lightgray uppercase tracking-wider">アクション</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-discord-lightgray uppercase tracking-wider">ステータス</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-discord-lightgray uppercase tracking-wider">日時</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-discord-lightgray uppercase tracking-wider">詳細</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-discord-darkgray/30">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-discord-lightgray">ログをロードしています...</td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-discord-lightgray">
                      {searchQuery ? "検索条件に一致するログはありません" : "認証ログはありません"}
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-discord-darkgray flex items-center justify-center text-xs">
                            {log.user.initial}
                          </div>
                          <div className="ml-2">
                            <div className="text-sm font-medium">{log.user.name}</div>
                            <div className="text-xs text-discord-lightgray">{log.user.tag}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">{log.action}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          log.status === "success" 
                            ? "bg-discord-green/10 text-discord-green" 
                            : "bg-discord-red/10 text-discord-red"
                        }`}>
                          {log.status === "success" ? "成功" : "失敗"}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-discord-lightgray">{log.timestamp}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Button variant="ghost" size="sm" className="text-discord-blue h-8">
                          詳細を表示
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
