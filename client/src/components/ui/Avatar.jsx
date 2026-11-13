const colors = ['bg-blue-500','bg-green-500','bg-purple-500','bg-orange-500','bg-pink-500','bg-teal-500'];
export default function Avatar({ name, size = 'md' }) {
  const initials = name?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2) || '?';
  const color = colors[name?.charCodeAt(0) % colors.length] || 'bg-gray-500';
  const s = size === 'sm' ? 'h-7 w-7 text-xs' : size === 'lg' ? 'h-12 w-12 text-lg' : 'h-9 w-9 text-sm';
  return <div className={`${s} ${color} rounded-full flex items-center justify-center text-white font-semibold`}>{initials}</div>;
}
