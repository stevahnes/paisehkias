import ChatInterface from "@/components/chat/ChatInterface";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          Housewarming Gift Assistant
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Ask me about available housewarming gifts and I'll help you choose the
          perfect one!
        </p>
        <ChatInterface />
      </div>
    </main>
  );
}
