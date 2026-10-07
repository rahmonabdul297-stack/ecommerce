import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ApiRequestError } from "@/lib/types";
import { getMyProfile } from "@/services/profileService";
import { signOut } from "@/services/authService";
import { ErrorState } from "@/components/ui/ErrorState";
import { FullPageSpinner } from "@/components/ui/Spinner";

export function AdminRouteGuard({ children }: { children: ReactNode }) {
  const location = useLocation();
  const currentLocation = useRef(location);
  currentLocation.current = location;
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let active = true;
    const current = currentLocation.current;
    const from = `${current.pathname}${current.search}${current.hash}`;

    const redirectToAdminLogin = async (
      message: string,
      shouldSignOut: boolean,
    ) => {
      if (shouldSignOut) await signOut().catch(() => undefined);
      if (!active) return;
      navigate("/admin/login", {
        replace: true,
        state: { message, from },
      });
    };

    const verifyAdmin = async () => {
      setChecking(true);
      setError(null);
      setAuthorized(false);
      try {
        const profile = await getMyProfile();
        if (profile.role === "admin") {
          if (active) setAuthorized(true);
          return;
        }

        await redirectToAdminLogin(
          "This account does not have administrator access. You have been signed out.",
          true,
        );
      } catch (reason) {
        const status = reason instanceof ApiRequestError ? reason.status : null;
        if (status === 401) {
          await redirectToAdminLogin(
            "Sign in with an existing administrator account to continue.",
            false,
          );
        } else if (status === 403) {
          await redirectToAdminLogin(
            "This account is not authorized to access administration.",
            true,
          );
        } else if (active) {
          setError(
            reason instanceof Error
              ? reason.message
              : "Could not verify administrator access.",
          );
        }
      } finally {
        if (active) setChecking(false);
      }
    };

    void verifyAdmin();
    return () => {
      active = false;
    };
  }, [navigate, retryKey]);

  if (checking) {
    return <FullPageSpinner message="Verifying administrator access…" />;
  }

  if (error) {
    return (
      <main className="mx-auto max-w-xl px-4 py-12">
        <ErrorState
          message={error}
          onRetry={() => setRetryKey((key) => key + 1)}
        />
        <p className="mt-4 text-center text-sm text-gray-500">
          <Link
            to="/admin/login"
            className="font-semibold text-teal-700 underline"
          >
            Admin sign in
          </Link>
        </p>
      </main>
    );
  }

  return authorized ? children : null;
}
