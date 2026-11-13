import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FileText, ArrowLeft, Download, Paperclip, Calendar, User,
  Pill, Activity, Clock, Plus, AlertCircle, CheckCircle2
} from 'lucide-react';
import { getRecordById, addAttachment } from '../../api/records.api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import FileUpload from '../../components/ui/FileUpload';
import Spinner from '../../components/ui/Spinner';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../context/AuthContext';

export default function RecordDetail() {
  const { id } = useParams();
  const { isRole } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const { data: record, isLoading } = useQuery({
    queryKey: ['record', id],
    queryFn: async () => {
      const res = await getRecordById(id);
      return res.data?.record;
    }
  });

  const uploadMutation = useMutation({
    mutationFn: async (files) => {
      const formData = new FormData();
      formData.append('file', files[0]); // server expects single file field "file"
      return addAttachment(id, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['record', id] });
      toast.success('Document uploaded successfully!');
      setIsUploadModalOpen(false);
      setSelectedFiles([]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'File upload failed.');
    }
  });

  const handleUploadSubmit = () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      toast.error('Please select a file to upload.');
      return;
    }
    uploadMutation.mutate(selectedFiles);
  };

  if (isLoading) return <Spinner size="lg" />;

  if (!record) {
    return (
      <Card className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-3" />
        <h3 className="text-lg font-semibold text-gray-800">Record Not Found</h3>
        <p className="text-gray-500 text-sm mt-1">The requested clinical consultation record could not be found.</p>
        <Link to="/records" className="mt-4 inline-block">
          <Button variant="secondary">Back to Records</Button>
        </Link>
      </Card>
    );
  }

  const patientName = record.patient ? `${record.patient.firstName} ${record.patient.lastName}` : 'Patient';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link to="/records" className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900">
          <ArrowLeft size={16} /> Back to Records
        </Link>

        {isRole(['doctor', 'admin']) && (
          <Button
            size="sm"
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Paperclip size={16} />
            <span>Upload Prescription / Scan</span>
          </Button>
        )}
      </div>

      {/* Main Medical Record Card */}
      <Card className="space-y-6">
        {/* Header Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-purple-50 text-purple-700 rounded border border-purple-200">
                Medical Record
              </span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-sm font-medium text-gray-600">
                Visit: {new Date(record.visitDate || record.createdAt).toLocaleDateString()}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mt-2">
              {record.diagnosis || 'Clinical Consultation'}
            </h2>
          </div>

          <div className="text-right sm:text-right">
            <p className="text-xs text-gray-400">Patient</p>
            <Link to={`/patients/${record.patient?._id}`} className="font-semibold text-blue-600 hover:underline">
              {patientName}
            </Link>
            <p className="text-xs text-gray-500 font-mono">{record.patient?.patientId}</p>
          </div>
        </div>

        {/* Consulting Physician & Follow Up Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl text-sm">
          <div>
            <p className="text-xs text-gray-500">Attending Physician</p>
            <p className="font-semibold text-gray-800">{record.doctor?.name || 'Physician'}</p>
            <p className="text-xs text-gray-500">{record.doctor?.specialization}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Scheduled Follow-up</p>
            <p className="font-semibold text-gray-800">
              {record.followUpDate ? new Date(record.followUpDate).toLocaleDateString() : 'None Scheduled'}
            </p>
          </div>
        </div>

        {/* Clinical Assessment */}
        <div className="space-y-4">
          {record.chiefComplaint && (
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Chief Complaint</h4>
              <p className="bg-red-50/50 border border-red-100 p-3 rounded-lg text-gray-800 text-sm">
                {record.chiefComplaint}
              </p>
            </div>
          )}

          {record.treatment && (
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Treatment Plan & Advice</h4>
              <p className="bg-blue-50/40 border border-blue-100 p-3 rounded-lg text-gray-800 text-sm">
                {record.treatment}
              </p>
            </div>
          )}

          {record.notes && (
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Physician Notes</h4>
              <p className="bg-gray-50 p-3 rounded-lg text-gray-700 text-sm">{record.notes}</p>
            </div>
          )}
        </div>

        {/* Structured Prescriptions Table */}
        <div className="pt-4 border-t border-gray-100">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-3">
            <Pill size={18} className="text-blue-600" /> Prescriptions ({record.prescriptions?.length || 0})
          </h3>

          {!record.prescriptions || record.prescriptions.length === 0 ? (
            <p className="text-sm text-gray-400 italic">No medications prescribed during this visit.</p>
          ) : (
            <div className="overflow-x-auto border rounded-xl">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600 border-b">
                  <tr>
                    <th className="px-4 py-2.5 font-medium">Medication</th>
                    <th className="px-4 py-2.5 font-medium">Dosage</th>
                    <th className="px-4 py-2.5 font-medium">Frequency</th>
                    <th className="px-4 py-2.5 font-medium">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {record.prescriptions.map((rx, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-2.5 font-semibold text-blue-600">{rx.medication}</td>
                      <td className="px-4 py-2.5 text-gray-700">{rx.dosage}</td>
                      <td className="px-4 py-2.5 text-gray-700">{rx.frequency}</td>
                      <td className="px-4 py-2.5 text-gray-700">{rx.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Lab Results Section */}
        {record.labResults?.length > 0 && (
          <div className="pt-4 border-t border-gray-100">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-3">
              <Activity size={18} className="text-emerald-600" /> Laboratory Results
            </h3>
            <div className="overflow-x-auto border rounded-xl">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600 border-b">
                  <tr>
                    <th className="px-4 py-2.5 font-medium">Test Name</th>
                    <th className="px-4 py-2.5 font-medium">Result</th>
                    <th className="px-4 py-2.5 font-medium">Unit</th>
                    <th className="px-4 py-2.5 font-medium">Reference Range</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {record.labResults.map((lab, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-2.5 font-medium text-gray-900">{lab.testName}</td>
                      <td className="px-4 py-2.5 font-semibold text-gray-800">{lab.result}</td>
                      <td className="px-4 py-2.5 text-gray-500">{lab.unit || '-'}</td>
                      <td className="px-4 py-2.5 text-gray-500">{lab.normalRange || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Attached Prescriptions & Files */}
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Paperclip size={18} className="text-indigo-600" /> Attached Documents & Prescriptions
            </h3>
            {isRole(['doctor', 'admin']) && (
              <Button size="sm" variant="secondary" onClick={() => setIsUploadModalOpen(true)}>
                <Plus size={14} className="mr-1" /> Add Document
              </Button>
            )}
          </div>

          {!record.attachments || record.attachments.length === 0 ? (
            <div className="bg-gray-50 p-6 rounded-xl text-center text-gray-400">
              <Paperclip className="mx-auto h-8 w-8 text-gray-300 mb-2" />
              <p className="text-sm">No prescriptions or scans attached yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {record.attachments.map((att, idx) => {
                const downloadUrl = `/uploads/${att.filename}`;
                return (
                  <div key={idx} className="flex items-center justify-between p-3 border rounded-xl bg-gray-50/50 hover:bg-gray-50">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="h-10 w-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                        <FileText size={20} />
                      </div>
                      <div className="truncate">
                        <p className="font-semibold text-sm text-gray-800 truncate">{att.originalName}</p>
                        <p className="text-xs text-gray-400">
                          {att.size ? `${(att.size / 1024).toFixed(1)} KB` : 'Attachment'} • {new Date(att.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <a
                      href={downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors ml-2 shrink-0"
                      title="Download / View Attachment"
                    >
                      <Download size={18} />
                    </a>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Patient Prescription / Document"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => setIsUploadModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              loading={uploadMutation.isPending}
              onClick={handleUploadSubmit}
            >
              Upload Document
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Select a prescription slip, diagnostic report, or radiology scan (PDF, JPG, PNG, DOC).
          </p>
          <FileUpload
            maxFiles={1}
            onChange={(files) => setSelectedFiles(files)}
            accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
          />
        </div>
      </Modal>
    </div>
  );
}
