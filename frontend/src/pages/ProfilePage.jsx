import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import PageLayout from "../components/layout/PageLayout";
import { NestedLayoutContext } from "../context/NestedLayoutContext";
import { useAuth } from "../hooks/useAuth";
import { getMe, updateBankInfo } from "../lib/ezbiasApi";

/* ── Nav items ─────────────────────────────────────────────────────────── */
const NAV_ITEMS = [
  {
    label: "My Account",
    to: "/profile",
    exact: true,
    icon: (
      <svg
        className="h-4 w-4 shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
        />
      </svg>
    ),
  },
  {
    label: "My Shop",
    to: "/profile/my-shop",
    icon: (
      <svg
        className="h-4 w-4 shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016 2.993 2.993 0 0 0 2.25-1.016 3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z"
        />
      </svg>
    ),
  },
  {
    label: "My Orders",
    to: "/profile/order-history",
    icon: (
      <svg
        className="h-4 w-4 shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z"
        />
      </svg>
    ),
  },
  {
    label: "Create Auction",
    to: "/profile/create-auction",
    icon: (
      <svg
        className="h-4 w-4 shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.042 21.672L13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672ZM12 2.25V4.5m5.834.166-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243-1.59-1.59"
        />
      </svg>
    ),
  },
  {
    label: "Upgrade Plan",
    to: "/subscription",
    highlight: true,
    icon: (
      <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ),
  },
];

