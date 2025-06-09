import { ChatMessage } from "@/lib/types";

interface MessageListProps {
  messages: ChatMessage[];
}

export default function MessageList({ messages }: MessageListProps) {
  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${
            message.role === "user" ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`max-w-[80%] rounded-lg p-4 ${
              message.role === "user"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-900"
            }`}
          >
            <p className="whitespace-pre-wrap">{message.content}</p>
            <span className="text-xs opacity-70">
              {message.timestamp.toLocaleTimeString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
