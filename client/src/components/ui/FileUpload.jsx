import { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
export default function FileUpload({ onChange, accept, multiple, maxFiles = 5 }) {
  const [files, setFiles] = useState([]);
  const inputRef = useRef();
  const handleFiles = (newFiles) => {
    const arr = Array.from(newFiles).slice(0, maxFiles);
    setFiles(arr);
    onChange?.(arr);
  };
  return (
    <div>
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
        onClick={() => inputRef.current.click()}
        onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
        onDragOver={(e) => e.preventDefault()}
      >
        <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
        <p className="text-sm text-gray-600">Drag & drop or <span className="text-blue-600 font-medium">browse</span></p>
        <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG, DOC up to 10MB</p>
        <input ref={inputRef} type="file" className="hidden" accept={accept} multiple={multiple} onChange={(e) => handleFiles(e.target.files)} />
      </div>
      {files.length > 0 && (
        <ul className="mt-2 space-y-1">
          {files.map((f, i) => (
            <li key={i} className="flex items-center justify-between text-sm bg-gray-50 rounded px-3 py-1.5">
              <span className="truncate text-gray-700">{f.name}</span>
              <button onClick={() => { const n = files.filter((_,j)=>j!==i); setFiles(n); onChange?.(n); }} className="text-gray-400 hover:text-red-500 ml-2"><X size={14}/></button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
