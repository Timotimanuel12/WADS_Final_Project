import LoginForm from "@/components/LoginForm";
import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative">
      <Link
        href="/"
        className="absolute top-6 left-6 inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-100"
      >
        <span aria-hidden="true">&larr;</span>
        Back
      </Link>
      <LoginForm />
    </main>
  );
}
