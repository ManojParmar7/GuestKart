'use client';
import Link from 'next/link';
import { ShoppingBag, PackageCheck, ShieldCheck, Truck, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useCart } from './providers';
export function Header() {
  const { lines } = useCart();
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="announcement">
        Good finds. Zero sign-ups. <span>Free delivery on orders ₹2,499+</span>
      </div>
      <header className="site-header">
        <div className="container header-inner">
          <Link href="/" className="brand" aria-label="GuestKart home">
            <span className="brand-icon">
              <ShoppingBag size={21} />
            </span>
            guestkart<span className="brand-dot">.</span>
          </Link>
          <nav className={open ? 'main-nav open' : 'main-nav'} aria-label="Main navigation">
            <Link href="/#collection" onClick={() => setOpen(false)}>
              Shop all
            </Link>
            <Link href="/track" onClick={() => setOpen(false)}>
              Track your order
            </Link>
            <Link href="/about" onClick={() => setOpen(false)}>
              Our story
            </Link>
          </nav>
          <div className="header-actions">
            <Link className="admin-link" href="/admin">
              Store admin
            </Link>
            <Link
              className="bag-button"
              href="/cart"
              aria-label={`Shopping bag, ${lines.reduce((n, line) => n + line.quantity, 0)} items`}
            >
              <ShoppingBag size={19} />
              <span>Bag</span>
              <b>{lines.reduce((n, line) => n + line.quantity, 0)}</b>
            </Link>
            <button
              className="mobile-menu icon-button"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              onClick={() => setOpen(!open)}
            >
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
export function TrustBar() {
  return (
    <div className="trust-bar container">
      <div>
        <Truck />
        <span>
          <b>Little joys, delivered</b>
          <small>Free shipping over ₹2,499</small>
        </span>
      </div>
      <div>
        <ShieldCheck />
        <span>
          <b>Your details stay safe</b>
          <small>Secure guest checkout</small>
        </span>
      </div>
      <div>
        <PackageCheck />
        <span>
          <b>No account needed</b>
          <small>Shop first. Skip the sign-up.</small>
        </span>
      </div>
    </div>
  );
}
export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-main">
        <div>
          <Link href="/" className="brand">
            guestkart<span className="brand-dot">.</span>
          </Link>
          <p>
            Thoughtful finds for your everyday.
            <br />A simpler way to shop.
          </p>
        </div>
        <div>
          <b>Make yourself at home</b>
          <Link href="/#collection">Explore the collection</Link>
          <Link href="/track">Track an order</Link>
          <Link href="/about">About GuestKart</Link>
        </div>
        <div>
          <b>Good to know</b>
          <Link href="/policies">Delivery & returns</Link>
          <Link href="/policies#privacy">Privacy & terms</Link>
          <Link href="/admin">Admin workspace</Link>
        </div>
        <div className="footer-note">
          <ShoppingBag size={30} />
          <p>
            No passwords to remember.
            <br />
            Just things you&apos;ll love.
          </p>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} GuestKart</span>
        <span>Made for the everyday.</span>
      </div>
    </footer>
  );
}
