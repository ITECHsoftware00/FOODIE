import type { Metadata } from "next";
import "./globals.css";
import "./glass.css";

export const metadata: Metadata = {
  title: "Foodie — Good food. Great mood.",
  description: "Find your next favourite meal. Discover colourful bowls, proper burgers and little moments of delicious in the Foodie ordering demo.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
