import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { UserPlus, ArrowLeft, Save, Shield, Stethoscope } from 'lucide-react';
import { createUser } from '../../api/users.api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useToast } from '../../hooks/useToast';

export default function UserForm() {
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      role: 'doctor',
      isActive: true
    }
  });

  const selectedRole = watch('role');

  const mutation = useMutation({
    mutationFn: (formData) => createUser(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Staff member onboarded successfully!');
      navigate('/users');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to create staff member.');
    }
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/users" className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900">
          <ArrowLeft size={16} /> Back to Staff
        </Link>
        <h2 className="text-xl font-bold text-gray-900">Onboard Staff Member</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="space-y-4">
          <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2 border-b pb-3">
            <UserPlus size={18} className="text-blue-600" /> Account Credentials & Role
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input
              {...register('name', { required: 'Full name is required' })}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
              placeholder="e.g. Dr. Jennifer Adams"
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
              <input
                type="email"
                {...register('email', { required: 'Email address is required' })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
                placeholder="staff@medcare.com"
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Initial Password *</label>
              <input
                type="password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Password must be at least 6 characters' }
                })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
                placeholder="••••••••"
              />
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">System Role *</label>
              <select
                {...register('role')}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 bg-white"
              >
                <option value="doctor">Doctor / Physician</option>
                <option value="receptionist">Receptionist / Front Desk</option>
                <option value="admin">System Administrator</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
              <input
                {...register('phone')}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
                placeholder="555-0155"
              />
            </div>
          </div>

          {selectedRole === 'doctor' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Medical Specialization</label>
              <input
                {...register('specialization')}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
                placeholder="e.g. Cardiology, Neurology, Pediatrics, Orthopedics"
              />
            </div>
          )}
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <Link to="/users">
            <Button variant="secondary" type="button">Cancel</Button>
          </Link>
          <Button type="submit" loading={mutation.isPending} className="flex items-center gap-2">
            <Save size={16} />
            <span>Create Staff Account</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
