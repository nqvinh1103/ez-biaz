import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { DEFAULT_CART_ITEMS } from "./data/checkoutData";

/* ─── Lazy-loaded page bundles ────────────────────────────────────────────── */
const LandingPage       = lazy(() => import("./pages/LandingPage"));
const AboutPage         = lazy(() => import("./pages/AboutPage"));
const FandomsPage       = lazy(() => import("./pages/FandomsPage"));
const AuctionPage       = lazy(() => import("./pages/AuctionPage"));
const AuctionDetailPage = lazy(() => import("./pages/AuctionDetailPage"));
const ContactPage       = lazy(() => import("./pages/ContactPage"));
const SellPage          = lazy(() => import("./pages/SellPage"));
const CheckoutPage      = lazy(() => import("./pages/CheckoutPage"));
const MyListingsPage    = lazy(() => import("./pages/MyListingsPage"));
const OrderHistoryPage  = lazy(() => import("./pages/OrderHistoryPage"));

/* ─── Full-screen spinner shown while a page chunk loads ─────────────────── */
function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#e6e6e6] border-t-[#ad93e6]" />
    </div>
  );
}

/* ─── Root ────────────────────────────────────────────────────────────────── */
function App() {
  return (
    <BrowserRouter>
      {/*
       * CartProvider wraps the whole tree so any page/component can access
       * cart state via useCart() without prop drilling.
       * In production, initialItems should be hydrated from localStorage or an API.
       */}
      <AuthProvider>
      <CartProvider initialItems={[]}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/"            element={<LandingPage />} />
            <Route path="/about"       element={<AboutPage />} />
            <Route path="/fandoms"     element={<FandomsPage />} />
            <Route path="/auction"     element={<AuctionPage />} />
            <Route path="/auction/:id" element={<AuctionDetailPage />} />
            <Route path="/contact"     element={<ContactPage />} />
            <Route path="/sell"        element={<SellPage />} />
            <Route path="/checkout"    element={<CheckoutPage />} />
            <Route path="/my-listings"    element={<MyListingsPage />} />
            <Route path="/order-history"  element={<OrderHistoryPage />} />
          </Routes>
        </Suspense>
      </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
