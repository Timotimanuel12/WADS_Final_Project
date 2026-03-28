"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Save, ShieldAlert, Trash2, Upload } from "lucide-react";
import {
  EmailAuthProvider,
  fetchSignInMethodsForEmail,
  onAuthStateChanged,
  reauthenticateWithCredential,
  signOut,
  updatePassword,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { accountApi, profileApi, type UpdateProfileInput } from "@/lib/api-client";
import { useRouter } from "next/navigation";

const USERNAME_REGEX = /^[a-zA-Z0-9._-]{3,30}$/;

type UsernameAvailability = "idle" | "checking" | "available" | "taken" | "invalid" | "error";

type ProfileForm = UpdateProfileInput & {
  email: string;
  focusTimerSounds: boolean;
  weeklyActivityReport: boolean;
};

const INITIAL_FORM: ProfileForm = {
  username: "",
  firstName: "",
  lastName: "",
  email: "",
  university: "",
  major: "",
  profilePhotoUrl: null,
  focusTimerSounds: true,
  weeklyActivityReport: false,
};

export default function ProfileSettings() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [authUserId, setAuthUserId] = useState("");
  const [initialSnapshot, setInitialSnapshot] = useState(INITIAL_FORM);
  const [profileCompleted, setProfileCompleted] = useState(false);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  const [profileInitials, setProfileInitials] = useState("U");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [imageError, setImageError] = useState("");
  const [usernameAvailability, setUsernameAvailability] = useState<UsernameAvailability>("idle");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      setAuthUserId(user.uid);

      const displayName = user.displayName?.trim() ?? "";
      setProfilePhotoUrl(user.photoURL ?? null);
      setProfileInitials(getInitials(displayName, user.email));

      try {
        const profile = await profileApi.get();
        const nextForm: ProfileForm = {
          username: profile.username ?? "",
          firstName: profile.firstName ?? "",
          lastName: profile.lastName ?? "",
          email: profile.email ?? user.email ?? "",
          university: profile.university ?? "",
          major: profile.major ?? "",
          profilePhotoUrl: profile.profilePhotoUrl ?? user.photoURL ?? null,
          focusTimerSounds: true,
          weeklyActivityReport: false,
        };

        setForm(nextForm);
        setInitialSnapshot(nextForm);
        setProfilePhotoUrl(nextForm.profilePhotoUrl ?? null);
        setProfileCompleted(profile.profileCompleted);
      } catch {
        setError("Failed to load your profile settings.");
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

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

  const isDirty = useMemo(() => {
    return JSON.stringify(form) !== JSON.stringify(initialSnapshot);
  }, [form, initialSnapshot]);

  const missingRequiredFields = useMemo(() => {
    const missing: string[] = [];
    if (!form.username.trim()) missing.push("Username");
    if (!form.firstName.trim()) missing.push("First Name");
    if (!form.lastName.trim()) missing.push("Last Name");
    return missing;
  }, [form.username, form.firstName, form.lastName]);

  const handleSave = async () => {
    setError("");
    setSuccessMessage("");

    if (!form.username.trim()) {
      setError("Username is required.");
      return;
    }

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

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError("First name and last name are required.");
      return;
    }

    setSaving(true);
    try {
      await profileApi.update({
        username: form.username.trim(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        university: (form.university ?? "").trim(),
        major: (form.major ?? "").trim(),
        profilePhotoUrl: form.profilePhotoUrl,
      });
      setInitialSnapshot(form);
      setProfilePhotoUrl(form.profilePhotoUrl ?? null);
      setProfileCompleted(true);
      setSuccessMessage("Profile updated successfully.");
    } catch (updateError) {
      if (updateError instanceof Error && updateError.message) {
        setError(updateError.message);
      } else {
        setError("Failed to save profile changes.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError("");
    setPasswordSuccess("");

    const user = auth.currentUser;
    if (!user || !user.email) {
      setPasswordError("You must be signed in to change password.");
      return;
    }

    if (!currentPassword.trim()) {
      setPasswordError("Current password is required.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    setPasswordLoading(true);
    try {
      const signInMethods = await fetchSignInMethodsForEmail(auth, user.email);
      if (!signInMethods.includes("password")) {
        setPasswordError("This account uses Google sign-in. Password changes are not available here.");
        return;
      }

      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);

      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setPasswordSuccess("Password changed successfully.");
    } catch (changeError: unknown) {
      if (changeError instanceof Error && changeError.message) {
        if (changeError.message.includes("auth/wrong-password") || changeError.message.includes("invalid-credential")) {
          setPasswordError("Current password is incorrect.");
        } else if (changeError.message.includes("auth/requires-recent-login")) {
          setPasswordError("Please sign in again and retry password change.");
        } else {
          setPasswordError("Failed to change password. Please try again.");
        }
      } else {
        setPasswordError("Failed to change password. Please try again.");
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteError("");

    if (deleteConfirmation.trim().toUpperCase() !== "DELETE") {
      setDeleteError("Type DELETE to confirm account deletion.");
      return;
    }

    setDeleteLoading(true);
    try {
      await accountApi.remove();
      await signOut(auth);
      router.replace("/");
    } catch (deleteAccountError) {
      if (deleteAccountError instanceof Error && deleteAccountError.message) {
        setDeleteError(deleteAccountError.message);
      } else {
        setDeleteError("Failed to delete account. Please try again.");
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleAvatarPickerClick = () => {
    setImageError("");
    fileInputRef.current?.click();
  };

  const handleAvatarFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setImageError("");

    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setImageError("Please choose an image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setImageError("Image is too large. Please use a file up to 2MB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : null;
      if (!result) {
        setImageError("Failed to read image file.");
        return;
      }

      setForm((prev) => ({ ...prev, profilePhotoUrl: result }));
      setProfilePhotoUrl(result);
    };

    reader.onerror = () => {
      setImageError("Failed to load image. Please try another file.");
    };

    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handleRemoveAvatar = () => {
    setImageError("");
    setForm((prev) => ({ ...prev, profilePhotoUrl: null }));
    setProfilePhotoUrl(null);
  };

  if (loading) {
    return (
      <div className="py-8 text-sm text-muted-foreground">Loading profile settings...</div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Avatar Section */}
      <div className="flex items-center gap-6">
        <Avatar className="w-20 h-20 border-2 shadow-sm">
          <AvatarImage src={profilePhotoUrl ?? undefined} alt="Profile" />
          <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">{profileInitials}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-lg font-medium">Profile</h3>
          <p className="text-sm text-muted-foreground">Choose a profile picture from your gallery or files.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={handleAvatarPickerClick}>
              <Upload className="h-4 w-4 mr-2" />
              Change Photo
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={handleRemoveAvatar}>
              <Trash2 className="h-4 w-4 mr-2" />
              Remove
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarFileChange}
          />
          {imageError && <p className="text-xs text-red-600 mt-2">{imageError}</p>}
        </div>
      </div>

      <div className="rounded-lg border bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Profile Completion</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Complete required fields to keep your account setup valid.
            </p>
          </div>
          <Badge variant={profileCompleted && missingRequiredFields.length === 0 ? "default" : "secondary"}>
            {profileCompleted && missingRequiredFields.length === 0 ? "Complete" : "Incomplete"}
          </Badge>
        </div>

        {missingRequiredFields.length === 0 ? (
          <div className="mt-3 flex items-center gap-2 text-sm text-green-600">
            <CheckCircle2 className="h-4 w-4" />
            All required profile fields are completed.
          </div>
        ) : (
          <div className="mt-3 flex items-start gap-2 text-sm text-amber-600">
            <AlertCircle className="h-4 w-4 mt-0.5" />
            <div>
              Missing required fields: {missingRequiredFields.join(", ")}.
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            value={form.username}
            onChange={(e) => {
              setForm((prev) => ({ ...prev, username: e.target.value }));
              if (error) setError("");
            }}
          />
          {usernameAvailability === "checking" && (
            <p className="text-xs text-gray-500">Checking username...</p>
          )}
          {usernameAvailability === "available" && (
            <p className="text-xs text-emerald-600">Username is available.</p>
          )}
          {usernameAvailability === "taken" && (
            <p className="text-xs text-red-600">Username is already taken.</p>
          )}
          {usernameAvailability === "invalid" && (
            <p className="text-xs text-amber-700">
              Username must be 3-30 chars and use letters, numbers, dot, underscore, or hyphen.
            </p>
          )}
          {usernameAvailability === "error" && (
            <p className="text-xs text-amber-700">Could not verify username right now. You can still try save.</p>
          )}
        </div>

        {/* Basic Info */}
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={form.firstName}
            onChange={(e) => setForm((prev) => ({ ...prev, firstName: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            placeholder="Doe"
            value={form.lastName}
            onChange={(e) => setForm((prev) => ({ ...prev, lastName: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">University Email</Label>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            disabled
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="university">University</Label>
          <Input
            id="university"
            value={form.university}
            onChange={(e) => setForm((prev) => ({ ...prev, university: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="major">Major / Program</Label>
          <Input
            id="major"
            value={form.major}
            onChange={(e) => setForm((prev) => ({ ...prev, major: e.target.value }))}
          />
        </div>
      </div>

      {/* Preferences Section */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-lg font-medium">App Preferences</h3>
        
        <div className="flex items-center justify-between rounded-lg border p-4 shadow-sm bg-card">
          <div className="space-y-0.5">
            <Label className="text-base">Focus Timer Sounds</Label>
            <p className="text-sm text-muted-foreground">Play a chime when a focus session ends.</p>
          </div>
          <Switch
            checked={form.focusTimerSounds}
            onCheckedChange={(checked) => setForm((prev) => ({ ...prev, focusTimerSounds: checked }))}
          />
        </div>

        <div className="flex items-center justify-between rounded-lg border p-4 shadow-sm bg-card">
          <div className="space-y-0.5">
            <Label className="text-base">Weekly Activity Report</Label>
            <p className="text-sm text-muted-foreground">Receive an email summary of your completed tasks.</p>
          </div>
          <Switch
            checked={form.weeklyActivityReport}
            onCheckedChange={(checked) => setForm((prev) => ({ ...prev, weeklyActivityReport: checked }))}
          />
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-lg font-medium">Security</h3>

        <div className="rounded-lg border bg-card p-4 shadow-sm space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-foreground">Change Password</h4>
            <p className="text-xs text-muted-foreground mt-1">Update your account password for email sign-in.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  aria-label={showCurrentPassword ? "Hide current password" : "Show current password"}
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  aria-label={showNewPassword ? "Hide new password" : "Show new password"}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmNewPassword"
                  type={showConfirmNewPassword ? "text" : "password"}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmNewPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  aria-label={showConfirmNewPassword ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirmNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          <Button onClick={handleChangePassword} disabled={passwordLoading}>
            {passwordLoading ? "Updating Password..." : "Change Password"}
          </Button>
          {passwordError && <p className="text-xs text-red-600">{passwordError}</p>}
          {passwordSuccess && <p className="text-xs text-green-600">{passwordSuccess}</p>}
        </div>

        <div className="rounded-lg border border-red-200 bg-red-50 p-4 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-red-700">
            <ShieldAlert className="h-4 w-4" />
            <h4 className="text-sm font-semibold">Delete Account</h4>
          </div>
          <p className="text-xs text-red-700/90">
            This action is permanent. Your profile, tasks, and focus sessions will be removed.
          </p>

          <div className="space-y-2 max-w-xs">
            <Label htmlFor="deleteConfirmation">Type DELETE to confirm</Label>
            <Input
              id="deleteConfirmation"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="DELETE"
            />
          </div>

          <Button variant="destructive" onClick={handleDeleteAccount} disabled={deleteLoading}>
            {deleteLoading ? "Deleting Account..." : "Delete Account"}
          </Button>
          {deleteError && <p className="text-xs text-red-700">{deleteError}</p>}
        </div>
      </div>

      <Button
        className="bg-indigo-600 hover:bg-indigo-700"
        disabled={!isDirty || saving || usernameAvailability === "checking" || usernameAvailability === "taken" || usernameAvailability === "invalid"}
        onClick={handleSave}
      >
        <Save className="w-4 h-4 mr-2" /> {saving ? "Saving..." : "Save Changes"}
      </Button>
      {error && <p className="text-xs text-red-600">{error}</p>}
      {successMessage && <p className="text-xs text-green-600">{successMessage}</p>}
      {!isDirty && <p className="text-xs text-muted-foreground">No unsaved changes.</p>}
    </div>
  );
}

function getInitials(name?: string | null, email?: string | null) {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/).slice(0, 2);
    return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "U";
  }
  if (email && email.trim()) {
    return email.trim()[0]?.toUpperCase() ?? "U";
  }
  return "U";
}