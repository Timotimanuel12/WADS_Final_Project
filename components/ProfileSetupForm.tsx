"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { profileApi, type UpdateProfileInput } from "@/lib/api-client";

const USERNAME_REGEX = /^[a-zA-Z0-9._-]{3,30}$/;

type UsernameAvailability = "idle" | "checking" | "available" | "taken" | "invalid" | "error";

type SetupFormState = UpdateProfileInput;

const INITIAL_FORM: SetupFormState = {
  username: "",
  firstName: "",
  lastName: "",
  university: "",
  major: "",
};

export default function ProfileSetupForm() {
  const router = useRouter();
  const [form, setForm] = useState<SetupFormState>(INITIAL_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [authUserId, setAuthUserId] = useState("");
  const [usernameAvailability, setUsernameAvailability] = useState<UsernameAvailability>("idle");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/login");
        return;
      }

      setAuthUserId(user.uid);

      try {
        const profile = await profileApi.get();
        setForm({
          username: profile.username ?? "",
          firstName: profile.firstName ?? "",
          lastName: profile.lastName ?? "",
          university: profile.university ?? "",
          major: profile.major ?? "",
        });

        if (profile.profileCompleted) {
          router.replace("/dashboard");
          return;
        }
      } catch {
        setError("Failed to load your profile setup data.");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const trimmed = form.username.trim();

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
          const params = new URLSearchParams({ username: trimmed });
          if (authUserId) params.set("excludeUserId", authUserId);
          const res = await fetch(`/api/auth/check-username?${params.toString()}`);

          if (!res.ok) {
            setUsernameAvailability("error");
            return;
          }

          const payload = (await res.json()) as {
            data?: { available?: boolean; valid?: boolean };
          };

          if (payload.data?.valid === false) {
            setUsernameAvailability("invalid");
            return;
          }

          setUsernameAvailability(payload.data?.available ? "available" : "taken");
        } catch {
          setUsernameAvailability("error");
        }
      })();
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [authUserId, form.username]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (!USERNAME_REGEX.test(form.username.trim())) {
      setError("username must be 3-30 chars and use letters, numbers, dot, underscore, or hyphen");
      return;
    }

    if (usernameAvailability === "taken") {
      setError("username is already taken");
      return;
    }

    if (usernameAvailability === "checking") {
      setError("Still checking username availability. Please wait a moment.");
      return;
    }

    setSaving(true);

    try {
      await profileApi.update({
        username: form.username,
        firstName: form.firstName,
        lastName: form.lastName,
        university: form.university,
        major: form.major,
      });
      router.replace("/dashboard");
    } catch (submissionError) {
      if (submissionError instanceof Error && submissionError.message) {
        setError(submissionError.message);
      } else {
        setError("Failed to complete profile setup.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-lg rounded-2xl border bg-white p-8 shadow-lg">
        <div className="flex items-center justify-center gap-3 text-indigo-700 font-semibold">
          <span className="inline-block h-5 w-5 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
          Loading profile setup...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg rounded-2xl border bg-white p-8 shadow-lg">
      <h1 className="text-2xl font-bold text-gray-900">Complete Your Profile</h1>
      <p className="mt-2 text-sm text-gray-600">
        Before you continue, add your basic account details.
      </p>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Username</label>
          <input
            type="text"
            value={form.username}
            onChange={(event) => {
              setForm((prev) => ({ ...prev, username: event.target.value }));
              if (error) setError("");
            }}
            required
            placeholder="your.username"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
            disabled={saving}
          />
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
            <label className="mb-1 block text-sm font-medium text-gray-700">First Name</label>
            <input
              type="text"
              value={form.firstName}
              onChange={(event) => setForm((prev) => ({ ...prev, firstName: event.target.value }))}
              required
              placeholder="John"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
              disabled={saving}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Last Name</label>
            <input
              type="text"
              value={form.lastName}
              onChange={(event) => setForm((prev) => ({ ...prev, lastName: event.target.value }))}
              required
              placeholder="Doe"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
              disabled={saving}
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">University (optional)</label>
          <input
            type="text"
            value={form.university}
            onChange={(event) => setForm((prev) => ({ ...prev, university: event.target.value }))}
            placeholder="Your University"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
            disabled={saving}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Major / Program (optional)</label>
          <input
            type="text"
            value={form.major}
            onChange={(event) => setForm((prev) => ({ ...prev, major: event.target.value }))}
            placeholder="Computer Science"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
            disabled={saving}
          />
        </div>

        <button
          type="submit"
          disabled={saving || usernameAvailability === "checking" || usernameAvailability === "taken" || usernameAvailability === "invalid"}
          className="w-full rounded-lg bg-indigo-600 py-2.5 font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-60"
        >
          {saving ? "Saving Profile..." : "Continue to Dashboard"}
        </button>
      </form>
    </div>
  );
}
