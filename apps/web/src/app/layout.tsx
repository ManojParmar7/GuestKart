import type { Metadata } from 'next';
import { Providers } from '@/components/providers';
import { Header, Footer } from '@/components/chrome';
import './globals.css';
export const metadata: Metadata = {
  title: { default: 'GuestKart — Good finds. Zero sign-ups.', template: '%s | GuestKart' },
  description:
    'Thoughtful everyday essentials. Browse, add to your bag and check out as a guest. No account needed.',
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
