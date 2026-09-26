import type { Metadata, Viewport } from 'next';
import { Inter, Outfit } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import './globals.css';
import { Providers } from './providers'; // We'll create this to wrap Redux and Query client

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: '#020617' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: {
    template: '%s | Aura Video AI',
    default: 'Aura Video AI - Next-Gen Video Creation',
  },
  description: 'AI-powered text-to-video platform with stunning glassmorphism design.',
  openGraph: {
    title: 'Aura Video AI',
    description: 'AI-powered text-to-video platform with stunning glassmorphism design.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <Providers>
            {children}
            <Toaster position="top-right" theme="dark" richColors />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
