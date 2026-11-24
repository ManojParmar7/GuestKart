import Link from 'next/link';
export const metadata = { title: 'Why GuestKart' };
export default function AboutPage() {
  return (
    <main id="main" className="container page-space prose">
      <div className="eyebrow">THERE&apos;S A CHAIR FOR YOU HERE</div>
      <h1 className="page-title">
        Come as you are.
        <br />
        Shop as you are<span>.</span>
      </h1>
      <p className="lead">
        Shopping shouldn&apos;t ask for your life story before it shows you the good stuff.
      </p>
      <h2>Browse first. Decide for yourself.</h2>
      <p>
        Our shelf brings together things for home, days out, work and the spaces in between. Product
        details and prices are right there when you want them; the bag is ready whenever you are.
      </p>
      <h2>Your order link is your way back.</h2>
      <p>
        Browse the collection, add your favorites to your bag and check out with your delivery
        details. You never need to create a shopping account. A private tracking link keeps your
        order close.
      </p>
      <h2>What&apos;s on the shelf today.</h2>
      <p>
        This repository is a working e-commerce starter. Its default demo store contains sample
        products and makes no real deliveries. Store owners must configure their real catalog,
        payment account, support details and policies before accepting customers.
      </p>
      <Link className="text-link" href="/#collection">
        Take another look
      </Link>
    </main>
  );
}
