// src/app/layout.tsx
import "./globals.css";
import Nav from "@/components/Nav";

export const metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME || "Gudang",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="bg-gray-50 text-gray-900">
        <Nav />
        {children}
      </body>
    </html>
  );
}
