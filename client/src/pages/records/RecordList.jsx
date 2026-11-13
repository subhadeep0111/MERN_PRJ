import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { FileText, Plus, Eye, Stethoscope, Paperclip, Search } from 'lucide-react';
import { getRecordsByPatient } from '../../api/records.api';
import { getAllPatients } from '../../api/patients.api';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';

export default function RecordList() {
  const { isRole } = useAuth();
  const [searchParams] = useSearchParams();
  const initialPatientId = searchParams.get('patientId') || '';
  const [selectedPatientId, setSelectedPatientId] = useState(initialPatientId);

  // Fetch all patients for dropdown
  const { data: patientsData } = useQuery({
    queryKey: ['all-patients'],
    queryFn: async () => {
      const res = await getAllPatients({ limit: 100 });
      return res.data?.patients || [];
    }
  });
  const patients = patientsData || [];

  // Fetch records
  const { data: recordsData, isLoading } = useQuery({
    queryKey: ['records', selectedPatientId],
    queryFn: async () => {
      const res = await getRecordsByPatient(selectedPatientId);
      return res.data?.records || [];
    }
  });

  const records = recordsData || [];

  const columns = [
    {
      key: 'visitDate',
      label: 'Visit Date',
      render: (r) => (
        <span className="font-semibold text-gray-900">
          {new Date(r.visitDate || r.createdAt).toLocaleDateString()}
        </span>
      )
    },
    {
      key: 'patient',
      label: 'Patient',
      render: (r) => r.patient ? (
        <div>
          <Link to={`/patients/${r.patient._id}`} className="font-medium text-blue-600 hover:underline">
            {r.patient.firstName} {r.patient.lastName}
          </Link>
          <p className="text-xs font-mono text-gray-400">{r.patient.patientId}</p>
        </div>
      ) : (
        <span className="text-gray-400">N/A</span>
      )
    },
    {
      key: 'doctor',
      label: 'Consulting Physician',
      render: (r) => r.doctor ? (
        <div>
          <span className="font-medium text-gray-800">{r.doctor.name}</span>
          <p className="text-xs text-gray-500">{r.doctor.specialization}</p>
        </div>
      ) : 'N/A'
    },
    {
      key: 'diagnosis',
      label: 'Diagnosis / Chief Complaint',
      render: (r) => (
        <div>
          <p className="font-semibold text-gray-900 line-clamp-1">{r.diagnosis || 'General Consultation'}</p>
          {r.chiefComplaint && <p className="text-xs text-gray-500 line-clamp-1">{r.chiefComplaint}</p>}
        </div>
      )
    },
    {
      key: 'prescriptions',
      label: 'Prescriptions',
      render: (r) => (
        <span className="text-xs font-semibold px-2 py-1 bg-blue-50 text-blue-700 rounded-full">
          {r.prescriptions?.length || 0} Med(s)
        </span>
      )
    },
    {
      key: 'attachments',
      label: 'Files',
      render: (r) => (
        <span className="inline-flex items-center gap-1 text-xs text-gray-500">
          <Paperclip size={12} />
          {r.attachments?.length || 0}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <Link to={`/records/${r._id}`}>
          <Button variant="secondary" size="sm" className="flex items-center gap-1 text-xs">
            <Eye size={14} /> View Record
          </Button>
        </Link>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Clinical & Medical Records</h2>
          <p className="text-gray-500 text-sm mt-1">
            Access patient diagnosis histories, prescription details, and lab document scans.
          </p>
        </div>

        {isRole(['doctor', 'admin']) && (
          <Link to={selectedPatientId ? `/records/new?patientId=${selectedPatientId}` : '/records/new'}>
            <Button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700">
              <Plus size={18} /> New Medical Record & Rx
            </Button>
          </Link>
        )}
      </div>

      {/* Filter by Patient */}
      <Card className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Search size={18} className="text-gray-400 shrink-0" />
          <select
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            className="w-full sm:w-80 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">All Patients (Recent Records)</option>
            {patients.map((p) => (
              <option key={p._id} value={p._id}>
                {p.firstName} {p.lastName} ({p.patientId})
              </option>
            ))}
          </select>
        </div>

        {selectedPatientId && (
          <button
            onClick={() => setSelectedPatientId('')}
            className="text-xs text-blue-600 hover:underline font-medium"
          >
            Clear Patient Filter
          </button>
        )}
      </Card>

      {/* Records Table */}
      <Card className="p-0 overflow-hidden">
        <Table
          columns={columns}
          data={records}
          loading={isLoading}
          emptyMessage="No clinical records found."
        />
      </Card>
    </div>
  );
}
