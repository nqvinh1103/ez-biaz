import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import * as api from "../lib/ezbiasApi";
import { CartContext } from "./cartContextObject";

const SHIPPING_FEE = 0;

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

  function getGuestId() {
    const key = "ezbias_guestId";
    let id = localStorage.getItem(key);
    if (!id) {
      id = `g_${crypto.randomUUID()}`;
      localStorage.setItem(key, id);
    }
    return id;
  }

  const [guestId] = useState(() =>
    typeof window !== "undefined" ? getGuestId() : "",
  );

  const ownerId = user?.id ?? guestId;

  const reloadFor = useCallback(async (owner) => {
    if (!owner) return;
    const res = await api.getCart(owner);
    if (res.success) setItems(mapServerCart(res.data));
  }, []);

  const reload = useCallback(async () => {
    await reloadFor(ownerId);
  }, [reloadFor, ownerId]);

  // When auth changes, reload cart. If logging in, merge guest cart into user cart.
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!ownerId) return;

      // merge guest → user on login
      if (user?.id && guestId) {
        const guestRes = await api.getCart(guestId);
        if (
          guestRes.success &&
          Array.isArray(guestRes.data) &&
          guestRes.data.length > 0
        ) {
          for (const item of guestRes.data) {
            await api.addToCart(user.id, item.productId, item.qty);
          }
          await api.clearCart(guestId);
        }
      }

      if (!mounted) return;
      await reloadFor(ownerId);
    })();

    return () => {
      mounted = false;
    };
  }, [user?.id, ownerId, guestId, reloadFor]);

  const addItem = useCallback(
    async (item) => {
      const id = item.id ?? item.productId;
      const qty = item.qty ?? 1;

      const res = await api.addToCart(ownerId, id, qty);
      if (res.success) await reload();
      return res;
    },
    [ownerId, reload],
  );

  const updateQty = useCallback(
    async (id, qty) => {
      const res = await api.updateCartQty(ownerId, id, qty);
      if (res.success) await reload();
      return res;
    },
    [ownerId, reload],
  );

  const removeItem = useCallback(
    async (id) => {
      const res = await api.removeFromCart(ownerId, id);
      if (res.success) await reload();
      return res;
    },
    [ownerId, reload],
  );

  const clearCart = useCallback(async () => {
    const res = await api.clearCart(ownerId);
    if (res.success) setItems([]);
    return res;
  }, [ownerId]);

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
