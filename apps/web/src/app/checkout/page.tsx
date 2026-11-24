'use client';
import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Alert, Button, TextField } from '@mui/material';
import { Banknote, CreditCard, ShieldCheck } from 'lucide-react';
import { useCart } from '@/components/providers';
import { api, post } from '@/lib/api';
import { money, type Address, type Catalog, type Order } from '@/lib/types';
const initial: Address = {
  name: '',
  email: '',
  phone: '',
  line1: '',
  city: '',
  state: '',
  postalCode: '',
};
export default function CheckoutPage() {
  const { lines, hydrated, clear } = useCart();
  const router = useRouter();
  const [customer, setCustomer] = useState(initial);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [accepted, setAccepted] = useState(false);
  useEffect(() => {
    api<Catalog>('/catalog?limit=1')
      .then(setCatalog)
      .catch((err) => setError(err.message));
  }, []);
  const subtotal = lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
  const shipping = subtotal >= 249900 ? 0 : 9900;
  const field = (name: keyof Address, title: string, autoComplete: string, type = 'text') => (
    <TextField
      required
      fullWidth
      label={title}
      type={type}
      value={customer[name]}
      autoComplete={autoComplete}
      onChange={(e) => setCustomer({ ...customer, [name]: e.target.value })}
      inputProps={{
        maxLength: name === 'line1' ? 250 : name === 'postalCode' ? 6 : 200,
        ...(name === 'postalCode' ? { pattern: '[1-9][0-9]{5}', inputMode: 'numeric' } : {}),
      }}
    />
  );
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy || !lines.length || !accepted) return;
    setBusy(true);
    setError('');
    const payload = {
      customer,
      paymentMethod,
      items: lines.map((line) => ({ productId: line.product.id, quantity: line.quantity })),
    };
    // Retain the key through retries and page reloads, but use a fresh key for a changed checkout.
    let idempotencyKey = crypto.randomUUID();
    try {
      const previous = JSON.parse(sessionStorage.getItem('guestkart-checkout') ?? 'null');
      if (previous?.payload === JSON.stringify(payload)) idempotencyKey = previous.key;
      sessionStorage.setItem(
        'guestkart-checkout',
        JSON.stringify({ payload: JSON.stringify(payload), key: idempotencyKey }),
      );
    } catch {
      /* Checkout can still proceed when storage is unavailable. */
    }
    try {
      const result = await post<{ order: Order; trackingToken: string; paymentUrl: string | null }>(
        '/checkout',
        { ...payload, idempotencyKey },
      );
      try {
        localStorage.setItem(
          'guestkart-last-order',
          JSON.stringify({ id: result.order.id, token: result.trackingToken }),
        );
        sessionStorage.removeItem('guestkart-checkout');
      } catch {
        /* Tracking link remains available below. */
      }
      clear();
      if (result.paymentUrl) window.location.assign(result.paymentUrl);
      else router.push(`/track?order=${result.order.id}#${result.trackingToken}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed. Please retry.');
      setBusy(false);
    }
  }
  return (
    <main id="main" className="container page-space">
      <div className="eyebrow">JUST THE ESSENTIALS</div>
      <h1 className="page-title">
        Good finds. Almost yours<span>.</span>
      </h1>
      {!hydrated ? (
        <p>Preparing checkout…</p>
      ) : !lines.length ? (
        <div className="empty-state">
          <h2>Your bag is empty.</h2>
          <Button component={Link} href="/">
            Find something good
          </Button>
        </div>
      ) : (
        <form onSubmit={submit} className="checkout-grid">
          <section className="checkout-form">
            {catalog?.demoMode && (
              <Alert severity="info">
                Demo checkout only. No real deliveries are made. Please use fictional contact
                details.
              </Alert>
            )}
            {error && (
              <Alert severity="error" role="alert">
                {error}
              </Alert>
            )}
            <h2>Where should we send it?</h2>
            <p className="muted">No account to create. Just a few delivery details.</p>
            <div className="form-grid">
              {field('name', 'Full name', 'name')}
              {field('email', 'Email address', 'email', 'email')}
              {field('phone', 'Phone number', 'tel', 'tel')}
              <div className="full-row">
                {field('line1', 'House, street and area', 'street-address')}
              </div>
              {field('city', 'City', 'address-level2')}
              {field('state', 'State', 'address-level1')}
              {field('postalCode', 'PIN code', 'postal-code')}
            </div>
            <h2>How would you like to pay?</h2>
            <div className="payment-options">
              <label className={paymentMethod === 'COD' ? 'selected' : ''}>
                <input
                  type="radio"
                  name="payment"
                  value="COD"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                />
                <Banknote />
                <span>
                  <b>Cash on delivery</b>
                  <small>Pay when your order arrives</small>
                </span>
              </label>
              <label className={paymentMethod === 'STRIPE' ? 'selected' : ''}>
                <input
                  type="radio"
                  name="payment"
                  value="STRIPE"
                  disabled={!catalog?.stripeEnabled}
                  checked={paymentMethod === 'STRIPE'}
                  onChange={() => setPaymentMethod('STRIPE')}
                />
                <CreditCard />
                <span>
                  <b>Pay securely by card</b>
                  <small>
                    {catalog?.stripeEnabled
                      ? 'Continue to Stripe Checkout'
                      : 'Card payments are not configured'}
                  </small>
                </span>
              </label>
            </div>
            <label className="terms-check">
              <input
                required
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
              />
              <span>
                I agree to the{' '}
                <Link href="/policies" target="_blank">
                  delivery and return terms
                </Link>{' '}
                and{' '}
                <Link href="/policies#privacy" target="_blank">
                  privacy policy
                </Link>
                .
              </span>
            </label>
          </section>
          <aside className="order-summary">
            <h2>Your good finds</h2>
            {lines.map((line) => (
              <div className="mini-line" key={line.product.id}>
                <img src={line.product.image} alt="" />
                <span>
                  {line.product.name}
                  <small>Qty {line.quantity}</small>
                </span>
                <b>{money(line.product.price * line.quantity)}</b>
              </div>
            ))}
            <div>
              <span>Subtotal</span>
              <b>{money(subtotal)}</b>
            </div>
            <div>
              <span>Delivery</span>
              <b>{shipping ? money(shipping) : 'On us'}</b>
            </div>
            <div className="summary-total">
              <span>Total</span>
              <b>{money(subtotal + shipping)}</b>
            </div>
            <p className="muted">
              Includes applicable taxes. Server confirms the current price and stock.
            </p>
            <Button
              fullWidth
              variant="contained"
              type="submit"
              disabled={busy || !catalog || !accepted}
            >
              {busy
                ? 'Placing your order…'
                : paymentMethod === 'COD'
                  ? 'Place guest order'
                  : 'Continue to secure payment'}
            </Button>
            <p className="secure-note">
              <ShieldCheck size={16} /> Your details are used for this order.
            </p>
            <Link href="/cart" className="detail-cart">
              Back to your bag
            </Link>
          </aside>
        </form>
      )}
    </main>
  );
}
