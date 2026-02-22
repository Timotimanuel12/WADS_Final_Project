"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ProfileSettings from "@/components/ProfileSettings";
import { BrainCircuit, Bell, Shield, User } from "lucide-react";

export default function SettingsPage() {
  return (
    <main className="flex-1 flex flex-col h-full bg-muted/5 overflow-y-auto w-full">
      <header className="px-8 py-8 border-b bg-background">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and AI preferences.</p>
      </header>

      <div className="p-8 max-w-5xl mx-auto w-full">
        <Tabs defaultValue="profile" className="flex flex-col md:flex-row gap-8 w-full">
          
          {/* Left-side Navigation for Settings */}
          <TabsList className="flex flex-col h-auto bg-transparent space-y-2 w-full md:w-64 items-start justify-start p-0">
            <TabsTrigger value="profile" className="w-full justify-start gap-2 data-[state=active]:bg-muted/50 data-[state=active]:shadow-none px-4 py-2.5">
              <User className="w-4 h-4" /> Profile & Account
            </TabsTrigger>
            <TabsTrigger value="ai" className="w-full justify-start gap-2 data-[state=active]:bg-muted/50 data-[state=active]:shadow-none px-4 py-2.5">
              <BrainCircuit className="w-4 h-4" /> AI Auto-Plan
            </TabsTrigger>
            <TabsTrigger value="notifications" className="w-full justify-start gap-2 data-[state=active]:bg-muted/50 data-[state=active]:shadow-none px-4 py-2.5">
              <Bell className="w-4 h-4" /> Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="w-full justify-start gap-2 data-[state=active]:bg-muted/50 data-[state=active]:shadow-none px-4 py-2.5">
              <Shield className="w-4 h-4" /> Security
            </TabsTrigger>
          </TabsList>

          {/* Right-side Content Panels */}
          <div className="flex-1">
            <TabsContent value="profile" className="m-0 focus-visible:outline-none focus-visible:ring-0">
              <Card className="shadow-sm border-muted">
                <CardHeader>
                  <CardTitle>Profile</CardTitle>
                  <CardDescription>Update your personal details and app preferences.</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Rendering our modular component right here! */}
                  <ProfileSettings />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ai" className="m-0 focus-visible:outline-none focus-visible:ring-0">
              <Card className="shadow-sm border-muted">
                <CardHeader>
                  <CardTitle>AI Auto-Plan Settings</CardTitle>
                  <CardDescription>Configure how the AI manages your calendar.</CardDescription>
                </CardHeader>
                <CardContent className="h-40 flex items-center justify-center text-muted-foreground border-t">
                  AI Configurations coming soon.
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* You can add more TabsContent for Notifications and Security later! */}
            
          </div>
        </Tabs>
      </div>
    </main>
  );
}