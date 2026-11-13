import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, UserCheck, Calendar, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { clsx } from 'clsx';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin','doctor','receptionist'] },
  { to: '/patients', icon: UserCheck, label: 'Patients', roles: ['admin','doctor','receptionist'] },
  { to: '/appointments', icon: Calendar, label: 'Appointments', roles: ['admin','doctor','receptionist'] },
  { to: '/records', icon: FileText, label: 'Medical Records', roles: ['admin','doctor'] },
  { to: '/users', icon: Users, label: 'Staff', roles: ['admin'] },
];

export default function Sidebar() {
  const { user } = useAuth();
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col z-10">
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">MC</span>
          </div>
          <span className="font-bold text-gray-900 text-lg">MedCare RMS</span>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.filter(item => item.roles.includes(user?.role)).map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to} to={to}
            className={({ isActive }) => clsx('flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900')}
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-gray-100">
        <div className="text-xs text-gray-400 text-center">MedCare RMS v1.0</div>
      </div>
    </aside>
  );
}
