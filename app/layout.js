import './globals.css';
import Navbar from '../components/Navbar';
import { Fraunces, IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google';
const fraunces = Fraunces({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--font-display' });
const plexSans = IBM_Plex_Sans({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-body' });
const plexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['500', '600'], variable: '--font-mono' });
export const metadata = {
  title: 'Passmark — Study Abroad Test Prep',
  description: 'Free mock tests and notes for IELTS, TOEFL and beyond.',
};
export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${plexSans.variable} ${plexMono.variable}`}>
      <body><Navbar />{children}</body>
    </html>
  );
}