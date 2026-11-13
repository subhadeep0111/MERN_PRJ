import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { User, Phone, MapPin, Heart, ArrowLeft, Save } from 'lucide-react';
import { getPatientById, createPatient, updatePatient } from '../../api/patients.api';
import { getAllUsers } from '../../api/users.api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { useToast } from '../../hooks/useToast';

export default function PatientForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // Fetch doctors for assignedDoctor dropdown
  const { data: doctorsData } = useQuery({
    queryKey: ['doctors'],
    queryFn: async () => {
      const res = await getAllUsers();
      const users = res.data?.users || [];
      return users.filter(u => u.role === 'doctor' && u.isActive);
    }
  });
  const doctors = doctorsData || [];

  // If in edit mode, fetch existing patient data
  const { data: existingPatient, isLoading: loadingExisting } = useQuery({
    queryKey: ['patient', id],
    queryFn: async () => {
      const res = await getPatientById(id);
      return res.data?.patient;
    },
    enabled: isEdit
  });

  useEffect(() => {
    if (existingPatient) {
      reset({
        firstName: existingPatient.firstName,
        lastName: existingPatient.lastName,
        dob: existingPatient.dob ? existingPatient.dob.split('T')[0] : '',
        gender: existingPatient.gender || 'male',
        bloodGroup: existingPatient.bloodGroup || '',
        phone: existingPatient.phone,
        email: existingPatient.email || '',
        status: existingPatient.status || 'active',
        assignedDoctor: existingPatient.assignedDoctor?._id || existingPatient.assignedDoctor || '',
        address: {
          street: existingPatient.address?.street || '',
          city: existingPatient.address?.city || '',
          state: existingPatient.address?.state || '',
          zipCode: existingPatient.address?.zipCode || ''
        },
        emergencyContact: {
          name: existingPatient.emergencyContact?.name || '',
          phone: existingPatient.emergencyContact?.phone || '',
          relation: existingPatient.emergencyContact?.relation || ''
        }
      });
    }
  }, [existingPatient, reset]);

  const mutation = useMutation({
    mutationFn: async (formData) => {
      if (isEdit) {
        return updatePatient(id, formData);
      } else {
        return createPatient(formData);
      }
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      if (isEdit) queryClient.invalidateQueries({ queryKey: ['patient', id] });
      toast.success(isEdit ? 'Patient profile updated successfully!' : 'Patient registered successfully!');
      navigate('/patients');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to save patient record.');
    }
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  if (isEdit && loadingExisting) return <Spinner size="lg" />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top back nav */}
      <div className="flex items-center justify-between">
        <Link to="/patients" className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900">
          <ArrowLeft size={16} /> Back to Directory
        </Link>
        <h2 className="text-xl font-bold text-gray-900">
          {isEdit ? `Edit Patient Profile (${existingPatient?.patientId || ''})` : 'Register New Patient'}
        </h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Personal & Demographic Details */}
        <Card className="space-y-4">
          <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2 border-b pb-3">
            <User size={18} className="text-blue-600" /> Personal Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
              <input
                {...register('firstName', { required: 'First name is required' })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
                placeholder="e.g. John"
              />
              {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
              <input
                {...register('lastName', { required: 'Last name is required' })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
                placeholder="e.g. Doe"
              />
              {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
              <input
                type="date"
                {...register('dob', { required: 'Date of birth is required' })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 bg-white"
              />
              {errors.dob && <p className="text-xs text-red-500 mt-1">{errors.dob.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                {...register('gender')}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 bg-white"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
              <select
                {...register('bloodGroup')}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 bg-white"
              >
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Physician</label>
              <select
                {...register('assignedDoctor')}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 bg-white"
              >
                <option value="">Select a Doctor</option>
                {doctors.map((doc) => (
                  <option key={doc._id} value={doc._id}>
                    {doc.name} ({doc.specialization || 'General'})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Contact Information */}
        <Card className="space-y-4">
          <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2 border-b pb-3">
            <Phone size={18} className="text-emerald-600" /> Contact Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Primary Phone *</label>
              <input
                {...register('phone', { required: 'Phone number is required' })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
                placeholder="e.g. 555-0123"
              />
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                {...register('email')}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
                placeholder="e.g. patient@example.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
              <input
                {...register('address.street')}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
                placeholder="123 Health Ave"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                {...register('address.city')}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
                placeholder="Metroville"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <input
                {...register('address.state')}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
                placeholder="CA"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
              <input
                {...register('address.zipCode')}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
                placeholder="90210"
              />
            </div>
          </div>
        </Card>

        {/* Emergency Contact */}
        <Card className="space-y-4">
          <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2 border-b pb-3">
            <Heart size={18} className="text-rose-600" /> Emergency Contact
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
              <input
                {...register('emergencyContact.name')}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
                placeholder="Relative / Spouse name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
              <input
                {...register('emergencyContact.relation')}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
                placeholder="e.g. Spouse, Parent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Phone</label>
              <input
                {...register('emergencyContact.phone')}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
                placeholder="555-0999"
              />
            </div>
          </div>
        </Card>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link to="/patients">
            <Button variant="secondary" type="button">Cancel</Button>
          </Link>
          <Button type="submit" loading={mutation.isPending} className="flex items-center gap-2">
            <Save size={16} />
            <span>{isEdit ? 'Save Changes' : 'Register Patient'}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
