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
    <html lang="en" className={`h-screen`}>
      <body className="h-screen overflow-hidden">{children}</body>
    </html>
  );
}
