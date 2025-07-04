import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

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
    <html lang="en" className={`${inter.className} h-screen`}>
      <body className="h-screen overflow-hidden">{children}</body>
    </html>
  );
}
