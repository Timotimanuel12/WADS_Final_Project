import { LayoutDashboard, Calendar, BarChart3, Settings, LogOut } from 'lucide-react';

export default function Sidebar() {
  return (
    <div className="w-64 h-screen bg-gray-50 border-r border-gray-200 p-6 flex flex-col fixed left-0 top-0">
      <div className="mb-8 flex items-center gap-2">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">F</div>
        <h1 className="text-xl font-bold text-gray-800">FocusFlow</h1>
      </div>

      <nav className="flex-1 space-y-1">
        <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active />
        <NavItem icon={<Calendar size={20} />} label="Schedule" />
        <NavItem icon={<BarChart3 size={20} />} label="Analytics" />
        <NavItem icon={<Settings size={20} />} label="Settings" />
      </nav>

      <div className="pt-4 border-t border-gray-200">
        <button className="flex items-center gap-3 text-gray-600 hover:text-red-600 w-full p-2 rounded-lg transition-colors">
          <LogOut size={20} />
          <span className="font-medium">Log Out</span>
        </button>
      </div>
    </div>
  );
}

function NavItem({ icon, label, active = false }: { icon: any, label: string, active?: boolean }) {
  return (
    <button className={`flex items-center gap-3 w-full p-3 rounded-lg transition-colors ${active ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}>
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );
}