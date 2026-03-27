import { useCallback, useEffect, useMemo, useState } from "react";
import { CartContext } from "./cartContextObject";
import { useAuth } from "../hooks/useAuth";
import * as api from "../lib/ezbiasApi";

const SHIPPING_FEE = 5.99;

/**
 * Provides cart state (items, add, remove, totals) to the subtree.
 *
 * Notes:
 * - If user is logged in: cart is synced with backend (/api/cart/:userId)
 * - If not logged in: cart stays in-memory (guest)
 */
export function CartProvider({ children, initialItems = [] }) {
  const { user } = useAuth();
  const [items, setItems] = useState(initialItems);

  const mapServerCart = (serverItems) =>
    (serverItems ?? []).map((i) => ({
      id: i.productId,
      name: i.name,
      artist: i.artist,
      fandom: i.fandom,
      price: i.price,
      image: i.image,
      stock: i.stock,
      qty: i.qty,
    }));

  const reload = useCallback(async () => {
    if (!user?.id) return;
    const res = await api.getCart(user.id);
    if (res.success) setItems(mapServerCart(res.data));
  }, [user?.id]);

  // When user changes (login/logout), reload cart
  useEffect(() => {
    if (user?.id) reload();
    else setItems(initialItems);
  }, [user?.id, reload]);

  const addItem = useCallback(
    async (item) => {
      const id = item.id ?? item.productId;
      const qty = item.qty ?? 1;

      if (user?.id) {
        const res = await api.addToCart(user.id, id, qty);
        if (res.success) await reload();
        return res;
      }

      // guest fallback
      setItems((prev) => {
        const existing = prev.find((i) => i.id === id);
        if (existing) return prev.map((i) => (i.id === id ? { ...i, qty: (i.qty ?? 1) + qty } : i));
        return [...prev, { ...item, id, qty }];
      });
      return { success: true, data: { productId: id, qty }, message: "Item added to cart." };
    },
    [user?.id, reload],
  );

  const updateQty = useCallback(
    async (id, qty) => {
      if (user?.id) {
        const res = await api.updateCartQty(user.id, id, qty);
        if (res.success) await reload();
        return res;
      }
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, qty } : i)));
      return { success: true, data: { productId: id, qty }, message: "Cart updated." };
    },
    [user?.id, reload],
  );

  const removeItem = useCallback(
    async (id) => {
      if (user?.id) {
        const res = await api.removeFromCart(user.id, id);
        if (res.success) await reload();
        return res;
      }
      setItems((prev) => prev.filter((item) => item.id !== id));
      return { success: true, data: null, message: "Item removed from cart." };
    },
    [user?.id, reload],
  );

  const clearCart = useCallback(async () => {
    if (user?.id) {
      const res = await api.clearCart(user.id);
      if (res.success) setItems([]);
      return res;
    }
    setItems([]);
    return { success: true, data: null, message: "Cart cleared." };
  }, [user?.id]);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * (item.qty ?? 1), 0),
    [items],
  );

  const count = useMemo(
    () => items.reduce((sum, item) => sum + (item.qty ?? 1), 0),
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      addItem,
      updateQty,
      removeItem,
      clearCart,
      reload,
      subtotal,
      shippingFee: SHIPPING_FEE,
      total: subtotal + SHIPPING_FEE,
      count,
    }),
    [items, addItem, updateQty, removeItem, clearCart, reload, subtotal, count],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
