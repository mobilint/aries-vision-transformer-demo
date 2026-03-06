import type { Metadata } from "next";
import "./globals.css";

import CssBaseline from "@mui/material/CssBaseline";

export const metadata: Metadata = {
  title: "ARIES Vision Transformer Demo",
  description: "Mobilint, Inc. ARIES Vision Transformer Demo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <CssBaseline />
      <body style={{backgroundColor: "#000000"}}>
        {children}
      </body>
    </html>
  );
}
