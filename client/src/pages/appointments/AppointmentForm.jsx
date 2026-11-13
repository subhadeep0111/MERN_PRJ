import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Calendar, Clock, User, ArrowLeft, Check, AlertCircle } from 'lucide-react';
import { createAppointment, getAvailableSlots } from '../../api/appointments.api';
import { getAllPatients, getPatientById } from '../../api/patients.api';
import { getAllUsers } from '../../api/users.api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { useToast } from '../../hooks/useToast';

export default function AppointmentForm() {
  const [searchParams] = useSearchParams();
  const preselectedPatientId = searchParams.get('patientId') || '';
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: {
      patient: preselectedPatientId,
      duration: 30
    }
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

  // If patientId is provided in URL, fetch patient details
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
      if (currentPatient?.assignedDoctor?._id) {
        setSelectedDoctor(currentPatient.assignedDoctor._id);
        setValue('doctor', currentPatient.assignedDoctor._id);
      }
    }
  }, [preselectedPatientId, currentPatient, setValue]);

  // Fetch slots when doctor and date are chosen
  const { data: slotsData, isLoading: loadingSlots } = useQuery({
    queryKey: ['slots', selectedDoctor, selectedDate],
    queryFn: async () => {
      const res = await getAvailableSlots(selectedDoctor, selectedDate);
      return res.data;
    },
    enabled: Boolean(selectedDoctor && selectedDate)
  });

  const mutation = useMutation({
    mutationFn: (formData) => createAppointment(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Appointment scheduled successfully!');
      navigate('/appointments');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to schedule appointment.');
    }
  });

  const onSubmit = (data) => {
    if (!selectedSlot) {
      toast.error('Please select an available time slot.');
      return;
    }
    mutation.mutate({
      ...data,
      doctor: selectedDoctor,
      date: selectedDate,
      timeSlot: selectedSlot
    });
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/appointments" className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900">
          <ArrowLeft size={16} /> Back to Calendar
        </Link>
        <h2 className="text-xl font-bold text-gray-900">Schedule New Appointment</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="space-y-5">
          <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2 border-b pb-3">
            <Calendar size={18} className="text-blue-600" /> Appointment Details
          </h3>

          {/* Patient Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Patient *</label>
            {preselectedPatientId && currentPatient ? (
              <div className="bg-blue-50/70 border border-blue-200 p-3 rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{currentPatient.firstName} {currentPatient.lastName}</p>
                  <p className="text-xs text-gray-500 font-mono">ID: {currentPatient.patientId} • Phone: {currentPatient.phone}</p>
                </div>
                <span className="text-xs font-semibold px-2 py-1 bg-blue-600 text-white rounded">Preselected</span>
              </div>
            ) : (
              <select
                {...register('patient', { required: 'Please select a patient' })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 bg-white"
              >
                <option value="">-- Choose Patient --</option>
                {patients.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.firstName} {p.lastName} ({p.patientId}) - {p.phone}
                  </option>
                ))}
              </select>
            )}
            {errors.patient && <p className="text-xs text-red-500 mt-1">{errors.patient.message}</p>}
          </div>

          {/* Doctor Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Physician *</label>
            <select
              value={selectedDoctor}
              onChange={(e) => {
                setSelectedDoctor(e.target.value);
                setSelectedSlot('');
              }}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 bg-white"
            >
              <option value="">-- Choose Physician --</option>
              {doctors.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name} ({d.specialization || 'General'})
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Date *</label>
            <input
              type="date"
              min={todayStr}
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setSelectedSlot('');
              }}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 bg-white"
            />
          </div>

          {/* Time Slot Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center justify-between">
              <span>Available Time Slots *</span>
              {selectedSlot && (
                <span className="text-xs text-blue-600 font-semibold">Selected: {selectedSlot}</span>
              )}
            </label>

            {!selectedDoctor || !selectedDate ? (
              <p className="text-xs text-gray-400 bg-gray-50 p-4 rounded-lg text-center">
                Select both a physician and a date above to display available slots.
              </p>
            ) : loadingSlots ? (
              <Spinner size="sm" />
            ) : slotsData ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {slotsData.allSlots?.map((slot) => {
                  const isBooked = slotsData.bookedSlots?.includes(slot);
                  const isSelected = selectedSlot === slot;

                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={isBooked}
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all flex items-center justify-center gap-1 ${
                        isBooked
                          ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed line-through'
                          : isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                      }`}
                    >
                      {isSelected && <Check size={12} />}
                      {slot}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-red-500">Could not retrieve slots.</p>
            )}
          </div>

          {/* Reason for Visit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Visit</label>
            <textarea
              {...register('reason')}
              rows={2}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
              placeholder="e.g. Follow-up consultation, chronic knee pain..."
            />
          </div>

          {/* Internal Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              {...register('notes')}
              rows={2}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
              placeholder="Special instructions or prep for the visit..."
            />
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <Link to="/appointments">
            <Button variant="secondary" type="button">Cancel</Button>
          </Link>
          <Button
            type="submit"
            loading={mutation.isPending}
            disabled={!selectedSlot}
            className="flex items-center gap-2"
          >
            <span>Confirm Appointment</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
