import Link from 'next/link';
export default function NotFound() {
  return (
    <main id="main" className="container page-space empty-state">
      <h1>This find wandered off.</h1>
      <p>The page you&apos;re looking for is not here.</p>
      <Link className="text-link" href="/">
        Back to GuestKart
      </Link>
    </main>
  );
}
