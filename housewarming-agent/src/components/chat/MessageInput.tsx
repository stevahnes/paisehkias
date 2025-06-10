import { useState } from "react";

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export default function MessageInput({
  onSendMessage,
  isLoading,
}: MessageInputProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex gap-2 rounded-lg p-2 bg-white/50 backdrop-blur-sm shadow-xl"
    >
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
        className="flex-1 p-3 border border-purple-300 rounded-full focus:outline-none focus:ring-4 focus:ring-purple-300 transition duration-300 ease-in-out bg-white/80 text-gray-800 placeholder-gray-400"
        disabled={isLoading}
      />
      <button
        type="submit"
        disabled={isLoading || !message.trim()}
        className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full shadow-lg hover:from-purple-600 hover:to-blue-600 focus:outline-none focus:ring-4 focus:ring-purple-300 disabled:opacity-50 disabled:cursor-not-allowed transition duration-300 ease-in-out transform hover:scale-105"
      >
        {isLoading ? "Sending..." : "Send"}
      </button>
    </form>
  );
}
