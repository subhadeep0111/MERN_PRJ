import Sidebar from './Sidebar';
import Header from './Header';
import { useLocation } from 'react-router-dom';

const titles = {
  '/dashboard': 'Dashboard',
  '/patients': 'Patients',
  '/appointments': 'Appointments',
  '/records': 'Medical Records',
  '/users': 'Staff Management',
};

export default function Layout({ children }) {
  const { pathname } = useLocation();
  const title = Object.entries(titles).find(([k]) => pathname.startsWith(k))?.[1] || 'MedCare RMS';
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64 flex flex-col min-h-screen">
        <Header title={title} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
