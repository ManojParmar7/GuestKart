"use client";

import * as React from "react";

import styles from "./shop.module.css";

type Product = {
	id: string;
	name: string;
	description?: string | null;
	price: number;
	discountPrice?: number | null;
	stock: number;
	images?: string[] | null;
	category?: { name?: string | null } | null;
};
type CartLine = { product: Product; quantity: number };
type Contact = { name: string; email: string; phone: string; address: string };
const API = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/graphql`;
const currency = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const assetUrl = (path: string) =>
	path.startsWith("http")
		? path
		: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}${path.startsWith("/") ? "" : "/"}${path}`;

async function graphQL<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
	const response = await fetch(API, {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify({ query, variables }),
	});
	const payload = await response.json();
	if (!response.ok || payload.errors?.length)
		throw new Error(payload.errors?.[0]?.message || "Store service is unavailable.");
	return payload.data as T;
}

export default function ShopPage() {
	const [products, setProducts] = React.useState<Product[]>([]);
	const [cart, setCart] = React.useState<CartLine[]>([]);
	const [query, setQuery] = React.useState("");
	const [category, setCategory] = React.useState("All finds");
	const [contact, setContact] = React.useState<Contact>({ name: "", email: "", phone: "", address: "" });
	const [notice, setNotice] = React.useState("");
	const [loading, setLoading] = React.useState(true);
	const [busy, setBusy] = React.useState(false);
	const [drawerOpen, setDrawerOpen] = React.useState(false);
	const [order, setOrder] = React.useState<{
		orderNumber: string;
		total: number;
		trackingToken: string;
		email: string;
		status: string;
	} | null>(null);

	React.useEffect(() => {
		document.title = "GuestKart — Good things, found";
		try {
			setCart(JSON.parse(localStorage.getItem("guestkart-cart") || "[]"));
			setOrder(JSON.parse(sessionStorage.getItem("guestkart-last-order") || "null"));
		} catch {
			localStorage.removeItem("guestkart-cart");
		}
		graphQL<{ getAllProducts?: { products?: Product[] } }>(
			`query StoreProducts { getAllProducts(page: 1, limit: 60) { products { id name description price discountPrice stock images category { name } } } }`
		)
			.then((data) => setProducts(data.getAllProducts?.products || []))
			.catch((error: Error) => setNotice(error.message))
			.finally(() => setLoading(false));
	}, []);

	React.useEffect(() => {
		localStorage.setItem("guestkart-cart", JSON.stringify(cart));
	}, [cart]);
	const categories = [
		"All finds",
		...Array.from(
			new Set(products.map((product) => product.category?.name).filter((name): name is string => Boolean(name)))
		),
	];
	const visibleProducts = products.filter(
		(product) =>
			(category === "All finds" || product.category?.name === category) &&
			`${product.name} ${product.description || ""}`.toLowerCase().includes(query.toLowerCase())
	);
	const count = cart.reduce((sum, item) => sum + item.quantity, 0);
	const subtotal = cart.reduce(
		(sum, item) => sum + (item.product.discountPrice ?? item.product.price) * item.quantity,
		0
	);
	const delivery = subtotal >= 999 || subtotal === 0 ? 0 : 49;

	function addToCart(product: Product) {
		setCart((items) => {
			const found = items.find((item) => item.product.id === product.id);
			return found
				? items.map((item) =>
						item.product.id === product.id ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) } : item
					)
				: [...items, { product, quantity: 1 }];
		});
		setNotice(`${product.name} added to your bag.`);
		setDrawerOpen(true);
	}

	async function checkout(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setBusy(true);
		setNotice("");
		try {
			const existingKey = sessionStorage.getItem("guestkart-checkout-key");
			const idempotencyKey = existingKey || `${crypto.randomUUID()}`;
			sessionStorage.setItem("guestkart-checkout-key", idempotencyKey);
			const data = await graphQL<{
				checkoutAsGuest: {
					success: boolean;
					message: string;
					trackingToken?: string;
					order?: { orderNumber: string; total: number; status: string };
				};
			}>(
				`mutation GuestCheckout($items: [GuestCartLineInput!]!, $contact: GuestContactInput!, $idempotencyKey: String!) { checkoutAsGuest(items: $items, contact: $contact, idempotencyKey: $idempotencyKey) { success message trackingToken order { orderNumber total status } } }`,
				{ items: cart.map(({ product, quantity }) => ({ productId: product.id, quantity })), contact, idempotencyKey }
			);
			if (!data.checkoutAsGuest.success || !data.checkoutAsGuest.order) throw new Error(data.checkoutAsGuest.message);
			const confirmedOrder = {
				...data.checkoutAsGuest.order,
				trackingToken: data.checkoutAsGuest.trackingToken || idempotencyKey,
				email: contact.email,
			};
			setOrder(confirmedOrder);
			sessionStorage.setItem("guestkart-last-order", JSON.stringify(confirmedOrder));
			setCart([]);
			sessionStorage.removeItem("guestkart-checkout-key");
		} catch (error) {
			setNotice(error instanceof Error ? error.message : "Could not place your order.");
		} finally {
			setBusy(false);
		}
	}

	async function refreshOrderStatus() {
		if (!order) return;
		setBusy(true);
		try {
			const data = await graphQL<{ trackGuestOrder: { status: string } | null }>(
				`query TrackGuestOrder($orderNumber: String!, $email: String!, $trackingToken: String!) { trackGuestOrder(orderNumber: $orderNumber, email: $email, trackingToken: $trackingToken) { status } }`,
				{ orderNumber: order.orderNumber, email: order.email, trackingToken: order.trackingToken }
			);
			if (!data.trackGuestOrder) throw new Error("Order details could not be verified.");
			const refreshed = { ...order, status: data.trackGuestOrder.status };
			setOrder(refreshed);
			sessionStorage.setItem("guestkart-last-order", JSON.stringify(refreshed));
		} catch (error) {
			setNotice(error instanceof Error ? error.message : "Could not check order status.");
		} finally {
			setBusy(false);
		}
	}

	return (
		<main className={styles.page}>
			<header className={styles.header}>
				<a className={styles.brand} href="/shop">
					<span className={styles.brandMark}>g</span> guest<span>kart</span>
				</a>
				<nav>
					<a href="#edit">The edit</a>
					<a href="#story">Our way</a>
				</nav>
				<button
					className={styles.bagButton}
					onClick={() => setDrawerOpen(true)}
					aria-label={`Open bag, ${count} items`}
				>
					Your bag <span>{count}</span>
				</button>
			</header>
			<section className={styles.hero} id="story">
				<div className={styles.heroCopy}>
					<span className={styles.kicker}>GOOD THINGS, FOUND</span>
					<h1>
						Little finds.
						<br />
						<em>Better days.</em>
					</h1>
					<p>Thoughtful everyday picks, brought together in one easy place.</p>
					<a href="#edit" className={styles.heroLink}>
						Explore the edit <span>↗</span>
					</a>
				</div>
				<div className={styles.heroArt}>
					<div className={styles.sun} />
					<div className={styles.artLabel}>
						A considered
						<br />
						kind of cart.
					</div>
					<div className={styles.artOrb}>
						g<span>k</span>
					</div>
					<div className={styles.artStamp}>
						MADE FOR
						<br />
						EVERYDAY
					</div>
				</div>
				<div className={styles.heroFoot}>
					<span>CURATED FOR REAL LIFE</span>
					<span>01 — 06 / THE DAILY EDIT</span>
				</div>
			</section>
			<section className={styles.catalog} id="edit">
				<div className={styles.catalogHeading}>
					<div>
						<span className={styles.kicker}>THE GOOD FINDS</span>
						<h2>Browse at your pace.</h2>
					</div>
					<label className={styles.search}>
						<span>⌕</span>
						<input
							value={query}
							onChange={(event) => setQuery(event.target.value)}
							placeholder="Find something lovely"
							aria-label="Search products"
						/>
					</label>
				</div>
				<div className={styles.filters}>
					{categories.map((item) => (
						<button
							key={item}
							onClick={() => setCategory(item)}
							className={category === item ? styles.activeFilter : ""}
						>
							{item}
						</button>
					))}
				</div>
				{notice && !drawerOpen && (
					<p className={styles.notice} role="status">
						{notice}
					</p>
				)}
				{loading ? (
					<div className={styles.empty}>Gathering the good finds…</div>
				) : visibleProducts.length ? (
					<div className={styles.grid}>
						{visibleProducts.map((product, index) => (
							<article className={styles.product} key={product.id}>
								<div
									className={styles.productPhoto}
									style={{ "--tone": ["#ded9c8", "#d9c7b4", "#c7d1c9", "#e8d8c9"][index % 4] } as React.CSSProperties}
								>
									{product.images?.[0] ? (
										<img src={assetUrl(product.images[0])} alt={product.name} />
									) : (
										<span className={styles.photoInitial}>{product.name.slice(0, 1)}</span>
									)}
									<span className={styles.productIndex}>GK / {String(index + 1).padStart(2, "0")}</span>
									<button
										onClick={() => addToCart(product)}
										disabled={product.stock < 1}
										aria-label={`Add ${product.name} to bag`}
									>
										＋
									</button>
								</div>
								<div className={styles.productInfo}>
									<div>
										<h3>{product.name}</h3>
										<p>{product.category?.name || "Everyday essential"}</p>
									</div>
									<strong>{currency.format(product.discountPrice ?? product.price)}</strong>
								</div>
							</article>
						))}
					</div>
				) : (
					<div className={styles.empty}>{notice || "No finds in this collection yet. Check back soon."}</div>
				)}
			</section>
			<footer className={styles.footer}>
				<a className={styles.brand} href="/shop">
					<span className={styles.brandMark}>g</span> guest<span>kart</span>
				</a>
				<p>Good finds, with the fuss left out.</p>
				<span>© {new Date().getFullYear()} GUESTKART</span>
			</footer>
			{drawerOpen && (
				<div
					className={styles.scrim}
					onMouseDown={(event) => {
						if (event.target === event.currentTarget) setDrawerOpen(false);
					}}
				>
					<aside className={styles.drawer} aria-label="Your bag">
						<div className={styles.drawerHead}>
							<div>
								<span className={styles.kicker}>YOUR GUEST BAG</span>
								<h2>{order ? "You're all set." : "A few good things."}</h2>
							</div>
							<button onClick={() => setDrawerOpen(false)} aria-label="Close bag">
								×
							</button>
						</div>
						{order ? (
							<div className={styles.confirmation}>
								<div className={styles.check}>✓</div>
								<p>Order confirmed · {order.status}</p>
								<h3>{order.orderNumber}</h3>
								<span>Cash on delivery · {currency.format(order.total)}</span>
								<button className={styles.checkoutButton} disabled={busy} onClick={refreshOrderStatus}>
									{busy ? "Checking…" : "Refresh order status"}
								</button>
								<button
									className={styles.heroLink}
									onClick={() => {
										setOrder(null);
										sessionStorage.removeItem("guestkart-last-order");
										setDrawerOpen(false);
									}}
								>
									Back to the edit
								</button>
							</div>
						) : (
							<>
								{notice && (
									<p className={styles.notice} role="status">
										{notice}
									</p>
								)}
								<div className={styles.cartLines}>
									{cart.length ? (
										cart.map(({ product, quantity }) => (
											<div className={styles.cartLine} key={product.id}>
												<div className={styles.cartThumb}>
													{product.images?.[0] && <img src={product.images[0]} alt="" />}
												</div>
												<div className={styles.cartProduct}>
													<strong>{product.name}</strong>
													<span>{currency.format(product.discountPrice ?? product.price)}</span>
													<div className={styles.qty}>
														<button
															onClick={() =>
																setCart((items) =>
																	items.map((item) =>
																		item.product.id === product.id
																			? { ...item, quantity: Math.max(1, item.quantity - 1) }
																			: item
																	)
																)
															}
														>
															−
														</button>
														<span>{quantity}</span>
														<button
															onClick={() =>
																setCart((items) =>
																	items.map((item) =>
																		item.product.id === product.id
																			? { ...item, quantity: Math.min(product.stock, item.quantity + 1) }
																			: item
																	)
																)
															}
														>
															＋
														</button>
														<button
															className={styles.remove}
															onClick={() => setCart((items) => items.filter((item) => item.product.id !== product.id))}
														>
															Remove
														</button>
													</div>
												</div>
											</div>
										))
									) : (
										<p className={styles.emptyCart}>Your bag has room for a good find.</p>
									)}
								</div>
								{cart.length > 0 && (
									<>
										<div className={styles.totals}>
											<div>
												<span>Subtotal</span>
												<span>{currency.format(subtotal)}</span>
											</div>
											<div>
												<span>Delivery</span>
												<span>{delivery ? currency.format(delivery) : "On us"}</span>
											</div>
											<div className={styles.grandTotal}>
												<span>Total</span>
												<strong>{currency.format(subtotal + delivery)}</strong>
											</div>
										</div>
										<form className={styles.checkoutForm} onSubmit={checkout}>
											<span className={styles.kicker}>DELIVER TO</span>
											<input
												required
												placeholder="Full name"
												value={contact.name}
												onChange={(event) => setContact({ ...contact, name: event.target.value })}
											/>
											<input
												required
												type="email"
												placeholder="Email address"
												value={contact.email}
												onChange={(event) => setContact({ ...contact, email: event.target.value })}
											/>
											<input
												required
												type="tel"
												placeholder="Phone number"
												value={contact.phone}
												onChange={(event) => setContact({ ...contact, phone: event.target.value })}
											/>
											<textarea
												required
												placeholder="Full delivery address"
												value={contact.address}
												onChange={(event) => setContact({ ...contact, address: event.target.value })}
											/>
											<button className={styles.checkoutButton} disabled={busy}>
												{busy ? "Placing your order…" : "Place order · Cash on delivery"}
											</button>
											<small>We’ll confirm your order details by email.</small>
										</form>
									</>
								)}
							</>
						)}
					</aside>
				</div>
			)}
		</main>
	);
}
