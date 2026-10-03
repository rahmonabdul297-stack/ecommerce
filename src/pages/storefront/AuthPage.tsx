import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Button } from "@/components/ui/Button";
import {
  checkSession,
  requestPasswordReset,
  requestSmsPasswordReset,
  resetPasswordByEmail,
  resetPasswordBySms,
  signIn,
  signUp,
  verifyAccount,
} from "@/services/authService";

type AuthMode =
  | "signin"
  | "signup"
  | "verify"
  | "forgot-email"
  | "forgot-sms"
  | "reset-email"
  | "reset-sms";

const fieldClass =
  "w-full border-0 border-b border-stone-300 bg-transparent px-0 py-3 text-sm text-stone-900 placeholder:text-stone-400 focus:border-teal-700 focus:outline-none focus:ring-0";

export function AuthPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const hasEmailResetLink = Boolean(
    searchParams.get("token") && searchParams.get("id"),
  );
  const [mode, setMode] = useState<AuthMode>(
    hasEmailResetLink ? "reset-email" : "signin",
  );
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    identifier: "",
    password: "",
    token: "",
    OTP: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{
    kind: "error" | "success";
    text: string;
  } | null>(null);

  const update = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setFeedback(null);
    try {
      let message = "Request completed.";
      if (mode === "signup") {
        const result = await signUp({
          name: form.name.trim(),
          username: form.username.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          password: form.password,
        });
        message = result.message ?? "Check your email for a verification code.";
        setMode("verify");
      } else if (mode === "verify") {
        const result = await verifyAccount(form.token.trim());
        message =
          result.message ?? "Your account is verified. You can sign in now.";
        setMode("signin");
      } else if (mode === "signin") {
        const identifier = form.identifier.trim();
        await signIn(identifier, form.password);
        await checkSession();
        navigate("/profile");
        return;
      } else if (mode === "forgot-email") {
        const result = await requestPasswordReset(form.email.trim());
        message =
          result.message ??
          "If that email is registered, a reset link is on its way.";
      } else if (mode === "forgot-sms") {
        const result = await requestSmsPasswordReset(form.phone.trim());
        message =
          result.message ??
          "If that number is registered, an OTP is on its way.";
        setMode("reset-sms");
      } else if (mode === "reset-email") {
        const token = searchParams.get("token");
        const userId = searchParams.get("id");
        if (!token || !userId)
          throw new Error("This reset link is incomplete.");
        const result = await resetPasswordByEmail(token, userId, form.password);
        message = result.message ?? "Your password was updated.";
        setMode("signin");
      } else {
        const result = await resetPasswordBySms(form.OTP.trim(), form.password);
        message = result.message ?? "Your password was updated.";
        setMode("signin");
      }
      setFeedback({ kind: "success", text: message });
    } catch (error) {
      setFeedback({
        kind: "error",
        text:
          error instanceof Error
            ? error.message
            : "The request could not be completed.",
      });
    } finally {
      setBusy(false);
    }
  };

  const title = {
    signin: "Welcome back",
    signup: "Create your account",
    verify: "Verify your email",
    "forgot-email": "Reset with email",
    "forgot-sms": "Reset with SMS",
    "reset-email": "Choose a new password",
    "reset-sms": "Enter your reset code",
  }[mode];

  const isReset = mode === "reset-email" || mode === "reset-sms";
  const passwordInput = (label: string) => (
    <label className="block text-xs font-semibold uppercase tracking-wide text-stone-500">
      {label}
      <span className="mt-1 flex items-center gap-3">
        <input
          className={fieldClass}
          type={showPassword ? "text" : "password"}
          autoComplete={isReset ? "new-password" : "current-password"}
          value={form.password}
          onChange={(event) => update("password", event.target.value)}
          required
          minLength={8}
        />
        <button
          type="button"
          className="p-2 text-stone-500 hover:text-stone-900"
          aria-label={showPassword ? "Hide password" : "Show password"}
          onClick={() => setShowPassword((visible) => !visible)}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </span>
    </label>
  );

  return (
    <main className="mx-auto grid min-h-[calc(100vh-9rem)] max-w-full grid-cols-1 bg-white lg:grid-cols-[0.95fr_1.05fr]">
      <section className="relative flex min-h-56 items-end overflow-hidden bg-stone-900 p-8 text-white sm:p-12 lg:min-h-full">
        <img
          className="absolute inset-0 h-full w-full object-cover opacity-40"
          src="https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=1200&q=85"
          alt="Smartphones and mobile accessories"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />
        <div className="relative max-w-sm animate-slide-up space-y-3">
          <div className="inline-flex items-center gap-2 text-sm font-semibold tracking-wide text-teal-400 bg-teal-500/10 px-3 py-1 rounded-full">
            <Smartphone className="h-4 w-4" /> NOKATA MOBILE STORE
          </div>
          <p className="text-3xl font-bold leading-tight sm:text-4xl">
            Power up your mobile experience with genuine gear.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-white underline underline-offset-4 pt-2 hover:text-teal-300"
          >
            Explore the mobile catalog <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="flex items-center justify-center px-6 py-12 sm:px-12 lg:px-16">
        <div className="w-full max-w-md animate-slide-up">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-teal-800">
              {mode === "verify" ? (
                <ShieldCheck className="h-5 w-5" />
              ) : (
                <KeyRound className="h-5 w-5" />
              )}
              <span className="text-xs font-bold uppercase tracking-[0.18em]">
                Nokata account
              </span>
            </div>
            <ThemeToggle />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-stone-900">
            {title}
          </h1>
          <p className="mt-2 text-sm leading-6 text-stone-500">
            {mode === "signin" &&
              "Sign in to track your orders and manage your saved delivery addresses."}
            {mode === "signup" &&
              "Create an account for a fast, secure checkout experience."}
            {mode === "verify" &&
              "Enter the verification code sent to your email."}
            {mode.startsWith("forgot") &&
              "We’ll send a secure reset code if we find a matching account."}
            {isReset && "Use a new password with at least 8 characters."}
          </p>

          {(mode === "signin" || mode === "signup") && (
            <div className="mt-8 grid grid-cols-2 border-b border-stone-200 text-sm">
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setFeedback(null);
                }}
                className={`border-b-2 py-3 text-center font-semibold transition-colors ${mode === "signin" ? "border-teal-700 text-teal-800" : "border-transparent text-stone-400 hover:text-stone-700"}`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setFeedback(null);
                }}
                className={`border-b-2 py-3 text-center font-semibold transition-colors ${mode === "signup" ? "border-teal-700 text-teal-800" : "border-transparent text-stone-400 hover:text-stone-700"}`}
              >
                Create account
              </button>
            </div>
          )}

          <form onSubmit={submit} className="mt-7 space-y-5">
            {mode === "signup" && (
              <>
                <label className="block text-xs font-semibold uppercase tracking-wide text-stone-500">
                  Full name
                  <input
                    className={fieldClass}
                    autoComplete="name"
                    value={form.name}
                    onChange={(event) => update("name", event.target.value)}
                    required
                  />
                </label>
                <label className="block text-xs font-semibold uppercase tracking-wide text-stone-500">
                  Username
                  <input
                    className={fieldClass}
                    autoComplete="username"
                    value={form.username}
                    onChange={(event) => update("username", event.target.value)}
                    required
                  />
                </label>
                <label className="block text-xs font-semibold uppercase tracking-wide text-stone-500">
                  Email
                  <input
                    className={fieldClass}
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={(event) => update("email", event.target.value)}
                    required
                  />
                </label>
                <label className="block text-xs font-semibold uppercase tracking-wide text-stone-500">
                  Phone
                  <input
                    className={fieldClass}
                    type="tel"
                    autoComplete="tel"
                    value={form.phone}
                    onChange={(event) => update("phone", event.target.value)}
                    required
                  />
                </label>
                {passwordInput("Password")}
              </>
            )}

            {mode === "signin" && (
              <>
                <label className="block text-xs font-semibold uppercase tracking-wide text-stone-500">
                  Email or username
                  <input
                    className={fieldClass}
                    autoComplete="username"
                    value={form.identifier}
                    onChange={(event) =>
                      update("identifier", event.target.value)
                    }
                    required
                  />
                </label>
                {passwordInput("Password")}
                <button
                  type="button"
                  onClick={() => {
                    setMode("forgot-email");
                    setFeedback(null);
                  }}
                  className="text-sm font-medium text-teal-800 underline underline-offset-4"
                >
                  Forgot password?
                </button>
              </>
            )}

            {mode === "verify" && (
              <label className="block text-xs font-semibold uppercase tracking-wide text-stone-500">
                Verification code
                <input
                  className={fieldClass}
                  inputMode="numeric"
                  value={form.token}
                  onChange={(event) => update("token", event.target.value)}
                  required
                />
              </label>
            )}

            {mode === "forgot-email" && (
              <label className="block text-xs font-semibold uppercase tracking-wide text-stone-500">
                Email
                <input
                  className={fieldClass}
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(event) => update("email", event.target.value)}
                  required
                />
              </label>
            )}
            {mode === "forgot-sms" && (
              <label className="block text-xs font-semibold uppercase tracking-wide text-stone-500">
                Phone
                <input
                  className={fieldClass}
                  type="tel"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={(event) => update("phone", event.target.value)}
                  required
                />
              </label>
            )}
            {mode === "reset-email" && passwordInput("New password")}
            {mode === "reset-sms" && (
              <>
                <label className="block text-xs font-semibold uppercase tracking-wide text-stone-500">
                  SMS code
                  <input
                    className={fieldClass}
                    inputMode="numeric"
                    value={form.OTP}
                    onChange={(event) => update("OTP", event.target.value)}
                    required
                  />
                </label>
                {passwordInput("New password")}
              </>
            )}

            {feedback && (
              <p
                role="status"
                className={`text-sm leading-5 ${feedback.kind === "error" ? "text-red-700" : "text-emerald-800"}`}
              >
                {feedback.text}
              </p>
            )}
            <Button
              type="submit"
              loading={busy}
              className="w-full justify-center bg-teal-600 hover:bg-teal-500 text-white py-3 rounded-xl font-semibold"
            >
              {mode === "signin"
                ? "Sign in"
                : mode === "signup"
                  ? "Create account"
                  : mode === "verify"
                    ? "Verify account"
                    : isReset
                      ? "Update password"
                      : "Send reset instructions"}
              {!busy && <ArrowRight className="h-4 w-4 ml-2" />}
            </Button>
          </form>

          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-3 text-sm text-stone-500">
            {mode === "signin" && (
              <button
                type="button"
                onClick={() => {
                  setMode("verify");
                  setFeedback(null);
                }}
                className="hover:text-teal-800 transition-colors"
              >
                Verify account
              </button>
            )}
            {mode === "signin" && (
              <button
                type="button"
                onClick={() => {
                  setMode("forgot-sms");
                  setFeedback(null);
                }}
                className="hover:text-teal-800 transition-colors"
              >
                Reset by SMS
              </button>
            )}
            {mode === "forgot-email" && (
              <button
                type="button"
                onClick={() => {
                  setMode("forgot-sms");
                  setFeedback(null);
                }}
                className="hover:text-teal-800 transition-colors"
              >
                Use SMS instead
              </button>
            )}
            {mode === "forgot-sms" && (
              <button
                type="button"
                onClick={() => {
                  setMode("forgot-email");
                  setFeedback(null);
                }}
                className="hover:text-teal-800 transition-colors"
              >
                Use email instead
              </button>
            )}
            {mode !== "signin" && mode !== "signup" && (
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setFeedback(null);
                }}
                className="hover:text-teal-800 transition-colors"
              >
                Back to sign in
              </button>
            )}
          </div>
          {feedback?.kind === "success" &&
            (mode === "forgot-email" || mode === "forgot-sms") && (
              <p className="mt-4 text-xs leading-5 text-stone-500">
                For account privacy, the message does not confirm whether an
                account exists.
              </p>
            )}
        </div>
      </section>
    </main>
  );
}
