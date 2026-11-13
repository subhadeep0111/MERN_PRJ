import mongoose from 'mongoose';

const medicalRecordSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: [true, 'Patient is required']
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Doctor is required']
    },
    visitDate: { type: Date, default: Date.now },
    chiefComplaint: { type: String },
    diagnosis: { type: String },
    treatment: { type: String },
    prescriptions: [
      {
        medication: String,
        dosage: String,
        frequency: String,
        duration: String
      }
    ],
    labResults: [
      {
        testName: String,
        result: String,
        unit: String,
        normalRange: String
      }
    ],
    attachments: [
      {
        filename: String,
        originalName: String,
        mimetype: String,
        size: Number,
        path: String,
        uploadedAt: { type: Date, default: Date.now }
      }
    ],
    notes: { type: String },
    followUpDate: { type: Date }
  },
  { timestamps: true }
);

const MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema);
export default MedicalRecord;
