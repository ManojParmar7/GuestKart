'use client';
import { Suspense, useEffect, useState, type FormEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import { Alert, Button, TextField } from '@mui/material';
import { Check, Copy, PackageCheck, RefreshCw } from 'lucide-react';
import { post } from '@/lib/api';
import { money, label, type Order } from '@/lib/types';
function Tracking() {
  const params = useSearchParams();
  const [id, setId] = useState('');
  const [token, setToken] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  async function load(orderId: string, trackingKey: string) {
    setBusy(true);
    setError('');
    setOrder(null);
    try {
      setOrder(
        await post<Order>('/orders/track', { id: orderId.trim(), token: trackingKey.trim() }),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to find this order.');
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    let orderId = params.get('order') ?? '';
    let trackingKey = window.location.hash.slice(1);
    if (!orderId) {
      try {
        const saved = JSON.parse(localStorage.getItem('guestkart-last-order') ?? 'null');
        orderId = saved?.id ?? '';
        trackingKey = saved?.token ?? '';
      } catch {
        /* Show manual lookup. */
      }
    }
    setId(orderId);
    setToken(trackingKey);
    if (orderId && trackingKey) void load(orderId, trackingKey);
  }, [params]);
  async function copy() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/track?order=${id}#${token}`);
      setCopied(true);
    } catch {
      setError('Clipboard unavailable. Save the order ID and tracking key shown below.');
    }
  }
  const steps = ['PLACED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
  return (
    <main id="main" className="container page-space">
      <div className="eyebrow">FROM OUR DOOR TO YOURS</div>
      <h1 className="page-title">
        Follow your good finds<span>.</span>
      </h1>
      <div className="tracking-layout">
        <section>
          <form
            className="tracking-form"
            onSubmit={(e: FormEvent) => {
              e.preventDefault();
              void load(id, token);
            }}
          >
            <TextField
              required
              fullWidth
              label="Order ID"
              value={id}
              onChange={(e) => setId(e.target.value)}
            />
            <TextField
              required
              fullWidth
              label="Private tracking key"
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
            <Button type="submit" variant="contained" disabled={busy}>
              {busy ? 'Finding your order…' : 'Track order'}
            </Button>
          </form>
          <p className="muted">
            Your tracking key is private. Keep it with your order ID to check back from another
            device.
          </p>
          {error && <Alert severity="error">{error}</Alert>}
        </section>
        {order && (
          <section className="tracking-order">
            <div className="order-top">
              <div>
                <PackageCheck />
                <h2>{order.number}</h2>
                <p className="muted">
                  Placed {new Date(order.createdAt).toLocaleDateString('en-IN')}
                </p>
              </div>
              <span className={`status ${order.status.toLowerCase()}`}>{label(order.status)}</span>
            </div>
            <Alert
              severity={
                order.paymentStatus === 'PENDING'
                  ? 'warning'
                  : order.status === 'CANCELLED'
                    ? 'warning'
                    : 'success'
              }
            >
              {order.paymentStatus === 'PENDING'
                ? 'Payment is pending. Fulfillment starts after Stripe confirms payment. If you just paid, refresh shortly.'
                : order.paymentStatus === 'PAID'
                  ? 'Payment confirmed. Thank you for shopping with us.'
                  : order.paymentStatus === 'CANCELLED'
                    ? 'This order has been cancelled.'
                    : 'Order received. Pay cash when your delivery arrives.'}
            </Alert>
            {order.status !== 'CANCELLED' && (
              <ol className="tracking-steps">
                {steps.map((step, index) => (
                  <li className={steps.indexOf(order.status) >= index ? 'done' : ''} key={step}>
                    <span>
                      {steps.indexOf(order.status) >= index ? <Check size={15} /> : index + 1}
                    </span>
                    {label(step)}
                  </li>
                ))}
              </ol>
            )}
            {order.items.map((item) => (
              <div className="tracking-item" key={item.productId}>
                <img src={item.image} alt="" />
                <div>
                  <b>{item.name}</b>
                  <small>
                    Qty {item.quantity} · {label(item.status)}
                  </small>
                </div>
                <b>{money(item.price * item.quantity)}</b>
              </div>
            ))}
            <div className="tracking-total">
              <span>Delivery {order.shipping ? money(order.shipping) : 'free'} · Total</span>
              <b>{money(order.currentTotal)}</b>
            </div>
            <div className="delivery-address">
              <b>Delivering to {order.customer.name}</b>
              <p>
                {order.customer.line1}
                <br />
                {order.customer.city}, {order.customer.state} {order.customer.postalCode}
              </p>
            </div>
            <div className="button-row">
              {order.paymentStatus === 'PENDING' && (
                <Button
                  variant="contained"
                  disabled={busy}
                  onClick={async () => {
                    setBusy(true);
                    setError('');
                    try {
                      const result = await post<{ url: string }>('/orders/payment', { id, token });
                      window.location.assign(result.url);
                    } catch (err) {
                      setError(err instanceof Error ? err.message : 'Unable to resume payment.');
                      setBusy(false);
                    }
                  }}
                >
                  Resume card payment
                </Button>
              )}
              <Button startIcon={<Copy size={16} />} onClick={copy}>
                {copied ? 'Tracking link copied' : 'Copy private tracking link'}
              </Button>
              <Button
                startIcon={<RefreshCw size={16} />}
                disabled={busy}
                onClick={() => load(id, token)}
              >
                Refresh status
              </Button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
export default function TrackPage() {
  return (
    <Suspense
      fallback={
        <main id="main" className="container page-space">
          Opening order tracking…
        </main>
      }
    >
      <Tracking />
    </Suspense>
  );
}