/* ── Sidebar ───────────────────────────────────────────────────────────── */
function Sidebar({ user, profile, onLogout }) {
  const { pathname } = useLocation();
  const isActive = (to, exact) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(to + "/");

  const displayName = profile?.fullName ?? user.fullName;
  const displayEmail = profile?.email ?? user.email;
  const avatarBg = profile?.avatarBg ?? user.avatarBg ?? "#ad93e6";
  const avatarChar =
    profile?.avatar ?? user.avatar ?? displayName?.[0]?.toUpperCase() ?? "?";

  return (
    <aside className="w-full lg:w-56 lg:shrink-0">
      {/* Avatar card */}
      <div className="mb-2 flex flex-col items-center gap-3 rounded-2xl border border-[#e6e6e6] bg-white px-5 py-6 text-center">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold text-white shadow ring-4 ring-[#ad93e6]/20"
          style={{ backgroundColor: avatarBg }}
        >
          {avatarChar}
        </div>
        <div>
          <p className="text-sm font-bold text-[#121212]">{displayName}</p>
          <p className="mt-0.5 max-w-[160px] truncate text-xs text-[#737373]">
            {displayEmail}
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 rounded-2xl border border-[#e6e6e6] bg-white px-2 py-3">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.to, item.exact);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-[rgba(173,147,230,0.12)] text-[#5b3f9e]"
                  : item.highlight
                    ? "text-[#7c3aed] hover:bg-[rgba(124,58,237,0.06)]"
                    : "text-[#737373] hover:bg-[#f7f6fb] hover:text-[#121212]"
              }`}
            >
              <span className={active ? "text-[#ad93e6]" : ""}>
                {item.icon}
              </span>
              {item.label}
              {active && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#ad93e6]" />
              )}
            </Link>
          );
        })}

        <div className="mx-2 my-1 border-t border-[#f0f0f0]" />
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-[#ef4343] transition-colors hover:bg-[rgba(239,67,67,0.06)]"
        >
          <svg
            className="h-4 w-4 shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"
            />
          </svg>
          Logout
        </button>
      </nav>
    </aside>
  );
}

/* ── Info Row ──────────────────────────────────────────────────────────── */
function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-sm text-[#737373]">{label}</span>
      <span className="text-sm font-medium text-[#121212]">
        {value || <span className="text-[#b3b3b3]">—</span>}
      </span>
    </div>
  );
}

/* ── Bank Form ─────────────────────────────────────────────────────────── */
function BankForm({ profile, onSaved }) {
  const [form, setForm] = useState({
    bankName: profile?.bankName ?? "",
    bankAccountNumber: profile?.bankAccountNumber ?? "",
    bankAccountName: profile?.bankAccountName ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // sync nếu profile load xong sau
  useEffect(() => {
    setForm({
      bankName: profile?.bankName ?? "",
      bankAccountNumber: profile?.bankAccountNumber ?? "",
      bankAccountName: profile?.bankAccountName ?? "",
    });
  }, [profile?.bankName, profile?.bankAccountNumber, profile?.bankAccountName]);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    const res = await updateBankInfo(form);
    setSaving(false);
    if (res.success) {
      setSuccess(true);
      onSaved?.(form);
    } else {
      setError(res.message ?? "Có lỗi xảy ra, vui lòng thử lại.");
    }
  };

  const fields = [
    {
      name: "bankName",
      label: "Bank Name",
      placeholder: "Vietcombank, BIDV, Techcombank...",
    },
    {
      name: "bankAccountNumber",
      label: "Account Number",
      placeholder: "0123456789",
    },
    {
      name: "bankAccountName",
      label: "Account Holder Name",
      placeholder: "NGUYEN VAN A",
    },
  ];

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {fields.map(({ name, label, placeholder }) => (
        <div key={name} className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[#737373] uppercase tracking-wide">
            {label}
          </label>
          <input
            type="text"
            name={name}
            value={form[name]}
            onChange={handleChange}
            placeholder={placeholder}
            className="h-10 rounded-xl border border-[#e6e6e6] bg-[#fafafa] px-3 text-sm text-[#121212] outline-none transition-colors placeholder:text-[#c4c4c4] focus:border-[#ad93e6] focus:bg-white"
          />
        </div>
      ))}

      {error && (
        <p className="rounded-lg border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-xs text-[#ef4444]">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded-lg border border-[#bbf7d0] bg-[#f0fdf4] px-3 py-2 text-xs text-[#166534]">
          ✓ Bank information updated successfully!
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="mt-1 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#ad93e6] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#9d7ed9] disabled:opacity-60"
      >
        {saving ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
        ) : (
          <>
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 3.75V16.5L12 14.25 7.5 16.5V3.75m9 0H18A2.25 2.25 0 0 1 20.25 6v12A2.25 2.25 0 0 1 18 20.25H6A2.25 2.25 0 0 1 3.75 18V6A2.25 2.25 0 0 1 6 3.75h1.5m9 0h-9"
              />
            </svg>
            Save Bank Information
          </>
        )}
      </button>
    </form>
  );
}

/* ── Account Info (default /profile) ──────────────────────────────────── */
function AccountInfo() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getMe().then((res) => {
      if (!mounted) return;
      if (res.success) setProfile(res.data);
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#e6e6e6] border-t-[#ad93e6]" />
      </div>
    );
  }

  const personalRows = [
    { label: "Full Name", value: profile?.fullName },
    { label: "Username", value: profile?.username },
    { label: "Email", value: profile?.email },
  ];

  const bankRows = [
    { label: "Bank Name", value: profile?.bankName },
    { label: "Account Number", value: profile?.bankAccountNumber },
    { label: "Account Holder", value: profile?.bankAccountName },
  ];

  const hasBankInfo = profile?.bankName || profile?.bankAccountNumber;

  return (
    <div className="flex flex-col gap-5">
      {/* Personal info */}
      <div className="rounded-2xl border border-[#e6e6e6] bg-white px-6 py-5">
        <div className="mb-1 flex items-center gap-2">
          <svg
            className="h-4 w-4 text-[#ad93e6]"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
            />
          </svg>
          <h2 className="text-sm font-bold text-[#121212]">
            Personal Information
          </h2>
        </div>
        <div className="flex flex-col divide-y divide-[#f0f0f0]">
          {personalRows.map(({ label, value }) => (
            <InfoRow key={label} label={label} value={value} />
          ))}
        </div>
      </div>

      {/* Bank info */}
      <div className="rounded-2xl border border-[#e6e6e6] bg-white px-6 py-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg
              className="h-4 w-4 text-[#ad93e6]"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z"
              />
            </svg>
            <h2 className="text-sm font-bold text-[#121212]">
              Bank Information
            </h2>
          </div>
          {hasBankInfo && (
            <span className="rounded-full bg-[#f0fdf4] border border-[#bbf7d0] px-2 py-0.5 text-[10px] font-semibold text-[#166534]">
              Configured
            </span>
          )}
        </div>

        {/* Current bank info display */}
        {hasBankInfo && (
          <div className="mb-5 flex flex-col divide-y divide-[#f0f0f0] rounded-xl border border-[#e6e6e6] bg-[#fafafa] px-4">
            {bankRows.map(({ label, value }) => (
              <InfoRow key={label} label={label} value={value} />
            ))}
          </div>
        )}

        {/* Edit form */}
        <p className="mb-4 text-xs text-[#737373]">
          {hasBankInfo
            ? "Update your bank details below:"
            : "Add your bank details to receive payments from buyers:"}
        </p>
        <BankForm
          profile={profile}
          onSaved={(updated) => setProfile((p) => ({ ...p, ...updated }))}
        />
      </div>
    </div>
  );
}

/* ── Page ──────────────────────────────────────────────────────────────── */
export default function ProfilePage() {
  const { user, isLoggedIn, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Load profile for sidebar display
  useEffect(() => {
    if (!isLoggedIn) return;
    getMe().then((res) => {
      if (res.success) setProfile(res.data);
    });
  }, [isLoggedIn]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!isLoggedIn) {
    return (
      <PageLayout>
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(173,147,230,0.1)]">
            <svg
              className="h-8 w-8 text-[#ad93e6]"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
              />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-[#121212]">
            Sign in to view your profile
          </h2>
          <p className="text-sm text-[#737373]">
            You need to be logged in to access this page.
          </p>
        </div>
      </PageLayout>
    );
  }

  const isRoot = pathname === "/profile";

  return (
    <PageLayout>
      <div className="mx-auto w-full max-w-[1150px] px-4 py-10 md:py-14">
        {/* Greeting */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#121212]">
            Hello,{" "}
            {(profile?.fullName ?? user.fullName)?.split(" ").at(-1) ?? "there"}
            !
          </h1>
          <p className="mt-0.5 text-sm text-[#737373]">
            Manage your account and orders
          </p>
        </div>

        <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
          <Sidebar user={user} profile={profile} onLogout={handleLogout} />

          <main className="min-w-0 flex-1">
            <NestedLayoutContext.Provider value={true}>
              {isRoot ? <AccountInfo /> : <Outlet />}
            </NestedLayoutContext.Provider>
          </main>
        </div>
      </div>
    </PageLayout>
  );
}
