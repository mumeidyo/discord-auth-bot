import { useState, useEffect } from "react";

export default function StatusBar() {
  const [lastUpdate, setLastUpdate] = useState<string>("");
  
  useEffect(() => {
    // Format current date and time for display
    const now = new Date();
    const formattedDate = now.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "numeric",
      day: "numeric"
    });
    const formattedTime = now.toLocaleTimeString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit"
    });
    
    setLastUpdate(`${formattedDate} ${formattedTime}`);
  }, []);

  return (
    <div className="bg-discord-darker rounded-lg p-4 mb-6 flex items-center justify-between">
      <div className="flex items-center">
        <div className="w-3 h-3 bg-discord-green rounded-full"></div>
        <span className="ml-2 text-sm font-medium">Bot オンライン</span>
      </div>
      <div>
        <span className="text-sm text-discord-lightgray">
          最終更新: <span>{lastUpdate}</span>
        </span>
      </div>
    </div>
  );
}
