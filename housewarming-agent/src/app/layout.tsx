import "./globals.css";

export const metadata = {
  title: "Paisehkias",
  description:
    "Here to help you answer what Gwen and Steve needs, because they are too paiseh to ask 🤭",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className="h-full bg-gradient-to-br from-[#f8f6ff] via-[#f3f7fa] to-[#e6f0ff]"
    >
      <body className="h-full min-h-screen w-full overflow-hidden flex flex-col">
        {children}
      </body>
    </html>
  );
}
