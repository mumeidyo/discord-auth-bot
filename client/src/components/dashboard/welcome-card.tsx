import { Button } from "@/components/ui/button";

export default function WelcomeCard() {
  return (
    <div className="bg-discord-darker rounded-lg p-6 mb-6">
      <h2 className="text-xl font-bold mb-2">RoleAuth Bot へようこそ</h2>
      <p className="text-discord-lightgray mb-4">
        このボットを使用して、サーバーメンバーの認証と役割の付与を自動化します。
      </p>
      <div className="bg-discord-black/30 rounded-md p-4 mb-4">
        <h3 className="font-medium mb-2 text-discord-blue">クイックスタート</h3>
        <ol className="space-y-2 text-sm list-decimal list-inside text-discord-lightgray">
          <li>サーバーに RoleAuth Botを招待</li>
          <li>認証に使用するロールを設定</li>
          <li>ユーザーに <code className="bg-discord-black px-1 py-0.5 rounded text-discord-blue">/auth</code> コマンドの使用方法を案内</li>
        </ol>
      </div>
      <a href="#setup" className="inline-block bg-discord-blue hover:bg-discord-blue/90 text-white px-4 py-2 rounded-md font-medium transition-colors">
        セットアップを開始
      </a>
    </div>
  );
}
