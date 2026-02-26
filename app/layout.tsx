import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "HypeShelf – Collect and share the stuff you're hyped about",
  description:
    "A shared recommendations hub where friends share their favorite movies, shows, and more.",
  openGraph: {
    title: "HypeShelf",
    description: "Collect and share the stuff you're hyped about.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/*
         * Anti-flash script: runs synchronously before React hydrates.
         * Reads localStorage (or OS preference) and sets the `dark` class
         * on <html> immediately, preventing a flash of the wrong theme.
         */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var s=localStorage.getItem('theme');var m=window.matchMedia('(prefers-color-scheme: dark)').matches;if(s==='dark'||(s===null&&m)){document.documentElement.classList.add('dark')}})()`,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
