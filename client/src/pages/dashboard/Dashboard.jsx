import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Users, UserCheck, Calendar, CalendarCheck, ArrowRight, Clock, Plus } from 'lucide-react';
import { getDashboardStats } from '../../api/dashboard.api';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await getDashboardStats();
      return res.data?.stats;
    }
  });

  if (isLoading) return <Spinner size="lg" />;

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50 text-red-700">
        <p className="font-semibold">Failed to load dashboard data</p>
        <p className="text-sm mt-1">{error.response?.data?.message || error.message}</p>
      </Card>
    );
  }

  const stats = data || {};

  const recentPatientCols = [
    {
      key: 'patientId',
      label: 'Patient ID',
      render: (row) => (
        <Link to={`/patients/${row._id}`} className="font-medium text-blue-600 hover:underline">
          {row.patientId}
        </Link>
      )
    },
    {
      key: 'name',
      label: 'Name',
      render: (row) => `${row.firstName} ${row.lastName}`
    },
    { key: 'phone', label: 'Phone' },
    {
      key: 'assignedDoctor',
      label: 'Doctor',
      render: (row) => row.assignedDoctor?.name || 'Unassigned'
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <Badge label={row.status} />
    }
  ];

  const appointmentCols = [
    {
      key: 'patient',
      label: 'Patient',
      render: (row) => (
        <span className="font-medium text-gray-900">
          {row.patient ? `${row.patient.firstName} ${row.patient.lastName}` : 'N/A'}
        </span>
      )
    },
    {
      key: 'doctor',
      label: 'Doctor',
      render: (row) => row.doctor?.name || 'N/A'
    },
    {
      key: 'date',
      label: 'Date & Time',
      render: (row) => (
        <div className="flex items-center gap-1.5 text-gray-700">
          <Clock size={14} className="text-gray-400" />
          <span>{new Date(row.date).toLocaleDateString()} at {row.timeSlot}</span>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <Badge label={row.status} />
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-2xl font-bold">Welcome back, {user?.name || 'Doctor'}! 👋</h2>
          <p className="text-blue-100 text-sm mt-1">Here is the latest snapshot of your patient clinic and schedules.</p>
        </div>
        <div className="flex items-center gap-2">
          {['admin', 'receptionist'].includes(user?.role) && (
            <Link to="/appointments/new">
              <Button variant="secondary" size="sm" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                <Plus size={16} className="mr-1" /> New Appointment
              </Button>
            </Link>
          )}
          <Link to="/patients/new">
            <Button size="sm" className="bg-white text-blue-700 hover:bg-blue-50 border-0 shadow-sm">
              <Plus size={16} className="mr-1" /> Register Patient
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalPatients ?? 0}</p>
            <p className="text-sm font-medium text-gray-500">Active Patients</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalDoctors ?? 0}</p>
            <p className="text-sm font-medium text-gray-500">Doctors on Staff</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.appointmentsToday ?? 0}</p>
            <p className="text-sm font-medium text-gray-500">Today's Appointments</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
            <CalendarCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.appointmentsThisWeek ?? 0}</p>
            <p className="text-sm font-medium text-gray-500">This Week's Volume</p>
          </div>
        </Card>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <Card className="p-0 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Upcoming Appointments
            </h3>
            <Link to="/appointments" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium">
              View Calendar <ArrowRight size={14} />
            </Link>
          </div>
          <Table
            columns={appointmentCols}
            data={stats.upcomingAppointments || []}
            emptyMessage="No upcoming appointments scheduled."
          />
        </Card>

        {/* Recently Registered Patients */}
        <Card className="p-0 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-600" />
              Recently Registered Patients
            </h3>
            <Link to="/patients" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <Table
            columns={recentPatientCols}
            data={stats.recentPatients || []}
            emptyMessage="No registered patients found."
          />
        </Card>
      </div>
    </div>
  );
}
