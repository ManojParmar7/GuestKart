'use client';
import { useEffect, useState } from 'react';
import { Button, Dialog, DialogContent, Alert, Skeleton } from '@mui/material';
import { Search, Plus, X, ShoppingBag, Sparkles, SlidersHorizontal, Check } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { money, type Catalog, type Product } from '@/lib/types';
import { useCart } from './providers';
import { TrustBar } from './chrome';

export function Storefront() {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('featured');
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [retry, setRetry] = useState(0);
  const [selected, setSelected] = useState<Product | null>(null);
  const { add } = useCart();
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(search);
      setPage(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    const query = new URLSearchParams({
      search: debounced,
      category,
      sort,
      page: String(page),
      limit: '8',
    });
    api<Catalog>(`/catalog?${query}`, { signal: controller.signal })
      .then(setCatalog)
      .catch((err) => {
        if (err.name !== 'AbortError') setError(err.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [debounced, category, sort, page, retry]);
  return (
    <main id="main">
      <section className="hero container">
        <div className="hero-copy">
          <div className="eyebrow">
            <span /> YOUR CART DOESN&apos;T NEED AN ACCOUNT
          </div>
          <h1>
            Shopping is better
            <br />
            <em>without the sign-up.</em>
          </h1>
          <p>
            Browse at your own pace. One tap for your bag, a few details to check out, and one
            private link to keep an eye on your delivery.
          </p>
          <Button
            component={Link}
            href="#collection"
            variant="contained"
            size="large"
            endIcon={<ShoppingBag size={18} />}
          >
            Start with the collection
          </Button>
          <div className="hero-check">
            <Check size={16} /> No password. No profile. Just your order link.
          </div>
        </div>
        <div className="hero-art">
          <div className="hero-orbit" />
          <span className="hero-sticker">
            <Sparkles size={15} /> THE NO-ACCOUNT CHECKOUT
          </span>
          <img
            src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=90"
            alt="Mustard studio headphones from the GuestKart collection"
            className="hero-image"
            fetchPriority="high"
          />
          <div className="hero-caption">
            <div>
              <small>A closer look, a click away.</small>
              <b>Studio headphones in mustard</b>
            </div>
            <span>₹3,499</span>
          </div>
          <span className="hero-note">
            See the details.
            <br />
            Big everyday energy.
          </span>
        </div>
      </section>
      <TrustBar />
      <section id="collection" className="collection container">
        <div className="section-title">
          <div>
            <div className="eyebrow">PICK UP WHERE YOU LEFT OFF</div>
            <h2>A shelf worth scrolling.</h2>
          </div>
          <p>Pick something. Leave whenever you like.</p>
        </div>
        {catalog?.demoMode && (
          <div className="demo-banner">
            You&apos;re exploring the demo store. Orders are for testing and reset when the server
            restarts.
          </div>
        )}
        <div className="catalog-tools">
          <div className="category-tabs" role="group" aria-label="Product categories">
            <button
              className={!category ? 'active' : ''}
              onClick={() => {
                setCategory('');
                setPage(1);
              }}
            >
              The whole shelf
            </button>
            {catalog?.categories.map((c) => (
              <button
                key={c.id}
                className={category === c.id ? 'active' : ''}
                onClick={() => {
                  setCategory(c.id);
                  setPage(1);
                }}
              >
                {c.name}
              </button>
            ))}
          </div>
          <div className="search-box">
            <Search size={18} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search the shelf…"
              aria-label="Search products"
            />
            {search && (
              <button
                className="icon-button"
                onClick={() => setSearch('')}
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
        <div className="results-row">
          <span>
            {loading ? 'Loading the shelf…' : `${catalog?.total ?? 0} products on the shelf`}
          </span>
          <label>
            <SlidersHorizontal size={15} />
            <select
              aria-label="Sort products"
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
            >
              <option value="featured">Featured first</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="newest">Newest arrivals</option>
            </select>
          </label>
        </div>
        {error ? (
          <Alert
            severity="error"
            action={<Button onClick={() => setRetry(retry + 1)}>Retry</Button>}
          >
            {error}
          </Alert>
        ) : (
          <div className="product-grid" aria-busy={loading}>
            {loading
              ? Array.from({ length: 8 }, (_, i) => (
                  <div key={i}>
                    <Skeleton variant="rounded" height={280} />
                    <Skeleton width="80%" />
                    <Skeleton width="40%" />
                  </div>
                ))
              : catalog?.products.map((product) => (
                  <article className="product-card" key={product.id}>
                    <div className={`product-media ${product.accent}`}>
                      <button
                        className="product-preview"
                        onClick={() => setSelected(product)}
                        aria-label={`View ${product.name}`}
                      >
                        <img src={product.image} alt={product.name} loading="lazy" />
                      </button>
                      {product.compareAtPrice && (
                        <span className="product-badge">
                          {Math.round((1 - product.price / product.compareAtPrice) * 100)}% less
                        </span>
                      )}
                      {!product.stock && <span className="sold-out">Back soon</span>}
                      <button
                        className="quick-add"
                        disabled={!product.stock}
                        onClick={() => add(product)}
                        aria-label={`Add ${product.name} to bag`}
                      >
                        <Plus size={21} />
                      </button>
                    </div>
                    <div className="product-meta">
                      {catalog.categories.find((c) => c.id === product.categoryId)?.name}
                    </div>
                    <button className="product-name" onClick={() => setSelected(product)}>
                      {product.name}
                    </button>
                    <div className="product-price">
                      <b>{money(product.price)}</b>
                      {product.compareAtPrice && <del>{money(product.compareAtPrice)}</del>}
                    </div>
                  </article>
                ))}
          </div>
        )}
        {!loading && !error && !catalog?.products.length && (
          <div className="empty-state">
            <Search size={38} />
            <h3>No finds just yet.</h3>
            <p>Try a different search or explore all our categories.</p>
            <Button
              onClick={() => {
                setSearch('');
                setCategory('');
              }}
            >
              Show all finds
            </Button>
          </div>
        )}
        {catalog && catalog.total > 8 && (
          <div className="pagination">
            <Button disabled={page === 1 || loading} onClick={() => setPage(page - 1)}>
              Previous
            </Button>
            <span>
              Page {page} of {Math.ceil(catalog.total / 8)}
            </span>
            <Button
              disabled={page * 8 >= catalog.total || loading}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </section>
      <section className="guest-route" aria-label="How guest checkout works">
        <div className="guest-route-heading">
          <span className="eyebrow">THE WAY GUESTKART WORKS</span>
          <p>A little more room for what brought you here.</p>
        </div>
        <ol>
          <li>
            <span>01</span>
            <b>Pick what catches your eye</b>
            <small>No membership, account or sign-in needed.</small>
          </li>
          <li>
            <span>02</span>
            <b>Tell us where to send it</b>
            <small>A name, a contact and your delivery address.</small>
          </li>
          <li>
            <span>03</span>
            <b>Keep the link, skip the account</b>
            <small>One private order link brings you back to your parcel.</small>
          </li>
        </ol>
      </section>
      <section className="guest-story container">
        <div className="guest-story-icon">
          <ShoppingBag size={42} />
        </div>
        <div>
          <div className="eyebrow">YOU&apos;RE ALWAYS WELCOME</div>
          <h2>Your bag is your account.</h2>
          <p>
            No password to remember. Keep your private order link,
            <br />
            and come back when your parcel moves.
          </p>
        </div>
        <Link href="/about" className="text-link">
          How guest shopping works
        </Link>
      </section>
      <Dialog open={Boolean(selected)} onClose={() => setSelected(null)} maxWidth="md" fullWidth>
        <DialogContent>
          <button
            className="dialog-close icon-button"
            aria-label="Close product details"
            onClick={() => setSelected(null)}
          >
            <X />
          </button>
          {selected && (
            <div className="product-detail">
              <img src={selected.image} alt={selected.name} />
              <div>
                <div className="eyebrow">PRODUCT DETAILS</div>
                <h2>{selected.name}</h2>
                <div className="product-price">
                  <b>{money(selected.price)}</b>
                  {selected.compareAtPrice && <del>{money(selected.compareAtPrice)}</del>}
                </div>
                <p>{selected.description}</p>
                <p className="muted">
                  {selected.stock
                    ? `${selected.stock} available · Ships across India`
                    : 'Currently out of stock'}
                </p>
                <Button
                  fullWidth
                  variant="contained"
                  disabled={!selected.stock}
                  onClick={() => add(selected)}
                  startIcon={<ShoppingBag size={18} />}
                >
                  Add to bag
                </Button>
                <Link href="/cart" className="detail-cart" onClick={() => setSelected(null)}>
                  View your bag
                </Link>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
