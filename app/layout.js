import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import AuthProvider from "@/components/AuthProvider";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import QueryProvider from "@/components/QueryProvider";
import { ToastProviderWrapper } from "@/components/ui/use-toast";
import { LanguageProvider } from "@/lib/i18n/language-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Nayabato - Civic Issue Reporting",
  description: "Report and track civic issues in your community",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-gray-50`}
      >
        <AuthProvider>
          <QueryProvider>
            <LanguageProvider>
              <ToastProviderWrapper>
                <Navigation />
                <main className="flex-1">
                  {children}
                </main>
                <Footer />
              </ToastProviderWrapper>
            </LanguageProvider>
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
