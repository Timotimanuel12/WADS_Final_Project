"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Save } from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

const INITIAL_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  major: "Computer Science",
  focusTimerSounds: true,
  weeklyActivityReport: false,
};

export default function ProfileSettings() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  const [profileInitials, setProfileInitials] = useState("U");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) return;

      const displayName = user.displayName?.trim() ?? "";
      const nameParts = displayName ? displayName.split(/\s+/) : [];
      const firstName = nameParts[0] ?? "";
      const lastName = nameParts.slice(1).join(" ");

      setForm((prev) => ({
        ...prev,
        firstName: firstName || prev.firstName,
        lastName: lastName || prev.lastName,
        email: user.email ?? prev.email,
      }));

      setProfilePhotoUrl(user.photoURL ?? null);
      setProfileInitials(getInitials(displayName, user.email));
    });

    return unsubscribe;
  }, []);

  const isDirty = useMemo(() => {
    return JSON.stringify(form) !== JSON.stringify(INITIAL_FORM);
  }, [form]);

  const handleSave = () => {
    // Placeholder for future API integration.
    // Keeping this as local state-only behavior for Phase 1 UI interactions.
    return;
  };

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
          <p className="text-sm text-muted-foreground">Photo and name are synced from your Google account.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
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

      <Button className="bg-indigo-600 hover:bg-indigo-700" disabled={!isDirty} onClick={handleSave}>
        <Save className="w-4 h-4 mr-2" /> Save Changes
      </Button>
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