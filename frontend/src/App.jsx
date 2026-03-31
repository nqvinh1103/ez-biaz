import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import RequireAuth from "./components/layout/RequireAuth";
import LoginModal from "./components/modals/LoginModal";
import RegisterModal from "./components/modals/RegisterModal";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { LoginModalProvider, useLoginModal } from "./context/LoginModalContext";
import { ToastProvider } from "./context/ToastContext";

/* ─── Lazy-loaded page bundles ────────────────────────────────────────────── */
const LandingPage = lazy(() => import("./pages/LandingPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const FandomsPage = lazy(() => import("./pages/FandomsPage"));
const AuctionPage = lazy(() => import("./pages/AuctionPage"));
const AuctionDetailPage = lazy(() => import("./pages/AuctionDetailPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const SellPage = lazy(() => import("./pages/SellPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const MyListingsPage = lazy(() => import("./pages/MyListingsPage"));
const MyShopPage = lazy(() => import("./pages/MyShopPage"));
const OrderHistoryPage = lazy(() => import("./pages/OrderHistoryPage"));
const SellerOrdersPage = lazy(() => import("./pages/SellerOrdersPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const CreateAuctionPage = lazy(() => import("./pages/CreateAuctionPage"));
const MyAuctionsPage = lazy(() => import("./pages/MyAuctionsPage"));
const WonAuctionsPage = lazy(() => import("./pages/WonAuctionsPage"));
const MyReviewsPage = lazy(() => import("./pages/MyReviewsPage"));
const ProductDetailPage = lazy(() => import("./pages/ProductDetailPage"));
const SubscriptionPage = lazy(() => import("./pages/SubscriptionPage"));

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#e6e6e6] border-t-[#ad93e6]" />
    </div>
  );
}

/* ─── Global auth modals connected to LoginModalContext ─────────────────── */
function GlobalAuthModals() {
  const {
    loginOpen,
    openLoginModal,
    closeLoginModal,
    registerOpen,
    openRegisterModal,
    closeRegisterModal,
  } = useLoginModal();

  return (
    <>
      <LoginModal
        isOpen={loginOpen}
        onClose={closeLoginModal}
        onOpenRegister={openRegisterModal}
      />
      <RegisterModal
        isOpen={registerOpen}
        onClose={closeRegisterModal}
        onOpenLogin={openLoginModal}
      />
    </>
  );
}

/* ─── Root ────────────────────────────────────────────────────────────────── */
function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <LoginModalProvider>
          <AuthProvider>
            <CartProvider initialItems={[]}>
              <GlobalAuthModals />
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Public */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/fandoms" element={<FandomsPage />} />
                  <Route path="/auction" element={<AuctionPage />} />
                  <Route path="/auction/:id" element={<AuctionDetailPage />} />
                  <Route path="/product/:id" element={<ProductDetailPage />} />
                  <Route path="/contact" element={<ContactPage />} />

                  {/* Protected */}
                  <Route
                    path="/profile"
                    element={
                      <RequireAuth>
                        <ProfilePage />
                      </RequireAuth>
                    }
                  >
                    <Route path="my-shop" element={<MyShopPage />} />
                    <Route
                      path="order-history"
                      element={<OrderHistoryPage />}
                    />
                    <Route
                      path="create-auction"
                      element={<CreateAuctionPage />}
                    />
                    <Route path="my-auctions" element={<MyAuctionsPage />} />
                    <Route path="won-auctions" element={<WonAuctionsPage />} />
                    <Route path="my-reviews" element={<MyReviewsPage />} />
                  </Route>
                  <Route
                    path="/sell"
                    element={
                      <RequireAuth>
                        <SellPage />
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/checkout"
                    element={
                      <RequireAuth>
                        <CheckoutPage />
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/my-shop"
                    element={
                      <RequireAuth>
                        <MyShopPage />
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/order-history"
                    element={
                      <RequireAuth>
                        <OrderHistoryPage />
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/create-auction"
                    element={
                      <RequireAuth>
                        <CreateAuctionPage />
                      </RequireAuth>
                    }
                  />
                  <Route path="/subscription" element={<SubscriptionPage />} />
                </Routes>
              </Suspense>
            </CartProvider>
          </AuthProvider>
        </LoginModalProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
