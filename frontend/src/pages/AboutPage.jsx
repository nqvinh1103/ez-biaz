import { memo } from "react";
import PageLayout from "../components/layout/PageLayout";

/* ─── Feature card data ───────────────────────────────────────────────────── */
const FEATURES = [
  {
    title: "Fan-First",
    description:
      "Built by K-pop fans, for K-pop fans. We understand what makes merch special.",
    icon: (
      <svg
        className="h-7 w-7 text-[#ad93e6]"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
        />
      </svg>
    ),
  },
  {
    title: "100% Authentic",
    description:
      "Every item verified for authenticity. No fakes, no knockoffs — ever.",
    icon: (
      <svg
        className="h-7 w-7 text-[#ad93e6]"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
        />
      </svg>
    ),
  },
  {
    title: "Worldwide Shipping",
    description:
      "We ship to over 50 countries so fans everywhere can get their bias's merch.",
    icon: (
      <svg
        className="h-7 w-7 text-[#ad93e6]"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418"
        />
      </svg>
    ),
  },
];

/* ─── FeatureCard ─────────────────────────────────────────────────────────── */
const FeatureCard = memo(function FeatureCard({ icon, title, description }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-[#e6e6e6] bg-white px-6 py-8 text-center shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(173,147,230,0.1)]">
        {icon}
      </div>
      <h2 className="text-base font-bold text-[#121212]">{title}</h2>
      <p className="text-sm leading-5.5 text-[#737373]">{description}</p>
    </div>
  );
});

/* ─── Page ────────────────────────────────────────────────────────────────── */
function AboutPage() {
  return (
    <PageLayout>
      <div className="mx-auto w-full max-w-350 px-4 py-16">
        {/* Hero copy */}
        <div className="flex flex-col items-center gap-4 text-center">
          <h1 className="text-3xl font-bold text-[#121212] md:text-4xl">
            About EZBias
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-[#737373] md:text-base md:leading-7">
            EZBias is the ultimate marketplace for K-pop merchandise. We connect
            fans worldwide with authentic lightsticks, albums, photocards, and
            rare collectibles from their favorite groups. Whether you&apos;re a
            casual listener or a dedicated stan, EZBias makes it easy to find
            and collect the merch you love.
          </p>
        </div>

        {/* Feature cards */}
        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {FEATURES.map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </div>
      </div>
    </PageLayout>
  );
}

export default AboutPage;
