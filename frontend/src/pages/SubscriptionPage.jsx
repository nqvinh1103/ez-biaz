import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "../components/layout/PageLayout";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../hooks/useAuth";
import { subscribe } from "../lib/api/subscriptions";

/* ── Plan definitions ─────────────────────────────────────────────────── */
const PLANS = [
  {
    id: "free",
    name: "Free",
    price: { monthly: 0, yearly: 0 },
    badge: null,
    description: "Perfect for getting started and casual selling.",
    color: "default",
    features: [
      { text: "Up to 15 listings", included: true },
      { text: "Basic product page", included: true },
      { text: "Community access", included: true },
      { text: "Priority listing boost", included: false },
      { text: "Analytics dashboard", included: false },
      { text: "Unlimited listings", included: false },
    ],
    cta: "Current Plan",
    ctaDisabled: true,
  },
  {
    id: "boost",
    name: "Boost",
    price: { monthly: 2.99, yearly: 1.99 },
    priceUnit: "/ day",
    badge: "Quick Boost",
    description: "Push your listings to the top for one full day.",
    color: "purple",
    features: [
      { text: "Up to 15 listings", included: true },
      { text: "Basic product page", included: true },
      { text: "Community access", included: true },
      { text: "Priority listing boost (1 day)", included: true },
      { text: "Analytics dashboard", included: false },
      { text: "Unlimited listings", included: false },
    ],
    cta: "Get Boost",
    ctaDisabled: false,
  },
  {
    id: "premium",
    name: "Premium",
    price: { monthly: 14.99, yearly: 9.99 },
    priceUnit: "/ month",
    badge: "Most Popular",
    description: "Everything you need to sell like a pro every month.",
    color: "gradient",
    features: [
      { text: "Up to 100 listings / month", included: true },
      { text: "Basic product page", included: true },
      { text: "Community access", included: true },
      { text: "Always priority boosted", included: true },
      { text: "Analytics dashboard", included: true },
      { text: "Early access to new features", included: true },
    ],
    cta: "Go Premium",
    ctaDisabled: false,
  },
];

/* ── Helper components ────────────────────────────────────────────────── */
function CheckIcon({ included }) {
  return included ? (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[rgba(173,147,230,0.15)]">
      <svg
        className="h-3 w-3 text-[#7c3aed]"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m4.5 12.75 6 6 9-13.5"
        />
      </svg>
    </span>
  ) : (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#f4f3f7]">
      <svg
        className="h-3 w-3 text-[#d4d4d4]"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6 18 18 6M6 6l12 12"
        />
      </svg>
    </span>
  );
}

