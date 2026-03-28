import AuthGuard from "@/components/AuthGuard";
import ProfileSetupForm from "@/components/ProfileSetupForm";

export default function ProfileSetupPage() {
  return (
    <AuthGuard>
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <ProfileSetupForm />
      </main>
    </AuthGuard>
  );
}
