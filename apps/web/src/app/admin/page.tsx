'use client';
import { useEffect, useState, type FormEvent } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from '@mui/material';
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  Users,
  LogOut,
  Plus,
  Pencil,
  FolderTree,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react';
import { api, ApiError, post } from '@/lib/api';
import { money, label, type Dashboard, type Product, type Status } from '@/lib/types';

const nextStatus: Record<Status, Status | undefined> = {
  PLACED: 'PROCESSING',
  PROCESSING: 'SHIPPED',
  SHIPPED: 'DELIVERED',
  DELIVERED: undefined,
  CANCELLED: undefined,
};
export default function AdminPage() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [tab, setTab] = useState('Overview');
  const [busy, setBusy] = useState(false);
  const [editor, setEditor] = useState<Product | 'new' | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [account, setAccount] = useState({ name: '', email: '', password: '' });
  const [filter, setFilter] = useState('');
  const [confirmCancel, setConfirmCancel] = useState<{ orderId: string; productId: string } | null>(
    null,
  );
  async function refresh() {
    try {
      setData(await api<Dashboard>('/admin/dashboard'));
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) setData(null);
      else setError(err instanceof Error ? err.message : 'Unable to load workspace.');
    } finally {
      setChecking(false);
    }
  }
  useEffect(() => {
    void refresh();
  }, []);
  async function action(fn: () => Promise<unknown>, message: string) {
    if (busy) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await fn();
      setNotice(message);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The change could not be saved.');
    } finally {
      setBusy(false);
    }
  }
  async function login(event: FormEvent) {
    event.preventDefault();
    await action(() => post('/auth/login', { email, password }), 'Signed in to your workspace.');
    setPassword('');
  }
  async function updateOrder(orderId: string, productId: string, status: Status) {
    await action(
      () =>
        api(`/admin/orders/${orderId}`, {
          method: 'PATCH',
          body: JSON.stringify({ productId, status }),
        }),
      'Order item updated.',
    );
  }
  if (checking)
    return (
      <main id="main" className="container page-space">
        <p>Opening your workspace…</p>
      </main>
    );
  if (!data)
    return (
      <main id="main" className="admin-login-wrap">
        <div className="login-intro">
          <div className="eyebrow">BEHIND EVERY GOOD FIND</div>
          <h1>
            A little workspace.
            <br />A lot of possibility.
          </h1>
          <p>
            Products, orders and your team.
            <br />
            All the essentials, in one place.
          </p>
          <ShoppingBag size={80} />
        </div>
        <form onSubmit={login} className="login-form">
          <div className="eyebrow">GUESTKART WORKSPACE</div>
          <h2>Welcome back.</h2>
          <p className="muted">Sign in with your store admin account.</p>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            required
            label="Email address"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            required
            label="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" variant="contained" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in to workspace'}
          </Button>
          <p className="muted">
            Demo credentials are listed in the repository README. Production credentials are
            configured by the store owner.
          </p>
        </form>
      </main>
    );
  const superAdmin = data.admin.role === 'SUPER_ADMIN';
  const nav = [
    { name: 'Overview', icon: LayoutDashboard },
    { name: 'Products', icon: Package },
    { name: 'Orders', icon: ClipboardList },
    ...(superAdmin
      ? [
          { name: 'Categories', icon: FolderTree },
          { name: 'Team', icon: Users },
        ]
      : []),
  ];
  const orders = data.orders.filter((o) =>
    `${o.number} ${o.customer.name} ${o.customer.email}`
      .toLowerCase()
      .includes(filter.toLowerCase()),
  );
  return (
    <main id="main" className="admin-shell">
      <aside className="admin-sidebar">
        <div className="eyebrow">YOUR STORE, SIMPLIFIED</div>
        <h2>
          Workspace<span>.</span>
        </h2>
        <div className="role-label">{label(data.admin.role)}</div>
        <nav aria-label="Workspace navigation">
          {nav.map(({ name, icon: Icon }) => (
            <button
              key={name}
              className={tab === name ? 'active' : ''}
              onClick={() => {
                setTab(name);
                setFilter('');
                setError('');
                setNotice('');
              }}
            >
              <Icon size={19} />
              {name}
            </button>
          ))}
        </nav>
        <div className="admin-profile">
          <b>{data.admin.name}</b>
          <small>{data.admin.email}</small>
          <button
            disabled={busy}
            onClick={() =>
              action(async () => {
                await post('/auth/logout', {});
                setData(null);
              }, 'Signed out.')
            }
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>
      <div className="admin-content">
        <div className="workspace-top">
          <div>
            <div className="eyebrow">LET&apos;S MAKE TODAY A GOOD ONE</div>
            <h1>{tab}</h1>
          </div>
          <Button
            startIcon={<RefreshCw size={16} />}
            disabled={busy}
            onClick={() => void refresh()}
          >
            Refresh
          </Button>
        </div>
        {error && (
          <Alert severity="error" onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        {notice && (
          <Alert severity="success" onClose={() => setNotice('')}>
            {notice}
          </Alert>
        )}
        {tab === 'Overview' && (
          <>
            <div className="stats-grid">
              {[
                { name: 'Orders received', value: data.stats.orders },
                { name: 'Delivered revenue', value: money(data.stats.revenue) },
                { name: 'Guest shoppers', value: data.stats.guests },
                { name: 'Units delivered', value: data.stats.sold },
              ].map((stat) => (
                <div className="stat-card" key={stat.name}>
                  <span>{stat.name}</span>
                  <strong>{stat.value}</strong>
                  <small>{superAdmin ? 'Across your store' : 'Your assigned items'}</small>
                </div>
              ))}
            </div>
            <div className="admin-panels">
              <section className="admin-panel">
                <h2>Latest orders</h2>
                {!data.orders.length ? (
                  <p className="muted">Orders will appear here after a guest checks out.</p>
                ) : (
                  data.orders.slice(0, 6).map((order) => (
                    <div className="dashboard-order" key={order.id}>
                      <div>
                        <b>{order.number}</b>
                        <small>
                          {order.customer.name} ·{' '}
                          {new Date(order.createdAt).toLocaleDateString('en-IN')}
                        </small>
                      </div>
                      <span className={`status ${order.status.toLowerCase()}`}>
                        {label(order.status)}
                      </span>
                      <b>{money(order.currentTotal)}</b>
                    </div>
                  ))
                )}
                <Button onClick={() => setTab('Orders')}>Manage orders</Button>
              </section>
              <section className="admin-panel">
                <h2>Inventory watch</h2>
                <p className="muted">
                  {data.stats.products} products · {data.stats.lowStock} running low
                </p>
                {data.products
                  .filter((p) => p.active && p.stock <= 5)
                  .map((p) => (
                    <div className="stock-line" key={p.id}>
                      <img src={p.image} alt="" />
                      <span>{p.name}</span>
                      <b>{p.stock} left</b>
                    </div>
                  ))}
                {!data.stats.lowStock && <p>Your active products have healthy stock levels.</p>}
                <Button onClick={() => setTab('Products')}>Review inventory</Button>
              </section>
            </div>
            <div className="admin-explainer">
              <b>{superAdmin ? 'You have the full picture.' : 'Your own corner of the store.'}</b>
              <p>
                {superAdmin
                  ? 'Manage product assignments, invite Sub Admins and follow every order. Revenue counts delivered merchandise; delivery fees are excluded.'
                  : 'You see your assigned products and order items. Order totals and revenue reflect your merchandise only; delivery fees are excluded.'}
              </p>
            </div>
          </>
        )}
        {tab === 'Products' && (
          <section className="admin-panel">
            <div className="panel-heading">
              <h2>Product collection</h2>
              <Button
                variant="contained"
                startIcon={<Plus size={17} />}
                onClick={() => setEditor('new')}
              >
                Add product
              </Button>
            </div>
            <TextField
              size="small"
              label="Search inventory"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              fullWidth
            />
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Visibility</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.products
                    .filter((p) => p.name.toLowerCase().includes(filter.toLowerCase()))
                    .map((product) => (
                      <tr key={product.id}>
                        <td>
                          <div className="table-product">
                            <img src={product.image} alt="" />
                            <div>
                              <b>{product.name}</b>
                              <small>
                                {data.categories.find((c) => c.id === product.categoryId)?.name}
                              </small>
                            </div>
                          </div>
                        </td>
                        <td>{money(product.price)}</td>
                        <td>
                          <span className={product.stock <= 5 ? 'low-stock' : ''}>
                            {product.stock}
                          </span>
                        </td>
                        <td>{product.active ? 'Live' : 'Archived'}</td>
                        <td>
                          <Button
                            size="small"
                            startIcon={<Pencil size={14} />}
                            onClick={() => setEditor(product)}
                          >
                            Edit
                          </Button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            {!data.products.length && (
              <p className="empty-state">Add your first product to open your collection.</p>
            )}
          </section>
        )}
        {tab === 'Orders' && (
          <>
            <TextField
              label="Search by order, guest or email"
              fullWidth
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
            {orders.map((order) => (
              <section className="admin-panel order-panel" key={order.id}>
                <div className="panel-heading">
                  <div>
                    <h2>{order.number}</h2>
                    <p className="muted">
                      {new Date(order.createdAt).toLocaleString('en-IN')} ·{' '}
                      {label(order.paymentStatus)} · {money(order.currentTotal)}
                    </p>
                  </div>
                  <span className={`status ${order.status.toLowerCase()}`}>
                    {label(order.status)}
                  </span>
                </div>
                <div className="order-address">
                  <b>{order.customer.name}</b>
                  <p>
                    {order.customer.email} · {order.customer.phone}
                    <br />
                    {order.customer.line1}, {order.customer.city}, {order.customer.state}{' '}
                    {order.customer.postalCode}
                  </p>
                </div>
                {order.items.map((item) => (
                  <div className="fulfillment-line" key={item.productId}>
                    <img src={item.image} alt="" />
                    <div className="fulfillment-name">
                      <b>{item.name}</b>
                      <small>
                        Qty {item.quantity} · {money(item.price * item.quantity)} ·{' '}
                        {label(item.status)}
                      </small>
                    </div>
                    <div className="button-row">
                      {nextStatus[item.status] && (
                        <Button
                          size="small"
                          variant="outlined"
                          disabled={busy || ['PENDING', 'CANCELLED'].includes(order.paymentStatus)}
                          onClick={() =>
                            updateOrder(order.id, item.productId, nextStatus[item.status]!)
                          }
                        >
                          Mark {label(nextStatus[item.status]!)}
                        </Button>
                      )}
                      {['PLACED', 'PROCESSING'].includes(item.status) &&
                        order.paymentStatus === 'COD' && (
                          <Button
                            color="error"
                            size="small"
                            disabled={busy}
                            onClick={() =>
                              setConfirmCancel({ orderId: order.id, productId: item.productId })
                            }
                          >
                            Cancel item
                          </Button>
                        )}
                    </div>
                  </div>
                ))}
              </section>
            ))}
            {!orders.length && (
              <div className="empty-state">
                <ClipboardList size={38} />
                <h2>No orders to show.</h2>
                <p>Guest orders will appear here as they arrive.</p>
              </div>
            )}
          </>
        )}
        {tab === 'Categories' && superAdmin && (
          <section className="admin-panel">
            <h2>Make everything easy to find.</h2>
            <form
              className="inline-form"
              onSubmit={(e) => {
                e.preventDefault();
                void action(async () => {
                  await post('/admin/categories', { name: categoryName });
                  setCategoryName('');
                }, 'Category added.');
              }}
            >
              <TextField
                required
                label="New category name"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                inputProps={{ maxLength: 80 }}
              />
              <Button disabled={busy} type="submit" variant="contained">
                Add category
              </Button>
            </form>
            <div className="category-list">
              {data.categories.map((c) => (
                <div key={c.id}>
                  <FolderTree size={20} />
                  <b>{c.name}</b>
                  <span>{data.products.filter((p) => p.categoryId === c.id).length} products</span>
                </div>
              ))}
            </div>
          </section>
        )}
        {tab === 'Team' && superAdmin && (
          <div className="admin-panels">
            <section className="admin-panel">
              <h2>Your store team</h2>
              {data.admins.map((admin) => (
                <div className="team-member" key={admin.id}>
                  <div>
                    <b>{admin.name}</b>
                    <small>
                      {admin.email} · {label(admin.role)}
                    </small>
                    <small>{admin.active ? 'Active' : 'Access disabled'}</small>
                  </div>
                  {admin.role === 'SUB_ADMIN' && (
                    <Button
                      color={admin.active ? 'error' : 'primary'}
                      size="small"
                      disabled={busy}
                      onClick={() =>
                        action(
                          () =>
                            api(`/admin/accounts/${admin.id}`, {
                              method: 'PATCH',
                              body: JSON.stringify({ active: !admin.active }),
                            }),
                          'Team access updated.',
                        )
                      }
                    >
                      {admin.active ? 'Disable' : 'Enable'}
                    </Button>
                  )}
                </div>
              ))}
            </section>
            <form
              className="admin-panel account-form"
              onSubmit={(e) => {
                e.preventDefault();
                void action(async () => {
                  await post('/admin/accounts', account);
                  setAccount({ name: '', email: '', password: '' });
                }, 'Sub Admin account created. Assign products in the product editor.');
              }}
            >
              <h2>Add a Sub Admin</h2>
              <p className="muted">
                Share credentials privately, then assign products from the product editor.
              </p>
              <TextField
                required
                label="Full name"
                value={account.name}
                onChange={(e) => setAccount({ ...account, name: e.target.value })}
              />
              <TextField
                required
                label="Email"
                type="email"
                value={account.email}
                onChange={(e) => setAccount({ ...account, email: e.target.value })}
              />
              <TextField
                required
                label="Password (12+ characters)"
                type="password"
                inputProps={{ minLength: 12, maxLength: 128 }}
                autoComplete="new-password"
                value={account.password}
                onChange={(e) => setAccount({ ...account, password: e.target.value })}
              />
              <Button variant="contained" disabled={busy} type="submit">
                Create Sub Admin
              </Button>
            </form>
          </div>
        )}
      </div>
      <ProductEditor
        key={typeof editor === 'object' && editor ? editor.id : String(editor)}
        product={editor}
        data={data}
        close={() => setEditor(null)}
        save={async (values, id) => {
          setBusy(true);
          setError('');
          try {
            await api(id ? `/admin/products/${id}` : '/admin/products', {
              method: id ? 'PUT' : 'POST',
              body: JSON.stringify(values),
            });
            await refresh();
            setEditor(null);
            setNotice('Product saved.');
          } finally {
            setBusy(false);
          }
        }}
      />
      <Dialog open={Boolean(confirmCancel)} onClose={() => setConfirmCancel(null)}>
        <DialogTitle>Cancel this item?</DialogTitle>
        <DialogContent>
          The item will be cancelled and its stock returned to inventory. This cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmCancel(null)}>Keep item</Button>
          <Button
            color="error"
            onClick={() => {
              if (confirmCancel)
                void updateOrder(confirmCancel.orderId, confirmCancel.productId, 'CANCELLED');
              setConfirmCancel(null);
            }}
          >
            Cancel item
          </Button>
        </DialogActions>
      </Dialog>
    </main>
  );
}

function ProductEditor({
  product,
  data,
  close,
  save,
}: {
  product: Product | 'new' | null;
  data: Dashboard;
  close: () => void;
  save: (values: unknown, id?: string) => Promise<void>;
}) {
  const existing = product && product !== 'new' ? product : null;
  const [form, setForm] = useState({
    name: existing?.name ?? '',
    description: existing?.description ?? '',
    price: existing ? String(existing.price / 100) : '',
    compareAtPrice: existing?.compareAtPrice ? String(existing.compareAtPrice / 100) : '',
    stock: String(existing?.stock ?? 0),
    categoryId: existing?.categoryId ?? data.categories[0]?.id ?? '',
    ownerId: existing?.ownerId ?? data.admin.id,
    image: existing?.image ?? '',
    accent: existing?.accent ?? 'sage',
    featured: existing?.featured ?? false,
    active: existing?.active ?? true,
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (key: string, value: string | boolean) =>
    setForm((current) => ({ ...current, [key]: value }));
  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await save(
        {
          ...form,
          price: Math.round(Number(form.price) * 100),
          compareAtPrice: form.compareAtPrice
            ? Math.round(Number(form.compareAtPrice) * 100)
            : null,
          stock: Number(form.stock),
        },
        existing?.id,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save this product.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog open={Boolean(product)} onClose={busy ? undefined : close} maxWidth="sm" fullWidth>
      <form onSubmit={submit}>
        <DialogTitle>{existing ? 'Edit your good find' : 'Add a good find'}</DialogTitle>
        <DialogContent>
          <div className="product-edit-form">
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
              required
              label="Product name"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              inputProps={{ maxLength: 120 }}
            />
            <TextField
              required
              multiline
              rows={3}
              label="Description"
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              inputProps={{ maxLength: 2000 }}
            />
            <div className="form-grid">
              <TextField
                required
                type="number"
                label="Price (₹)"
                value={form.price}
                onChange={(e) => set('price', e.target.value)}
                inputProps={{ min: 1, max: 1000000, step: '0.01' }}
              />
              <TextField
                type="number"
                label="Compare price (₹, optional)"
                value={form.compareAtPrice}
                onChange={(e) => set('compareAtPrice', e.target.value)}
                inputProps={{ min: 1, max: 1000000, step: '0.01' }}
              />
              <TextField
                required
                type="number"
                label="Available stock"
                value={form.stock}
                onChange={(e) => set('stock', e.target.value)}
                inputProps={{ min: 0, max: 100000, step: 1 }}
              />
              <TextField
                select
                required
                label="Category"
                value={form.categoryId}
                onChange={(e) => set('categoryId', e.target.value)}
              >
                {data.categories.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
              </TextField>
            </div>
            <TextField
              required
              type="url"
              label="Image URL (HTTPS)"
              value={form.image}
              onChange={(e) => set('image', e.target.value)}
            />
            {data.admin.role === 'SUPER_ADMIN' && (
              <TextField
                select
                required
                label="Assigned owner"
                value={form.ownerId}
                onChange={(e) => set('ownerId', e.target.value)}
              >
                {data.admins
                  .filter((a) => a.active)
                  .map((a) => (
                    <MenuItem key={a.id} value={a.id}>
                      {a.name}
                    </MenuItem>
                  ))}
              </TextField>
            )}
            <TextField
              select
              label="Card background"
              value={form.accent}
              onChange={(e) => set('accent', e.target.value)}
            >
              {['sage', 'peach', 'blue', 'lilac', 'sand'].map((c) => (
                <MenuItem key={c} value={c}>
                  {label(c)}
                </MenuItem>
              ))}
            </TextField>
            <label className="terms-check">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => set('featured', e.target.checked)}
              />
              Featured product
            </label>
            <label className="terms-check">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => set('active', e.target.checked)}
              />
              Visible in storefront (uncheck to archive)
            </label>
            <p className="muted">
              Changing the owner affects future orders. Existing order items keep their original
              assignment.
            </p>
          </div>
        </DialogContent>
        <DialogActions>
          <Button disabled={busy} onClick={close}>
            Cancel
          </Button>
          <Button disabled={busy} variant="contained" type="submit">
            {busy ? 'Saving…' : 'Save product'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
