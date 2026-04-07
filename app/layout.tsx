import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AlphaBot \u2014 Autonomous Trading Intelligence",
  description:
    "Watch an AI learn to trade cryptocurrency in real time. Live performance dashboard for a self-learning BTC/USDT trading bot powered by Claude AI.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Inter:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased min-h-screen">{children}</body>
    </html>
  );
}
