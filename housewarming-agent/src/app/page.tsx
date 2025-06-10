import ChatInterface from "@/components/chat/ChatInterface";

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen items-center justify-center p-4 bg-gradient-to-br from-indigo-50 to-pink-50">
      <div className="flex flex-col flex-grow items-center justify-center text-center max-w-lg w-full">
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 mb-4">
          Paisehkias
        </h1>
        <p className="text-lg text-gray-700 mb-8 font-medium">
          Here to help you answer what Gwen and Steve needs, because they are
          too paiseh to ask 🤭
        </p>
        <ChatInterface />
      </div>
    </main>
  );
}
