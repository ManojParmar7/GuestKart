'use client';
export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <main id="main" className="container page-space empty-state">
      <h1>Something interrupted your visit.</h1>
      <p>Please try loading the page again.</p>
      <button className="plain-button" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
