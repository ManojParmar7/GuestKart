'use client';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { ThemeProvider, createTheme, Snackbar, Alert } from '@mui/material';
import type { CartLine, Product } from '@/lib/types';

const theme = createTheme({
  palette: { primary: { main: '#1769aa' }, secondary: { main: '#f59e0b' } },
  typography: {
    fontFamily: 'Arial, Helvetica, sans-serif',
    button: { textTransform: 'none', fontWeight: 700 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { padding: '11px 22px' } },
    },
  },
});
interface CartContextValue {
  lines: CartLine[];
  hydrated: boolean;
  add: (product: Product) => void;
  quantity: (id: string, value: number) => void;
  clear: () => void;
  notify: (message: string) => void;
}
const CartContext = createContext<CartContextValue | null>(null);
export function Providers({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [message, setMessage] = useState('');
  useEffect(() => {
    try {
      const saved: unknown = JSON.parse(localStorage.getItem('guestkart-cart') ?? '[]');
      if (Array.isArray(saved))
        setLines(
          saved
            .filter((line): line is CartLine =>
              Boolean(
                line &&
                typeof line === 'object' &&
                line.product &&
                typeof line.product.id === 'string' &&
                typeof line.product.name === 'string' &&
                Number.isInteger(line.product.stock) &&
                Number.isSafeInteger(line.product.price) &&
                line.product.price > 0 &&
                Number.isInteger(line.quantity) &&
                line.quantity > 0 &&
                line.quantity <= 20,
              ),
            )
            .slice(0, 40),
        );
    } catch {
      /* An unavailable browser store should not block shopping. */
    }
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (hydrated) {
      try {
        localStorage.setItem('guestkart-cart', JSON.stringify(lines));
      } catch {
        /* Memory cart remains usable. */
      }
    }
  }, [lines, hydrated]);
  const add = (product: Product) => {
    const existing = lines.find((line) => line.product.id === product.id);
    if ((existing?.quantity ?? 0) >= Math.min(20, product.stock)) {
      setMessage('You have reached the available quantity.');
      return;
    }
    if (!existing && lines.length >= 40) {
      setMessage('Your cart can hold up to 40 different products.');
      return;
    }
    setLines((current) => {
      const found = current.find((line) => line.product.id === product.id);
      return found
        ? current.map((line) =>
            line.product.id === product.id
              ? { product, quantity: Math.min(line.quantity + 1, 20, product.stock) }
              : line,
          )
        : [...current, { product, quantity: 1 }];
    });
    setMessage(`${product.name} added to your bag`);
  };
  return (
    <ThemeProvider theme={theme}>
      <CartContext.Provider
        value={{
          lines,
          hydrated,
          add,
          quantity: (id, value) =>
            setLines((current) =>
              current.flatMap((line) =>
                line.product.id !== id
                  ? [line]
                  : value <= 0
                    ? []
                    : [{ ...line, quantity: Math.min(value, 20, line.product.stock) }],
              ),
            ),
          clear: () => setLines([]),
          notify: setMessage,
        }}
      >
        {children}
        <Snackbar
          open={Boolean(message)}
          autoHideDuration={3500}
          onClose={() => setMessage('')}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity="success" variant="filled" onClose={() => setMessage('')}>
            {message}
          </Alert>
        </Snackbar>
      </CartContext.Provider>
    </ThemeProvider>
  );
}
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('Cart provider missing');
  return context;
};
