import ChatInterface from "@/components/chat/ChatInterface";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-pink-50">
      <main className="flex flex-col h-screen">
        <div className="flex-shrink-0 text-center py-6">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 mb-4">
            Paisehkias
          </h1>
          <p className="text-lg text-gray-700 font-medium">
            Here to help you answer what Gwen and Steve needs, because they are
            too paiseh to ask 🤭
          </p>
        </div>
        <div className="flex-1 px-4 pb-4 min-h-0">
          <ChatInterface />
        </div>
      </main>
    </div>
  );
}
