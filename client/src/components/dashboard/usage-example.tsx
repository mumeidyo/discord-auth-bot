export default function UsageExample() {
  return (
    <div className="bg-discord-darker rounded-lg overflow-hidden mb-6">
      <div className="px-6 py-4 bg-discord-black/20 border-b border-discord-darkgray/30">
        <h2 className="text-lg font-bold">使用方法例</h2>
      </div>
      <div className="p-6">
        <p className="text-discord-lightgray mb-4">
          以下は、Botがどのように機能するかの例です。ユーザーとBotのやり取りをシミュレートしています。
        </p>
        
        {/* Chat Simulation */}
        <div className="bg-discord-black/30 rounded-lg p-4 mb-5">
          <div className="flex mb-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-discord-darkgray flex items-center justify-center text-sm">U</div>
            <div className="ml-3">
              <div className="flex items-center">
                <span className="font-medium">ユーザー</span>
                <span className="text-discord-gray text-xs ml-2">今日 12:42</span>
              </div>
              <div className="mt-1 bg-discord-darker inline-block px-2 py-1 rounded-md text-sm">
                <code className="text-discord-blue">/auth</code>
              </div>
            </div>
          </div>
          
          <div className="flex">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-discord-blue flex items-center justify-center">
              <i className="ri-robot-fill text-white text-lg"></i>
            </div>
            <div className="ml-3">
              <div className="flex items-center">
                <span className="font-medium">RoleAuth Bot</span>
                <span className="text-discord-lightgray text-xs ml-2 bg-discord-blue/20 px-1.5 py-0.5 rounded text-discord-blue">BOT</span>
                <span className="text-discord-gray text-xs ml-2">今日 12:42</span>
              </div>
              <div className="mt-1">
                <div className="bg-discord-black/20 rounded-md p-3 border-l-4 border-discord-green max-w-xl">
                  <div className="font-medium mb-1">認証成功</div>
                  <p className="text-discord-lightgray text-sm">認証が完了しました！サーバーの機能が利用可能になりました。</p>
                  <div className="mt-2 text-sm">
                    <span className="font-medium">付与されたロール:</span>
                    <div className="mt-1 flex gap-2 flex-wrap">
                      <div className="role-badge bg-blue-500/20 text-blue-400">認証済みユーザー</div>
                      <div className="role-badge bg-green-500/20 text-green-400">メンバー</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-discord-black/30 p-4 rounded-lg">
          <h3 className="font-medium mb-2">利用可能なコマンド</h3>
          <ul className="space-y-3 command">
            <li className="flex">
              <code className="text-discord-blue min-w-[150px]">/auth</code>
              <span className="text-discord-lightgray">基本の認証プロセスを開始</span>
            </li>
            <li className="flex">
              <code className="text-discord-blue min-w-[150px]">/auth help</code>
              <span className="text-discord-lightgray">認証コマンドに関するヘルプを表示</span>
            </li>
            <li className="flex">
              <code className="text-discord-blue min-w-[150px]">/auth status</code>
              <span className="text-discord-lightgray">現在の認証状態を確認</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
