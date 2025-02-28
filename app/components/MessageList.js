import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useRef } from "react";

export default function MessageList({ messages }) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="flex-grow p-4 overflow-y-auto">
      {messages.map((msg, index) => (
        <div key={msg.id || `${index}-${msg.user_message || msg.bot_message || msg.image_url}`}>
          {msg.user_message && (
            <Card className="mb-2 p-3 max-w-2xl w-fit ml-auto bg-blue-600 text-white">
              <CardContent>
                <div className="whitespace-pre-wrap">{msg.user_message}</div>
                {msg.created_at && (
                  <p className="text-xs text-gray-300 mt-1">
                    {new Date(msg.created_at).toLocaleString()}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {msg.image_url && (
            <Card className="mb-2 p-3 max-w-2xl w-fit ml-auto bg-blue-600 text-white">
              <CardContent>
                <img src={`/images/${msg.image_url}`} alt="Uploaded" className="max-w-full h-64" />
                {msg.image_url}
                {msg.created_at && (
                  <p className="text-xs text-gray-300 mt-1">
                    {new Date(msg.created_at).toLocaleString()}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {msg.bot_message && (
            <Card className="mb-2 p-3 max-w-2xl w-fit mr-auto bg-gray-800 text-white">
              <CardContent>
                <div className="whitespace-pre-wrap">{msg.bot_message}</div>
                {msg.created_at && (
                  <p className="text-xs text-gray-300 mt-1">
                    {new Date(msg.created_at).toLocaleString()}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
