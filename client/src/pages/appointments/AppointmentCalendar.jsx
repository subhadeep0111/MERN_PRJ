import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Calendar as CalendarIcon, Clock, User, Plus, Filter, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { getAllAppointments, updateAppointment } from '../../api/appointments.api';
import { getAllUsers } from '../../api/users.api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';

const localizer = momentLocalizer(moment);

export default function AppointmentCalendar() {
  const { isRole } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState('month');
  const [currentDate, setCurrentDate] = useState(new Date());

  // Fetch doctors for filter
  const { data: doctorsData } = useQuery({
    queryKey: ['doctors'],
    queryFn: async () => {
      const res = await getAllUsers();
      const users = res.data?.users || [];
      return users.filter(u => u.role === 'doctor' && u.isActive);
    }
  });
  const doctors = doctorsData || [];

  // Fetch appointments
  const { data: appointmentsData, isLoading } = useQuery({
    queryKey: ['appointments', selectedDoctor],
    queryFn: async () => {
      const params = {};
      if (selectedDoctor) params.doctor = selectedDoctor;
      const res = await getAllAppointments(params);
      return res.data?.appointments || [];
    }
  });

  const appointments = appointmentsData || [];

  // Transform appointments into events for react-big-calendar
  const events = useMemo(() => {
    return appointments.map((a) => {
      const [year, month, day] = a.date.split('T')[0].split('-').map(Number);
      const [hours, minutes] = (a.timeSlot || '09:00').split(':').map(Number);

      const start = new Date(year, month - 1, day, hours, minutes);
      const end = new Date(start.getTime() + (a.duration || 30) * 60000);

      const patientName = a.patient ? `${a.patient.firstName} ${a.patient.lastName}` : 'Patient';
      const doctorName = a.doctor?.name ? `(${a.doctor.name})` : '';

      return {
        id: a._id,
        title: `${a.timeSlot} - ${patientName} ${doctorName}`,
        start,
        end,
        resource: a
      };
    });
  }, [appointments]);

  // Status update mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => updateAppointment(id, { status }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success(`Appointment status updated to ${vars.status}`);
      setIsModalOpen(false);
      setSelectedEvent(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update status.');
    }
  });

  const handleSelectEvent = (event) => {
    setSelectedEvent(event.resource);
    setIsModalOpen(true);
  };

  // Color events by status
  const eventPropGetter = (event) => {
    const status = event.resource?.status;
    let bg = '#3b82f6'; // default blue

    if (status === 'confirmed') bg = '#10b981'; // emerald
    else if (status === 'completed') bg = '#64748b'; // slate
    else if (status === 'cancelled') bg = '#ef4444'; // red
    else if (status === 'no-show') bg = '#f97316'; // orange

    return {
      style: {
        backgroundColor: bg,
        borderRadius: '6px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block',
        fontSize: '12px',
        fontWeight: '500',
        padding: '2px 6px'
      }
    };
  };

  return (
    <div className="space-y-6">
      <style>{`
        .rbc-calendar { font-family: inherit; }
        .rbc-header { padding: 8px 4px; font-weight: 600; color: #475569; font-size: 0.85rem; }
        .rbc-today { background-color: #f0f7ff; }
        .rbc-event:focus { outline: none; }
        .rbc-toolbar button { font-size: 13px; font-weight: 500; border-radius: 6px; }
        .rbc-toolbar button.rbc-active { background-color: #2563eb; color: white; border-color: #2563eb; }
      `}</style>

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Appointment Calendar</h2>
          <p className="text-gray-500 text-sm mt-1">Schedule, track, and manage patient visits and doctor availability.</p>
        </div>

        {isRole(['admin', 'receptionist']) && (
          <Link to="/appointments/new">
            <Button className="flex items-center gap-2">
              <Plus size={18} /> Schedule Appointment
            </Button>
          </Link>
        )}
      </div>

      {/* Controls: Doctor Filter & Legend */}
      <Card className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Filter size={18} className="text-gray-400 shrink-0" />
          <select
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
            className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">All Physicians</option>
            {doctors.map((d) => (
              <option key={d._id} value={d._id}>{d.name} ({d.specialization})</option>
            ))}
          </select>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-gray-600">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-500"></span> Scheduled
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span> Confirmed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-slate-500"></span> Completed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500"></span> Cancelled
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-orange-500"></span> No-show
          </span>
        </div>
      </Card>

      {/* Calendar Area */}
      <Card className="p-4 bg-white min-h-[650px]">
        {isLoading ? (
          <Spinner size="lg" />
        ) : (
          <BigCalendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 620 }}
            view={currentView}
            onView={(view) => setCurrentView(view)}
            date={currentDate}
            onNavigate={(date) => setCurrentDate(date)}
            eventPropGetter={eventPropGetter}
            onSelectEvent={handleSelectEvent}
            popup
          />
        )}
      </Card>

      {/* Event Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Appointment Information"
        footer={
          selectedEvent && (
            <div className="flex flex-wrap items-center justify-between w-full gap-2">
              <div className="flex items-center gap-2">
                {selectedEvent.status !== 'confirmed' && selectedEvent.status !== 'completed' && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                    onClick={() => updateStatusMutation.mutate({ id: selectedEvent._id, status: 'confirmed' })}
                    loading={updateStatusMutation.isPending}
                  >
                    Confirm
                  </Button>
                )}
                {selectedEvent.status !== 'completed' && selectedEvent.status !== 'cancelled' && (
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => updateStatusMutation.mutate({ id: selectedEvent._id, status: 'completed' })}
                    loading={updateStatusMutation.isPending}
                  >
                    Mark Completed
                  </Button>
                )}
                {selectedEvent.status !== 'cancelled' && (
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => updateStatusMutation.mutate({ id: selectedEvent._id, status: 'cancelled' })}
                    loading={updateStatusMutation.isPending}
                  >
                    Cancel
                  </Button>
                )}
              </div>
              <Button size="sm" variant="ghost" onClick={() => setIsModalOpen(false)}>
                Close
              </Button>
            </div>
          )
        }
      >
        {selectedEvent && (
          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <span className="text-gray-500 font-medium">Status</span>
              <Badge label={selectedEvent.status} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-500">Patient</p>
                <Link
                  to={`/patients/${selectedEvent.patient?._id}`}
                  className="font-semibold text-blue-600 hover:underline"
                >
                  {selectedEvent.patient?.firstName} {selectedEvent.patient?.lastName}
                </Link>
                <p className="text-xs text-gray-400 font-mono mt-0.5">{selectedEvent.patient?.patientId}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Physician</p>
                <p className="font-semibold text-gray-900">{selectedEvent.doctor?.name}</p>
                <p className="text-xs text-gray-500">{selectedEvent.doctor?.specialization}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <p className="text-xs text-gray-500">Date</p>
                <p className="font-medium text-gray-800">{new Date(selectedEvent.date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Time Slot & Duration</p>
                <p className="font-medium text-gray-800">{selectedEvent.timeSlot} ({selectedEvent.duration || 30} mins)</p>
              </div>
            </div>

            {selectedEvent.reason && (
              <div className="pt-2">
                <p className="text-xs text-gray-500">Reason for Visit</p>
                <p className="bg-gray-50 p-2.5 rounded-lg text-gray-700 mt-1">{selectedEvent.reason}</p>
              </div>
            )}

            {selectedEvent.notes && (
              <div>
                <p className="text-xs text-gray-500">Clinical / Administrative Notes</p>
                <p className="bg-gray-50 p-2.5 rounded-lg text-gray-700 mt-1">{selectedEvent.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
