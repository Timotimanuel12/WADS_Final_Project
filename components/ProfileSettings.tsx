"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Save } from "lucide-react";

export default function ProfileSettings() {
  return (
    <div className="space-y-8">
      {/* Avatar Section */}
      <div className="flex items-center gap-6">
        <Avatar className="w-20 h-20 border-2 shadow-sm">
          <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">AL</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-lg font-medium">Profile Picture</h3>
          <p className="text-sm text-muted-foreground mb-3">PNG, JPG or GIF under 5MB</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Upload New</Button>
            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">Remove</Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Info */}
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input id="firstName" defaultValue="Alex" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input id="lastName" placeholder="Doe" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">University Email</Label>
          <Input id="email" type="email" defaultValue="alex@binus.ac.id" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="major">Major / Program</Label>
          <Input id="major" defaultValue="Computer Science" />
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
          <Switch defaultChecked />
        </div>

        <div className="flex items-center justify-between rounded-lg border p-4 shadow-sm bg-card">
          <div className="space-y-0.5">
            <Label className="text-base">Weekly Activity Report</Label>
            <p className="text-sm text-muted-foreground">Receive an email summary of your completed tasks.</p>
          </div>
          <Switch />
        </div>
      </div>

      <Button className="bg-indigo-600 hover:bg-indigo-700">
        <Save className="w-4 h-4 mr-2" /> Save Changes
      </Button>
    </div>
  );
}