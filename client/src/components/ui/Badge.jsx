import { clsx } from 'clsx';
const colorMap = {
  scheduled: 'bg-blue-100 text-blue-800',
  confirmed: 'bg-green-100 text-green-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
  'no-show': 'bg-orange-100 text-orange-800',
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  admin: 'bg-purple-100 text-purple-800',
  doctor: 'bg-blue-100 text-blue-800',
  receptionist: 'bg-teal-100 text-teal-800',
};
export default function Badge({ label, className }) {
  return (
    <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', colorMap[label?.toLowerCase()] || 'bg-gray-100 text-gray-800', className)}>
      {label}
    </span>
  );
}
