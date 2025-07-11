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
      className="h-full bg-linear-to-br from-purple-50 via-blue-50 to-cyan-50"
    >
      <body className="h-full min-h-screen w-full bg-purple-50">
        {children}
      </body>
    </html>
  );
}
