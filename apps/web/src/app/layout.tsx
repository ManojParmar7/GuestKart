import type { Metadata } from 'next';
import { Providers } from '@/components/providers';
import { Header, Footer } from '@/components/chrome';
import './globals.css';
export const metadata: Metadata = {
  title: {
    default: 'GuestKart | Shop as a guest. Leave as a regular.',
    template: '%s | GuestKart',
  },
  description:
    'A fresh way to shop without an account. Explore a considered collection, check out as a guest and follow your parcel from one private link.',
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <a className="skip-link" href="#main">
            Skip to content
          </a>
          <Header />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
