import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { DashboardLayout } from "@/components/organisms";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { GlobalErrorBoundary } from "@/components/ErrorBoundary";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SmartStock Pro | Cloud Logistics & Predictive Analysis",
  description: "Plataforma de inteligencia logística para el sector mayorista. Optimización de stock, análisis predictivo y gestión SaaS de alto rendimiento.",
  keywords: ["inventario", "SaaS", "logística", "análisis predictivo", "Next.js", "Supabase"],
  authors: [{ name: "SmartStock Team" }],
  robots: "index, follow",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <GlobalErrorBoundary>
          <AuthProvider>
            <DashboardLayout>{children}</DashboardLayout>
          </AuthProvider>
          <Toaster richColors position="top-center" />
        </GlobalErrorBoundary>
      </body>
    </html>
  );
}
