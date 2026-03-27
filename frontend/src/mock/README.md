# EzBias Mock API — Usage Guide

## Files

| File | Purpose |
|------|---------|
| `src/mock/mockData.js` | Static in-memory DB (users, products, auctions, orders, carts) |
| `src/mock/mockApi.js` | All API functions with fake delay + error simulation |
| `src/hooks/useApi.js` | Generic hook for any API call |
| `src/hooks/useAuth.js` | Login / register / logout with localStorage persistence |
| `src/hooks/useProducts.js` | Products list with filter support |

---

## Quick Examples

### 1 — Login (LoginModal.jsx)

```jsx
import { useAuth } from "../hooks/useAuth";

function LoginModal() {
  const { login, loading, error } = useAuth();
  const { values, handleChange } = useForm({ email: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await login(values.email, values.password);
    if (res.success) navigate("/");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="email"    onChange={handleChange} value={values.email} />
      <input name="password" onChange={handleChange} value={values.password} type="password" />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button disabled={loading}>{loading ? "Logging in…" : "Log In"}</button>
    </form>
  );
}
```

---

### 2 — Products list with fandom filter (FandomsPage.jsx)

```jsx
import { useProducts } from "../hooks/useProducts";

function FandomsPage() {
  const [fandom, setFandom] = useState("BTS");
  const { products, loading, error } = useProducts({ fandom, inStockOnly: true });

  if (loading) return <Spinner />;
  if (error)   return <p className="text-red-500">{error}</p>;

  return (
    <div className="grid grid-cols-4 gap-4">
      {products.map((p) => (
        <ProductCard key={p.id} {...p} />
      ))}
    </div>
  );
}
```

---

### 3 — Add to cart (ProductCard.jsx)

```jsx
import { useApi } from "../hooks/useApi";
import { addToCart } from "../mock/mockApi";
import { useAuth } from "../hooks/useAuth";

function ProductCard({ id, name, price, image }) {
  const { user } = useAuth();
  const { loading, error, execute } = useApi(addToCart);

  const handleAdd = async () => {
    if (!user) { alert("Please log in first."); return; }
    const res = await execute(user.id, id);
    if (res.success) alert(res.message);
    else             alert(res.message);
  };

  return (
    <div>
      <img src={image} alt={name} />
      <p>{name} — ${price}</p>
      {error && <p className="text-red-500 text-xs">{error}</p>}
      <button onClick={handleAdd} disabled={loading}>
        {loading ? "Adding…" : "Add to Cart"}
      </button>
    </div>
  );
}
```

---

### 4 — Checkout (CheckoutPage.jsx)

```jsx
import { checkout } from "../mock/mockApi";
import { useApi } from "../hooks/useApi";
import { useAuth } from "../hooks/useAuth";

function CheckoutPage() {
  const { user } = useAuth();
  const { loading, error, execute } = useApi(checkout);
  const { values } = useForm(INITIAL_SHIPPING);
  const [payment, setPayment] = useState("");

  const handlePlace = async () => {
    const res = await execute(user.id, values, payment);
    if (res.success) {
      alert(res.message);
      navigate("/");
    }
  };

  return (
    <>
      {/* ...form fields... */}
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button onClick={handlePlace} disabled={loading}>
        {loading ? "Placing order…" : "Place Order"}
      </button>
    </>
  );
}
```

---

### 5 — Place a bid (AuctionDetailPage.jsx)

```jsx
import { placeBid } from "../mock/mockApi";
import { useApi } from "../hooks/useApi";
import { useAuth } from "../hooks/useAuth";

function AuctionDetailPage() {
  const { user } = useAuth();
  const { loading, error, execute } = useApi(placeBid);
  const [bidInput, setBidInput] = useState("315.00");

  const handleBid = async () => {
    if (!user) { alert("Please log in to bid."); return; }
    const res = await execute(user.id, "a7", parseFloat(bidInput));
    if (res.success) alert(res.message);
  };

  return (
    <>
      <input value={bidInput} onChange={(e) => setBidInput(e.target.value)} />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button onClick={handleBid} disabled={loading}>
        {loading ? "Placing bid…" : "Place Bid"}
      </button>
    </>
  );
}
```

---

## Swap for Real Backend

Replace any mock API function with a real `fetch()` call — the hook layer stays 100 % identical:

```js
// Before (mock)
export async function getProducts(filters) {
  await delay();
  return ok(_products.filter(...));
}

// After (real)
export async function getProducts(filters) {
  const params = new URLSearchParams(filters).toString();
  const res = await fetch(`/api/products?${params}`);
  return res.json(); // must return { success, data, message }
}
```
