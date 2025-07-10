"use client";

import { GiftItem } from "@/lib/types";
import { useChat } from "@ai-sdk/react";

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();

  return (
    <div className="flex flex-col h-screen w-full max-w-2xl mx-auto relative">
      {/* Header */}
      <div className="flex-shrink-0 text-center pt-8 pb-6 px-4">
        <h1 className="text-4xl font-bold text-paiseh-purple mb-2">
          Paisehkias
        </h1>
        <p className="text-paiseh-text text-lg">
          Here to help you answer what Gwen and Steve needs, because they are
          too paiseh to ask 🤭
        </p>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-2 sm:px-6">
        {messages.length === 0 && (
          <div className="text-center text-paiseh-text/60 mt-12">
            <p className="text-lg">Start a conversation with Paisehkias! 🏠</p>
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id} className="mb-4 flex flex-col gap-1">
            <div
              className={
                message.role === "user"
                  ? "text-right text-paiseh-purple font-semibold"
                  : "text-left text-paiseh-text font-semibold"
              }
            >
              {message.role === "user" ? "You" : "Emma"}
            </div>
            <div
              className={
                message.role === "user"
                  ? "bg-paiseh-user-bubble text-paiseh-text inline-block rounded-2xl px-5 py-3 ml-auto max-w-[80%] shadow-sm"
                  : "bg-white text-paiseh-text inline-block rounded-2xl px-5 py-3 mr-auto max-w-[80%] shadow-sm border border-paiseh-border"
              }
            >
              {message.parts.map((part, i) => {
                switch (part.type) {
                  case "text":
                    return <div key={`${message.id}-${i}`}>{part.text}</div>;
                  case "tool-invocation": {
                    if (
                      !part.toolInvocation ||
                      part.toolInvocation.state !== "result"
                    )
                      return null;
                    const data = part.toolInvocation.result;
                    return (
                      <div key={`${message.id}-tool-response-${i}`}>
                        {data.message && <div>{data.message}</div>}
                        {data.gifts &&
                          Array.isArray(data.gifts) &&
                          data.gifts.length > 0 && (
                            <ul className="mt-2 ml-4">
                              {data.gifts.map((gift: GiftItem) => (
                                <li key={gift.id} className="list-none">
                                  • {gift.name} ({gift.quantityNeeded})
                                </li>
                              ))}
                            </ul>
                          )}
                      </div>
                    );
                  }
                }
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Input Container - positioned absolutely within the chat container */}
      <div className="flex bottom-0 left-0 right-0 bg-gradient-to-t from-paiseh-bg from-70% via-paiseh-bg/90 to-transparent pt-8 pb-6 px-4">
        <form
          onSubmit={handleSubmit}
          className="flex w-full bg-white rounded-full shadow-lg border border-paiseh-border overflow-hidden"
        >
          <input
            className="flex-1 px-6 py-4 border-none bg-transparent focus:outline-none text-paiseh-text placeholder-paiseh-text/50 text-base"
            value={input}
            placeholder="Type your message..."
            onChange={handleInputChange}
            autoFocus
          />
          <button
            type="submit"
            className="px-6 py-4 bg-paiseh-purple text-white font-medium rounded-full hover:bg-paiseh-purple-dark transition-colors text-base"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