function PlanCard({ plan, billing, onSelect, loading }) {
  const isGradient = plan.color === "gradient";
  const isPurple = plan.color === "purple";

  const cardCls = isGradient
    ? "relative flex flex-col rounded-2xl bg-gradient-to-b from-[#6d28d9] to-[#4e1fa8] p-px shadow-xl shadow-[rgba(109,40,217,0.25)] scale-[1.03]"
    : "relative flex flex-col rounded-2xl border border-[#e6e6e6] bg-white shadow-sm";

  const innerCls = isGradient
    ? "flex flex-1 flex-col rounded-[15px] bg-[#1e0a4a] p-6 sm:p-8"
    : "flex flex-1 flex-col p-6 sm:p-8";

  const titleCls = isGradient ? "text-white" : "text-[#121212]";
  const priceCls = isGradient ? "text-white" : "text-[#121212]";
  const unitCls = isGradient ? "text-[#c4b5fd]" : "text-[#737373]";
  const descCls = isGradient ? "text-[#c4b5fd]" : "text-[#737373]";
  const featureCls = (inc) =>
    isGradient
      ? inc
        ? "text-[#e9d5ff]"
        : "text-[#6b5b8a] line-through"
      : inc
        ? "text-[#121212]"
        : "text-[#b3b3b3] line-through";

  const price = billing === "yearly" ? plan.price.yearly : plan.price.monthly;

  const btnCls = isGradient
    ? "mt-auto w-full rounded-full bg-white py-3 text-sm font-semibold text-[#6d28d9] transition hover:bg-[#f3f0ff] disabled:opacity-50 disabled:cursor-not-allowed"
    : isPurple
      ? "mt-auto w-full rounded-full bg-[#ad93e6] py-3 text-sm font-semibold text-white transition hover:bg-[#9d7ed9] disabled:opacity-50 disabled:cursor-not-allowed"
      : "mt-auto w-full rounded-full border border-[#e6e6e6] bg-[#f4f3f7] py-3 text-sm font-semibold text-[#737373] cursor-default";

  return (
    <div className={cardCls}>
      {/* Popular badge */}
      {plan.badge && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
              isGradient
                ? "bg-[#f59e0b] text-white"
                : "bg-[rgba(173,147,230,0.15)] text-[#7c3aed] border border-[#d4c6f5]"
            }`}
          >
            {plan.badge}
          </span>
        </div>
      )}

      <div className={innerCls}>
        {/* Plan name */}
        <h3 className={`text-lg font-bold ${titleCls}`}>{plan.name}</h3>
        <p className={`mt-1 text-sm ${descCls}`}>{plan.description}</p>

        {/* Price */}
        <div className="mt-6 flex items-end gap-1">
          {price === 0 ? (
            <span className={`text-4xl font-extrabold ${priceCls}`}>Free</span>
          ) : (
            <>
              <span className={`text-4xl font-extrabold ${priceCls}`}>
                ${price.toFixed(2)}
              </span>
              <span className={`mb-1 text-sm ${unitCls}`}>
                {plan.priceUnit}
              </span>
            </>
          )}
        </div>
        {billing === "yearly" && price > 0 && (
          <p className="mt-1 text-xs text-[#10b981] font-medium">
            Save ${((plan.price.monthly - plan.price.yearly) * 12).toFixed(2)} /
            year
          </p>
        )}

        {/* Divider */}
        <div
          className={`my-6 border-t ${isGradient ? "border-[#3d1d80]" : "border-[#f0edf7]"}`}
        />

        {/* Features */}
        <ul className="flex flex-col gap-3 mb-3">
          {plan.features.map((f) => (
            <li key={f.text} className="flex items-center gap-3">
              <CheckIcon included={f.included} />
              <span className={`text-sm ${featureCls(f.included)}`}>
                {f.text}
              </span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <button
          className={`mt-8 ${btnCls}`}
          disabled={plan.ctaDisabled || loading === plan.id}
          onClick={() => !plan.ctaDisabled && onSelect(plan.id)}
        >
          {loading === plan.id ? "Processing…" : plan.cta}
        </button>
      </div>
    </div>
  );
}

/* ── FAQ ──────────────────────────────────────────────────────────────── */
const FAQS = [
  {
    q: "Can I cancel anytime?",
    a: "Yes. Premium subscriptions can be cancelled at any time with no penalty. You'll keep access until the end of the billing period.",
  },
  {
    q: "How does Boost work?",
    a: "Boost is purchased per listing. Go to My Listings, choose an item, then buy a 24h boost for that item.",
  },
  {
    q: "What happens when I hit the listing limit?",
    a: "On Free you can have up to 15 active listings. On Premium, up to 100 per month. Old listings are archived (not deleted) when you exceed the cap.",
  },
  {
    q: "Is payment secure?",
    a: "All payments are processed via our secure payment gateway. We never store your card details.",
  },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <li className="border-b border-[#f0edf7] last:border-0">
      <button
        className="flex w-full items-center justify-between gap-4 py-4 text-left text-sm font-semibold text-[#121212] hover:text-[#7c3aed] transition-colors"
        onClick={() => setOpen((p) => !p)}
      >
        {q}
        <svg
          className={`h-4 w-4 shrink-0 text-[#ad93e6] transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m19 9-7 7-7-7"
          />
        </svg>
      </button>
      {open && (
        <p className="pb-4 text-sm text-[#737373] leading-relaxed">{a}</p>
      )}
    </li>
  );
}

/* ── Page ─────────────────────────────────────────────────────────────── */
export default function SubscriptionPage() {
  const { isLoggedIn } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [billing, setBilling] = useState("monthly"); // "monthly" | "yearly"
  const [loading, setLoading] = useState(null); // planId being subscribed

  async function handleSelect(planId) {
    if (!isLoggedIn) {
      showToast("Please sign in to subscribe.", "error");
      return;
    }

    if (planId === "boost") {
      showToast("Choose a listing to boost in My Listings.", "success");
      navigate("/profile/my-shop?tab=listings");
      return;
    }

    setLoading(planId);
    try {
      const res = await subscribe(planId);
      if (res.success) {
        const payUrl = res.data?.payUrl;
        if (payUrl) {
          window.location.href = payUrl;
          return;
        }
        showToast("Missing VNPay payUrl.", "error");
      } else {
        showToast(res.message ?? "Subscription failed. Please try again.", "error");
      }
    } catch {
      showToast("Something went wrong. Please try again.", "error");
    } finally {
      setLoading(null);
    }
  }

  return (
    <PageLayout>
      {/* ── Hero ── */}
      <section className="bg-gradient-to-b from-[#f4f3f7] to-white px-4 pb-0 pt-14 text-center md:pt-20">
        <div className="mx-auto max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#d4c6f5] bg-[rgba(173,147,230,0.1)] px-3 py-1 text-xs font-semibold text-[#7c3aed]">
            <svg
              className="h-3.5 w-3.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Simple, transparent pricing
          </span>
          <h1 className="mt-4 text-3xl font-extrabold text-[#121212] sm:text-4xl md:text-5xl">
            Sell smarter with the{" "}
            <span className="bg-gradient-to-r from-[#7c3aed] to-[#ad93e6] bg-clip-text text-transparent">
              right plan
            </span>
          </h1>
          <p className="mt-4 text-[#737373] sm:text-lg">
            Start free. Upgrade when you're ready to grow. No hidden fees.
          </p>

          {/* Billing toggle */}
          <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-[#e6e6e6] bg-white p-1 shadow-sm">
            <button
              onClick={() => setBilling("monthly")}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                billing === "monthly"
                  ? "bg-[#7c3aed] text-white shadow"
                  : "text-[#737373] hover:text-[#121212]"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling("yearly")}
              className={`flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                billing === "yearly"
                  ? "bg-[#7c3aed] text-white shadow"
                  : "text-[#737373] hover:text-[#121212]"
              }`}
            >
              Yearly
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  billing === "yearly"
                    ? "bg-white text-[#7c3aed]"
                    : "bg-[#f0fdf4] text-[#166534]"
                }`}
              >
                −33%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* ── Plan cards ── */}
      <section className="px-4 py-14 md:px-6 lg:px-16">
        <div className="mx-auto grid max-w-5xl grid-cols-1 items-start gap-6 pt-4 md:grid-cols-3">
          {PLANS.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              billing={billing}
              onSelect={handleSelect}
              loading={loading}
            />
          ))}
        </div>
      </section>

      {/* ── Feature comparison table ── */}
      <section className="px-4 pb-14 md:px-6 lg:px-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-8 text-center text-xl font-bold text-[#121212]">
            Full feature comparison
          </h2>
          <div className="overflow-hidden rounded-2xl border border-[#e6e6e6]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e6e6e6] bg-[#f4f3f7]">
                  <th className="px-5 py-3.5 text-left font-semibold text-[#737373]">
                    Feature
                  </th>
                  {PLANS.map((p) => (
                    <th
                      key={p.id}
                      className={`px-4 py-3.5 text-center font-bold ${
                        p.color === "gradient"
                          ? "text-[#7c3aed]"
                          : "text-[#121212]"
                      }`}
                    >
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "Listing limit", vals: ["15", "15", "100 / month"] },
                  { label: "Priority boost", vals: [false, "1 day", "Always"] },
                  { label: "Analytics dashboard", vals: [false, false, true] },
                  {
                    label: "Early access features",
                    vals: [false, false, true],
                  },
                  { label: "Community access", vals: [true, true, true] },
                  { label: "Billing", vals: ["—", "Per use", "Monthly"] },
                ].map((row, i) => (
                  <tr
                    key={row.label}
                    className={i % 2 === 0 ? "bg-white" : "bg-[#faf9fc]"}
                  >
                    <td className="px-5 py-3.5 font-medium text-[#121212]">
                      {row.label}
                    </td>
                    {row.vals.map((v, j) => (
                      <td key={j} className="px-4 py-3.5 text-center">
                        {typeof v === "boolean" ? (
                          v ? (
                            <svg
                              className="mx-auto h-4 w-4 text-[#7c3aed]"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m4.5 12.75 6 6 9-13.5"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="mx-auto h-4 w-4 text-[#d4d4d4]"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 18 18 6M6 6l12 12"
                              />
                            </svg>
                          )
                        ) : (
                          <span
                            className={`font-medium ${j === 2 ? "text-[#7c3aed]" : "text-[#737373]"}`}
                          >
                            {v}
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-[#f4f3f7] px-4 py-14 md:px-6 lg:px-16">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-8 text-center text-xl font-bold text-[#121212]">
            Frequently asked questions
          </h2>
          <ul className="rounded-2xl border border-[#e6e6e6] bg-white px-6">
            {FAQS.map((faq) => (
              <FaqItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </ul>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="px-4 py-16 text-center">
        <div className="mx-auto max-w-lg">
          <h2 className="text-2xl font-bold text-[#121212]">
            Ready to take your K-pop store to the next level?
          </h2>
          <p className="mt-3 text-sm text-[#737373]">
            Join thousands of fans already selling on EzBias.
          </p>
          <button
            onClick={() => handleSelect("premium")}
            className="mt-6 rounded-full bg-gradient-to-r from-[#7c3aed] to-[#ad93e6] px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[rgba(124,58,237,0.3)] transition hover:opacity-90"
          >
            Start with Premium →
          </button>
        </div>
      </section>
    </PageLayout>
  );
}
