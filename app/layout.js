import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import AuthProvider from "@/components/AuthProvider";
import ErrorBoundary from "@/components/ErrorBoundary";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import QueryProvider from "@/components/QueryProvider";
import SessionTimeout from "@/components/SessionTimeout";
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
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" }
    ]
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0d9488",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#3b82f6" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-gray-50`}
      >
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function(registrations) {
                  for(let registration of registrations) {
                    registration.unregister();
                  }
                });
              }
            `,
          }}
        />
        <ErrorBoundary>
          <AuthProvider>
            <QueryProvider>
              <LanguageProvider>
                <ToastProviderWrapper>
                  <Navigation />
                  <main className="flex-1">
                    {children}
                  </main>
                  <Footer />
                  <SessionTimeout />
                </ToastProviderWrapper>
              </LanguageProvider>
            </QueryProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
