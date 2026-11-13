import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { FileText, Plus, Trash2, ArrowLeft, Save, Pill, Activity, User } from 'lucide-react';
import { createRecord } from '../../api/records.api';
import { getAllPatients, getPatientById } from '../../api/patients.api';
import { getAllUsers } from '../../api/users.api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../context/AuthContext';

export default function RecordForm() {
  const [searchParams] = useSearchParams();
  const preselectedPatientId = searchParams.get('patientId') || '';
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { register, control, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: {
      patient: preselectedPatientId,
      doctor: user?.id || '',
      visitDate: new Date().toISOString().split('T')[0],
      prescriptions: [
        { medication: '', dosage: '', frequency: '', duration: '' }
      ],
      labResults: []
    }
  });

  const {
    fields: prescriptionFields,
    append: appendPrescription,
    remove: removePrescription
  } = useFieldArray({
    control,
    name: 'prescriptions'
  });

  const {
    fields: labFields,
    append: appendLab,
    remove: removeLab
  } = useFieldArray({
    control,
    name: 'labResults'
  });

  // Fetch doctors
  const { data: doctorsData } = useQuery({
    queryKey: ['doctors'],
    queryFn: async () => {
      const res = await getAllUsers();
      const users = res.data?.users || [];
      return users.filter(u => u.role === 'doctor' && u.isActive);
    }
  });
  const doctors = doctorsData || [];

  // Fetch patients if needed
  const { data: patientsData } = useQuery({
    queryKey: ['all-patients'],
    queryFn: async () => {
      const res = await getAllPatients({ limit: 100 });
      return res.data?.patients || [];
    }
  });
  const patients = patientsData || [];

  // Fetch preselected patient details
  const { data: currentPatient } = useQuery({
    queryKey: ['patient', preselectedPatientId],
    queryFn: async () => {
      const res = await getPatientById(preselectedPatientId);
      return res.data?.patient;
    },
    enabled: !!preselectedPatientId
  });

  useEffect(() => {
    if (preselectedPatientId) {
      setValue('patient', preselectedPatientId);
    }
    if (user?.role === 'doctor' && user.id) {
      setValue('doctor', user.id);
    }
  }, [preselectedPatientId, user, setValue]);

  const mutation = useMutation({
    mutationFn: (formData) => createRecord(formData),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['records'] });
      queryClient.invalidateQueries({ queryKey: ['patient-records'] });
      toast.success('Consultation record created successfully!');
      const newId = res.data?.record?._id;
      if (newId) {
        navigate(`/records/${newId}`);
      } else {
        navigate('/records');
      }
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to save medical record.');
    }
  });

  const onSubmit = (data) => {
    // Filter out completely empty prescription rows
    const cleanedPrescriptions = (data.prescriptions || []).filter(p => p.medication && p.medication.trim() !== '');
    const cleanedLabResults = (data.labResults || []).filter(l => l.testName && l.testName.trim() !== '');

    mutation.mutate({
      ...data,
      prescriptions: cleanedPrescriptions,
      labResults: cleanedLabResults
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top back nav */}
      <div className="flex items-center justify-between">
        <Link to="/records" className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900">
          <ArrowLeft size={16} /> Back to Records
        </Link>
        <h2 className="text-xl font-bold text-gray-900">New Clinical Consultation & Prescription</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Core Metadata */}
        <Card className="space-y-4">
          <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2 border-b pb-3">
            <User size={18} className="text-blue-600" /> Visit & Patient Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Patient *</label>
              {preselectedPatientId && currentPatient ? (
                <div className="bg-blue-50/70 border border-blue-200 p-2.5 rounded-lg flex items-center justify-between">
                  <span className="font-semibold text-sm text-gray-900">
                    {currentPatient.firstName} {currentPatient.lastName} ({currentPatient.patientId})
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-blue-600 text-white rounded">Preselected</span>
                </div>
              ) : (
                <select
                  {...register('patient', { required: 'Please select a patient' })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 bg-white"
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.firstName} {p.lastName} ({p.patientId})
                    </option>
                  ))}
                </select>
              )}
              {errors.patient && <p className="text-xs text-red-500 mt-1">{errors.patient.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Visit Date *</label>
              <input
                type="date"
                {...register('visitDate', { required: 'Visit date required' })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Physician *</label>
              <select
                {...register('doctor', { required: 'Doctor required' })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 bg-white"
              >
                <option value="">-- Select Physician --</option>
                {doctors.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name} ({d.specialization || 'General'})
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Recommended Follow-up Date</label>
              <input
                type="date"
                {...register('followUpDate')}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 bg-white"
              />
            </div>
          </div>
        </Card>

        {/* Clinical Assessment */}
        <Card className="space-y-4">
          <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2 border-b pb-3">
            <FileText size={18} className="text-purple-600" /> Clinical Assessment
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Chief Complaint *</label>
            <textarea
              {...register('chiefComplaint', { required: 'Chief complaint is required' })}
              rows={2}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
              placeholder="Primary symptoms described by patient..."
            />
            {errors.chiefComplaint && <p className="text-xs text-red-500 mt-1">{errors.chiefComplaint.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Clinical Diagnosis *</label>
            <textarea
              {...register('diagnosis', { required: 'Diagnosis is required' })}
              rows={2}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
              placeholder="e.g. Essential Hypertension, Acute Bronchitis..."
            />
            {errors.diagnosis && <p className="text-xs text-red-500 mt-1">{errors.diagnosis.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Treatment Plan & Advice</label>
            <textarea
              {...register('treatment')}
              rows={3}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
              placeholder="Therapeutic plan, diet instructions, lifestyle recommendations..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Physician Notes</label>
            <textarea
              {...register('notes')}
              rows={2}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
              placeholder="Private clinical notes..."
            />
          </div>
        </Card>

        {/* Dynamic Prescription Rows */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Pill size={18} className="text-blue-600" /> Prescribed Medications
            </h3>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => appendPrescription({ medication: '', dosage: '', frequency: '', duration: '' })}
              className="flex items-center gap-1 text-xs"
            >
              <Plus size={14} /> Add Medicine
            </Button>
          </div>

          {prescriptionFields.length === 0 ? (
            <p className="text-sm text-gray-400 italic py-2">Click "Add Medicine" to prescribe medications.</p>
          ) : (
            <div className="space-y-3">
              {prescriptionFields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-1 sm:grid-cols-9 gap-2 items-center bg-gray-50/70 p-3 rounded-lg border">
                  <div className="sm:col-span-3">
                    <input
                      {...register(`prescriptions.${index}.medication`)}
                      placeholder="Medication name (e.g. Amoxicillin)"
                      className="w-full border rounded px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <input
                      {...register(`prescriptions.${index}.dosage`)}
                      placeholder="Dosage (e.g. 500mg)"
                      className="w-full border rounded px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <input
                      {...register(`prescriptions.${index}.frequency`)}
                      placeholder="Freq (e.g. BID, Once daily)"
                      className="w-full border rounded px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <input
                      {...register(`prescriptions.${index}.duration`)}
                      placeholder="e.g. 7 days"
                      className="w-full border rounded px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="sm:col-span-1 flex justify-center">
                    <button
                      type="button"
                      onClick={() => removePrescription(index)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                      title="Remove"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Dynamic Lab Results Rows */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Activity size={18} className="text-emerald-600" /> Laboratory / Diagnostic Results
            </h3>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => appendLab({ testName: '', result: '', unit: '', normalRange: '' })}
              className="flex items-center gap-1 text-xs"
            >
              <Plus size={14} /> Add Lab Test
            </Button>
          </div>

          {labFields.length === 0 ? (
            <p className="text-sm text-gray-400 italic py-2">Click "Add Lab Test" if clinical labs were performed.</p>
          ) : (
            <div className="space-y-3">
              {labFields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-1 sm:grid-cols-9 gap-2 items-center bg-gray-50/70 p-3 rounded-lg border">
                  <div className="sm:col-span-3">
                    <input
                      {...register(`labResults.${index}.testName`)}
                      placeholder="Test name (e.g. HbA1c)"
                      className="w-full border rounded px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <input
                      {...register(`labResults.${index}.result`)}
                      placeholder="Result value"
                      className="w-full border rounded px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <input
                      {...register(`labResults.${index}.unit`)}
                      placeholder="Unit (e.g. mg/dL, %)"
                      className="w-full border rounded px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <input
                      {...register(`labResults.${index}.normalRange`)}
                      placeholder="Normal range"
                      className="w-full border rounded px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="sm:col-span-1 flex justify-center">
                    <button
                      type="button"
                      onClick={() => removeLab(index)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                      title="Remove"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <Link to="/records">
            <Button variant="secondary" type="button">Cancel</Button>
          </Link>
          <Button
            type="submit"
            loading={mutation.isPending}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
          >
            <Save size={16} />
            <span>Save Consultation Record</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
