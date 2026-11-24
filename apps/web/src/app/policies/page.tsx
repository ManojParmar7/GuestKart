export const metadata = { title: 'Delivery, returns & privacy' };
export default function PoliciesPage() {
  return (
    <main id="main" className="container page-space prose">
      <div className="eyebrow">THE DETAILS MATTER</div>
      <h1 className="page-title">
        Good to know<span>.</span>
      </h1>
      <div className="demo-banner">
        Starter-store policy. The store operator must publish their legal business name, support
        contact, dispatch time, return window and refund terms before launch. Demo orders do not
        result in deliveries.
      </div>
      <h2>Delivery</h2>
      <p>
        The checkout currently supports Indian delivery addresses. Standard shipping is ₹99 and is
        free for orders of ₹2,499 or more. Item prices include applicable taxes. Availability and
        current prices are confirmed by the server when you place your order.
      </p>
      <h2>Payment & order tracking</h2>
      <p>
        Cash on delivery is available. Card payments appear only when the store operator has
        connected Stripe. A card order is confirmed for fulfillment after the payment provider
        verifies payment. Save your private tracking link; anyone holding that link can view your
        order details.
      </p>
      <h2>Cancellation & returns</h2>
      <p>
        The store administrator can cancel unshipped cash-on-delivery items. This starter does not
        include a self-service returns portal or automated refunds. Paid-order refunds must be
        handled by the operator through Stripe. A real store must supply customer support and its
        return terms before taking orders.
      </p>
      <h2 id="privacy">Privacy</h2>
      <p>
        Guest checkout collects your name, email, phone and delivery address to process and deliver
        your order. Authorized store administrators can access the order details needed for
        fulfillment. Card details are entered on Stripe&apos;s hosted checkout and are not stored by
        this application.
      </p>
      <p>
        Your browser stores your shopping bag and the latest private order-tracking key locally. A
        checkout retry key and delivery form snapshot are stored in session storage during checkout
        and removed after success. Clearing site data removes these browser records. Admin sign-in
        uses an HTTP-only session cookie lasting up to eight hours. Product photographs are loaded
        from external HTTPS image providers, which receive normal image requests from your browser.
      </p>
      <h2>Use of this demo</h2>
      <p>
        Use fictional details when testing the demo. Data in memory mode disappears when the API
        restarts. This starter has no analytics, marketing subscription, or customer account system.
        The operator must define retention, deletion and applicable consumer terms for a live
        business.
      </p>
    </main>
  );
}
