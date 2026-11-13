import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/layout/Layout';
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import PatientList from './pages/patients/PatientList';
import PatientDetail from './pages/patients/PatientDetail';
import PatientForm from './pages/patients/PatientForm';
import AppointmentCalendar from './pages/appointments/AppointmentCalendar';
import AppointmentForm from './pages/appointments/AppointmentForm';
import RecordList from './pages/records/RecordList';
import RecordDetail from './pages/records/RecordDetail';
import RecordForm from './pages/records/RecordForm';
import UserList from './pages/users/UserList';
import UserForm from './pages/users/UserForm';
import NotFound from './pages/NotFound';

const qc = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
            <Route path="/patients" element={<ProtectedRoute roles={['admin','doctor','receptionist']}><Layout><PatientList /></Layout></ProtectedRoute>} />
            <Route path="/patients/new" element={<ProtectedRoute roles={['admin','receptionist']}><Layout><PatientForm /></Layout></ProtectedRoute>} />
            <Route path="/patients/:id" element={<ProtectedRoute><Layout><PatientDetail /></Layout></ProtectedRoute>} />
            <Route path="/patients/:id/edit" element={<ProtectedRoute roles={['admin','receptionist']}><Layout><PatientForm /></Layout></ProtectedRoute>} />
            <Route path="/appointments" element={<ProtectedRoute><Layout><AppointmentCalendar /></Layout></ProtectedRoute>} />
            <Route path="/appointments/new" element={<ProtectedRoute roles={['admin','receptionist']}><Layout><AppointmentForm /></Layout></ProtectedRoute>} />
            <Route path="/records" element={<ProtectedRoute roles={['admin','doctor']}><Layout><RecordList /></Layout></ProtectedRoute>} />
            <Route path="/records/new" element={<ProtectedRoute roles={['doctor','admin']}><Layout><RecordForm /></Layout></ProtectedRoute>} />
            <Route path="/records/:id" element={<ProtectedRoute roles={['admin','doctor']}><Layout><RecordDetail /></Layout></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute roles={['admin']}><Layout><UserList /></Layout></ProtectedRoute>} />
            <Route path="/users/new" element={<ProtectedRoute roles={['admin']}><Layout><UserForm /></Layout></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <ToastContainer position="top-right" autoClose={3000} />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
