import './globals.css';

export const metadata = {
  title: 'Passmark — Study Abroad Test Prep',
  description: 'Free mock tests and notes for IELTS, TOEFL and beyond.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
