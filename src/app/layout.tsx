import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MyDramaList Stremio Addon",
  description: "Add MyDramaList lists as Stremio catalogs",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
