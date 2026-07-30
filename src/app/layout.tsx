import type { Metadata } from "next";
import "./globals.css";
import { RoleNav } from "@/components/shared/role-nav";
import { HydrationGate } from "@/components/shared/hydration-gate";

export const metadata: Metadata = {
  title: "FOOD OS — FIFA 2026",
  description:
    "Sistema de pedidos para estadios modulares FIFA 2026. Pide desde tu asiento, sin filas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className="bg-stadium min-h-screen antialiased">
        <HydrationGate>
          <RoleNav />
          {children}
        </HydrationGate>
      </body>
    </html>
  );
}
