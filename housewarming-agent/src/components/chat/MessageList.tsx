import { ChatMessage } from "@/lib/types";

interface MessageListProps {
  messages: ChatMessage[];
}

export default function MessageList({ messages }: MessageListProps) {
  return (
    <div className="space-y-4">
      {messages.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          Start a conversation with Gwen and Steve! 🏠
        </div>
      )}
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${
            message.role === "user" ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`max-w-[80%] rounded-xl p-4 shadow-md ${(() => {
              switch (message.role) {
                case "user":
                  return "bg-purple-400 text-white";
                case "assistant":
                  return "bg-purple-100 text-gray-800";
                case "loading":
                  return "bg-purple-100 text-gray-800";
                default:
                  return "";
              }
            })()}`}
          >
            {message.role === "loading" ? (
              <div className="flex space-x-1">
                <span
                  className="animate-bounce"
                  style={{ animationDelay: "0s" }}
                >
                  .
                </span>
                <span
                  className="animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                >
                  .
                </span>
                <span
                  className="animate-bounce"
                  style={{ animationDelay: "0.4s" }}
                >
                  .
                </span>
              </div>
            ) : (
              <p className="whitespace-pre-wrap text-left break-words">
                {message.content}
              </p>
            )}
            <span className="text-xs opacity-70">
              {message.timestamp.toLocaleTimeString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
