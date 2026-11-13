import Spinner from './Spinner';
export default function Table({ columns, data, loading, emptyMessage = 'No records found.' }) {
  if (loading) return <Spinner />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>{columns.map(col => <th key={col.key} className="px-4 py-3 font-medium text-gray-600">{col.label}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.length === 0
            ? <tr><td colSpan={columns.length} className="px-4 py-8 text-center text-gray-400">{emptyMessage}</td></tr>
            : data.map((row, i) => (
              <tr key={i} className="hover:bg-gray-50">
                {columns.map(col => <td key={col.key} className="px-4 py-3 text-gray-700">{col.render ? col.render(row) : row[col.key]}</td>)}
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  );
}
