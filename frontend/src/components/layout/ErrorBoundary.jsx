import { Component } from "react";
import { Link } from "react-router-dom";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    if (typeof console !== "undefined") {
      console.error("ErrorBoundary caught:", error, info?.componentStack);
    }
  }

  handleReset = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-6 text-center font-['Inter'] text-[#121212]">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(239,67,67,0.12)]">
          <svg
            className="h-8 w-8 text-[#ef4343]"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
            />
          </svg>
        </div>
        <h1 className="text-xl font-bold">Something went wrong</h1>
        <p className="max-w-md text-sm text-[#737373]">
          We hit an unexpected error while rendering this page. Try reloading,
          or head back home.
        </p>
        {import.meta.env.DEV && error?.message && (
          <pre className="max-w-xl overflow-auto rounded-lg bg-[#fafafa] p-3 text-left text-xs text-[#ef4343]">
            {String(error.message)}
          </pre>
        )}
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-[#ad93e6] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#9d7ed9]"
          >
            Reload
          </button>
          <Link
            to="/"
            onClick={this.handleReset}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-[#e6e6e6] px-5 text-sm font-medium text-[#737373] transition-colors hover:border-[#ad93e6] hover:text-[#ad93e6]"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
