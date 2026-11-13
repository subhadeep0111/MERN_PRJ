import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Header({ title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/login'); };
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Avatar name={user?.name} size="sm" />
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
          </div>
          <Badge label={user?.role} />
        </div>
        <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Logout">
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
