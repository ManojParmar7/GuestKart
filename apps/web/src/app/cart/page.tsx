'use client';
import Link from 'next/link';
import { Button } from '@mui/material';
import { Minus, Plus, Trash2, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useCart } from '@/components/providers';
import { money } from '@/lib/types';
export default function CartPage() {
  const { lines, quantity, hydrated } = useCart();
  const subtotal = lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
  const shipping = subtotal >= 249900 ? 0 : 9900;
  return (
    <main id="main" className="container page-space">
      <div className="eyebrow">NO SIGN-IN NEEDED AT THE NEXT STEP</div>
      <h1 className="page-title">
        Your bag. Your call<span>.</span>
      </h1>
      {!hydrated ? (
        <p>Opening your bag…</p>
      ) : !lines.length ? (
        <div className="empty-state">
          <ShoppingBag size={48} />
          <h2>Nothing in here just yet.</h2>
          <p>The good part: no login to come back to, either.</p>
          <Button component={Link} href="/#collection" variant="contained">
            Explore the collection
          </Button>
        </div>
      ) : (
        <div className="checkout-grid">
          <section>
            <div className="cart-heading">
              {lines.reduce((sum, line) => sum + line.quantity, 0)}{' '}
              {lines.reduce((sum, line) => sum + line.quantity, 0) === 1 ? 'piece' : 'pieces'} ready
              for the next step
            </div>
            {lines.map(({ product, quantity: count }) => (
              <article className="cart-line" key={product.id}>
                <img src={product.image} alt={product.name} />
                <div className="cart-line-content">
                  <h3>{product.name}</h3>
                  <p>{money(product.price)} each</p>
                  <div className="quantity-control">
                    <button
                      aria-label={`Reduce ${product.name} quantity`}
                      onClick={() => quantity(product.id, count - 1)}
                    >
                      <Minus size={15} />
                    </button>
                    <span aria-live="polite">{count}</span>
                    <button
                      aria-label={`Increase ${product.name} quantity`}
                      disabled={count >= Math.min(20, product.stock)}
                      onClick={() => quantity(product.id, count + 1)}
                    >
                      <Plus size={15} />
                    </button>
                  </div>
                </div>
                <div className="cart-line-end">
                  <b>{money(product.price * count)}</b>
                  <button
                    className="icon-button muted"
                    onClick={() => quantity(product.id, 0)}
                    aria-label={`Remove ${product.name}`}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </article>
            ))}
            <Link href="/#collection" className="text-link">
              Leave the bag open. Keep looking
            </Link>
          </section>
          <aside className="order-summary">
            <h2>Before we say hello</h2>
            <div>
              <span>Subtotal</span>
              <b>{money(subtotal)}</b>
            </div>
            <div>
              <span>Delivery</span>
              <b>{shipping ? money(shipping) : 'On us'}</b>
            </div>
            {shipping > 0 && (
              <p className="shipping-note">
                You&apos;re {money(249900 - subtotal)} away from free delivery.
              </p>
            )}
            <div className="summary-total">
              <span>Total</span>
              <b>{money(subtotal + shipping)}</b>
            </div>
            <p className="muted">
              All prices include applicable taxes. Final price and availability are checked at
              checkout.
            </p>
            <Button fullWidth component={Link} href="/checkout" variant="contained">
              Continue without an account
            </Button>
            <p className="secure-note">
              <ShieldCheck size={16} /> No password. No account. Private tracking link.
            </p>
          </aside>
        </div>
      )}
    </main>
  );
}
