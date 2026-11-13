import { clsx } from 'clsx';
export default function Input({ label, error, className, ...props }) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      <input
        {...props}
        className={clsx('block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
          error ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white', className)}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
