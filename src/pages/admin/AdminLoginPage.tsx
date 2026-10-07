import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { ApiRequestError } from "@/lib/types";
import { signIn, signOut } from "@/services/authService";
import { getMyProfile } from "@/services/profileService";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Button } from "@/components/ui/Button";

interface AdminLoginLocationState {
  message?: string;
  from?: string;
}

export function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as AdminLoginLocationState | null;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState(locationState?.message ?? null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setNotice(null);

    let signedIn = false;
    try {
      await signIn(email.trim(), password);
      signedIn = true;

      const profile = await getMyProfile();
      if (profile.role !== "admin") {
        await signOut().catch(() => undefined);
        signedIn = false;
        setPassword("");
        setError(
          "This account is not an administrator. You have been signed out; use an existing admin account.",
        );
        return;
      }

      const requestedPath = locationState?.from;
      const destination =
        requestedPath?.startsWith("/admin/") && requestedPath !== "/admin/login"
          ? requestedPath
          : "/admin/products";
      navigate(destination, { replace: true });
    } catch (reason) {
      if (signedIn) await signOut().catch(() => undefined);

      const status = reason instanceof ApiRequestError ? reason.status : null;
      setError(
        status === 403
          ? "This account is not authorized to enter the admin area."
          : reason instanceof Error
            ? reason.message
            : "Could not sign in. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10 dark:bg-gray-950">
      <section className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-8">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-teal-700 dark:text-gray-400 dark:hover:text-teal-300"
            >
              <ArrowLeft className="h-4 w-4" /> Storefront
            </Link>
            <div className="mt-6 flex items-center gap-3">
              <span className="rounded-xl bg-teal-700 p-2.5 text-white">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700 dark:text-teal-300">
                  Nokata administration
                </p>
                <h1 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                  Admin sign in
                </h1>
              </div>
            </div>
          </div>
          <ThemeToggle />
        </div>

        <p className="mb-6 text-sm leading-6 text-gray-600 dark:text-gray-300">
          Sign in with an existing administrator account. Access is confirmed
          against your account role after authentication.
        </p>

        {notice && (
          <p
            role="status"
            className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200"
          >
            {notice}
          </p>
        )}
        {error && (
          <p
            role="alert"
            className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
          >
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Email address
            <input
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="form-input mt-2"
            />
          </label>

          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Password
            <span className="relative mt-2 block">
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="form-input pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </span>
          </label>

          <Button
            type="submit"
            loading={submitting}
            className="w-full justify-center"
          >
            Sign in to admin
          </Button>
        </form>

        <p className="mt-6 border-t border-gray-100 pt-5 text-xs leading-5 text-gray-500 dark:border-gray-800 dark:text-gray-400">
          Admin accounts must be provisioned by an administrator. There is no
          public admin registration.
        </p>
      </section>
    </main>
  );
}
