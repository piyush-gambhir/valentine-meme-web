import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono, Instrument_Serif, Caveat } from 'next/font/google';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });
const instrumentSerif = Instrument_Serif({ weight: '400', subsets: ['latin'], variable: '--font-display', display: 'swap' });
const caveat = Caveat({ subsets: ['latin'], variable: '--font-handwritten', display: 'swap' });

export const metadata: Metadata = {
  title: 'Will you be my Valentine?',
  description: 'I have a very important question to ask you...',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    url: '/',
    title: 'Will you be my Valentine?',
    description: 'Someone has a very important question for you...',
  },
};

export const viewport: Viewport = {
  themeColor: '#FF9A9E',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} ${caveat.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
