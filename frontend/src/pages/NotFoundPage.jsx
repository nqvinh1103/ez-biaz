import { Link } from "react-router-dom";
import PageLayout from "../components/layout/PageLayout";

function NotFoundPage() {
  return (
    <PageLayout>
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-4 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(173,147,230,0.12)]">
          <svg
            className="h-8 w-8 text-[#ad93e6]"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-[#121212]">Page not found</h1>
        <p className="text-sm text-[#737373]">
          We couldn&apos;t find that page. It may have moved or never existed.
        </p>
        <Link
          to="/"
          className="mt-2 inline-flex h-10 items-center justify-center rounded-lg bg-[#ad93e6] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#9d7ed9]"
        >
          Back to Home
        </Link>
      </div>
    </PageLayout>
  );
}

export default NotFoundPage;
