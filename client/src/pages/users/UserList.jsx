import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Users, UserPlus, Shield, CheckCircle, Ban, Phone, Mail } from 'lucide-react';
import { getAllUsers, deactivateUser } from '../../api/users.api';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Avatar from '../../components/ui/Avatar';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../hooks/useToast';

export default function UserList() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [roleFilter, setRoleFilter] = useState('');
  const [userToDeactivate, setUserToDeactivate] = useState(null);

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await getAllUsers();
      return res.data?.users || [];
    }
  });

  const deactivateMutation = useMutation({
    mutationFn: (userId) => deactivateUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Staff member deactivated.');
      setUserToDeactivate(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to deactivate user.');
    }
  });

  const allUsers = usersData || [];
  const filteredUsers = roleFilter
    ? allUsers.filter(u => u.role === roleFilter)
    : allUsers;

  const columns = [
    {
      key: 'name',
      label: 'Staff Member',
      render: (u) => (
        <div className="flex items-center gap-3">
          <Avatar name={u.name} size="sm" />
          <div>
            <p className="font-semibold text-gray-900">{u.name}</p>
            <p className="text-xs text-gray-500">{u.email}</p>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      label: 'Role',
      render: (u) => <Badge label={u.role} />
    },
    {
      key: 'specialization',
      label: 'Specialization / Dept',
      render: (u) => u.specialization || (u.role === 'admin' ? 'Administration' : 'Front Desk')
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (u) => u.phone || '-'
    },
    {
      key: 'status',
      label: 'Status',
      render: (u) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          u.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
        }`}>
          {u.isActive ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (u) => u.isActive && u.role !== 'admin' ? (
        <Button
          size="sm"
          variant="danger"
          className="text-xs py-1 px-2"
          onClick={() => setUserToDeactivate(u)}
        >
          Deactivate
        </Button>
      ) : null
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Hospital Staff Administration</h2>
          <p className="text-gray-500 text-sm mt-1">
            Manage physician credentials, receptionists, and administrative access permissions.
          </p>
        </div>

        <Link to="/users/new">
          <Button className="flex items-center gap-2">
            <UserPlus size={18} /> Add New Staff Member
          </Button>
        </Link>
      </div>

      {/* Role Filter */}
      <Card className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-600">Filter by Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">All Roles ({allUsers.length})</option>
            <option value="admin">Administrators</option>
            <option value="doctor">Doctors / Physicians</option>
            <option value="receptionist">Receptionists</option>
          </select>
        </div>
      </Card>

      {/* Staff Table */}
      <Card className="p-0 overflow-hidden">
        <Table
          columns={columns}
          data={filteredUsers}
          loading={isLoading}
          emptyMessage="No staff members matching criteria."
        />
      </Card>

      {/* Deactivate Confirmation Modal */}
      <Modal
        isOpen={Boolean(userToDeactivate)}
        onClose={() => setUserToDeactivate(null)}
        title="Confirm Staff Deactivation"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => setUserToDeactivate(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              loading={deactivateMutation.isPending}
              onClick={() => deactivateMutation.mutate(userToDeactivate._id)}
            >
              Confirm Deactivation
            </Button>
          </div>
        }
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to deactivate <strong className="text-gray-900">{userToDeactivate?.name}</strong> ({userToDeactivate?.email})?
          This will revoke their login access immediately.
        </p>
      </Modal>
    </div>
  );
}
