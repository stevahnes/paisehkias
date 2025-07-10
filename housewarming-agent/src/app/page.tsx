"use client";

import { GiftItem } from "@/lib/types";
import { useChat } from "@ai-sdk/react";

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();
  return (
    <div className="flex flex-col min-h-screen h-screen w-full max-w-2xl mx-auto bg-paiseh-bg">
      <div
        className="flex-1 overflow-y-auto px-2 sm:px-6 pt-8 pb-4"
        style={{ paddingBottom: "7.5rem" }}
      >
        {messages.map((message) => (
          <div key={message.id} className="mb-4 flex flex-col gap-1">
            <div
              className={
                message.role === "user"
                  ? "text-right text-paiseh-accent font-semibold"
                  : "text-left text-paiseh-dark font-semibold"
              }
            >
              {message.role === "user" ? "You" : "Emma"}
            </div>
            <div
              className={
                message.role === "user"
                  ? "bg-paiseh-light text-paiseh-dark inline-block rounded-2xl px-5 py-3 ml-auto max-w-[80%] shadow"
                  : "bg-paiseh-bubble text-paiseh-dark inline-block rounded-2xl px-5 py-3 mr-auto max-w-[80%] shadow"
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
      <div
        className="fixed bottom-0 left-0 w-full flex justify-center bg-gradient-to-t from-paiseh-bg/90 to-white/60 dark:from-paiseh-dark/90 dark:to-paiseh-dark/30 py-6 px-2 z-10 border-t border-paiseh-light"
        style={{ boxShadow: "0 -2px 24px 0 rgba(124,58,237,0.06)" }}
      >
        <form
          onSubmit={handleSubmit}
          className="flex w-full max-w-2xl bg-white dark:bg-paiseh-dark rounded-full shadow-lg border border-paiseh-light dark:border-paiseh-dark overflow-hidden"
        >
          <input
            className="flex-1 px-6 py-4 border-none bg-transparent focus:outline-none text-paiseh-dark dark:text-paiseh-light placeholder-paiseh-dark/40 dark:placeholder-paiseh-light/60 text-lg"
            value={input}
            placeholder="Type your message..."
            onChange={handleInputChange}
            autoFocus
          />
          <button
            type="submit"
            className="px-8 py-2 bg-gradient-to-r from-paiseh-dark to-paiseh-accent text-white font-semibold rounded-full shadow-none hover:from-paiseh-accent hover:to-paiseh-dark transition-colors text-lg"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
