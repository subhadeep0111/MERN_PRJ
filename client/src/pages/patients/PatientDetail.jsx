import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Calendar, FileText, Phone, Mail, MapPin, Heart, AlertCircle,
  Clock, Plus, Edit, ChevronRight, User, Stethoscope
} from 'lucide-react';
import { getPatientById } from '../../api/patients.api';
import { getAllAppointments } from '../../api/appointments.api';
import { getRecordsByPatient } from '../../api/records.api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import Spinner from '../../components/ui/Spinner';
import { useAuth } from '../../context/AuthContext';

export default function PatientDetail() {
  const { id } = useParams();
  const { isRole } = useAuth();
  const [activeTab, setActiveTab] = useState('records'); // 'records' or 'appointments'

  const { data: patient, isLoading: loadingPatient } = useQuery({
    queryKey: ['patient', id],
    queryFn: async () => {
      const res = await getPatientById(id);
      return res.data?.patient;
    }
  });

  const { data: appointments, isLoading: loadingAppointments } = useQuery({
    queryKey: ['patient-appointments', id],
    queryFn: async () => {
      const res = await getAllAppointments();
      const list = res.data?.appointments || [];
      return list.filter(a => a.patient?._id === id || a.patient === id);
    },
    enabled: !!id
  });

  const { data: records, isLoading: loadingRecords } = useQuery({
    queryKey: ['patient-records', id],
    queryFn: async () => {
      const res = await getRecordsByPatient(id);
      return res.data?.records || [];
    },
    enabled: !!id
  });

  if (loadingPatient) return <Spinner size="lg" />;

  if (!patient) {
    return (
      <Card className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-3" />
        <h3 className="text-lg font-semibold text-gray-800">Patient Not Found</h3>
        <p className="text-gray-500 text-sm mt-1">The requested patient record could not be located.</p>
        <Link to="/patients" className="mt-4 inline-block">
          <Button variant="secondary">Back to Patient Directory</Button>
        </Link>
      </Card>
    );
  }

  const age = patient.dob ? Math.floor((new Date() - new Date(patient.dob)) / (365.25 * 24 * 60 * 60 * 1000)) : 'N/A';

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/patients" className="text-sm font-medium text-blue-600 hover:underline">
            Patients
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-sm text-gray-700 font-medium">{patient.firstName} {patient.lastName}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isRole(['admin', 'receptionist']) && (
            <Link to={`/patients/${id}/edit`}>
              <Button variant="secondary" size="sm" className="flex items-center gap-1.5">
                <Edit size={14} /> Edit Profile
              </Button>
            </Link>
          )}

          {isRole(['admin', 'receptionist']) && (
            <Link to={`/appointments/new?patientId=${id}`}>
              <Button size="sm" className="flex items-center gap-1.5">
                <Calendar size={14} /> Schedule Visit
              </Button>
            </Link>
          )}

          {isRole(['doctor', 'admin']) && (
            <Link to={`/records/new?patientId=${id}`}>
              <Button size="sm" variant="primary" className="bg-purple-600 hover:bg-purple-700 flex items-center gap-1.5">
                <FileText size={14} /> New Record & Rx
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Grid Layout: Left Profile Card, Right Tabbed Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Demographics & Info */}
        <div className="space-y-6">
          <Card className="space-y-6">
            <div className="flex flex-col items-center text-center pb-6 border-b border-gray-100">
              <Avatar name={`${patient.firstName} ${patient.lastName}`} size="lg" />
              <h3 className="text-xl font-bold text-gray-900 mt-3">{patient.firstName} {patient.lastName}</h3>
              <div className="flex items-center gap-2 mt-2">
                <span className="font-mono text-xs font-semibold px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                  {patient.patientId}
                </span>
                <Badge label={patient.status} />
              </div>
            </div>

            {/* Vitals & Demographics Summary */}
            <div className="grid grid-cols-3 gap-2 text-center py-2 bg-gray-50 rounded-xl">
              <div>
                <p className="text-xs text-gray-500">Age</p>
                <p className="font-semibold text-gray-800">{age} yrs</p>
              </div>
              <div className="border-x border-gray-200">
                <p className="text-xs text-gray-500">Gender</p>
                <p className="font-semibold text-gray-800 capitalize">{patient.gender || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Blood</p>
                <p className="font-semibold text-rose-600">{patient.bloodGroup || 'N/A'}</p>
              </div>
            </div>

            {/* Contact Details */}
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-gray-700">
                <Phone size={16} className="text-gray-400 shrink-0" />
                <span>{patient.phone}</span>
              </div>
              {patient.email && (
                <div className="flex items-center gap-3 text-gray-700">
                  <Mail size={16} className="text-gray-400 shrink-0" />
                  <span className="truncate">{patient.email}</span>
                </div>
              )}
              {patient.address?.street && (
                <div className="flex items-start gap-3 text-gray-700">
                  <MapPin size={16} className="text-gray-400 shrink-0 mt-0.5" />
                  <span>
                    {patient.address.street}, {patient.address.city}, {patient.address.state} {patient.address.zipCode}
                  </span>
                </div>
              )}
            </div>

            {/* Assigned Doctor */}
            <div className="pt-4 border-t border-gray-100">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Assigned Physician</h4>
              {patient.assignedDoctor ? (
                <div className="flex items-center gap-3 bg-blue-50/60 p-3 rounded-lg border border-blue-100">
                  <Stethoscope className="text-blue-600 shrink-0" size={20} />
                  <div>
                    <p className="font-medium text-sm text-gray-900">{patient.assignedDoctor.name}</p>
                    <p className="text-xs text-gray-500">{patient.assignedDoctor.specialization}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No assigned physician.</p>
              )}
            </div>

            {/* Emergency Contact */}
            {patient.emergencyContact?.name && (
              <div className="pt-4 border-t border-gray-100">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Emergency Contact</h4>
                <div className="bg-amber-50/70 p-3 rounded-lg border border-amber-200/60 text-sm">
                  <p className="font-semibold text-gray-900">{patient.emergencyContact.name}</p>
                  <p className="text-xs text-gray-600 capitalize">Relation: {patient.emergencyContact.relation || 'Contact'}</p>
                  <p className="text-xs font-mono text-gray-800 mt-1">{patient.emergencyContact.phone}</p>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Medical History Tabs */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('records')}
              className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'records'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <FileText size={16} />
              Medical Consultations & Prescriptions ({records?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('appointments')}
              className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'appointments'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Calendar size={16} />
              Appointment History ({appointments?.length || 0})
            </button>
          </div>

          {/* Tab 1: Medical Records */}
          {activeTab === 'records' && (
            <div className="space-y-4">
              {loadingRecords ? (
                <Spinner />
              ) : records?.length === 0 ? (
                <Card className="text-center py-10 text-gray-400">
                  <FileText className="mx-auto h-10 w-10 text-gray-300 mb-2" />
                  <p className="font-medium text-gray-600">No medical records on file yet.</p>
                  <p className="text-xs text-gray-400 mt-1">Clinical notes and prescriptions will appear here.</p>
                  {isRole(['doctor', 'admin']) && (
                    <Link to={`/records/new?patientId=${id}`} className="mt-4 inline-block">
                      <Button size="sm">Create First Consultation Record</Button>
                    </Link>
                  )}
                </Card>
              ) : (
                records.map((rec) => (
                  <Card key={rec._id} className="hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
                      <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                          Visit on {new Date(rec.visitDate || rec.createdAt).toLocaleDateString()}
                        </span>
                        <h4 className="text-base font-bold text-gray-900 mt-0.5">
                          {rec.diagnosis || 'General Consultation'}
                        </h4>
                      </div>
                      <Link to={`/records/${rec._id}`}>
                        <Button variant="secondary" size="sm" className="flex items-center gap-1 text-xs">
                          Full Record <ChevronRight size={14} />
                        </Button>
                      </Link>
                    </div>

                    <div className="mt-3 space-y-2 text-sm text-gray-600">
                      {rec.chiefComplaint && (
                        <p><strong className="text-gray-800">Chief Complaint:</strong> {rec.chiefComplaint}</p>
                      )}
                      {rec.treatment && (
                        <p><strong className="text-gray-800">Treatment Plan:</strong> {rec.treatment}</p>
                      )}
                    </div>

                    {/* Prescriptions preview */}
                    {rec.prescriptions?.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-gray-100 bg-gray-50/70 p-3 rounded-lg">
                        <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                          Prescribed Medication ({rec.prescriptions.length})
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {rec.prescriptions.map((rx, idx) => (
                            <span key={idx} className="inline-flex items-center gap-1 bg-white border border-gray-200 px-2.5 py-1 rounded text-xs text-gray-800">
                              <span className="font-semibold text-blue-600">{rx.medication}</span>
                              <span className="text-gray-500">({rx.dosage} • {rx.frequency})</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Attachments count */}
                    {rec.attachments?.length > 0 && (
                      <div className="mt-3 text-xs text-gray-500 flex items-center gap-1">
                        <FileText size={14} className="text-blue-500" />
                        <span>{rec.attachments.length} attachment(s) uploaded (Prescriptions / Lab Scans)</span>
                      </div>
                    )}
                  </Card>
                ))
              )}
            </div>
          )}

          {/* Tab 2: Appointments */}
          {activeTab === 'appointments' && (
            <div className="space-y-3">
              {loadingAppointments ? (
                <Spinner />
              ) : appointments?.length === 0 ? (
                <Card className="text-center py-10 text-gray-400">
                  <Calendar className="mx-auto h-10 w-10 text-gray-300 mb-2" />
                  <p className="font-medium text-gray-600">No appointments scheduled.</p>
                  {isRole(['admin', 'receptionist']) && (
                    <Link to={`/appointments/new?patientId=${id}`} className="mt-4 inline-block">
                      <Button size="sm">Book New Appointment</Button>
                    </Link>
                  )}
                </Card>
              ) : (
                appointments.map((appt) => (
                  <Card key={appt._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">
                          {new Date(appt.date).toLocaleDateString()} at {appt.timeSlot}
                        </span>
                        <Badge label={appt.status} />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Doctor: {appt.doctor?.name || 'Assigned Doctor'}</p>
                      {appt.reason && (
                        <p className="text-sm text-gray-600 mt-1 italic">"{appt.reason}"</p>
                      )}
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
