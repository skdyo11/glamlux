import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { FirebaseClientProvider } from '@/firebase';
import { StoreProvider } from '@/app/lib/store';
import { GlamAssistant } from '@/components/GlamAssistant';

export const metadata: Metadata = {
  title: 'GlamLux | The Editorial Registry',
  description: 'Elite beauty curators and professional artistry registry.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&family=Poppins:wght@400;600;700;800&display=swap" rel="stylesheet" />
        <meta name="theme-color" content="#D70F64" />
      </head>
      <body className="font-body antialiased selection:bg-secondary/30 pb-20 md:pb-0">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <FirebaseClientProvider>
            <StoreProvider>
              <div className="wavy-bg" />
              {children}
              <GlamAssistant />
              <Toaster />
            </StoreProvider>
          </FirebaseClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
