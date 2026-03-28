"use client";

import { useCallback, useEffect, useState } from "react";
import { Book, Chrome, Eye, EyeOff, Lock, LogIn, User, UserPlus } from "lucide-react";
import { auth } from "@/lib/firebase";
import {
  fetchSignInMethodsForEmail,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { useRouter } from "next/navigation";

const USERNAME_REGEX = /^[a-zA-Z0-9._-]{3,30}$/;

type UsernameAvailability = "idle" | "checking" | "available" | "taken" | "invalid" | "error";

function mapAuthError(err: unknown, isRegisterMode: boolean): string {
  if (!(err instanceof FirebaseError)) {
    return isRegisterMode
      ? "Failed to create account. Please check your input and try again."
      : "Failed to sign in. Please check your credentials.";
  }

  switch (err.code) {
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/missing-password":
      return "Password is required.";
    case "auth/weak-password":
      return "Password is too weak. Use at least 6 characters.";
    case "auth/email-already-in-use":
      return "Email already in use.";
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "Incorrect email/username or password.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a moment and try again.";
    case "auth/popup-closed-by-user":
      return "Google sign-in was cancelled.";
    case "auth/popup-blocked":
      return "Popup was blocked. Please allow popups and try again.";
    default:
      return isRegisterMode
        ? "Failed to create account. Please check your input and try again."
        : "Failed to sign in. Please check your credentials.";
  }
}

function toUserFacingAuthError(err: unknown, isRegisterMode: boolean): string {
  if (err instanceof FirebaseError) {
    return mapAuthError(err, isRegisterMode);
  }

  if (err instanceof Error) {
    if (err.message === "username is required") return "Username is required.";
    if (err.message === "firstName is required") return "First name is required.";
    if (err.message === "lastName is required") return "Last name is required.";
    if (err.message === "password mismatch") return "Passwords do not match. Please re-type your password.";
    if (err.message === "username is already taken") return "Username is already taken.";
    if (err.message === "Failed to complete profile setup") {
      return "Could not finish profile setup. Please try again.";
    }
    if (err.message === "login resolve failed") {
      return "Incorrect email/username or password. If you recently registered, try signing in with email first.";
    }
  }

  if (err instanceof Error && err.message === "username is already taken") {
    return "Username is already taken. Your account may already exist. Sign in with email and choose a different username in profile setup.";
  }

  return isRegisterMode
    ? "Failed to create account. Please check your input and try again."
    : "Failed to sign in. Please check your credentials.";
}

export default function LoginForm() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [university, setUniversity] = useState("");
  const [major, setMajor] = useState("");
  const [error, setError] = useState("");
  const [forgotMessage, setForgotMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [isSwitchingMode, setIsSwitchingMode] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [usernameAvailability, setUsernameAvailability] = useState<UsernameAvailability>("idle");

  const router = useRouter();

  const fetchSessionWithTimeout = useCallback(async (idToken: string) => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 10000);

    try {
      return await fetch("/api/auth/session", {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
        signal: controller.signal,
      });
    } finally {
      window.clearTimeout(timeoutId);
    }
  }, []);

  const resolvePostAuthRoute = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) {
      router.replace("/login");
      return;
    }

    const idToken = await user.getIdToken();
    const res = await fetchSessionWithTimeout(idToken);

    if (!res.ok) {
      router.replace("/login");
      return;
    }

    const payload = (await res.json()) as {
      success: boolean;
      data?: { profileCompleted?: boolean };
    };

    if (payload.data?.profileCompleted) {
      router.replace("/dashboard");
      return;
    }

    router.replace("/profile-setup");
  }, [fetchSessionWithTimeout, router]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const run = async () => {
        if (!user) {
          setCheckingAuth(false);
          return;
        }

        try {
          await resolvePostAuthRoute();
        } catch {
          router.replace("/login");
        } finally {
          // Always clear the gate so the login form does not get stuck forever.
          setCheckingAuth(false);
        }
      };

      void run();
    });

    return () => unsubscribe();
  }, [resolvePostAuthRoute, router]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setForgotMessage("");
    setLoading(true);

    try {
      if (isRegisterMode) {
        if (!username.trim()) throw new Error("username is required");
        if (!USERNAME_REGEX.test(username.trim())) {
          throw new Error("username must be 3-30 chars and use letters, numbers, dot, underscore, or hyphen");
        }
        if (!firstName.trim()) throw new Error("firstName is required");
        if (!lastName.trim()) throw new Error("lastName is required");
        if (password !== confirmPassword) throw new Error("password mismatch");

        const usernameAvailable = await checkUsernameAvailability(username.trim());
        if (!usernameAvailable) throw new Error("username is already taken");

        const credential = await createUserWithEmailAndPassword(auth, identifier, password);
        await updateProfile(credential.user, {
          displayName: `${firstName.trim()} ${lastName.trim()}`.trim(),
        });

        const idToken = await credential.user.getIdToken();
        const res = await fetch("/api/profile", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            username: username.trim(),
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            university: university.trim(),
            major: major.trim(),
          }),
        });

        if (!res.ok) {
          const payload = (await res.json()) as { error?: string };
          throw new Error(payload.error ?? "Failed to complete profile setup");
        }
      } else {
        const resolvedEmail = await resolveIdentifierToEmail(identifier);

        await signInWithEmailAndPassword(auth, resolvedEmail, password);
      }

      await resolvePostAuthRoute();
    } catch (err: unknown) {
      console.error(err);
      setError(toUserFacingAuthError(err, isRegisterMode));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setForgotMessage("");
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      await resolvePostAuthRoute();
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof FirebaseError) {
        if (err.code === "auth/account-exists-with-different-credential") {
          const email = (err.customData?.email as string | undefined) ?? "";

          if (email) {
            try {
              const methods = await fetchSignInMethodsForEmail(auth, email);
              if (methods.includes("password")) {
                setError("This email is already registered with password. Please sign in with email and password.");
              } else if (methods.length > 0) {
                setError("This email is already linked to another sign-in method. Please use that method first.");
              } else {
                setError("This account already exists with a different sign-in method.");
              }
            } catch {
              setError("This account already exists with a different sign-in method.");
            }
          } else {
            setError("This account already exists with a different sign-in method.");
          }
        } else if (err.code === "auth/invalid-credential") {
          setError("Google sign-in failed due to invalid credentials. Please try again or use email sign-in.");
        } else {
          setError(toUserFacingAuthError(err, false));
        }
      } else {
        setError(toUserFacingAuthError(err, false));
      }
    } finally {
      setLoading(false);
    }
  };

  const resolveIdentifierToEmail = async (rawIdentifier: string): Promise<string> => {
    const resolveRes = await fetch("/api/auth/resolve-login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ identifier: rawIdentifier }),
    });

    if (!resolveRes.ok) {
      throw new Error("login resolve failed");
    }

    const resolvePayload = (await resolveRes.json()) as {
      data?: { email?: string };
    };

    const resolvedEmail = resolvePayload.data?.email;
    if (!resolvedEmail) {
      throw new Error("login resolve failed");
    }

    return resolvedEmail;
  };

  const checkUsernameAvailability = useCallback(async (candidate: string): Promise<boolean> => {
    const res = await fetch(`/api/auth/check-username?username=${encodeURIComponent(candidate)}`);
    if (!res.ok) return false;

    const payload = (await res.json()) as {
      data?: { available?: boolean; valid?: boolean };
    };

    return Boolean(payload.data?.available) && payload.data?.valid !== false;
  }, []);

  useEffect(() => {
    if (!isRegisterMode) {
      setUsernameAvailability("idle");
      return;
    }

    const trimmed = username.trim();
    if (!trimmed) {
      setUsernameAvailability("idle");
      return;
    }

    if (!USERNAME_REGEX.test(trimmed)) {
      setUsernameAvailability("invalid");
      return;
    }

    setUsernameAvailability("checking");
    const timeoutId = window.setTimeout(() => {
      void (async () => {
        try {
          const available = await checkUsernameAvailability(trimmed);
          setUsernameAvailability(available ? "available" : "taken");
        } catch {
          setUsernameAvailability("error");
        }
      })();
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [checkUsernameAvailability, isRegisterMode, username]);

  const handleForgotPassword = async () => {
    setError("");
    setForgotMessage("");

    if (!identifier.trim()) {
      setError("Enter your email or username first.");
      return;
    }

    setLoading(true);
    try {
      const resolvedEmail = await resolveIdentifierToEmail(identifier.trim());
      await sendPasswordResetEmail(auth, resolvedEmail);
      setForgotMessage("If this account exists, a password reset email has been sent.");
    } catch {
      setForgotMessage("If this account exists, a password reset email has been sent.");
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
        <div className="flex items-center justify-center gap-3 text-indigo-700 font-semibold">
          <span className="inline-block h-5 w-5 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
          Checking session...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-gray-100 relative">
      {isSwitchingMode && (
        <div className="absolute inset-0 z-10 rounded-2xl bg-white/80 backdrop-blur-sm flex items-center justify-center">
          <div className="flex items-center gap-3 text-indigo-700 font-semibold">
            <span className="inline-block h-5 w-5 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
            Loading...
          </div>
        </div>
      )}

      <div className={`text-center mb-8 ${isSwitchingMode ? "opacity-70" : "opacity-100"} transition-opacity`}>
        <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white mx-auto mb-4">
          <Book size={24} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{isRegisterMode ? "Create Account" : "Welcome Back"}</h1>
        <p className="text-gray-500 text-sm">
          {isRegisterMode ? "Create your account to get started" : "Please sign in to your account"}
        </p>
      </div>

      {error && <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm mb-4 text-center">{error}</div>}
      {forgotMessage && (
        <div className="bg-emerald-50 text-emerald-700 p-3 rounded-lg text-sm mb-4 text-center">{forgotMessage}</div>
      )}

      <form onSubmit={handleAuth} className="space-y-4" aria-busy={loading || isSwitchingMode}>
        {isRegisterMode && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (error) setError("");
                  }}
                  required
                  placeholder="your.username"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-gray-900 placeholder:text-gray-400"
                  disabled={loading || isSwitchingMode}
                />
              </div>
              {usernameAvailability === "checking" && (
                <p className="mt-1 text-xs text-gray-500">Checking username...</p>
              )}
              {usernameAvailability === "available" && (
                <p className="mt-1 text-xs text-emerald-600">Username is available.</p>
              )}
              {usernameAvailability === "taken" && (
                <p className="mt-1 text-xs text-red-600">Username is already taken.</p>
              )}
              {usernameAvailability === "invalid" && (
                <p className="mt-1 text-xs text-amber-700">
                  Username must be 3-30 chars and use letters, numbers, dot, underscore, or hyphen.
                </p>
              )}
              {usernameAvailability === "error" && (
                <p className="mt-1 text-xs text-amber-700">Could not verify username right now. You can still try submit.</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  placeholder="John"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-gray-900 placeholder:text-gray-400"
                  disabled={loading || isSwitchingMode}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  placeholder="Doe"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-gray-900 placeholder:text-gray-400"
                  disabled={loading || isSwitchingMode}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">University (optional)</label>
              <input
                type="text"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                placeholder="Your University"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-gray-900 placeholder:text-gray-400"
                disabled={loading || isSwitchingMode}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Major / Program (optional)</label>
              <input
                type="text"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                placeholder="Computer Science"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-gray-900 placeholder:text-gray-400"
                disabled={loading || isSwitchingMode}
              />
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {isRegisterMode ? "Email Address" : "Email or Username"}
          </label>
          <div className="relative">
            <User className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type={isRegisterMode ? "email" : "text"}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              placeholder="example@email.com"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-gray-900 placeholder:text-gray-400"
              disabled={loading || isSwitchingMode}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="password123"
              className="w-full pl-10 pr-11 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-gray-900 placeholder:text-gray-400"
              disabled={loading || isSwitchingMode}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {!isRegisterMode && (
            <div className="mt-2 text-right">
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={loading || isSwitchingMode}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:underline disabled:opacity-50"
              >
                Forgot password?
              </button>
            </div>
          )}
        </div>

        {isRegisterMode && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="re-type your password"
                className="w-full pl-10 pr-11 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-gray-900 placeholder:text-gray-400"
                disabled={loading || isSwitchingMode}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={
            loading ||
            isSwitchingMode ||
            (isRegisterMode && (usernameAvailability === "checking" || usernameAvailability === "taken" || usernameAvailability === "invalid"))
          }
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isRegisterMode ? <UserPlus size={18} /> : <LogIn size={18} />}
          {loading ? (isRegisterMode ? "Creating Account..." : "Signing In...") : isRegisterMode ? "Create Account" : "Sign In"}
        </button>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading || isSwitchingMode}
          className="w-full border border-gray-200 bg-white text-gray-700 font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 hover:bg-gray-50 disabled:opacity-50"
        >
          <Chrome size={18} />
          Continue with Google
        </button>
      </form>

      <p className="text-sm text-center text-gray-500 mt-4">
        {isRegisterMode ? "Already have an account?" : "Don't have an account?"}{" "}
        <button
          type="button"
          onClick={() => {
            setError("");
            setIsSwitchingMode(true);
            setTimeout(() => {
              setIsRegisterMode(!isRegisterMode);
              setIsSwitchingMode(false);
            }, 250);
          }}
          className="text-indigo-600 font-semibold transition-all duration-150 hover:text-indigo-700 hover:underline hover:underline-offset-2 active:scale-95 active:text-indigo-800"
          disabled={loading || isSwitchingMode}
        >
          {isRegisterMode ? "Sign In" : "Create one"}
        </button>
      </p>
    </div>
  );
}
