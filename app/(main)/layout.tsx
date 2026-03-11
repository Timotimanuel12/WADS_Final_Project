import Sidebar from "@/components/sidebar";
import MobileBottomNav from "@/components/MobileBottomNav";
import AuthGuard from "@/components/AuthGuard";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex h-screen bg-background overflow-hidden">
        {/* 1. The reusable Sidebar */}
        <Sidebar />
        
        {/* 2. The dynamic page content (Dashboard or Calendar) */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden pb-16 md:pb-0">
          {children}
        </div>

        <MobileBottomNav />
      </div>
    </AuthGuard>
  );
}