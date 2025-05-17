import { useQuery } from "@tanstack/react-query";
import { AuthLog } from "@/lib/types";
import { Link } from "wouter";

export default function LogCard() {
  const { data: logs = [], isLoading } = useQuery<AuthLog[]>({
    queryKey: ["/api/logs"],
  });

  return (
    <div className="bg-discord-darker rounded-lg overflow-hidden">
      <div className="px-6 py-4 bg-discord-black/20 border-b border-discord-darkgray/30 flex justify-between items-center">
        <h2 className="text-lg font-bold">最近の認証ログ</h2>
        <Link href="/logs" className="text-discord-blue hover:underline text-sm">
          すべてのログを表示
        </Link>
      </div>
      <div className="p-4">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-discord-darkgray/30">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-discord-lightgray uppercase tracking-wider">ユーザー</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-discord-lightgray uppercase tracking-wider">アクション</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-discord-lightgray uppercase tracking-wider">ステータス</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-discord-lightgray uppercase tracking-wider">日時</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-discord-darkgray/30">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-discord-lightgray">ログをロードしています...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-discord-lightgray">認証ログはありません</td>
                </tr>
              ) : (
                logs.map((log) => (
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
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
