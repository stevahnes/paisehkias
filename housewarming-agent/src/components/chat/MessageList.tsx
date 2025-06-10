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
            className={`max-w-[80%] rounded-xl p-4 shadow-md ${
              message.role === "user"
                ? "bg-purple-400 text-white"
                : "bg-purple-100 text-gray-800"
            }`}
          >
            <p className="whitespace-pre-wrap text-left">{message.content}</p>
            <span className="text-xs opacity-70">
              {message.timestamp.toLocaleTimeString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
