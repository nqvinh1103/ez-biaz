import { useState } from "react";
import { Link } from "react-router-dom";
import OrderSummary from "../components/checkout/OrderSummary";
import PaymentSelector from "../components/checkout/PaymentSelector";
import PageLayout from "../components/layout/PageLayout";
import BackLink from "../components/ui/BackLink";
import Button from "../components/ui/Button";
import FormField from "../components/ui/FormField";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import { useForm } from "../hooks/useForm";
import { checkout } from "../lib/ezbiasApi";

const INITIAL_SHIPPING = {
  fullName: "",
  email: "",
  address: "",
  city: "",
  zip: "",
  phone: "",
};

/* ── Main page ──────────────────────────────────────────────────────────── */
function CheckoutPage() {
  const { user } = useAuth();
  const { items } = useCart();
  const { showToast } = useToast();
  const { values, handleChange } = useForm(INITIAL_SHIPPING);
  const [payment, setPayment] = useState("");
  const [placing, setPlacing] = useState(false);
  const [error,   setError]   = useState(null);

  const itemCount = items.length;
  const isShippingComplete = Object.values(values).every((v) => v.trim());
  const isValid = isShippingComplete && payment && itemCount > 0;

  const handlePlaceOrder = async () => {
    if (!isValid || placing) return;
    if (!user?.id) {
      setError("You must be signed in to place an order.");
      return;
    }
    setPlacing(true);
    setError(null);
    try {
      const res = await checkout(user.id, values, payment, items);
      if (!res.success) {
        setError(res.message);
        return;
      }
      const payUrl = res.data?.payUrl;
      if (payUrl) {
        window.location.href = payUrl;
        return;
      }
      showToast("Payment provider did not return a redirect URL.", "error");
      setError("Unable to start payment. Please try again or pick another method.");
    } catch (err) {
      setError(err.message ?? "Something went wrong. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <PageLayout>
      <div className="mx-auto w-full max-w-[1100px] px-4 py-10 md:py-14">
        <BackLink to="/fandoms" label="Back to Shop" />

        {/* Page title */}
        <div className="mb-8 flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ad93e6]">
            <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
            </svg>
          </span>
          <h1 className="text-2xl font-bold text-[#121212]">Checkout</h1>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          {/* ── Left — Shipping + Payment ──────────────────────────── */}
          <div className="flex-1">
            <section className="mb-8">
              <h2 className="mb-5 text-base font-bold text-[#121212]">Shipping Details</h2>

              <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="Full Name" id="co-name" name="fullName"
                  placeholder="Kim Namjoon" value={values.fullName} onChange={handleChange} />
                <FormField label="Email" id="co-email" name="email" type="email"
                  placeholder="you@example.com" value={values.email} onChange={handleChange} />
              </div>

              <FormField label="Address" id="co-address" name="address"
                placeholder="123 K-Pop Street" value={values.address} onChange={handleChange}
                wrapperClassName="mb-4" />

              <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="City" id="co-city" name="city"
                  placeholder="Hồ Chí Minh" value={values.city} onChange={handleChange} />
                <FormField label="ZIP Code" id="co-zip" name="zip"
                  placeholder="70000" value={values.zip} onChange={handleChange} />
              </div>

              <FormField label="Phone Number" id="co-phone" name="phone" type="tel"
                placeholder="+84 91 234 5678" value={values.phone} onChange={handleChange} />
            </section>

            <section className="mb-8">
              <PaymentSelector value={payment} onChange={setPayment} />
            </section>

            {/* API error */}
            {error && (
              <div className="mb-4 flex items-start gap-2 rounded-lg border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-sm text-[#ef4343]">
                <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                </svg>
                {error}
              </div>
            )}

            {/* Submit */}
            <div className="flex flex-col items-center gap-2">
              <Button size="lg" disabled={!isValid || placing} className="w-full" type="button" onClick={handlePlaceOrder}>
                {placing ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Placing Order…
                  </span>
                ) : "Place Order"}
              </Button>
              {!isValid && !error && (
                <p className="text-xs text-[#737373]">
                  {itemCount === 0 ? (
                    <>
                      Cart is empty.{" "}
                      <Link to="/fandoms" className="font-semibold text-[#ad93e6] underline">
                        Browse shop
                      </Link>{" "}
                      to add items.
                    </>
                  ) : (
                    "Fill in shipping details and select a payment method to continue."
                  )}
                </p>
              )}
            </div>
          </div>

          {/* ── Right — Order Summary ──────────────────────────────── */}
          <OrderSummary />
        </div>
      </div>
    </PageLayout>
  );
}

export default CheckoutPage;
