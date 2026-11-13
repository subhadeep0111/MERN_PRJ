import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Search, Plus, Eye, Edit, Calendar, FileText, UserPlus } from 'lucide-react';
import { getAllPatients } from '../../api/patients.api';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Avatar from '../../components/ui/Avatar';
import { useAuth } from '../../context/AuthContext';

export default function PatientList() {
  const { isRole } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data, isLoading } = useQuery({
    queryKey: ['patients', debouncedSearch, statusFilter],
    queryFn: async () => {
      const params = {};
      if (debouncedSearch) params.search = debouncedSearch;
      if (statusFilter) params.status = statusFilter;
      const res = await getAllPatients(params);
      return res.data;
    }
  });

  const patients = data?.patients || [];

  const columns = [
    {
      key: 'patientId',
      label: 'Patient ID',
      render: (p) => (
        <span className="font-mono text-xs font-semibold px-2 py-1 bg-gray-100 text-gray-800 rounded">
          {p.patientId}
        </span>
      )
    },
    {
      key: 'name',
      label: 'Patient Name',
      render: (p) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={`${p.firstName} ${p.lastName}`} size="sm" />
          <div>
            <Link to={`/patients/${p._id}`} className="font-medium text-gray-900 hover:text-blue-600">
              {p.firstName} {p.lastName}
            </Link>
            <p className="text-xs text-gray-500">{p.gender} • {p.bloodGroup || 'Blood: N/A'}</p>
          </div>
        </div>
      )
    },
    {
      key: 'dob',
      label: 'Age / DOB',
      render: (p) => {
        if (!p.dob) return 'N/A';
        const dob = new Date(p.dob);
        const age = Math.floor((new Date() - dob) / (365.25 * 24 * 60 * 60 * 1000));
        return (
          <div>
            <span className="text-gray-900 font-medium">{age} yrs</span>
            <p className="text-xs text-gray-500">{dob.toLocaleDateString()}</p>
          </div>
        );
      }
    },
    { key: 'phone', label: 'Phone' },
    {
      key: 'assignedDoctor',
      label: 'Assigned Doctor',
      render: (p) => p.assignedDoctor ? (
        <div>
          <span className="text-gray-900 font-medium">{p.assignedDoctor.name}</span>
          <p className="text-xs text-gray-500">{p.assignedDoctor.specialization}</p>
        </div>
      ) : (
        <span className="text-gray-400 italic">Unassigned</span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (p) => <Badge label={p.status} />
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (p) => (
        <div className="flex items-center gap-1.5">
          <Link to={`/patients/${p._id}`} title="View Patient Details">
            <button className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
              <Eye size={16} />
            </button>
          </Link>

          {isRole(['admin', 'receptionist']) && (
            <Link to={`/patients/${p._id}/edit`} title="Edit Patient Profile">
              <button className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors">
                <Edit size={16} />
              </button>
            </Link>
          )}

          {isRole(['admin', 'receptionist']) && (
            <Link to={`/appointments/new?patientId=${p._id}`} title="Book Appointment">
              <button className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors">
                <Calendar size={16} />
              </button>
            </Link>
          )}

          {isRole(['doctor', 'admin']) && (
            <Link to={`/records/new?patientId=${p._id}`} title="Create Medical Record / Prescription">
              <button className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors">
                <FileText size={16} />
              </button>
            </Link>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Patient Directory</h2>
          <p className="text-gray-500 text-sm mt-1">Manage and track registered patient records and clinical visits.</p>
        </div>
        {isRole(['admin', 'receptionist']) && (
          <Link to="/patients/new">
            <Button className="flex items-center gap-2">
              <UserPlus size={18} />
              <span>Register Patient</span>
            </Button>
          </Link>
        )}
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, phone, or patient ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="w-full sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Patient Table */}
      <Card className="p-0 overflow-hidden">
        <Table
          columns={columns}
          data={patients}
          loading={isLoading}
          emptyMessage="No patients matching your criteria."
        />
      </Card>
    </div>
  );
}
