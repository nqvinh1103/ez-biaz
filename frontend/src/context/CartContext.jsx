import { useCallback, useMemo, useState } from "react";
import { CartContext } from "./cartContextObject";

const SHIPPING_FEE = 5.99;

/**
 * Provides cart state (items, add, remove, totals) to the subtree.
 *
 * @param {{ children: React.ReactNode, initialItems?: CartItem[] }} props
 */
export function CartProvider({ children, initialItems = [] }) {
  const [items, setItems] = useState(initialItems);

  const addItem = useCallback((item) => {
    setItems((prev) =>
      prev.some((i) => i.id === item.id) ? prev : [...prev, item],
    );
  }, []);

  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price, 0),
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      clearCart,
      subtotal,
      shippingFee: SHIPPING_FEE,
      total: subtotal + SHIPPING_FEE,
      count: items.length,
    }),
    [items, addItem, removeItem, clearCart, subtotal],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
