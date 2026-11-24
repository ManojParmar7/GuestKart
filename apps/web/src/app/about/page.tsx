import Link from 'next/link';
export const metadata = { title: 'Our story' };
export default function AboutPage() {
  return (
    <main id="main" className="container page-space prose">
      <div className="eyebrow">A SIMPLER KIND OF SHOPPING</div>
      <h1 className="page-title">
        Always welcome.
        <br />
        Always a guest<span>.</span>
      </h1>
      <p className="lead">
        GuestKart starts with a simple idea: finding something good should be easy.
      </p>
      <h2>Everyday essentials, thoughtfully picked.</h2>
      <p>
        Home comforts, useful tech and everyday carry. Our collection brings together small upgrades
        that fit into real life, with clear prices and straightforward delivery.
      </p>
      <h2>Your time is yours.</h2>
      <p>
        Browse the collection, add your favorites to your bag and check out with your delivery
        details. You never need to create a shopping account. A private tracking link keeps your
        order close.
      </p>
      <h2>A practical foundation.</h2>
      <p>
        This repository is a working e-commerce starter. Its default demo store contains sample
        products and makes no real deliveries. Store owners must configure their real catalog,
        payment account, support details and policies before accepting customers.
      </p>
      <Link className="text-link" href="/#collection">
        Explore the everyday edit
      </Link>
    </main>
  );
}
