import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function HelpPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">ヘルプ</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>RoleAuth Bot について</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-discord-lightgray mb-4">
            RoleAuth Bot は、Discord サーバーでのユーザー認証を自動化するボットです。
            このボットを使用すると、サーバーにすでに設定されているロールをユーザーに自動的に付与することができます。
          </p>
          <p className="text-discord-lightgray">
            認証には <code className="bg-discord-black px-1 py-0.5 rounded text-discord-blue">/auth</code> コマンドを使用します。
            認証が成功すると、設定されたロールがユーザーに付与されます。
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>よくある質問</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-white">ボットをサーバーに追加するにはどうすればいいですか？</AccordionTrigger>
              <AccordionContent className="text-discord-lightgray">
                ボットの追加は、ダッシュボードの「Bot を招待」ボタンをクリックし、表示される認証画面で追加したいサーバーを選択するだけです。サーバーの「管理者」権限が必要です。
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-white">どのようなロールを付与できますか？</AccordionTrigger>
              <AccordionContent className="text-discord-lightgray">
                サーバーに既存のすべてのロールを付与することができます。ただし、ボットよりも上位のロールは付与できませんので、ボットのロールを上位に配置してください。
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-white">認証に失敗する場合はどうすればいいですか？</AccordionTrigger>
              <AccordionContent className="text-discord-lightgray">
                認証に失敗する原因はいくつか考えられます。ボットに適切な権限があるか、ボットが正しく設定されているか、サーバーの設定に問題がないかを確認してください。詳細は、ログページで失敗の理由を確認できます。
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-4">
              <AccordionTrigger className="text-white">ボットのコマンドは何がありますか？</AccordionTrigger>
              <AccordionContent className="text-discord-lightgray">
                <ul className="space-y-2 list-disc pl-5">
                  <li><code className="bg-discord-black px-1 py-0.5 rounded text-discord-blue">/auth</code> - 基本の認証プロセスを開始</li>
                  <li><code className="bg-discord-black px-1 py-0.5 rounded text-discord-blue">/auth help</code> - ヘルプを表示</li>
                  <li><code className="bg-discord-black px-1 py-0.5 rounded text-discord-blue">/auth status</code> - 現在の認証状態を確認</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>お問い合わせ</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-discord-lightgray mb-4">
            さらに質問がある場合や、サポートが必要な場合は、以下の方法でお問い合わせください。
          </p>
          <div className="space-y-2">
            <div className="flex items-center">
              <i className="ri-discord-fill text-discord-blue text-xl mr-2"></i>
              <span>サポートサーバー: <a href="#" className="text-discord-blue hover:underline">RoleAuth Support</a></span>
            </div>
            <div className="flex items-center">
              <i className="ri-mail-line text-discord-blue text-xl mr-2"></i>
              <span>メール: support@roleauth-bot.example.com</span>
            </div>
            <div className="flex items-center">
              <i className="ri-global-line text-discord-blue text-xl mr-2"></i>
              <span>ウェブサイト: <a href="#" className="text-discord-blue hover:underline">roleauth-bot.example.com</a></span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
